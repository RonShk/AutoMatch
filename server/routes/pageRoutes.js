const express = require('express');
const path = require('path'); // Import the path module
const router = express.Router();

router.get('/', (req, res) => {
  // Use path.join to ensure the correct file path
  res.sendFile(path.join(__dirname, '..', '..', 'HTML', 'homepage.html'));
});

router.get('/dashboard', async (req, res) => {
  // Use path.join to ensure the correct file path
  res.sendFile(path.join(__dirname, '..', '..', 'HTML', 'dashboard.html'));
});

router.get('/reset/password/page', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'HTML', 'forgotPasswordPage.html'));
})

module.exports = router;
