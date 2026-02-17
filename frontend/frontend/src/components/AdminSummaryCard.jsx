import React from 'react';
import { calculateStudentAverage } from '../helpers/performanceHelpers';

const AdminSummaryCard = ({ dataset }) => {
  // Helper: Get total students
  const getTotalStudents = () => {
    return dataset.length;
  };

  // Helper: Get top 3 performers (use subject average if available, otherwise marks)
  const getTopPerformers = () => {
    // Check if dataset has subject columns with actual values
    const hasSubjects = dataset.some(s => (s.math || 0) > 0 || (s.biology || 0) > 0 || (s.physics || 0) > 0);

    let sorted;
    if (hasSubjects) {
      // Sort by subject average
      sorted = [...dataset]
        .map(s => ({...s, performanceScore: calculateStudentAverage(s)}))
        .sort((a, b) => b.performanceScore - a.performanceScore);
    } else {
      // Fall back to marks
      sorted = [...dataset]
        .map(s => ({...s, performanceScore: s.marks}))
        .sort((a, b) => b.performanceScore - a.performanceScore);
    }
    return sorted.slice(0, 3);
  };

  // Helper: Calculate class average (use subject average if available, otherwise marks)
  const getClassAverage = () => {
    if (dataset.length === 0) return 0;
    
    const hasSubjects = dataset.some(s => (s.math || 0) > 0 || (s.biology || 0) > 0 || (s.physics || 0) > 0);
    
    if (hasSubjects) {
      // Average of subject averages
      const total = dataset.reduce((sum, student) => sum + calculateStudentAverage(student), 0);
      return (total / dataset.length).toFixed(2);
    } else {
      // Average of marks
      const total = dataset.reduce((sum, student) => sum + (student.marks || 0), 0);
      return (total / dataset.length).toFixed(2);
    }
  };

  // Helper: Count students below average
  const getCountBelowAverage = () => {
    const average = parseFloat(getClassAverage());
    const hasSubjects = dataset.some(s => (s.math || 0) > 0 || (s.biology || 0) > 0 || (s.physics || 0) > 0);
    
    if (hasSubjects) {
      return dataset.filter(student => calculateStudentAverage(student) < average).length;
    } else {
      return dataset.filter(student => (student.marks || 0) < average).length;
    }
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
                <span className="performer-marks">{performer.performanceScore.toFixed(2)}</span>
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
