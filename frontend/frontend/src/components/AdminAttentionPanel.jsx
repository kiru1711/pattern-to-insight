import React from 'react';
import { calculateStudentAverage, calculateClassAverage } from '../helpers/performanceHelpers';
import '../styles/AdminAttentionPanel.css';

const AdminAttentionPanel = ({ dataset }) => {
  // Get students needing attention
  const getStudentsNeedingAttention = () => {
    if (!dataset || dataset.length === 0) return [];

    const classAverage = calculateClassAverage(dataset);
    
    // Filter students below class average and sort by lowest average first
    const belowAverage = dataset
      .map(student => {
        const average = calculateStudentAverage(student);
        const weakestSubject = getWeakestSubject(student);
        const improvementNeeded = (classAverage - average).toFixed(2);
        
        return {
          name: student.name,
          average: average.toFixed(2),
          weakestSubject,
          improvementNeeded: Math.abs(improvementNeeded),
        };
      })
      .filter(student => parseFloat(student.average) < classAverage)
      .sort((a, b) => parseFloat(a.average) - parseFloat(b.average));

    return belowAverage;
  };

  // Get weakest subject for a student
  const getWeakestSubject = (student) => {
    const subjects = {
      Math: student.math,
      Biology: student.biology,
      Physics: student.physics,
    };

    return Object.keys(subjects).reduce((weak, subject) =>
      subjects[subject] < subjects[weak] ? subject : weak
    );
  };

  const studentsNeedingAttention = getStudentsNeedingAttention();

  if (studentsNeedingAttention.length === 0) {
    return (
      <div className="attention-panel">
        <h3>🎯 Students Needing Attention</h3>
        <div className="empty-state">
          <p>Excellent! All students are at or above class average.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attention-panel">
      <h3>🎯 Students Needing Attention</h3>
      <div className="attention-table-wrapper">
        <table className="attention-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Avg Score</th>
              <th>Weakest</th>
              <th>Δ Needed</th>
            </tr>
          </thead>
          <tbody>
            {studentsNeedingAttention.map((student, index) => (
              <tr key={index} className="attention-row">
                <td className="student-name">{student.name}</td>
                <td className="avg-score">{student.average}</td>
                <td className="weakest-subject">{student.weakestSubject}</td>
                <td className="improvement-needed">+{student.improvementNeeded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="attention-footer">
        <p className="attention-metric">
          {studentsNeedingAttention.length} of {dataset.length} below average
        </p>
      </div>
    </div>
  );
};

export default AdminAttentionPanel;
