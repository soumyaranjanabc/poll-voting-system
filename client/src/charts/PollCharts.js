import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444','#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16',
];

export const PieChart = ({ results, title }) => {
  const data = {
    labels: results.map((r) => r.option_text),
    datasets: [
      {
        data: results.map((r) => r.vote_count),
        backgroundColor: results.map((_, i) => COLORS[i % COLORS.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: title || 'Vote Distribution', font: { size: 14, weight: 'bold' } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${ctx.raw} votes (${pct}%)`;
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export const BarChart = ({ results, title }) => {
  const data = {
    labels: results.map((r) => r.option_text),
    datasets: [
      {
        label: 'Votes',
        data: results.map((r) => r.vote_count),
        backgroundColor: results.map((_, i) => COLORS[i % COLORS.length] + 'cc'),
        borderColor: results.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title || 'Vote Count by Option', font: { size: 14, weight: 'bold' } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: '#f3f4f6' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
