const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist'));
});

app.listen(PORT);
console.log(`listen on port: ${PORT}`);