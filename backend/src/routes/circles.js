const express = require('express');
const router = express.Router();
const {
    createCircle,
    joinCircle,
    getMyCircles,
    postToCircle,
    getCircleFeed
} = require('../controllers/circleController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Circle management
router.get('/', getMyCircles);
router.post('/', createCircle);
router.post('/join', joinCircle);

// Circle feed/posts
router.get('/:circleId/feed', getCircleFeed);
router.post('/:circleId/posts', postToCircle);

module.exports = router;
