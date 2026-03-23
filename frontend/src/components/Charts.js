import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie, Line } from "react-chartjs-2";

// REGISTER
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// GLOBAL DARK THEME
ChartJS.defaults.color = "#e5e7eb";
ChartJS.defaults.borderColor = "rgba(255,255,255,0.1)";

// -----------------------------
// CONFIDENCE BAR (PREMIUM)
// -----------------------------
export const ConfidenceBar = ({ confidence }) => {
  const data = {
    labels: ["Confidence"],
    datasets: [
      {
        label: "Confidence %",
        data: [confidence],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvas, chartArea } = chart;

          if (!chartArea) return "#38bdf8";

          const gradient = canvas.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );

          gradient.addColorStop(0, "#2563eb");
          gradient.addColorStop(1, "#22d3ee");

          return gradient;
        },
        borderRadius: 12,
        barThickness: 45,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
      tooltip: {
        backgroundColor: "#020617",
        borderColor: "#38bdf8",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      x: {
        ticks: { color: "#94a3b8" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="chart-card">
      <h4>Confidence Analysis</h4>
      <Bar data={data} options={options} />
    </div>
  );
};

// -----------------------------
// PIE CHART (GLOW EFFECT)
// -----------------------------
export const SafetyPie = ({ result }) => {
  const isDanger =
    result === "Spam" || result === "Phishing" || result === "Scam";

  const data = {
    labels: ["Safe", "Threat"],
    datasets: [
      {
        data: isDanger ? [15, 85] : [90, 10],
        backgroundColor: ["#10b981", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    animation: {
      duration: 1200,
    },
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
      tooltip: {
        backgroundColor: "#020617",
      },
    },
  };

  return (
    <div className="chart-card">
      <h4>Threat Distribution</h4>
      <Pie data={data} options={options} />
    </div>
  );
};

// -----------------------------
// HISTORY LINE (SMOOTH GLOW)
// -----------------------------
export const HistoryLine = ({ history }) => {
  const data = {
    labels: history.map((h) => h.time),
    datasets: [
      {
        label: "Confidence %",
        data: history.map((h) => h.confidence),
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.15)",
        fill: true,
        tension: 0.5,
        pointRadius: 4,
        pointBackgroundColor: "#22d3ee",
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1200,
    },
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      x: {
        ticks: { color: "#94a3b8" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="chart-card">
      <h4>Scan History</h4>
      <Line data={data} options={options} />
    </div>
  );
};