import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { register, clearError } from '../../store/slices/authSlice';
import { Button, Input } from '../../components';
import { colors, spacing, typography } from '../../theme';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (error) {
            Alert.alert('Registration Failed', error);
            dispatch(clearError());
        }
    }, [error]);

    const handleRegister = () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters');
            return;
        }

        dispatch(register({ username, email, password }));
    };

    return (
        <LinearGradient
            colors={colors.peacefulGradient}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Join Qalb & Quran</Text>
                        <Text style={styles.subtitle}>
                            Begin your beautiful journey with the Quran 🌸
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Name"
                            placeholder="Enter your name"
                            value={username}
                            onChangeText={setUsername}
                            icon="person-outline"
                            autoCapitalize="words"
                        />

                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            icon="mail-outline"
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={isLoading}
                            size="lg"
                            style={styles.registerButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.loginLink}> Login</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Terms */}
                    <Text style={styles.terms}>
                        By creating an account, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    form: {
        flex: 1,
    },
    registerButton: {
        marginTop: spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.md,
    },
    loginLink: {
        color: colors.primary,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    terms: {
        color: colors.textMuted,
        fontSize: typography.fontSize.xs,
        textAlign: 'center',
        marginTop: spacing.lg,
        lineHeight: 18,
    },
    termsLink: {
        color: colors.primary,
    },
});

export default RegisterScreen;
