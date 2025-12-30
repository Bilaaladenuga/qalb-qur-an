const prisma = require('../lib/prisma');

/**
 * Get all journal entries for current user
 */
const getEntries = async (req, res) => {
    try {
        const entries = await prisma.journalEntry.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: entries
        });
    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching journal entries.'
        });
    }
};

/**
 * Create a new journal entry
 */
const createEntry = async (req, res) => {
    try {
        const { reflectionText, ayahReference, moodTags } = req.body;

        if (!reflectionText) {
            return res.status(400).json({
                success: false,
                message: 'Please provide reflectionText.'
            });
        }

        const entry = await prisma.journalEntry.create({
            data: {
                userId: req.user.id,
                reflectionText,
                ayahReference,
                moodTags: moodTags || []
            }
        });

        res.status(201).json({
            success: true,
            message: 'Reflection saved. May it bring you closer to Allah 🤲',
            data: entry
        });
    } catch (error) {
        console.error('Create entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating journal entry.'
        });
    }
};

/**
 * Update a journal entry
 */
const updateEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { reflectionText, ayahReference, moodTags } = req.body;

        // Check ownership
        const existing = await prisma.journalEntry.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Journal entry not found.'
            });
        }

        const updatedEntry = await prisma.journalEntry.update({
            where: { id },
            data: {
                ...(reflectionText && { reflectionText }),
                ...(ayahReference !== undefined && { ayahReference }),
                ...(moodTags && { moodTags })
            }
        });

        res.json({
            success: true,
            message: 'Entry updated successfully.',
            data: updatedEntry
        });
    } catch (error) {
        console.error('Update entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating journal entry.'
        });
    }
};

/**
 * Delete a journal entry
 */
const deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existing = await prisma.journalEntry.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Journal entry not found.'
            });
        }

        await prisma.journalEntry.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Entry deleted successfully.'
        });
    } catch (error) {
        console.error('Delete entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting journal entry.'
        });
    }
};

/**
 * Get reflection prompts
 */
const getPrompts = async (req, res) => {
    const prompts = [
        {
            id: 1,
            category: 'Quranic Reflection',
            prompt: 'What ayah touched your heart today? How can you apply its message?'
        },
        {
            id: 2,
            category: 'Gratitude',
            prompt: 'What three blessings are you grateful for today?'
        },
        {
            id: 3,
            category: 'Self-Improvement',
            prompt: 'What is one thing you can do tomorrow to be a better Muslimah?'
        },
        {
            id: 4,
            category: 'Memorization Journey',
            prompt: 'How has your Quran memorization journey affected your daily life?'
        },
        {
            id: 5,
            category: 'Dua',
            prompt: 'What dua is in your heart today? Share your hopes with Allah.'
        },
        {
            id: 6,
            category: 'Spiritual Growth',
            prompt: 'When did you feel closest to Allah this week?'
        }
    ];

    res.json({
        success: true,
        data: prompts
    });
};

/**
 * Get mood statistics based on journal entries
 */
const getMoodStats = async (req, res) => {
    try {
        const entries = await prisma.journalEntry.findMany({
            where: { userId: req.user.id },
            select: { moodTags: true }
        });

        const stats = {};
        entries.forEach(entry => {
            entry.moodTags.forEach(mood => {
                stats[mood] = (stats[mood] || 0) + 1;
            });
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get mood stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mood stats.'
        });
    }
};

module.exports = {
    getEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getPrompts,
    getMoodStats
};
