import AnalysisCharts from "./AnalysisCharts";
import AdminSummaryCard from "./AdminSummaryCard";

function AdminAnalysis({ result, csvData }) {
  // Helper: Build dataset from CSV
  const buildDataset = () => {
    if (!csvData || csvData.length < 2) return [];
    
    const headers = csvData[0].map(h => h.toLowerCase().trim());
    const nameColIndex = headers.findIndex(h => h === 'name' || h === 'student');
    const marksColIndex = headers.findIndex(h => h === 'marks' || h === 'score' || h === 'performance' || h === 'value');
    
    const actualNameIdx = nameColIndex >= 0 ? nameColIndex : 0;
    const actualMarksIdx = marksColIndex >= 0 ? marksColIndex : 1;
    
    return csvData.slice(1).map(row => ({
      name: row[actualNameIdx] || 'Unknown',
      marks: parseFloat(row[actualMarksIdx]) || 0
    }));
  };

  const dataset = buildDataset();
  return (
    <div className="app-container">
      <h2>📊 Admin Analysis Dashboard</h2>
      <AdminSummaryCard dataset={dataset} />
      <AnalysisCharts result={result} />
    </div>
  );
}

export default AdminAnalysis;
