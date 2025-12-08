// File: /components/compareToken/MUIVolumeChart.jsx
import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

export default function MUIVolumeChart() {
  // Dummy data for Aster and Hyperliquid (in Billions USD)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      {
        label: 'Aster',
        data: [11.1, 10.8, 12.5, 9.7, 13.2, 14.0],
        color: '#3b82f6',
      },
      {
        label: 'Hyperliquid',
        data: [12.5, 11.9, 13.8, 10.5, 14.1, 15.2],
        color: '#8b5cf6',
      },
    ],
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
      <h3>🔍 MUI X-Charts Test (React Component)</h3>
      <p>This is a standalone React component using @mui/x-charts.</p>
      <div style={{ height: 400, width: '100%' }}>
        <BarChart
          xAxis={[{ scaleType: 'band', data: chartData.labels }]}
          series={chartData.series.map(s => ({
            data: s.data,
            label: s.label,
            color: s.color,
          }))}
          height={350}
        />
      </div>
      <p><strong>Status:</strong> Component rendered successfully with dummy data.</p>
    </div>
  );
}