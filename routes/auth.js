const express = require('express');
const router = express.Router();

// Пример заглушки для проверки
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'auth pong' });
});

module.exports = router; 