const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user's earned badges
router.get('/my', badgeController.getMyBadges);

// Get all available badges with earned status
router.get('/', badgeController.getAllBadges);

module.exports = router;
