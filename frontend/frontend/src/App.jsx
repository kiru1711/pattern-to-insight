import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "chart.js/auto";
import RoleSelection from "./components/RoleSelection";
import AdminAnalysis from "./components/AdminAnalysis";
import StudentAnalysis from "./components/StudentAnalysis";
import AdminLogin from "./components/AdminLogin";

function UploadPage({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(0);

      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Stop at 90% while waiting for backend
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 400);

      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      const csvText = await file.text();
      const csvRows = csvText.split('\n').filter(row => row.trim());
      const csvData = csvRows.map(row => 
        row.split(',').map(cell => cell.trim())
      );

      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);

      // Wait briefly to show 100% before navigating
      setTimeout(() => {
        onAnalysisComplete(data, csvData);
        navigate("/role-selection");
        setLoading(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      setLoading(false);
      setProgress(0);
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
          {loading ? "Analyzing Dataset..." : "Analyze Dataset"}
        </button>

        {loading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}
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
          path="/admin/login" 
          element={<AdminLogin />} 
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
