const prisma = require('../lib/prisma');

/**
 * Get all badges earned by the current user
 */
const getMyBadges = async (req, res) => {
    try {
        const userBadges = await prisma.userBadge.findMany({
            where: { userId: req.user.id },
            include: {
                badge: true
            },
            orderBy: { earnedAt: 'desc' }
        });

        const badges = userBadges.map(ub => ({
            ...ub.badge,
            earnedAt: ub.earnedAt
        }));

        res.json({
            success: true,
            data: badges
        });
    } catch (error) {
        console.error('Get my badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching badges.'
        });
    }
};

/**
 * Get all available badges (to show what can be earned)
 */
const getAllBadges = async (req, res) => {
    try {
        const badges = await prisma.badge.findMany({
            orderBy: { requirement: 'asc' }
        });

        // Also get user's earned badge IDs for comparison
        const earnedBadges = await prisma.userBadge.findMany({
            where: { userId: req.user.id },
            select: { badgeId: true }
        });

        const earnedIds = earnedBadges.map(eb => eb.badgeId);

        const data = badges.map(badge => ({
            ...badge,
            isEarned: earnedIds.includes(badge.id)
        }));

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get all badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching badges list.'
        });
    }
};

module.exports = {
    getMyBadges,
    getAllBadges
};
