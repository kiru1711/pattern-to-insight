import AnalysisCharts from "./AnalysisCharts";

function AdminAnalysis({ result }) {
  return (
    <div className="app-container">
      <h2>📊 Admin Analysis Dashboard</h2>
      <AnalysisCharts result={result} />
    </div>
  );
}

export default AdminAnalysis;
