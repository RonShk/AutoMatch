const express = require('express');
const path = require('path'); // Import the path module
const router = express.Router();

router.get('/', (req, res) => {
  // Use path.join to ensure the correct file path
  res.sendFile(path.join(__dirname, '..', '..', 'homepage.html'));
});

router.get('/dashboard', async (req, res) => {
  // Use path.join to ensure the correct file path
  res.sendFile(path.join(__dirname, '..', '..', 'dashboard.html'));
});

module.exports = router;
