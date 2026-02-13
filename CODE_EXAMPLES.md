# Code Implementation Examples

## 1. App.jsx - Router Setup

### Key Structure
```jsx
function App() {
  const [result, setResult] = useState(null);              // Analysis from backend
  const [csvData, setCsvData] = useState(null);            // Raw CSV data
  const [selectedRole, setSelectedRole] = useState(null);  // User's role

  const handleAnalysisComplete = (analysisResult, parsedCsvData) => {
    setResult(analysisResult);
    setCsvData(parsedCsvData);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage onAnalysisComplete={handleAnalysisComplete} />} />
        <Route path="/role-selection" element={<RoleSelection onRoleSelect={handleRoleSelect} />} />
        <Route path="/analysis/admin" element={<AdminAnalysis result={result} />} />
        <Route path="/analysis/student" element={<StudentAnalysis result={result} csvData={csvData} />} />
      </Routes>
    </Router>
  );
}
```

### CSV Parsing After Upload
```jsx
// In UploadPage component
const csvText = await file.text();
const csvRows = csvText.split('\n').filter(row => row.trim());
const csvData = csvRows.map(row => 
  row.split(',').map(cell => cell.trim())
);

onAnalysisComplete(data, csvData);
navigate("/role-selection");
```

---

## 2. RoleSelection Component

### Complete Component
```jsx
function RoleSelection({ onRoleSelect }) {
  const navigate = useNavigate();

  const handleAdminSelect = () => {
    onRoleSelect("admin");
    navigate("/analysis/admin");
  };

  const handleStudentSelect = () => {
    onRoleSelect("student");
    navigate("/analysis/student");
  };

  return (
    <div className="role-selection">
      <div className="role-container">
        <h1>Select Your Role</h1>
        <p>Choose how you'd like to view the analysis</p>

        <div className="role-options">
          <button className="role-button admin-button" onClick={handleAdminSelect}>
            <div className="role-icon">👨‍💼</div>
            <h2>Admin / Faculty</h2>
            <p>View overall analysis and insights</p>
          </button>

          <button className="role-button student-button" onClick={handleStudentSelect}>
            <div className="role-icon">👤</div>
            <h2>Student / User</h2>
            <p>View personalized analysis</p>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. StudentAnalysis - Name Validation

### Name Extraction Logic
```jsx
const getValidNames = () => {
  if (!csvData || csvData.length === 0) return [];
  
  // Get the name column
  const headers = csvData[0];
  let nameColumnIndex = headers.findIndex(
    (h) => h.toLowerCase() === "name" || h.toLowerCase() === "student"
  );

  // If name column not found, use first column
  if (nameColumnIndex === -1) {
    nameColumnIndex = 0;
  }

  // Extract clean names
  return csvData.slice(1)
    .map((row) => row[nameColumnIndex])
    .filter(name => name);  // Remove empty entries
};
```

### Validation Function
```jsx
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
```

### Conditional Rendering
```jsx
// Before validation - show input form
if (!validatedName) {
  return (
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
          <button className="validate-btn" onClick={handleValidateStudent}>
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
  );
}

// After validation - show analysis
return (
  <div className="app-container">
    <h2>👤 Student Analysis Dashboard</h2>
    <div className="student-header">
      <p className="student-welcome">
        Welcome, <strong>{validatedName}</strong>!
      </p>
      <button className="logout-btn" onClick={() => setValidatedName(null)}>
        Change Student
      </button>
    </div>
    <AnalysisCharts result={result} />
  </div>
);
```

---

## 4. AnalysisCharts - Reusable Charts Component

### Helper Functions
```jsx
const buildHistogram = (values, binCount = 5) => {
  const nums = values.map(Number);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const binSize = (max - min) / binCount || 1;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    label: `${(min + i * binSize).toFixed(1)}–${(min + (i + 1) * binSize).toFixed(1)}`,
    count: 0,
  }));

  nums.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
    bins[idx].count += 1;
  });

  return bins;
};

const buildAnomalyData = (values) => {
  const nums = values.map(Number);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
  const std = Math.sqrt(variance);

  return nums.map((v) => ({
    value: v,
    isAnomaly: v > mean + 2 * std || v < mean - 2 * std,
  }));
};
```

### Chart Rendering
```jsx
<div className="charts-grid">
  {/* Comparison Chart */}
  <div className="chart-card">
    <h3>Comparison Chart</h3>
    <Bar
      data={{
        labels: result.patterns.comparison.categories,
        datasets: [
          {
            label: "Average Performance",
            data: result.patterns.comparison.values.map(Number),
            backgroundColor: getComparisonBarColors(),
          },
        ],
      }}
    />
    <div className="chart-insight">
      📊 {getComparisonInsight()}
    </div>
  </div>

  {/* Trend Chart */}
  <div className="chart-card">
    <h3>Trend Chart</h3>
    <Line
      data={{
        labels: result.patterns.trend.values.map((_, i) => `Point ${i + 1}`),
        datasets: [
          {
            label: "Trend",
            data: result.patterns.trend.values.map(Number),
            borderColor: "#03A9F4",
            tension: 0.3,
          },
        ],
      }}
    />
    <div className="chart-insight">📈 {result.patterns.trend.insight}</div>
  </div>

  {/* ... other charts */}
</div>
```

---

## 5. AdminAnalysis - Simple Wrapper

```jsx
function AdminAnalysis({ result }) {
  return (
    <div className="app-container">
      <h2>📊 Admin Analysis Dashboard</h2>
      <AnalysisCharts result={result} />
    </div>
  );
}
```

---

## 6. CSS - Role Selection Styling

### Button Styling
```css
.role-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2rem;
  border: 2px solid #30363d;
  border-radius: 12px;
  background-color: #161b22;
  color: #c9d1d9;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  gap: 1rem;
}

.role-button:hover {
  border-color: #58a6ff;
  background-color: #0d1117;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

/* Admin styling */
.admin-button {
  border-color: #238636;
  background-color: rgba(35, 134, 54, 0.1);
}

.admin-button:hover {
  border-color: #2ea043;
  background-color: rgba(35, 134, 54, 0.2);
}

/* Student styling */
.student-button {
  border-color: #0969da;
  background-color: rgba(9, 105, 218, 0.1);
}

.student-button:hover {
  border-color: #1f6feb;
  background-color: rgba(9, 105, 218, 0.2);
}
```

---

## 7. CSS - Student Validation Form

### Input Styling
```css
.input-group input {
  flex: 1;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #30363d;
  border-radius: 8px;
  background-color: #0d1117;
  color: #c9d1d9;
  font-family: inherit;
  transition: all 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
}

.input-group input.input-error {
  border-color: #f85149;
}

.input-group input.input-error:focus {
  border-color: #f85149;
  box-shadow: 0 0 0 3px rgba(248, 81, 73, 0.1);
}
```

### Error Message Styling
```css
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(248, 81, 73, 0.1);
  border: 1px solid #f85149;
  border-radius: 8px;
  color: #f85149;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Data Flow Diagram

```
CSV Upload
    ↓
[UploadPage]
    ↓
Parse CSV + Backend API call
    ↓
App State: result + csvData
    ↓
Navigate to /role-selection
    ↓
[RoleSelection] ← User selects role
    ↓              ↓
[AdminAnalysis]  [StudentAnalysis]
    ↓              ↓
[AnalysisCharts]  Validate Name
                    ↓
                [AnalysisCharts]
```

---

## Import Statements Summary

```jsx
// App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "chart.js/auto";
import RoleSelection from "./components/RoleSelection";
import AdminAnalysis from "./components/AdminAnalysis";
import StudentAnalysis from "./components/StudentAnalysis";

// RoleSelection.jsx
import { useNavigate } from "react-router-dom";
import "../styles/RoleSelection.css";

// StudentAnalysis.jsx
import { useState } from "react";
import AnalysisCharts from "./AnalysisCharts";
import "../styles/StudentAnalysis.css";

// AnalysisCharts.jsx
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "chart.js": "^4.5.1",
    "react": "^19.2.0",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "^19.2.0",
    "react-router-dom": "^6.x.x"  // Added
  }
}
```
