const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// ✅ Serve everything from /public
app.use(express.static(path.join(__dirname, '../public')));

// ❌ DO NOT manually serve index.html anymore
// ❌ DO NOT use app.get('*') for frontend

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
