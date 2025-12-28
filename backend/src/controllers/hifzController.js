const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all hifz progress for current user
 */
const getProgress = async (req, res) => {
    try {
        const progress = await prisma.hifzProgress.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate stats
        const stats = {
            total: progress.length,
            memorizing: progress.filter(p => p.status === 'memorizing').length,
            reviewing: progress.filter(p => p.status === 'reviewing').length,
            mastered: progress.filter(p => p.status === 'mastered').length
        };

        res.json({
            success: true,
            data: {
                progress,
                stats
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress.'
        });
    }
};

/**
 * Add new hifz progress
 */
const addProgress = async (req, res) => {
    try {
        const { surahId, surahName, ayahStart, ayahEnd, status } = req.body;

        if (!surahId || !surahName || !ayahStart || !ayahEnd) {
            return res.status(400).json({
                success: false,
                message: 'Please provide surahId, surahName, ayahStart, and ayahEnd.'
            });
        }

        const progress = await prisma.hifzProgress.create({
            data: {
                userId: req.user.id,
                surahId,
                surahName,
                ayahStart,
                ayahEnd,
                status: status || 'memorizing'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Progress added successfully! May Allah bless your memorization 🤲',
            data: progress
        });
    } catch (error) {
        console.error('Add progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding progress.'
        });
    }
};

/**
 * Update hifz progress
 */
const updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewCount, nextReviewDate, memorizedDate } = req.body;

        // Check ownership
        const existing = await prisma.hifzProgress.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Progress not found.'
            });
        }

        const updatedProgress = await prisma.hifzProgress.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(reviewCount !== undefined && { reviewCount }),
                ...(nextReviewDate && { nextReviewDate: new Date(nextReviewDate) }),
                ...(memorizedDate && { memorizedDate: new Date(memorizedDate) })
            }
        });

        res.json({
            success: true,
            message: 'Progress updated successfully!',
            data: updatedProgress
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating progress.'
        });
    }
};

/**
 * Get all goals for current user
 */
const getGoals = async (req, res) => {
    try {
        const goals = await prisma.goal.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: goals
        });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching goals.'
        });
    }
};

/**
 * Create a new goal
 */
const createGoal = async (req, res) => {
    try {
        const { type, targetValue, description, startDate, endDate } = req.body;

        if (!type || !targetValue || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide type, targetValue, startDate, and endDate.'
            });
        }

        const goal = await prisma.goal.create({
            data: {
                userId: req.user.id,
                type,
                targetValue,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }
        });

        res.status(201).json({
            success: true,
            message: 'Goal created! May Allah help you achieve it 🌙',
            data: goal
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating goal.'
        });
    }
};

/**
 * Update goal progress
 */
const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentProgress, isCompleted } = req.body;

        // Check ownership
        const existing = await prisma.goal.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found.'
            });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: {
                ...(currentProgress !== undefined && { currentProgress }),
                ...(isCompleted !== undefined && { isCompleted })
            }
        });

        res.json({
            success: true,
            message: isCompleted ? 'Congratulations! Goal completed! 🎉' : 'Progress updated!',
            data: updatedGoal
        });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating goal.'
        });
    }
};

module.exports = {
    getProgress,
    addProgress,
    updateProgress,
    getGoals,
    createGoal,
    updateGoal
};
