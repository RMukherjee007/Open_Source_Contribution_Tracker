const express = require('express');
const router = express.Router();
const { getGithubMetrics } = require('../controllers/githubController');

// Handles requests sent to /api/github/:username
router.get('/:username', getGithubMetrics);

module.exports = router;
