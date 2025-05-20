# app.py
import pandas as pd
from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model
with open("model/credit_risk_ensemble.pkl", "rb") as f:
    model = pickle.load(f)

# Preprocessing function
def preprocess(data):
    df = pd.DataFrame([data])

    # Feature engineering
    df["loan_to_income"] = df["loan_amnt"] / df["person_income"]
    df["age_income_interaction"] = df["person_age"] * df["person_income"]
    df["loan_to_emp_length_ratio"] = df["loan_amnt"] / df["person_emp_length"]
    df["monthly_debt"] = df["person_income"] * df["loan_percent_income"]
    df["dti_ratio"] = df["monthly_debt"] / df["loan_amnt"]

    return df

# Predict endpoint
@app.route("/predict", methods=["POST"])
def predict():
    input_data = request.get_json()
    processed_data = preprocess(input_data)
    prediction = model.predict(processed_data)
    return jsonify({"prediction": int(prediction[0])})

if __name__ == "__main__":
    app.run(debug=True)
