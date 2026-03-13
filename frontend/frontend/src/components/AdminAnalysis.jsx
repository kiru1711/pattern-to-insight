import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AnalysisCharts from "./AnalysisCharts";
import AdminSummaryCard from "./AdminSummaryCard";
import AdminAttentionPanel from "./AdminAttentionPanel";
import ExportReportButton from "./ExportReportButton";
import "../styles/AdminAnalysis.css";

function AdminAnalysis({ result, csvData }) {
  const dashboardRef = useRef(null);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentScores, setNewStudentScores] = useState({
    Math: "",
    Biology: "",
    Physics: "",
    Chemistry: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  // Check authentication on component mount
  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      // Not authenticated, redirect to login
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/students");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  }, []);

  // Fetch students from database
  useEffect(() => {
    const loadStudents = async () => {
      const data = await fetchStudents();
      setStudents(data);
    };

    loadStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Convert scores to numbers
    const scores = {};
    for (const [subject, value] of Object.entries(newStudentScores)) {
      if (value.trim()) {
        scores[subject] = parseFloat(value);
      }
    }

    if (Object.keys(scores).length === 0) {
      setMessage({ text: "Please enter at least one score", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newStudentName,
          scores: scores
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setNewStudentName("");
        setNewStudentScores({ Math: "", Biology: "", Physics: "", Chemistry: "" });
        setShowAddStudent(false);
        const updatedStudents = await fetchStudents();
        setStudents(updatedStudents);
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error creating student: " + error.message, type: "error" });
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/students/${studentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.message) {
        setMessage({ text: data.message, type: "success" });
        const updatedStudents = await fetchStudents();
        setStudents(updatedStudents);
      } else if (data.error) {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error deleting student: " + error.message, type: "error" });
    }
  };
  
  // Helper: Build dataset from CSV with all columns
  const buildDataset = () => {
    if (!csvData || csvData.length < 2) return [];
    
    const headers = csvData[0].map(h => h.toLowerCase().trim());
    
    // Find column indices
    let nameColumnIndex = headers.findIndex(
      (h) => h === "name" || h === "student"
    );
    if (nameColumnIndex === -1) nameColumnIndex = 0;
    
    let marksColumnIndex = headers.findIndex(
      (h) => {
        return h === "marks" || 
               h === "score" || 
               h === "performance" ||
               h === "value";
      }
    );
    if (marksColumnIndex === -1) marksColumnIndex = 1;
    
    let mathColumnIndex = headers.findIndex(h => h === "math");
    let biologyColumnIndex = headers.findIndex(h => h === "biology");
    let physicsColumnIndex = headers.findIndex(h => h === "physics");
    
    // Build dataset with all fields
    return csvData.slice(1).map((row) => ({
      name: row[nameColumnIndex],
      marks: parseFloat(row[marksColumnIndex]) || 0,
      math: parseFloat(row[mathColumnIndex]) || 0,
      biology: parseFloat(row[biologyColumnIndex]) || 0,
      physics: parseFloat(row[physicsColumnIndex]) || 0,
    })).filter(item => item.name);
  };

  const dataset = buildDataset();
  
  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/role-selection");
  };

  const adminData = JSON.parse(localStorage.getItem("admin") || "null");

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2>📊 Admin Analysis Dashboard</h2>
          {adminData && <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0 0 0' }}>Logged in as: {adminData.username}</p>}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
          <ExportReportButton 
            dashboardRef={dashboardRef} 
            reportTitle="Admin Analytics Report"
            fileName="admin-report"
          />
        </div>
      </div>
      <div ref={dashboardRef}>
        <AdminSummaryCard dataset={dataset} />
        <div className="admin-dashboard-wrapper">
          <AnalysisCharts result={result} dataset={dataset} />
          <AdminAttentionPanel dataset={dataset} />
        </div>
      </div>

      {/* Student Management Section */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#c9d1d9' }}>👥 Student Management</h3>
          <button
            onClick={() => setShowAddStudent(!showAddStudent)}
            style={{
              padding: '0.5rem 1rem',
              background: '#238636',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {showAddStudent ? '✕ Cancel' : '+ Add Student'}
          </button>
        </div>

        {message.text && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            background: message.type === 'success' ? '#0d4429' : '#3d1116',
            color: message.type === 'success' ? '#3fb950' : '#f85149',
            border: `1px solid ${message.type === 'success' ? '#1b6938' : '#db575e'}`
          }}>
            {message.text}
          </div>
        )}

        {showAddStudent && (
          <form onSubmit={handleAddStudent} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#0d1117', borderRadius: '8px', border: '1px solid #30363d' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c9d1d9', fontWeight: '500' }}>
                Student Name *
              </label>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                required
                placeholder="Enter student name"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#c9d1d9',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {Object.keys(newStudentScores).map((subject) => (
                <div key={subject}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.9rem' }}>
                    {subject}
                  </label>
                  <input
                    type="number"
                    value={newStudentScores[subject]}
                    onChange={(e) => setNewStudentScores({ ...newStudentScores, [subject]: e.target.value })}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0d1117',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      color: '#c9d1d9',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              style={{
                padding: '0.5rem 1.5rem',
                background: '#1f6feb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}
            >
              Create Student
            </button>
          </form>
        )}

        {/* Students List */}
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            All Students ({students.length})
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {students.length === 0 ? (
              <p style={{ color: '#8b949e', textAlign: 'center', padding: '2rem' }}>
                No students found. Add a student or upload a CSV file.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {students.map((student) => (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#0d1117',
                      border: '1px solid #30363d',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <div style={{ color: '#c9d1d9', fontWeight: '500' }}>{student.name}</div>
                      <div style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Average: {student.average.toFixed(2)}% | Subjects: {Object.keys(student.scores).length}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStudent(student.id, student.name)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: '#da3633',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalysis;
