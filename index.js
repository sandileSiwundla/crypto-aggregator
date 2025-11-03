const express = require('express');
const app = express();
const PORT = 3000;

const allRoutes = require('./routes/all');
const singleRoutes = require('./routes/single');

app.use('/api/all', allRoutes);
app.use('/api/single', singleRoutes);


// Serve static files (CSS, JS)
app.use(express.static('public'));

// Landing page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});


// All cryptos page
app.get('/all', (req, res) => {
  res.sendFile(__dirname + '/views/all-cryptos.html');
});

// Single token page
app.get('/token', (req, res) => {
  res.sendFile(__dirname + '/views/single-token.html');
});

// Compare tokens page
app.get('/compare', (req, res) => {
  res.sendFile(__dirname + '/views/compare.html');
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
