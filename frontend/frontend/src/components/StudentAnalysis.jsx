import { useState } from "react";
import AnalysisCharts from "./AnalysisCharts";
import "../styles/StudentAnalysis.css";

function StudentAnalysis({ result, csvData }) {
  const [studentName, setStudentName] = useState("");
  const [validatedName, setValidatedName] = useState(null);
  const [error, setError] = useState("");

  // Extract names from CSV data (assuming first row is headers)
  const getValidNames = () => {
    if (!csvData || csvData.length === 0) return [];
    
    // Get the name column (assuming it's the first column or a "name" column)
    const headers = csvData[0];
    let nameColumnIndex = headers.findIndex(
      (h) => h.toLowerCase() === "name" || h.toLowerCase() === "student"
    );

    // If name column not found, use first column (index 0)
    if (nameColumnIndex === -1) {
      nameColumnIndex = 0;
    }

    return csvData.slice(1).map((row) => row[nameColumnIndex]).filter(name => name);
  };

  const validNames = getValidNames();

  const handleValidateStudent = () => {
    const trimmedName = studentName.trim();

    if (!trimmedName) {
      setError("Please enter a student name");
      return;
    }

    // Case-insensitive validation
    const foundName = validNames.find(
      (name) => name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (foundName) {
      setValidatedName(foundName);
      setError("");
    } else {
      setError("Student name not found in dataset");
      setValidatedName(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleValidateStudent();
    }
  };

  if (validatedName) {
    return (
      <div className="app-container">
        <h2>👤 Student Analysis Dashboard</h2>
        <div className="student-header">
          <p className="student-welcome">Welcome, <strong>{validatedName}</strong>!</p>
          <button 
            className="logout-btn"
            onClick={() => {
              setValidatedName(null);
              setStudentName("");
              setError("");
            }}
          >
            Change Student
          </button>
        </div>
        <AnalysisCharts result={result} studentName={validatedName} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <h2>👤 Student Analysis</h2>
      <div className="student-validation">
        <div className="validation-container">
          <h3>Enter Your Name</h3>
          <p className="validation-subtitle">
            Please verify your name to access personalized analysis
          </p>

          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your full name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyPress={handleKeyPress}
              className={error ? "input-error" : ""}
            />
            <button
              className="validate-btn"
              onClick={handleValidateStudent}
            >
              Verify Name
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentAnalysis;
