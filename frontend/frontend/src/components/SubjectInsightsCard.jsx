import React from 'react';
import { generateSubjectInsights } from '../helpers/performanceHelpers';
import { calculateSubjectAverages } from '../helpers/performanceHelpers';

const SubjectInsightsCard = ({ studentName, dataset }) => {
  // Helper: Find student object from dataset
  const findStudent = () => {
    if (!dataset || !studentName) return null;
    return dataset.find(s => 
      s.name.toLowerCase() === studentName.toLowerCase()
    );
  };

  // Helper: Get subject averages from class
  const getSubjectAverages = () => {
    if (!dataset || dataset.length === 0) {
      return { math: 0, biology: 0, physics: 0 };
    }
    return calculateSubjectAverages(dataset);
  };

  const student = findStudent();
  const subjectAverages = getSubjectAverages();
  
  if (!student) {
    return null;
  }

  const insights = generateSubjectInsights(student, subjectAverages);

  return (
    <div className="subject-insights-card">
      <div className="summary-header">
        <h3>Subject Performance</h3>
      </div>

      <div className="insights-content">
        {/* Strengths Section */}
        <div className="insights-section">
          <h4 className="section-title strengths-title">✨ Areas of Excellence</h4>
          {insights.strengths.length > 0 ? (
            <div className="insights-list">
              {insights.strengths.map((item, index) => (
                <div key={index} className="insight-item strength-item">
                  <div className="insight-subject">
                    <span className="subject-name">{item.subject}</span>
                    <span className="subject-score">{item.studentScore}</span>
                  </div>
                  <div className="insight-detail">
                    <span className="insight-text">
                      {item.studentScore} is above class average ({item.classAverage})
                    </span>
                    <span className="insight-diff">+{item.difference}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-insights">No subjects above class average at this time.</p>
          )}
        </div>

        {/* Improvements Section */}
        <div className="insights-section">
          <h4 className="section-title improvements-title">📚 Areas for Improvement</h4>
          {insights.improvements.length > 0 ? (
            <div className="insights-list">
              {insights.improvements.map((item, index) => (
                <div key={index} className="insight-item improvement-item">
                  <div className="insight-subject">
                    <span className="subject-name">{item.subject}</span>
                    <span className="subject-score">{item.studentScore}</span>
                  </div>
                  <div className="insight-detail">
                    <span className="insight-text">
                      {item.studentScore} is below class average ({item.classAverage})
                    </span>
                    <span className="insight-diff">{item.difference}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-insights">Excellent! All subjects are at or above class average.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectInsightsCard;
