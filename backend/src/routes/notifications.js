const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Mark a single notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all as read
router.post('/read-all', notificationController.markAllAsRead);

module.exports = router;
