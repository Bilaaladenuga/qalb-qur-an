const prisma = require('../lib/prisma');

/**
 * Get all recordings for current user
 */
const getRecordings = async (req, res) => {
    try {
        const recordings = await prisma.recording.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: recordings
        });
    } catch (error) {
        console.error('Get recordings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recordings.'
        });
    }
};

/**
 * Save a new recording
 */
const saveRecording = async (req, res) => {
    try {
        const { surahId, surahName, ayahRange, audioUrl, duration } = req.body;

        if (!surahId || !surahName || !ayahRange || !audioUrl) {
            return res.status(400).json({
                success: false,
                message: 'Please provide surahId, surahName, ayahRange, and audioUrl.'
            });
        }

        const recording = await prisma.recording.create({
            data: {
                userId: req.user.id,
                surahId,
                surahName,
                ayahRange,
                audioUrl,
                duration: duration || 0,
                tajwidFeedback: req.body.tajwidFeedback || null,
                sharedWithMentor: req.body.sharedWithMentor || false
            }
        });

        res.status(201).json({
            success: true,
            message: 'Recording saved successfully!',
            data: recording
        });
    } catch (error) {
        console.error('Save recording error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving recording.'
        });
    }
};

/**
 * Delete a recording
 */
const deleteRecording = async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existing = await prisma.recording.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Recording not found.'
            });
        }

        await prisma.recording.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Recording deleted successfully.'
        });
    } catch (error) {
        console.error('Delete recording error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting recording.'
        });
    }
};

module.exports = {
    getRecordings,
    saveRecording,
    deleteRecording
};
