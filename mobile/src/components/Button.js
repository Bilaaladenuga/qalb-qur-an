import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../theme';

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost
    size = 'md', // sm, md, lg
    loading = false,
    disabled = false,
    icon = null,
    style = {},
    textStyle = {},
}) => {
    const isDisabled = disabled || loading;

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            case 'ghost':
                return styles.ghostButton;
            default:
                return {};
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'sm':
                return styles.smallButton;
            case 'lg':
                return styles.largeButton;
            default:
                return styles.mediumButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
            case 'ghost':
                return { color: colors.primary };
            default:
                return { color: colors.text };
        }
    };

    const getTextSizeStyle = () => {
        switch (size) {
            case 'sm':
                return { fontSize: typography.fontSize.sm };
            case 'lg':
                return { fontSize: typography.fontSize.lg };
            default:
                return { fontSize: typography.fontSize.md };
        }
    };

    // Primary button with gradient
    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[styles.buttonContainer, style]}
            >
                <LinearGradient
                    colors={isDisabled ? [colors.surfaceLight, colors.surface] : colors.purpleGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, getSizeStyle()]}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.text} size="small" />
                    ) : (
                        <View style={styles.contentContainer}>
                            {icon && <View style={styles.iconContainer}>{icon}</View>}
                            <Text style={[styles.buttonText, getTextSizeStyle(), textStyle]}>
                                {title}
                            </Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.button,
                getSizeStyle(),
                getButtonStyle(),
                isDisabled && styles.disabledButton,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.text}
                    size="small"
                />
            ) : (
                <View style={styles.contentContainer}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[styles.buttonText, getTextStyle(), getTextSizeStyle(), textStyle]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    button: {
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
    },
    smallButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    mediumButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    largeButton: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    secondaryButton: {
        backgroundColor: colors.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    disabledButton: {
        opacity: 0.5,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    buttonText: {
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default Button;
