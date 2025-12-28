const express = require('express');
const router = express.Router();
const {
    getRecordings,
    saveRecording,
    deleteRecording
} = require('../controllers/recordingsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Recording routes
router.get('/', getRecordings);
router.post('/', saveRecording);
router.delete('/:id', deleteRecording);

module.exports = router;
