import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TelemetryChart({ history }) {
  // Take latest 20 data points in chronological order
  const chronologicalHistory = [...history].reverse().slice(-25);

  const labels = chronologicalHistory.map((item) => {
    const date = new Date(item.createdAt || Date.now());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const tempData = chronologicalHistory.map((item) => item.temperature);
  const voltData = chronologicalHistory.map((item) => item.voltage);
  const currData = chronologicalHistory.map((item) => item.current);

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: tempData,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: 'yTemp',
      },
      {
        label: 'Voltage (V)',
        data: voltData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: 'yVolt',
      },
      {
        label: 'Current (A)',
        data: currData,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: 'yCurr',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          font: { family: 'Inter', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(55, 65, 81, 0.3)' },
        ticks: { color: '#6b7280', font: { size: 10 } },
      },
      yTemp: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Temp (°C)', color: '#f97316', font: { size: 10 } },
        grid: { color: 'rgba(55, 65, 81, 0.2)' },
        ticks: { color: '#9ca3af', font: { size: 10 } },
      },
      yVolt: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Voltage (V)', color: '#3b82f6', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#9ca3af', font: { size: 10 } },
      },
      yCurr: {
        type: 'linear',
        display: false,
        position: 'right',
      },
    },
  };

  return (
    <div className="p-6 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Live Telemetry Analytics</h3>
          <p className="text-xs text-gray-400">Real-time trend analysis of motor parameters</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          ● REALTIME STREAM
        </span>
      </div>
      <div className="h-[320px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
