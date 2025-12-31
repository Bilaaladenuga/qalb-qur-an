const prisma = require('../lib/prisma');
const { createNotification } = require('./notificationController');

/**
 * Check and award badges to a user based on a specific trigger
 * @param {string} userId - ID of the user
 * @param {string} type - Trigger type (streak, journal_count, circle_post)
 */
const checkAndAwardBadges = async (userId, type) => {
    try {
        // 1. Get user progress based on trigger type
        let currentValue = 0;

        if (type === 'streak') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            currentValue = user?.currentStreak || 0;
        } else if (type === 'journal_count') {
            currentValue = await prisma.journalEntry.count({ where: { userId } });
        } else if (type === 'circle_post') {
            currentValue = await prisma.circlePost.count({ where: { userId } });
        }

        // 2. Find eligible badges of this type that the user doesn't have yet
        const eligibleBadges = await prisma.badge.findMany({
            where: {
                type,
                requirement: { lte: currentValue },
                users: {
                    none: { userId }
                }
            }
        });

        // 3. Award each eligible badge
        for (const badge of eligibleBadges) {
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badge.id
                }
            });

            // 4. Notify the user
            await createNotification({
                userId,
                type: 'goal_reached', // We use goal_reached for badges too
                title: 'New Badge Earned! 🏆',
                message: `Congratulations! You've earned the "${badge.name}" badge: ${badge.description}`,
                data: { badgeId: badge.id }
            });

            console.log(`Badge "${badge.name}" awarded to user ${userId}`);
        }
    } catch (error) {
        console.error('Check and award badges error:', error);
    }
};

module.exports = {
    checkAndAwardBadges
};
