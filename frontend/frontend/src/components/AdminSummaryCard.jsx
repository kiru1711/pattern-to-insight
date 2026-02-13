import React from 'react';

const AdminSummaryCard = ({ dataset }) => {
  // Helper: Get total students
  const getTotalStudents = () => {
    return dataset.length;
  };

  // Helper: Get top 3 performers
  const getTopPerformers = () => {
    const sorted = [...dataset].sort((a, b) => b.marks - a.marks);
    return sorted.slice(0, 3);
  };

  // Helper: Calculate class average
  const getClassAverage = () => {
    if (dataset.length === 0) return 0;
    const total = dataset.reduce((sum, student) => sum + student.marks, 0);
    return (total / dataset.length).toFixed(2);
  };

  // Helper: Count students below average
  const getCountBelowAverage = () => {
    const average = parseFloat(getClassAverage());
    return dataset.filter(student => student.marks < average).length;
  };

  const totalStudents = getTotalStudents();
  const topPerformers = getTopPerformers();
  const classAverage = getClassAverage();
  const belowAverageCount = getCountBelowAverage();

  return (
    <div className="admin-summary-card">
      <div className="summary-header">
        <h3>Class Overview</h3>
      </div>
      <div className="summary-content">
        {/* Top 3 Performers */}
        <div className="top-performers-section">
          <h4>Top 3 Performers</h4>
          <div className="top-performers-list">
            {topPerformers.map((performer, index) => (
              <div key={index} className="performer-item">
                <span className="performer-rank">#{index + 1}</span>
                <span className="performer-name">{performer.name}</span>
                <span className="performer-marks">{performer.marks}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="admin-summary-stats">
          <div className="admin-stat">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{totalStudents}</span>
          </div>
          <div className="admin-stat">
            <span className="stat-label">Class Average</span>
            <span className="stat-value">{classAverage}</span>
          </div>
          <div className="admin-stat">
            <span className="stat-label">Below Average</span>
            <span className="stat-value">{belowAverageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummaryCard;
