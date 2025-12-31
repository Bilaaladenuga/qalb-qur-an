const prisma = require('../lib/prisma');
const { getAyahOfTheDay } = require('../utils/quranUtils');
const { checkAndAwardBadges } = require('./gamificationService');
const PDFDocument = require('pdfkit');

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
 * Get the inspirational Ayah of the day
 */
const getDailyAyah = async (req, res) => {
    try {
        const ayah = getAyahOfTheDay();
        res.json({
            success: true,
            data: ayah
        });
    } catch (error) {
        console.error('Get daily ayah error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily ayah.'
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

        // Trigger gamification check
        checkAndAwardBadges(req.user.id, 'journal_count');

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

/**
 * Export all journal entries to PDF
 */
const exportJournalToPDF = async (req, res) => {
    try {
        const entries = await prisma.journalEntry.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        if (!entries || entries.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No journal entries found to export.'
            });
        }

        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Qalb_Quran_Journal_${req.user.username}.pdf`);

        // Pipe to response
        doc.pipe(res);

        // Styling and Content
        doc.fillColor('#8B5CF6').fontSize(26).text('My Spiritual Journey', { align: 'center' });
        doc.fillColor('#6B7280').fontSize(14).text(`Reflections from the heart of ${req.user.username}`, { align: 'center' });
        doc.moveDown(2);
        doc.strokeColor('#E5E7EB').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(2);

        entries.forEach((entry, index) => {
            const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Entry Header
            doc.fillColor('#4B5563').fontSize(10).text(dateStr, { continued: true });
            if (entry.ayahReference) {
                doc.fillColor('#10B981').text(`  |  Quran ${entry.ayahReference}`, { align: 'right' });
            } else {
                doc.text('', { align: 'right' });
            }
            doc.moveDown(0.5);

            // Reflection Text
            doc.fillColor('#1F2937').fontSize(12).text(entry.reflectionText, {
                lineGap: 4,
                align: 'justify'
            });

            // Moods
            if (entry.moodTags && entry.moodTags.length > 0) {
                doc.moveDown(0.5);
                doc.fillColor('#6D28D9').fontSize(9).text(`Feeling: ${entry.moodTags.join(', ')}`);
            }

            doc.moveDown(2);

            // Separator between entries except last
            if (index < entries.length - 1) {
                doc.strokeColor('#F3F4F6').moveTo(100, doc.y).lineTo(500, doc.y).stroke();
                doc.moveDown(2);
            }

            // Simple page breaking
            if (doc.y > 700) {
                doc.addPage();
            }
        });

        doc.end();

    } catch (error) {
        console.error('PDF Export error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF.'
            });
        }
    }
};

module.exports = {
    getEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getPrompts,
    getMoodStats,
    getDailyAyah,
    exportJournalToPDF
};
