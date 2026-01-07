const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// =======================
// Debug startup
// =======================
console.log('=== CRYPTO APP STARTING ===');
console.log('__dirname:', __dirname);

const publicPath = path.join(__dirname, '../public');
console.log('Public path:', publicPath);

if (fs.existsSync(publicPath)) {
  console.log('✅ Public folder exists');
} else {
  console.log('❌ Public folder NOT found');
}

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// API ROUTES (FIRST)
// =======================
const singleRoutes = require('../routes/single');

console.log('➡️ Mounting /api/single');
app.use('/api/single', singleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'crypto-api',
    timestamp: new Date().toISOString()
  });
});

// =======================
// Static files (AFTER API)
// =======================
app.use(express.static(publicPath));

// =======================
// Page routes
// =======================
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/token', (req, res) => {
  res.sendFile(path.join(publicPath, 'single-token.html'));
});

app.get('/compare', (req, res) => {
  res.sendFile(path.join(publicPath, 'compare.html'));
});

// =======================
// API 404 handler
// =======================
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.path
    });
  }
  next();
});

// =======================
// Global error handler
// =======================
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

// =======================
// Local dev server
// =======================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Public folder: ${publicPath}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}
