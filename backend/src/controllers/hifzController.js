const prisma = require('../lib/prisma');

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

        // Smart Goal Auto-update
        // Find active goals that might be affected by this progress
        const ayahCount = Math.abs(ayahEnd - ayahStart) + 1;
        const today = new Date();

        const activeGoals = await prisma.goal.findMany({
            where: {
                userId: req.user.id,
                isCompleted: false,
                startDate: { lte: today },
                endDate: { gte: today }
            }
        });

        for (const goal of activeGoals) {
            const newProgress = goal.currentProgress + ayahCount;
            const isCompleted = newProgress >= goal.targetValue;

            await prisma.goal.update({
                where: { id: goal.id },
                data: {
                    currentProgress: newProgress,
                    isCompleted
                }
            });
        }

        // Update User Streak
        await updateStreak(req.user.id);

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

/**
 * Helper to update user streak
 */
const updateStreak = async (userId) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
        if (lastActivity) lastActivity.setHours(0, 0, 0, 0);

        let newStreak = user.currentStreak;

        if (!lastActivity) {
            newStreak = 1;
        } else {
            const diffTime = today.getTime() - lastActivity.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);

            if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                newStreak = 1;
            }
            // If diffDays === 0, already recorded today, do nothing to streak
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, user.longestStreak),
                lastActivityDate: new Date()
            }
        });
    } catch (error) {
        console.error('Streak update error:', error);
    }
};

/**
 * Mark a hifz entry as reviewed and calculate next review date
 * using Spaced Repetition Algorithm (SRA)
 */
const markAsReviewed = async (req, res) => {
    try {
        const { id } = req.params;
        const { quality } = req.body; // 1: Hard, 2: Good, 3: Perfect

        const existing = await prisma.hifzProgress.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Progress not found.'
            });
        }

        let newReviewCount = existing.reviewCount + 1;
        let daysToAdd = 1;

        // Simplified SRA logic
        if (quality === 3) { // Perfect
            daysToAdd = Math.pow(2, newReviewCount); // 1, 2, 4, 8, 16...
        } else if (quality === 2) { // Good
            daysToAdd = Math.pow(1.5, newReviewCount); // 1, 1.5, 2.25...
        } else { // Hard (quality 1)
            daysToAdd = 1; // Stay on 1 day
        }

        // Cap review interval at 90 days
        daysToAdd = Math.min(Math.round(daysToAdd), 90);

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

        // Update status if reviewed many times
        let newStatus = existing.status;
        if (newReviewCount > 10 && quality >= 2) {
            newStatus = 'mastered';
        } else if (existing.status === 'memorizing') {
            newStatus = 'reviewing';
        }

        const updatedProgress = await prisma.hifzProgress.update({
            where: { id },
            data: {
                reviewCount: newReviewCount,
                nextReviewDate,
                status: newStatus,
                lastReviewed: new Date()
            }
        });

        // Update User Streak
        await updateStreak(req.user.id);

        res.json({
            success: true,
            message: `Review recorded! Next review in ${daysToAdd} days.`,
            data: updatedProgress
        });
    } catch (error) {
        console.error('Mark as reviewed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording review.'
        });
    }
};

/**
 * Get items due for review today
 */
const getReviewQueue = async (req, res) => {
    try {
        const today = new Date();

        const queue = await prisma.hifzProgress.findMany({
            where: {
                userId: req.user.id,
                OR: [
                    { nextReviewDate: { lte: today } },
                    { nextReviewDate: null } // Items never reviewed
                ],
                status: { not: 'mastered' }
            },
            orderBy: { nextReviewDate: 'asc' }
        });

        res.json({
            success: true,
            data: queue
        });
    } catch (error) {
        console.error('Get review queue error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review queue.'
        });
    }
};

module.exports = {
    getProgress,
    addProgress,
    updateProgress,
    getGoals,
    createGoal,
    updateGoal,
    markAsReviewed,
    getReviewQueue
};
