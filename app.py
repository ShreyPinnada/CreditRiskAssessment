import pandas as pd
from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model
with open("model/credit_risk_ensemble.pkl", "rb") as f:
    model = pickle.load(f)

# Preprocessing function (same formulas as frontend)
def preprocess(data):
    df = pd.DataFrame([data])

    # Derived features (from frontend logic)
    loan_amnt = df["loan_amnt"]
    loan_int_rate = df["loan_int_rate"]
    person_income = df["person_income"]
    person_age = df["person_age"]
    person_emp_length = df["person_emp_length"]
    loan_grade = df["loan_grade"]
    cb_person_default_on_file = df["cb_person_default_on_file"]

    df["monthly_debt"] = loan_amnt * (1 + loan_int_rate / 100)
    df["dti_ratio"] = person_income.apply(lambda x: 0 if x == 0 else (df["monthly_debt"] * 12) / x)
    df["loan_percent_income"] = person_income.apply(lambda x: 0 if x == 0 else (loan_amnt / x) * 100)
    df["loan_to_income"] = person_income.apply(lambda x: 0 if x == 0 else loan_amnt / x - df["loan_percent_income"])
    df["age_income_interaction"] = person_age * person_income
    df["loan_to_emp_length_ratio"] = person_emp_length.apply(lambda x: 0 if x == 0 else loan_amnt / x)

    # Risk flag
    df["risk_flag"] = ((cb_person_default_on_file == 1) & loan_grade.isin([3, 4, 5])).astype(int)

    # Reorder to match training order
    expected_columns = [
        "person_age",
        "person_income",
        "person_home_ownership",
        "person_emp_length",
        "loan_intent",
        "loan_grade",
        "loan_amnt",
        "loan_int_rate",
        "loan_percent_income",
        "cb_person_default_on_file",
        "cb_person_cred_hist_length",
        "loan_to_income",
        "age_income_interaction",
        "loan_to_emp_length_ratio",
        "monthly_debt",
        "dti_ratio",
        "risk_flag",
    ]

    df = df[expected_columns]

    return df

# Predict endpoint
@app.route("/predict", methods=["POST"])
def predict():
    input_data = request.get_json()

    try:
        processed_data = preprocess(input_data)
        prediction = model.predict(processed_data)
        return jsonify({"prediction": int(prediction[0])})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
