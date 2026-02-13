function StudentSummaryCard({ studentName, dataset }) {
  // Compute total students
  const totalStudents = dataset.length;

  // Find student's rank based on marks
  const findStudentRank = () => {
    // Find student's data
    const student = dataset.find(
      s => s.name.toLowerCase() === studentName.toLowerCase()
    );
    
    if (!student) return null;
    
    // Count students with marks greater than this student, then add 1 for rank
    const studentsAhead = dataset.filter(s => s.marks > student.marks).length;
    const rank = studentsAhead + 1;
    
    return rank;
  };

  const studentRank = findStudentRank();

  // Compute percentile (percentage of students this student scored below or tied with)
  const computePercentile = () => {
    if (!studentRank) return 0;
    return ((studentRank - 1) / totalStudents) * 100;
  };

  const percentile = computePercentile();

  // Determine status badge based on percentile
  const getStatusBadge = () => {
    if (percentile <= 10) {
      return { label: "Top Performer", color: "#238636" }; // Green
    } else if (percentile <= 50) {
      return { label: "Above Average", color: "#1F6FEB" }; // Blue
    } else if (percentile <= 75) {
      return { label: "Average", color: "#FF9800" }; // Orange
    } else {
      return { label: "Needs Improvement", color: "#F44336" }; // Red
    }
  };

  const status = getStatusBadge();

  if (!studentRank) {
    return <div className="student-summary-card">Status unavailable.</div>;
  }

  return (
    <div className="student-summary-card">
      <div className="summary-header">
        <h3>Your Performance</h3>
      </div>

      <div className="summary-content">
        <div className="rank-display">
          <div className="rank-item">
            <span className="rank-label">Rank</span>
            <span className="rank-value">{studentRank} / {totalStudents}</span>
          </div>
          <div className="status-badge" style={{ backgroundColor: status.color }}>
            {status.label}
          </div>
        </div>

        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{totalStudents}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSummaryCard;
