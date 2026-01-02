const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { email, username, password, gender } = req.body;

        // Validate input
        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, username, and password.'
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                gender: gender || 'female' // Default to female for the core audience
            },
            select: {
                id: true,
                email: true,
                username: true,
                gender: true,
                avatarUrl: true,
                languagePreference: true,
                currentStreak: true,
                longestStreak: true,
                lastActivityDate: true,
                createdAt: true
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to Qalb & Quran 🌙',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user.'
        });
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful! Welcome back 🌙',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    gender: user.gender,
                    avatarUrl: user.avatarUrl,
                    languagePreference: user.languagePreference,
                    currentStreak: user.currentStreak,
                    longestStreak: user.longestStreak,
                    lastActivityDate: user.lastActivityDate,
                    createdAt: user.createdAt
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in.'
        });
    }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile.'
        });
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
    try {
        const { username, avatarUrl, languagePreference, gender } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(username && { username }),
                ...(avatarUrl && { avatarUrl }),
                ...(languagePreference && { languagePreference }),
                ...(gender && { gender })
            },
            select: {
                id: true,
                email: true,
                username: true,
                gender: true,
                avatarUrl: true,
                languagePreference: true,
                currentStreak: true,
                longestStreak: true,
                lastActivityDate: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile.'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
