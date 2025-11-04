const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const allRoutes = require('./routes/all');
const singleRoutes = require('./routes/single');

// API routes
app.use('/api/all', allRoutes);
app.use('/api/single', singleRoutes);

// Serve static files (CSS, JS) - important for Vercel
app.use(express.static('public'));

// HTML pages
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/all', (req, res) => {
  res.sendFile(__dirname + '/views/all-cryptos.html');
});

app.get('/token', (req, res) => {
  res.sendFile(__dirname + '/views/single-token.html');
});

app.get('/compare', (req, res) => {
  res.sendFile(__dirname + '/views/compare.html');
});

// Export for Vercel
module.exports = app;

// Only run server locally
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
}