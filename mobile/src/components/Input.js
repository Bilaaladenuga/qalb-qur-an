import React, { useState } from 'react';
import {
    View,
    TextInput as RNTextInput,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const Input = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error = null,
    icon = null,
    multiline = false,
    numberOfLines = 1,
    style = {},
    inputStyle = {},
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry;

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                    multiline && styles.multilineContainer,
                ]}
            >
                {icon && (
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon} size={20} color={colors.textSecondary} />
                    </View>
                )}

                <RNTextInput
                    style={[
                        styles.input,
                        icon && styles.inputWithIcon,
                        multiline && styles.multilineInput,
                        inputStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.passwordToggle}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        color: colors.text,
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    inputContainerFocused: {
        borderColor: colors.primary,
    },
    inputContainerError: {
        borderColor: colors.error,
    },
    multilineContainer: {
        alignItems: 'flex-start',
        minHeight: 120,
    },
    iconContainer: {
        paddingLeft: spacing.md,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: typography.fontSize.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    inputWithIcon: {
        paddingLeft: spacing.sm,
    },
    multilineInput: {
        paddingTop: spacing.md,
    },
    passwordToggle: {
        padding: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSize.xs,
        marginTop: spacing.xs,
    },
});

export default Input;
