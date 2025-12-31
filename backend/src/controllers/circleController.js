const prisma = require('../lib/prisma');
const crypto = require('crypto');
const { createNotification } = require('./notificationController');
const { checkAndAwardBadges } = require('./gamificationService');

/**
 * Create a new Sister Circle
 */
const createCircle = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a name for your circle.'
            });
        }

        // Generate unique invite code
        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const circle = await prisma.circle.create({
            data: {
                name,
                description,
                inviteCode,
                creatorId: req.user.id,
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'creator'
                    }
                }
            },
            include: {
                members: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Circle created! Share your code to invite your sisters 🌸',
            data: circle
        });
    } catch (error) {
        console.error('Create circle error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating circle.'
        });
    }
};

/**
 * Join a circle using invite code
 */
const joinCircle = async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an invite code.'
            });
        }

        const circle = await prisma.circle.findUnique({
            where: { inviteCode }
        });

        if (!circle) {
            return res.status(404).json({
                success: false,
                message: 'Circle not found. Please check the code.'
            });
        }

        // Check if already a member
        const existingMember = await prisma.circleMember.findUnique({
            where: {
                circleId_userId: {
                    circleId: circle.id,
                    userId: req.user.id
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this circle.'
            });
        }

        const member = await prisma.circleMember.create({
            data: {
                circleId: circle.id,
                userId: req.user.id
            }
        });

        res.json({
            success: true,
            message: `Welcome to ${circle.name}! 🌙`,
            data: circle
        });
    } catch (error) {
        console.error('Join circle error:', error);
        res.status(500).json({
            success: false,
            message: 'Error joining circle.'
        });
    }
};

/**
 * Get all circles the user is part of
 */
const getMyCircles = async (req, res) => {
    try {
        const members = await prisma.circleMember.findMany({
            where: { userId: req.user.id },
            include: {
                circle: {
                    include: {
                        _count: {
                            select: { members: true }
                        }
                    }
                }
            }
        });

        const circles = members.map(m => m.circle);

        res.json({
            success: true,
            data: circles
        });
    } catch (error) {
        console.error('Get my circles error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching circles.'
        });
    }
};

/**
 * Post a reflection to a circle
 */
const postToCircle = async (req, res) => {
    try {
        const { circleId } = req.params;
        const { content, ayahReference, moodTags } = req.body;

        // Check membership
        const membership = await prisma.circleMember.findUnique({
            where: {
                circleId_userId: {
                    circleId,
                    userId: req.user.id
                }
            }
        });

        if (!membership) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this circle.'
            });
        }

        const post = await prisma.circlePost.create({
            data: {
                circleId,
                userId: req.user.id,
                content,
                ayahReference,
                moodTags: moodTags || []
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        // Trigger notifications for other members
        try {
            const otherMembers = await prisma.circleMember.findMany({
                where: {
                    circleId,
                    userId: { not: req.user.id }
                },
                include: {
                    circle: true
                }
            });

            for (const member of otherMembers) {
                await createNotification({
                    userId: member.userId,
                    type: 'post_created',
                    title: 'New Reflection 🌸',
                    message: `${post.user.username} shared a new reflection in ${member.circle.name}`,
                    data: {
                        circleId,
                        postId: post.id
                    }
                });
            }
        } catch (notifError) {
            console.error('Failed to trigger notifications:', notifError);
            // Don't fail the post creation if notifications fail
        }

        res.status(201).json({
            success: true,
            message: 'Reflection shared with your circle 🌸',
            data: post
        });
    } catch (error) {
        console.error('Post to circle error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing reflection.'
        });
    }
};

/**
 * Toggle a reaction on a post
 */
const toggleReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({
                success: false,
                message: 'Emoji is required.'
            });
        }

        // Check if reaction exists
        const existingReaction = await prisma.postReaction.findFirst({
            where: {
                postId,
                userId: req.user.id,
                emoji
            }
        });

        if (existingReaction) {
            // Remove reaction
            await prisma.postReaction.delete({
                where: { id: existingReaction.id }
            });

            res.json({
                success: true,
                message: 'Reaction removed',
                data: { action: 'removed' }
            });
        } else {
            // Add reaction
            await prisma.postReaction.create({
                data: {
                    postId,
                    userId: req.user.id,
                    emoji
                }
            });

            // Notify post owner (unless it's self)
            const post = await prisma.circlePost.findUnique({
                where: { id: postId },
                select: { userId: true, content: true }
            });

            if (post && post.userId !== req.user.id) {
                // Determine notification title based on emoji
                let reactionTitle = 'New Reaction';
                if (emoji === '❤️') reactionTitle = 'Sent you love ❤️';
                if (emoji === '🤲') reactionTitle = 'Said Ameen 🤲';
                if (emoji === '🌟') reactionTitle = 'Inspired by you 🌟';

                await createNotification({
                    userId: post.userId,
                    type: 'reaction_added',
                    title: reactionTitle,
                    message: `${req.user.username} reacted to your reflection: "${post.content.substring(0, 30)}..."`,
                    data: { postId, emoji }
                });
            }

            res.json({
                success: true,
                message: 'Reaction added',
                data: { action: 'added' }
            });
        }
    } catch (error) {
        console.error('Toggle reaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling reaction.'
        });
    }
};

/**
 * Get circle feed (latest posts)
 */
const getCircleFeed = async (req, res) => {
    try {
        const { circleId } = req.params;

        // Check membership
        const membership = await prisma.circleMember.findUnique({
            where: {
                circleId_userId: {
                    circleId,
                    userId: req.user.id
                }
            }
        });

        if (!membership) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this circle.'
            });
        }

        const posts = await prisma.circlePost.findMany({
            where: { circleId },
            include: {
                user: {
                    select: {
                        username: true,
                        avatarUrl: true
                    }
                },
                reactions: {
                    select: {
                        userId: true,
                        emoji: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Get circle feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching circle feed.'
        });
    }
};

module.exports = {
    createCircle,
    joinCircle,
    getMyCircles,
    postToCircle,
    getCircleFeed,
    toggleReaction
};
