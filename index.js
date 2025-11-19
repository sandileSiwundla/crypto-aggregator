const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const allRoutes = require('./routes/all');
const singleRoutes = require('./routes/single');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Also serve static files from root for any direct file requests
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/all', allRoutes);
app.use('/api/single', singleRoutes);

// HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/all', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/all-cryptos.html'));
});

app.get('/token', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/single-token.html'));
});

app.get('/compare', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/compare.html'));
});

// Export for Vercel
module.exports = app;

// Only run server locally
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
}