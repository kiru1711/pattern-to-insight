import { useRef } from "react";
import AnalysisCharts from "./AnalysisCharts";
import AdminSummaryCard from "./AdminSummaryCard";
import AdminAttentionPanel from "./AdminAttentionPanel";
import ExportReportButton from "./ExportReportButton";
import "../styles/AdminAnalysis.css";

function AdminAnalysis({ result, csvData }) {
  const dashboardRef = useRef(null);
  
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
  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📊 Admin Analysis Dashboard</h2>
        <ExportReportButton 
          dashboardRef={dashboardRef} 
          reportTitle="Admin Analytics Report"
          fileName="admin-report"
        />
      </div>
      <div ref={dashboardRef}>
        <AdminSummaryCard dataset={dataset} />
        <div className="admin-dashboard-wrapper">
          <AnalysisCharts result={result} dataset={dataset} />
          <AdminAttentionPanel dataset={dataset} />
        </div>
      </div>
    </div>
  );
}

export default AdminAnalysis;
