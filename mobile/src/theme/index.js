// Theme colors for Qalb & Quran
// Inspired by Islamic art with a feminine, premium feel

export const colors = {
    // Primary - Spiritual Purple
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',

    // Secondary - Warm Gold
    secondary: '#F59E0B',
    secondaryLight: '#FBBF24',
    secondaryDark: '#D97706',

    // Background - Deep Navy (calm, focused)
    background: '#0F172A',
    backgroundLight: '#1E293B',

    // Surface - Slate (cards, containers)
    surface: '#1E293B',
    surfaceLight: '#334155',

    // Accent - Emerald (growth, success)
    accent: '#10B981',
    accentLight: '#34D399',

    // Text colors
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Special - Islamic Gold Gradient
    goldGradient: ['#F59E0B', '#D97706', '#B45309'],

    // Purple Gradient 
    purpleGradient: ['#8B5CF6', '#7C3AED', '#6D28D9'],

    // Peaceful gradient
    peacefulGradient: ['#1E293B', '#0F172A'],
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    // Font families (can be customized with expo-font)
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        display: 40,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};
