import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../../store/slices/authSlice';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../../components';

const ProfileScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout? 🌙',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: () => dispatch(logout()), style: 'destructive' },
            ]
        );
    };

    const renderOption = (icon, title, subtitle, onPress, showArrow = true) => (
        <TouchableOpacity style={styles.option} onPress={onPress}>
            <View style={[styles.optionIconContainer, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{title}</Text>
                {subtitle ? <Text style={styles.optionSubtitle}>{subtitle}</Text> : null}
            </View>
            {showArrow && (
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <LinearGradient
                    colors={colors.purpleGradient}
                    style={styles.headerGradient}
                >
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.username?.charAt(0).toUpperCase() || 'Q'}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons name="camera" size={16} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user?.username || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.currentStreak || 0}</Text>
                                <Text style={styles.statLabel}>Current Streak</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.longestStreak || 0}</Text>
                                <Text style={styles.statLabel}>Best Streak</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    {renderOption('person-outline', 'Personal Information', 'Name, email, and password')}
                    {renderOption('notifications-outline', 'Daily Reminders', 'Scheduled: 9:00 AM')}
                    {renderOption('language-outline', 'Language Preference', user?.languagePreference || 'English')}
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support & More</Text>
                    {renderOption('help-circle-outline', 'Help Center', 'FAQs and contact')}
                    {renderOption('shield-checkmark-outline', 'Privacy Policy')}
                    {renderOption('document-text-outline', 'Terms of Service')}
                </View>

                {/* Logout Button */}
                <View style={styles.footer}>
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="outline"
                        icon="log-out-outline"
                        style={styles.logoutButton}
                    />
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerGradient: {
        paddingVertical: spacing.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: spacing.lg,
    },
    profileHeader: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: colors.primary,
    },
    editAvatarButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.text,
    },
    userName: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: spacing.md,
        width: '90%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.sm,
    },
    optionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '500',
        color: colors.text,
    },
    optionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    logoutButton: {
        width: '100%',
    },
    versionText: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
});

export default ProfileScreen;
