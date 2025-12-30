const express = require('express');
const router = express.Router();
const {
    getEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getPrompts,
    getMoodStats
} = require('../controllers/journalController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Journal entry routes
router.get('/', getEntries);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

// Analytics & Prompts
router.get('/prompts', getPrompts);
router.get('/mood-stats', getMoodStats);

module.exports = router;
