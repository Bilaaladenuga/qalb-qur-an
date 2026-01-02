const express = require('express');
const router = express.Router();
const tajwidController = require('../controllers/tajwidController');
const { authenticate } = require('../middleware/auth');

router.get('/lessons', authenticate, tajwidController.getLessons);
router.post('/progress', authenticate, tajwidController.updateProgress);

module.exports = router;
