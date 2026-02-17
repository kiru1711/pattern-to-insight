import React from 'react';
import StudentSummaryCard from './StudentSummaryCard';
import SubjectInsightsCard from './SubjectInsightsCard';
import AnalysisCharts from './AnalysisCharts';
import '../styles/StudentDashboard.css';

const StudentDashboard = ({ result, studentName, dataset }) => {
  return (
    <div className="student-dashboard">
      {/* Row 1: Full-width Summary Card */}
      <div className="dashboard-summary">
        <StudentSummaryCard studentName={studentName} dataset={dataset} />
      </div>

      {/* Rows 2-3: Charts */}
      <div className="dashboard-charts-section">
        <AnalysisCharts result={result} studentName={studentName} dataset={dataset} />
      </div>

      {/* Row 3: Subject Insights (positioned next to Subject Performance chart) */}
      <div className="dashboard-insights-section">
        <SubjectInsightsCard studentName={studentName} dataset={dataset} />
      </div>
    </div>
  );
};

export default StudentDashboard;
