import { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { calculateStudentAverage, calculateSubjectAverages, calculateClassAverage } from "../helpers/performanceHelpers";

function AnalysisCharts({ result, studentName, dataset }) {
  const [showStudentInsight, setShowStudentInsight] = useState(false);

  /* ---------- Helper: Compute subject-based comparison data ---------- */
  const getSubjectBasedComparisonData = () => {
    if (!dataset || dataset.length === 0) {
      // Fallback to result data if no dataset provided
      return {
        categories: result.patterns.comparison.categories,
        values: result.patterns.comparison.values
      };
    }

    // Check if dataset has subject columns (math, biology, physics) with actual values
    const hasSubjects = dataset.some(s => (s.math || 0) > 0 || (s.biology || 0) > 0 || (s.physics || 0) > 0);

    let sortedByAverage;
    if (hasSubjects) {
      // Use subject averages
      sortedByAverage = [...dataset]
        .map(student => ({
          name: student.name,
          average: calculateStudentAverage(student)
        }))
        .sort((a, b) => b.average - a.average);
    } else {
      // Fall back to marks column
      sortedByAverage = [...dataset]
        .map(student => ({
          name: student.name,
          average: student.marks || 0
        }))
        .sort((a, b) => b.average - a.average);
    }

    return {
      categories: sortedByAverage.map(s => s.name),
      values: sortedByAverage.map(s => s.average)
    };
  };

  const comparisonData = getSubjectBasedComparisonData();

  /* ---------- Student POV Comparison Functions ---------- */
  const getStudentIndex = () => {
    if (!studentName) return -1;
    
    const categories = comparisonData.categories;
    return categories.findIndex(cat =>
      cat.toLowerCase() === studentName.toLowerCase() ||
      cat.toLowerCase().includes(studentName.toLowerCase())
    );
  };

  const getStudentComparisonInsight = () => {
    if (!studentName) return "";
    
    const categories = comparisonData.categories;
    const values = comparisonData.values.map(Number);
    const studentIndex = getStudentIndex();
    
    if (studentIndex === -1) return "Your data could not be found in the dataset.";
    
    const studentValue = values[studentIndex];
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    // Rule 1: Student has the highest value
    if (studentValue === maxValue) {
      return "You top the dataset.";
    }
    
    // Rule 2: Student has the lowest value
    if (studentValue === minValue) {
      return "You are currently at the bottom of the dataset and need improvement.";
    }
    
    // Rule 3: Otherwise - find next higher and calculate percentages
    const higherValues = values.filter(v => v > studentValue);
    
    if (higherValues.length === 0) {
      return "You top the dataset.";
    }
    
    const nextHigher = Math.min(...higherValues);
    const percentToNext = ((nextHigher - studentValue) / studentValue * 100).toFixed(1);
    const percentToTop = ((maxValue - studentValue) / studentValue * 100).toFixed(1);
    
    return `You are ${percentToNext}% away from the next higher performer and ${percentToTop}% away from topping the dataset.`;
  };

  const getStudentComparisonColors = () => {
    const values = comparisonData.values.map(Number);
    
    // If no student context, use original admin colors
    if (!studentName) {
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      
      return values.map((value) => {
        if (value === maxValue) return "#4CAF50"; // Green for highest
        if (value === minValue) return "#F44336"; // Red for lowest
        return "#2196F3"; // Blue for others
      });
    }
    
    // Student POV: highlight student's bar, neutral for others
    const studentIndex = getStudentIndex();
    
    return values.map((_, index) => {
      if (index === studentIndex) {
        return "#1F6FEB"; // Highlight color for student's bar
      }
      return "#8B949E"; // Neutral gray for other bars
    });
  };


  const buildHistogram = (values, binCount = 5) => {
    const nums = values.map(Number);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const binSize = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      label: `${(min + i * binSize).toFixed(1)}–${(
        min +
        (i + 1) * binSize
      ).toFixed(1)}`,
      count: 0,
    }));

    nums.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      bins[idx].count += 1;
    });

    return bins;
  };

  const buildAnomalyData = (values) => {
    const nums = values.map(Number);
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const variance =
      nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
    const std = Math.sqrt(variance);

    return nums.map((v) => ({
      value: v,
      isAnomaly: v > mean + 2 * std || v < mean - 2 * std,
    }));
  };

  const buildThresholdData = (values) => {
    const nums = values.map(Number);
    return {
      values: nums,
      threshold: nums.reduce((a, b) => a + b, 0) / nums.length,
    };
  };

  /* ---------- derived data ---------- */
  const bins =
    result && buildHistogram(result.patterns.trend.values, 5);
  const anomalyData =
    result && buildAnomalyData(result.patterns.trend.values);
  const thresholdData =
    result && buildThresholdData(result.patterns.trend.values);

  // Comparison chart helpers
  const getComparisonInsight = () => {
    const values = comparisonData.values.map(Number);
    const categories = comparisonData.categories;
    
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const maxIndex = values.indexOf(maxValue);
    const minIndex = values.indexOf(minValue);
    const maxName = categories[maxIndex];
    const minName = categories[minIndex];
    
    return `From the comparison chart, ${maxName} shows the highest performance, while ${minName} shows the lowest performance.`;
  };

  const getComparisonBarColors = () => {
    const values = comparisonData.values.map(Number);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    return values.map((value) => {
      if (value === maxValue) return "#4CAF50"; // Green for highest
      if (value === minValue) return "#F44336"; // Red for lowest
      return "#2196F3"; // Blue for others
    });
  };

  const getThresholdSplitData = () => {
    if (!thresholdData) return { above: [], below: [] };
    
    const threshold = thresholdData.threshold;
    const values = thresholdData.values;
    
    return {
      above: values.map((v) => (v >= threshold ? v : null)),
      below: values.map((v) => (v < threshold ? v : null)),
    };
  };

  const getThresholdCounts = () => {
    if (!thresholdData) return { above: 0, below: 0 };
    
    const threshold = thresholdData.threshold;
    const values = thresholdData.values;
    
    const above = values.filter((v) => v >= threshold).length;
    const below = values.filter((v) => v < threshold).length;
    
    return { above, below };
  };

  const getThresholdInsight = () => {
    const counts = getThresholdCounts();
    const total = counts.above + counts.below;
    
    if (total === 0) return "No data available to analyze.";
    
    const belowPercentage = (counts.below / total) * 100;
    const abovePercentage = (counts.above / total) * 100;
    
    if (belowPercentage > 60) {
      return "A majority of values fall below the defined threshold, indicating underperformance.";
    } else if (abovePercentage > 50) {
      return "Most values exceed the threshold, indicating acceptable or improving performance.";
    } else {
      return "Values are distributed around the threshold, indicating mixed performance.";
    }
  };

  /* ---------- Student Subject Performance Functions ---------- */
  const getStudentSubjectData = () => {
    if (!dataset || !studentName) return null;
    
    // Find student in dataset
    const student = dataset.find(s => 
      s.name.toLowerCase() === studentName.toLowerCase()
    );
    
    if (!student) return null;
    
    return {
      name: student.name,
      math: student.math || 0,
      biology: student.biology || 0,
      physics: student.physics || 0
    };
  };

  const getSubjectClassAverages = () => {
    if (!dataset) return { math: 0, biology: 0, physics: 0 };
    return calculateSubjectAverages(dataset);
  };

  const getStudentSubjectInsight = () => {
    const studentData = getStudentSubjectData();
    const classAvgs = getSubjectClassAverages();
    
    if (!studentData) return "Student data not found.";
    
    const strengths = [];
    const improvements = [];
    
    // Check each subject
    [
      { subject: "Math", score: studentData.math, classAvg: classAvgs.math },
      { subject: "Biology", score: studentData.biology, classAvg: classAvgs.biology },
      { subject: "Physics", score: studentData.physics, classAvg: classAvgs.physics }
    ].forEach(item => {
      if (item.score > item.classAvg) {
        strengths.push(`${item.subject} (${item.score})`);
      } else if (item.score < item.classAvg) {
        improvements.push(`${item.subject} (${item.score})`);
      }
    });
    
    let insight = "";
    if (strengths.length > 0) {
      insight += `Strengths: ${strengths.join(", ")}. `;
    }
    if (improvements.length > 0) {
      insight += `Areas for improvement: ${improvements.join(", ")}.`;
    }
    if (strengths.length === 0 && improvements.length === 0) {
      insight = "Your performance is consistent across all subjects.";
    }
    
    return insight;
  };

  /* ---------- Distribution Chart Functions ---------- */
  const getStudentDistributionPosition = () => {
    const studentData = getStudentSubjectData();
    if (!studentData || !bins) return -1;

    const studentAverage = calculateStudentAverage(studentData);
    
    // Find which bin the student falls into
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      // Parse bin label to get range
      const [minStr, maxStr] = bin.label.split('–');
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      
      if (studentAverage >= min && studentAverage <= max) {
        return i;
      }
    }
    return -1;
  };

  const getDistributionBinColors = () => {
    if (!studentName) {
      // Admin mode: use default color
      return bins.map(() => "#9C27B0");
    }
    
    // Student mode: highlight student's bin
    const studentBinIndex = getStudentDistributionPosition();
    return bins.map((_, index) => 
      index === studentBinIndex ? "#1F6FEB" : "#9C27B0"
    );
  };

  const getStudentDistributionInsight = () => {
    const studentData = getStudentSubjectData();
    if (!studentData) return "Student data not found.";

    const studentAverage = calculateStudentAverage(studentData);
    const classAverage = calculateClassAverage(dataset);
    
    // Determine range
    let range = "average";
    if (studentAverage > classAverage) {
      range = "above average";
    } else if (studentAverage < classAverage) {
      range = "below average";
    }

    // Classify into high/average/lower based on percentile
    const sorted = [...dataset]
      .map(s => calculateStudentAverage(s))
      .sort((a, b) => a - b);
    
    const percentile = (sorted.filter(v => v <= studentAverage).length / sorted.length) * 100;
    let classification = "lower range";
    if (percentile > 75) {
      classification = "upper range";
    } else if (percentile > 50) {
      classification = "middle range";
    }

    return `Your score of ${studentAverage.toFixed(2)} places you in the ${classification} of the class distribution (${range}).`;
  };

  if (!result) {
    return <div>Loading...</div>;
  }

  return (
    <div className="charts-grid">
      {/* Comparison */}
      <div
        className="chart-card"
        onClick={() => {
          if (studentName) {
            setShowStudentInsight(!showStudentInsight);
          }
        }}
        style={{ cursor: studentName ? "pointer" : "default" }}
      >
        <h3>Comparison Chart</h3>
        <Bar
          data={{
            labels: comparisonData.categories,
            datasets: [
              {
                label: "Average Performance",
                data: comparisonData.values.map(Number),
                backgroundColor: getStudentComparisonColors(),
              },
            ],
          }}
        />
        {studentName ? (
          <>
            {!showStudentInsight && (
              <div className="chart-insight-prompt">
                💡 Click to know about your analysis
              </div>
            )}
            {showStudentInsight && (
              <div className="chart-insight">
                📊 {getStudentComparisonInsight()}
              </div>
            )}
          </>
        ) : (
          <div className="chart-insight">
            📊 {getComparisonInsight()}
          </div>
        )}
      </div>

      {/* Trend / Subject Performance */}
      <div className="chart-card">
        <h3>{studentName ? "Subject Performance" : "Trend Chart"}</h3>
        {studentName ? (
          <>
            <Line
              data={{
                labels: ["Math", "Biology", "Physics"],
                datasets: [
                  {
                    label: "Your Performance",
                    data: [
                      getStudentSubjectData()?.math || 0,
                      getStudentSubjectData()?.biology || 0,
                      getStudentSubjectData()?.physics || 0
                    ],
                    borderColor: "#1F6FEB",
                    backgroundColor: "rgba(31, 111, 235, 0.1)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: "#1F6FEB"
                  },
                  {
                    label: "Class Average",
                    data: [
                      getSubjectClassAverages().math,
                      getSubjectClassAverages().biology,
                      getSubjectClassAverages().physics
                    ],
                    borderColor: "#8B949E",
                    backgroundColor: "rgba(139, 148, 158, 0.05)",
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: "#8B949E"
                  }
                ],
              }}
            />
            <div className="chart-insight">
              📚 {getStudentSubjectInsight()}
            </div>
          </>
        ) : (
          <>
            <Line
              data={{
                labels: result.patterns.trend.values.map(
                  (_, i) => `Point ${i + 1}`
                ),
                datasets: [
                  {
                    label: "Trend",
                    data: result.patterns.trend.values.map(Number),
                    borderColor: "#03A9F4",
                    tension: 0.3,
                  },
                ],
              }}
            />
            <div className="chart-insight">
              📈 {result.patterns.trend.insight}
            </div>
          </>
        )}
      </div>

      {/* Distribution */}
      <div className="chart-card">
        <h3>Distribution Chart</h3>
        <Bar
          data={{
            labels: bins.map((b) => b.label),
            datasets: [
              {
                label: "Frequency",
                data: bins.map((b) => b.count),
                backgroundColor: getDistributionBinColors(),
              },
            ],
          }}
        />
        <div className="chart-insight">
          📦 {studentName ? getStudentDistributionInsight() : result.patterns.distribution.insight}
        </div>
      </div>

      {/* Anomaly */}
      <div className="chart-card">
        <h3>Anomaly Chart</h3>
        <Line
          data={{
            labels: anomalyData.map(
              (_, i) => `Point ${i + 1}`
            ),
            datasets: [
              {
                label: "Normal",
                data: anomalyData.map((d) =>
                  d.isAnomaly ? null : d.value
                ),
                borderColor: "#4CAF50",
              },
              {
                label: "Anomaly",
                data: anomalyData.map((d) =>
                  d.isAnomaly ? d.value : null
                ),
                borderColor: "#F44336",
                pointRadius: 6,
              },
            ],
          }}
        />
        <div className="chart-insight">
          🚨 {result.patterns.anomaly.insight}
        </div>
      </div>

      {/* Threshold */}
      <div className="chart-card">
        <h3>Threshold Chart</h3>
        <Line
          data={{
            labels: thresholdData.values.map(
              (_, i) => `Point ${i + 1}`
            ),
            datasets: [
              {
                label: "Above Threshold",
                data: getThresholdSplitData().above,
                borderColor: "#2196F3",
                backgroundColor: "#2196F3",
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false,
              },
              {
                label: "Below Threshold",
                data: getThresholdSplitData().below,
                borderColor: "#F44336",
                backgroundColor: "#F44336",
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false,
              },
              {
                label: "Threshold",
                data: thresholdData.values.map(
                  () => thresholdData.threshold
                ),
                borderColor: "#FF9800",
                borderDash: [6, 6],
                pointRadius: 0,
                tension: 0,
              },
            ],
          }}
        />
        <div className="threshold-summary">
          <div className="summary-item threshold-value">
            <span className="summary-label">Threshold:</span>
            <span className="summary-value">{thresholdData.threshold.toFixed(2)}</span>
          </div>
          <div className="summary-item above">
            <span className="summary-label">Points above:</span>
            <span className="summary-value">{getThresholdCounts().above}</span>
          </div>
          <div className="summary-item below">
            <span className="summary-label">Points below:</span>
            <span className="summary-value">{getThresholdCounts().below}</span>
          </div>
        </div>
        <div className="chart-insight">
          ⚠️ {getThresholdInsight()}
        </div>
      </div>
    </div>
  );
}

export default AnalysisCharts;
