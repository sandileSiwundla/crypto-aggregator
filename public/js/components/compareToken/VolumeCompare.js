import { LineChart } from '@mui/x-charts/LineChart';

// Sample data for price history
const priceHistory = [
  { date: '2025-01-01', bitcoin: 45000, ethereum: 3200 },
  { date: '2025-01-02', bitcoin: 45500, ethereum: 3250 },
  { date: '2025-01-03', bitcoin: 44200, ethereum: 3100 },
  // ... more data
];

function CryptoPriceChart({ data }) {
  // Transform data for the chart
  const dates = data.map(entry => entry.date);
  const bitcoinPrices = data.map(entry => entry.bitcoin);
  const ethereumPrices = data.map(entry => entry.ethereum);

  return (
    <LineChart
      width={800}
      height={400}
      series={[
        { data: bitcoinPrices, label: 'BTC', yAxisKey: 'price' },
        { data: ethereumPrices, label: 'ETH', yAxisKey: 'price' },
      ]}
      xAxis={[{ data: dates, scaleType: 'point' }]}
      yAxis={[{ id: 'price', scaleType: 'linear' }]}
    />
  );
}