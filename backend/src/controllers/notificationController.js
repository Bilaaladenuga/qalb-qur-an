const prisma = require('../lib/prisma');

/**
 * Get notifications for the current user
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to latest 50
        });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications.'
        });
    }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification || notification.userId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found.'
            });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification.'
        });
    }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.user.id,
                isRead: false
            },
            data: { isRead: true }
        });

        res.json({
            success: true,
            message: 'All notifications marked as read.'
        });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notifications.'
        });
    }
};

/**
 * Helper to create a notification (internal use)
 */
const createNotification = async ({ userId, type, title, message, data }) => {
    try {
        return await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data
            }
        });
    } catch (error) {
        console.error('Create notification error:', error);
        // We don't throw here to not break the calling process (e.g. post creation)
        return null;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
};
