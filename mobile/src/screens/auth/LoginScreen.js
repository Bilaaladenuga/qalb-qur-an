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
import { login, clearError } from '../../store/slices/authSlice';
import { Button, Input } from '../../components';
import { colors, spacing, typography } from '../../theme';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (error) {
            Alert.alert('Login Failed', error);
            dispatch(clearError());
        }
    }, [error]);

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter email and password');
            return;
        }
        dispatch(login({ email, password }));
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
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="book" size={60} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Qalb & Quran</Text>
                        <Text style={styles.subtitle}>Connect your heart to the Quran</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Text style={styles.welcomeText}>Welcome Back 🌙</Text>

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
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Login"
                            onPress={handleLogin}
                            loading={isLoading}
                            size="lg"
                            style={styles.loginButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}> Register</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingTop: spacing.xxl * 2,
        paddingBottom: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
    form: {
        flex: 1,
    },
    welcomeText: {
        fontSize: typography.fontSize.xxl,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xl,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
    },
    loginButton: {
        marginTop: spacing.md,
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
    registerLink: {
        color: colors.primary,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
});

export default LoginScreen;
