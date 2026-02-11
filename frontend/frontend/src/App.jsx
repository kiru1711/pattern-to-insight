import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
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
    body: formData
  });

  const data = await response.json();
  console.log("BACKEND RESPONSE:", data); // 👈 ADD THIS
  setResult(data);
};
const buildHistogram = (values, binCount = 5) => {
  const nums = values.map(Number);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const binSize = (max - min) / binCount || 1;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    label: `${(min + i * binSize).toFixed(1)}–${(min + (i + 1) * binSize).toFixed(1)}`,
    count: 0,
  }));

  nums.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
    bins[idx].count += 1;
  });

  return bins;
};

const buildAnomalyData = (values) => {
  const nums = values.map(Number);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
  const std = Math.sqrt(variance);

  return nums.map(v => ({
    value: v,
    isAnomaly: v > mean + 2 * std || v < mean - 2 * std,
  }));
};
const buildThresholdData = (values) => {
  const nums = values.map(Number);
  const threshold = nums.reduce((a, b) => a + b, 0) / nums.length;

  return {
    values: nums,
    threshold
  };
};


  return (
<div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>Pattern-to-Insight System</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>Upload Dataset</button>

      <br /><br />
      {result && result.patterns && (
  <div style={{ marginTop: "1.5rem" }}>
    <h3>Comparison Chart</h3>
    
    <Bar
    key="comparison-chart"
    redraw
  data={{
    labels: result.patterns.comparison.categories,
    datasets: [
      {
        label: "Average Performance",
        data: result.patterns.comparison.values.map(Number),
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  }}
  options={{
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#ffffff" }
      },
      x: {
        ticks: { color: "#ffffff" }
      }
    },
    plugins: {
      legend: {
        labels: { color: "#ffffff" }
      }
    }
  }}
/>
<div style={{ height: "24px" }} />
<div className="chart-insight">
    📊 {result.patterns.comparison.insight}
  </div>

  </div>
)}
{result && result.patterns && (
  <div style={{ marginTop: "3rem" }}>
    <h3>Trend Chart</h3>
    <Line
      key="trend-chart"
      redraw
      data={{
        labels: result.patterns.trend.values.map((_, i) => `Point ${i + 1}`),
        datasets: [
          {
            label: "Trend Over Dataset",
            data: result.patterns.trend.values.map(Number),
            borderColor: "#03A9F4",
            backgroundColor: "rgba(3,169,244,0.3)",
            tension: 0.3
          },
        ],
      }}
      options={{
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { color: "#ffffff" } },
          x: { ticks: { color: "#ffffff" } }
        },
        plugins: {
          legend: { labels: { color: "#ffffff" } }
        }
      }}
    />
    <div style={{ height: "24px" }} />
    <div className="chart-insight">
  📈 {result.patterns.trend.insight}
</div>
  </div>
)}
{result && result.patterns && (
  (() => {
    const bins = buildHistogram(result.patterns.trend.values, 5);
    return (
      <div style={{ marginTop: "3rem" }}>
        <h3>Distribution Chart</h3>
        <Bar
          key="distribution-chart"
          redraw
          data={{
            labels: bins.map(b => b.label),
            datasets: [
              {
                label: "Frequency",
                data: bins.map(b => b.count),
                backgroundColor: "#9C27B0",
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true, ticks: { color: "#ffffff" } },
              x: { ticks: { color: "#ffffff" } },
            },
            plugins: {
              legend: { labels: { color: "#ffffff" } },
            },
          }}
        />
        <div style={{ height: "24px" }} />
        <div className="chart-insight">
  📦 {result.patterns.distribution.insight}
</div>
      </div>
    );
  })()
)}

{result && result.patterns && (
  (() => {
    const anomalyData = buildAnomalyData(result.patterns.trend.values);
    return (
      <div style={{ marginTop: "3rem" }}>
        <h3>Anomaly Chart</h3>
        <Line
          key="anomaly-chart"
          redraw
          data={{
            labels: anomalyData.map((_, i) => `Point ${i + 1}`),
            datasets: [
              {
                label: "Normal Values",
                data: anomalyData.map(d => d.isAnomaly ? null : d.value),
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76,175,80,0.3)",
                tension: 0.3,
              },
              {
                label: "Anomalies",
                data: anomalyData.map(d => d.isAnomaly ? d.value : null),
                borderColor: "#F44336",
                backgroundColor: "rgba(244,67,54,0.6)",
                pointRadius: 6,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true, ticks: { color: "#ffffff" } },
              x: { ticks: { color: "#ffffff" } },
            },
            plugins: {
              legend: { labels: { color: "#ffffff" } },
            },
          }}
        />
        <div style={{ height: "24px" }} />
        <div className="chart-insight">
  🚨 {result.patterns.anomaly.insight}
</div>
      </div>
    );
  })()
)}
{result && result.patterns && (
  (() => {
    const thresholdData = buildThresholdData(result.patterns.trend.values);
    return (
      <div style={{ marginTop: "3rem" }}>
        <h3>Threshold Chart</h3>
        <Line
          key="threshold-chart"
          redraw
          data={{
            labels: thresholdData.values.map((_, i) => `Point ${i + 1}`),
            datasets: [
              {
                label: "Actual Values",
                data: thresholdData.values,
                borderColor: "#2196F3",
                backgroundColor: "rgba(33,150,243,0.3)",
                tension: 0.3,
              },
              {
                label: "Threshold",
                data: thresholdData.values.map(() => thresholdData.threshold),
                borderColor: "#FF9800",
                borderDash: [6, 6],
                pointRadius: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true, ticks: { color: "#ffffff" } },
              x: { ticks: { color: "#ffffff" } },
            },
            plugins: {
              legend: { labels: { color: "#ffffff" } },
            },
          }}
        />
        <div style={{ height: "24px" }} />
      </div>
    );
  })()
)}


    </div>
  );
}

export default App;
