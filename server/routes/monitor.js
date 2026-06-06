const express = require('express');
const router = express.Router();
const pkg = require('../package.json');

router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: pkg.version || 'unknown'
  });
});

module.exports = router;
