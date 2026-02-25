import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "chart.js/auto";
import RoleSelection from "./components/RoleSelection";
import AdminAnalysis from "./components/AdminAnalysis";
import StudentAnalysis from "./components/StudentAnalysis";

function UploadPage({ onAnalysisComplete }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
  if (!file) return alert("Please select a CSV file");

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true); // ← added

    const response = await fetch("https://pattern-to-insight.onrender.com/upload/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    const csvText = await file.text();
    const csvRows = csvText.split('\n').filter(row => row.trim());
    const csvData = csvRows.map(row => 
      row.split(',').map(cell => cell.trim())
    );

    onAnalysisComplete(data, csvData);
    navigate("/role-selection");

    setLoading(false); // ← added
  } catch (error) {
    setLoading(false); // ← added
    alert("Error uploading file: " + error.message);
  }
};

  return (
    <div className="landing">
      {/* Hero Section */}
      <div className="hero">
        <div className="logo">📊</div>
        <h1>Pattern to Insight</h1>
        <p>Upload your CSV file to discover patterns and insights</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <label className={`upload-box ${file ? "file-selected" : ""}`} htmlFor="file-input">
          <div className="upload-content">
            {!file ? (
              <>
                <div className="upload-icon">📤</div>
                <p className="primary">Click to upload or drag and drop</p>
                <p className="secondary">CSV files only</p>
              </>
            ) : (
              <>
                <div className="upload-icon success">✓</div>
                <p className="primary">File uploaded successfully</p>
                <p className="secondary">{file.name}</p>
              </>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <button 
  className="analyze-btn"
  onClick={handleUpload}
  disabled={loading}
  style={{ opacity: loading ? 0.6 : 1 }}
>
  {loading ? "Analyzing dataset..." : "Analyze Dataset"}
</button>
      </div>
    </div>
  );
}

function App() {
  const [result, setResult] = useState(null);
  const [csvData, setCsvData] = useState(null);

  const handleAnalysisComplete = (analysisResult, parsedCsvData) => {
    setResult(analysisResult);
    setCsvData(parsedCsvData);
  };

  const handleRoleSelect = () => {
    // Role selection handled by navigation
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<UploadPage onAnalysisComplete={handleAnalysisComplete} />} 
        />
        <Route 
          path="/role-selection" 
          element={<RoleSelection onRoleSelect={handleRoleSelect} />} 
        />
        <Route 
          path="/analysis/admin" 
          element={<AdminAnalysis result={result} csvData={csvData} />} 
        />
        <Route 
          path="/analysis/student" 
          element={<StudentAnalysis result={result} csvData={csvData} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
