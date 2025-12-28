const express = require('express');
const router = express.Router();
const {
    getProgress,
    addProgress,
    updateProgress,
    getGoals,
    createGoal,
    updateGoal
} = require('../controllers/hifzController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Progress routes
router.get('/progress', getProgress);
router.post('/progress', addProgress);
router.put('/progress/:id', updateProgress);

// Goal routes
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);

module.exports = router;
