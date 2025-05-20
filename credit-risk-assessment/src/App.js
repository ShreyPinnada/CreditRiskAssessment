import {
  AlertCircle,
  ArrowRight,
  BarChart,
  Briefcase,
  CalendarIcon,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import "./App.css";

export default function LoanRiskPredictionApp() {
  const [formData, setFormData] = useState({
    person_age: 48,
    person_income: 120000,
    person_home_ownership: 3, // 1: Rent, 2: Mortgage, 3: Own, 4: Other
    person_emp_length: 15.0,
    loan_intent: 0, // 0: Personal, 1: Education, 2: Medical, 3: Venture, 4: Home Improvement, 5: Debt Consolidation
    loan_grade: 7, // 1-7 (A-G)
    loan_amnt: 15000,
    loan_int_rate: 7.5,
    loan_percent_income: 0.125,
    cb_person_default_on_file: 0, // 0: No, 1: Yes
    cb_person_cred_hist_length: 20,
    loan_to_income: 0.125,
    age_income_interaction: 5760000,
    loan_to_emp_length_ratio: 1000,
    monthly_debt: 15000,
    dti_ratio: 1.0,
    risk_flag: 0, // 0: Low Risk, 1: High Risk
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(50);

  useEffect(() => {
    // Calculate form completion percentage based on required fields
    const requiredFields = [
      "person_age",
      "person_income",
      "person_emp_length",
      "loan_amnt",
      "loan_int_rate",
    ];
    const filledFields = requiredFields.filter(
      (field) => formData[field] !== null && formData[field] !== ""
    );
    setFormProgress((filledFields.length / requiredFields.length) * 100);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Convert numeric inputs to numbers
    if (
      name !== "person_home_ownership" &&
      name !== "loan_intent" &&
      name !== "loan_grade" &&
      name !== "cb_person_default_on_file" &&
      name !== "risk_flag"
    ) {
      processedValue = parseFloat(value);
    } else {
      processedValue = parseInt(value, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const validateForm = () => {
    if (formData.person_age <= 0) {
      setErrorMessage("Age must be positive");
      return false;
    }
    setErrorMessage(null); // clear errors if validation passes
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setPredictionResult(null);

    try {
      setIsLoading(true); // Optional, in case it's not already set before this block

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST", // change to "GET" if your API uses GET
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const predictionValue = data.prediction;

      if (predictionValue === 0) {
        console.log("Low risk");
      } else if (predictionValue === 1) {
        console.log("High risk");
      } else {
        console.log("Unexpected prediction value:", predictionValue);
      }

      setPredictionResult({
        risk_flag: predictionValue,
        probability: data.probability ?? 0.5,
        key_factors: data.key_factors ?? [],
      });
      setIsSheetOpen(true);
    } catch (error) {
      setErrorMessage("Error getting prediction: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  // Home ownership options
  const homeOwnershipOptions = [
    { value: 1, label: "Rent" },
    { value: 2, label: "Mortgage" },
    { value: 3, label: "Own" },
    { value: 4, label: "Other" },
  ];

  // Loan intent options
  const loanIntentOptions = [
    { value: 0, label: "Personal" },
    { value: 1, label: "Education" },
    { value: 2, label: "Medical" },
    { value: 3, label: "Venture" },
    { value: 4, label: "Home Improvement" },
    { value: 5, label: "Debt Consolidation" },
  ];

  // Loan grade options
  const loanGradeOptions = [
    { value: 1, label: "A" },
    { value: 2, label: "B" },
    { value: 3, label: "C" },
    { value: 4, label: "D" },
    { value: 5, label: "E" },
    { value: 6, label: "F" },
    { value: 7, label: "G" },
  ];

  // Yes/No options
  const yesNoOptions = [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-md mr-4">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Loan Risk Assessment
                </h1>
                <p className="text-gray-500 text-sm">
                  Intelligent prediction system powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-indigo-50 rounded-full flex items-center">
                <BarChart className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="text-sm font-medium text-indigo-700">
                  Financial Intelligence
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Progress tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">
              Application Progress
            </h2>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(formProgress)}% Complete
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${formProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Form tabs */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex-1 py-4 px-6 focus:outline-none transition-all duration-200 ${
                activeTab === "personal"
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-500 text-indigo-700 font-medium"
                  : "text-gray-600 hover:text-indigo-500"
              }`}
            >
              <div className="flex items-center justify-center">
                <User
                  className={`h-5 w-5 ${
                    activeTab === "personal"
                      ? "text-indigo-600"
                      : "text-gray-400"
                  } mr-2`}
                />
                <span>Personal Information</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("loan")}
              className={`flex-1 py-4 px-6 focus:outline-none transition-all duration-200 ${
                activeTab === "loan"
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-500 text-indigo-700 font-medium"
                  : "text-gray-600 hover:text-indigo-500"
              }`}
            >
              <div className="flex items-center justify-center">
                <CreditCard
                  className={`h-5 w-5 ${
                    activeTab === "loan" ? "text-indigo-600" : "text-gray-400"
                  } mr-2`}
                />
                <span>Loan Details</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`flex-1 py-4 px-6 focus:outline-none transition-all duration-200 ${
                activeTab === "credit"
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-500 text-indigo-700 font-medium"
                  : "text-gray-600 hover:text-indigo-500"
              }`}
            >
              <div className="flex items-center justify-center">
                <FileText
                  className={`h-5 w-5 ${
                    activeTab === "credit" ? "text-indigo-600" : "text-gray-400"
                  } mr-2`}
                />
                <span>Credit History</span>
              </div>
            </button>
          </div>

          <div className="p-8">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="number"
                          name="person_age"
                          value={formData.person_age}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Enter your age"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">Years</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Income
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="number"
                          name="person_income"
                          value={formData.person_income}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Enter your annual income"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Home Ownership
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Home className="h-5 w-5 text-indigo-400" />
                        </div>
                        <select
                          name="person_home_ownership"
                          value={formData.person_home_ownership}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-10 sm:text-sm border-gray-300 rounded-lg py-3"
                        >
                          {homeOwnershipOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Length
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Briefcase className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="number"
                          name="person_emp_length"
                          value={formData.person_emp_length}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Years at current job"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">Years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveTab("loan")}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Next: Loan Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Loan Information Tab */}
            {activeTab === "loan" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Purpose
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <select
                          name="loan_intent"
                          value={formData.loan_intent}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-10 sm:text-sm border-gray-300 rounded-lg py-3"
                        >
                          {loanIntentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Grade
                      </label>
                      <div className="flex space-x-2">
                        {loanGradeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                loan_grade: option.value,
                              }))
                            }
                            className={`flex-1 py-3 border rounded-lg transition-all duration-200 ${
                              formData.loan_grade === option.value
                                ? "bg-indigo-100 border-indigo-500 text-indigo-700 font-medium"
                                : "border-gray-300 text-gray-500 hover:border-indigo-300"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Amount
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="number"
                          name="loan_amnt"
                          value={formData.loan_amnt}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Enter loan amount"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">USD</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate (%)
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          step="0.01"
                          name="loan_int_rate"
                          value={formData.loan_int_rate}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Enter interest rate"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab("credit")}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Next: Credit History
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Credit History Tab */}
            {activeTab === "credit" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default on Record
                      </label>
                      <div className="flex space-x-3">
                        {yesNoOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                cb_person_default_on_file: option.value,
                              }))
                            }
                            className={`flex-1 py-3 border rounded-lg transition-all duration-200 ${
                              formData.cb_person_default_on_file ===
                              option.value
                                ? option.value === 0
                                  ? "bg-green-100 border-green-500 text-green-700 font-medium"
                                  : "bg-red-100 border-red-500 text-red-700 font-medium"
                                : "border-gray-300 text-gray-500 hover:border-indigo-300"
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              {formData.cb_person_default_on_file ===
                                option.value &&
                                option.value === 0 && (
                                  <Check className="h-4 w-4 mr-2 text-green-600" />
                                )}
                              {formData.cb_person_default_on_file ===
                                option.value &&
                                option.value === 1 && (
                                  <X className="h-4 w-4 mr-2 text-red-600" />
                                )}
                              {option.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credit History Length
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="number"
                          name="cb_person_cred_hist_length"
                          value={formData.cb_person_cred_hist_length}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Years of credit history"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">Years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Debt
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="number"
                          name="monthly_debt"
                          value={formData.monthly_debt}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Current monthly debt"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">USD</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Debt-to-Income Ratio
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          step="0.01"
                          name="dti_ratio"
                          value={formData.dti_ratio}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Enter DTI ratio"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">ratio</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setActiveTab("loan")}
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white ${
                      isLoading
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Analyzing Risk...
                      </>
                    ) : (
                      <>Predict Loan Risk</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-in prediction result sheet */}
      {isSheetOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeSheet}
            ></div>
            <section className="absolute inset-y-0 right-0 flex max-w-md">
              <div className="h-full w-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                      Risk Assessment Results
                    </h2>
                    <div className="ml-3 h-7 flex items-center">
                      <button
                        onClick={closeSheet}
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 relative flex-1 px-4 sm:px-6">
                  {predictionResult ? (
                    <div className="space-y-8">
                      {/* Risk score indicator */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-6">
                            Risk Prediction
                          </h3>

                          <div className="relative h-44 w-44 mx-auto">
                            <div
                              className={`absolute inset-0 rounded-full border-8 ${
                                predictionResult.risk_flag === 1
                                  ? "border-red-500"
                                  : "border-green-500"
                              } flex items-center justify-center`}
                            >
                              <div
                                className={`text-2xl font-bold ${
                                  predictionResult.risk_flag === 1
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {predictionResult.risk_flag === 1
                                  ? "High Risk"
                                  : "Low Risk"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key factors */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Key Factors
                        </h3>

                        <ul className="space-y-3">
                          {predictionResult.key_factors &&
                            predictionResult.key_factors.map(
                              (factor, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-800">
                                      {index + 1}
                                    </div>
                                  </div>
                                  <p className="ml-3 text-sm text-gray-700">
                                    {factor}
                                  </p>
                                </li>
                              )
                            )}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Recommendations
                        </h3>

                        {predictionResult.risk_flag === 1 ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-4">
                              Consider the following actions to improve your
                              loan approval chances:
                            </p>
                            <ul className="space-y-3">
                              <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-indigo-600">
                                  <Check className="h-5 w-5" />
                                </div>
                                <p className="ml-3 text-sm text-gray-700">
                                  Decrease the loan amount relative to income
                                </p>
                              </li>
                              <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-indigo-600">
                                  <Check className="h-5 w-5" />
                                </div>
                                <p className="ml-3 text-sm text-gray-700">
                                  Reduce existing debt before applying
                                </p>
                              </li>
                              <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-indigo-600">
                                  <Check className="h-5 w-5" />
                                </div>
                                <p className="ml-3 text-sm text-gray-700">
                                  Consider a co-signer with strong credit
                                </p>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 mb-4">
                              Your application shows a good risk profile. To
                              further improve:
                            </p>
                            <ul className="space-y-3">
                              <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-600">
                                  <Check className="h-5 w-5" />
                                </div>
                                <p className="ml-3 text-sm text-gray-700">
                                  You may qualify for a better interest rate
                                </p>
                              </li>
                              <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-600">
                                  <Check className="h-5 w-5" />
                                </div>
                                <p className="ml-3 text-sm text-gray-700">
                                  Consider negotiating loan terms
                                </p>
                              </li>
                              <li className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-600">
                                  <Check className="h-5 w-5" />
                                </div>
                                <p className="ml-3 text-sm text-gray-700">
                                  Explore different lenders for comparison
                                </p>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={closeSheet}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          Close
                        </button>
                        <button className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                          Export Report
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">
                        No prediction data available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Features highlight */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Advanced AI Model
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Our risk assessment uses state-of-the-art machine learning
              algorithms to accurately predict loan outcomes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
              <BarChart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Data-Driven Insights
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get detailed analysis of risk factors and personalized
              recommendations to improve your application.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Actionable Reports
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Generate comprehensive reports with specific steps to improve your
              loan eligibility and terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
