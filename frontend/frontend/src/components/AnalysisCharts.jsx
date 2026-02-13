import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

function AnalysisCharts({ result }) {
  /* ---------- helpers ---------- */
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
    if (!result) return "";
    const values = result.patterns.comparison.values.map(Number);
    const categories = result.patterns.comparison.categories;
    
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const maxIndex = values.indexOf(maxValue);
    const minIndex = values.indexOf(minValue);
    const maxName = categories[maxIndex];
    const minName = categories[minIndex];
    
    return `From the comparison chart, ${maxName} shows the highest performance, while ${minName} shows the lowest performance.`;
  };

  const getComparisonBarColors = () => {
    if (!result) return [];
    const values = result.patterns.comparison.values.map(Number);
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

  if (!result) {
    return <div>Loading...</div>;
  }

  return (
    <div className="charts-grid">
      {/* Comparison */}
      <div className="chart-card">
        <h3>Comparison Chart</h3>
        <Bar
          data={{
            labels: result.patterns.comparison.categories,
            datasets: [
              {
                label: "Average Performance",
                data: result.patterns.comparison.values.map(Number),
                backgroundColor: getComparisonBarColors(),
              },
            ],
          }}
        />
        <div className="chart-insight">
          📊 {getComparisonInsight()}
        </div>
      </div>

      {/* Trend */}
      <div className="chart-card">
        <h3>Trend Chart</h3>
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
                backgroundColor: "#9C27B0",
              },
            ],
          }}
        />
        <div className="chart-insight">
          📦 {result.patterns.distribution.insight}
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
