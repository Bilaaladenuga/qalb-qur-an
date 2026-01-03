import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, spacing } from '../theme';

const Card = ({
    children,
    variant = 'default', // default, gradient, outline
    style = {},
    gradientColors = colors.primaryGradient || ['#2563EB', '#60A5FA'],
}) => {
    if (variant === 'gradient') {
        return (
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.gradientCard, style]}
            >
                {children}
            </LinearGradient>
        );
    }

    if (variant === 'outline') {
        return (
            <View style={[styles.card, styles.outlineCard, style]}>
                {children}
            </View>
        );
    }

    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.md,
    },
    gradientCard: {
        backgroundColor: 'transparent',
    },
    outlineCard: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
});

export default Card;
