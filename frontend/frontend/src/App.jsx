import { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
  };

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

  return !result ? (
    <div className="landing">
      {/* Hero Section */}
      <div className="hero">
        <div className="logo">📊</div>
        <h1>Pattern to Insight</h1>
        <p>Upload your CSV file to discover patterns and insights</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <label className={`upload-box ${file ? "file-selected" : ""}`} htmlFor="file-input">
          <div className="upload-content">
            {!file ? (
              <>
                <div className="upload-icon">📤</div>
                <p className="primary">Click to upload or drag and drop</p>
                <p className="secondary">CSV files only</p>
              </>
            ) : (
              <>
                <div className="upload-icon success">✓</div>
                <p className="primary">File uploaded successfully</p>
                <p className="secondary">{file.name}</p>
              </>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <button
          className="analyze-btn"
          onClick={handleUpload}
          disabled={!file}
        >
          Analyze Dataset
        </button>
      </div>
    </div>
  ) : (
    <div className="app-container">
      <h2>Pattern-to-Insight System</h2>

      {/* Charts */}
      {result && (
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
                    label: "Actual",
                    data: thresholdData.values,
                    borderColor: "#2196F3",
                  },
                  {
                    label: "Threshold",
                    data: thresholdData.values.map(
                      () => thresholdData.threshold
                    ),
                    borderColor: "#FF9800",
                    borderDash: [6, 6],
                  },
                ],
              }}
            />
            <div className="chart-insight">
              ⚠️ {result.patterns.threshold.insight}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
