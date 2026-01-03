// Theme colors for Qalb & Quran
// Inspired by Islamic art with a feminine, premium feel

export const colors = {
    // Primary - Royal Blue (Trust, Calm, Clarity)
    primary: '#2563EB',
    primaryLight: '#60A5FA',
    primaryDark: '#1E40AF',

    // Secondary - Golden Amber (Warmth, Premium accent)
    secondary: '#F59E0B',
    secondaryLight: '#FCD34D',
    secondaryDark: '#B45309',

    // Background - Clean White & Off-White
    background: '#FFFFFF',
    backgroundLight: '#F8FAFC', // Slate 50

    // Surface - Light Greys (Cards, Containers)
    surface: '#F1F5F9', // Slate 100
    surfaceLight: '#FFFFFF',
    surfaceDark: '#E2E8F0',

    // Accent - Emerald (Success, Growth)
    accent: '#10B981',
    accentLight: '#34D399',

    // Text colors - High contrast for readability on white
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    textInverse: '#FFFFFF', // For text on primary buttons

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Special - Islamic Gold Gradient
    goldGradient: ['#F59E0B', '#D97706', '#B45309'],

    // Blue Sky Gradient (Primary)
    primaryGradient: ['#2563EB', '#3B82F6', '#60A5FA'],
    // Alias for backward compatibility (prevents crashes)
    purpleGradient: ['#2563EB', '#3B82F6', '#60A5FA'],

    // Peaceful White/Blue Gradient
    peacefulGradient: ['#FFFFFF', '#F0F9FF'],
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
