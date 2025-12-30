import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProgress, fetchGoals, fetchReviewQueue } from '../../store/slices/hifzSlice';
import { Card } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme';

const HomeScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { stats, goals, reviewQueue, isLoading } = useSelector((state) => state.hifz);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        dispatch(fetchProgress());
        dispatch(fetchGoals());
        dispatch(fetchReviewQueue());
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Get a motivational Islamic quote
    const getDailyQuote = () => {
        const quotes = [
            { text: "Indeed, with hardship comes ease.", reference: "Quran 94:6" },
            { text: "So remember Me; I will remember you.", reference: "Quran 2:152" },
            { text: "And He found you lost and guided you.", reference: "Quran 93:7" },
            { text: "My mercy encompasses all things.", reference: "Quran 7:156" },
        ];
        const today = new Date().getDate();
        return quotes[today % quotes.length];
    };

    const quote = getDailyQuote();
    const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 3);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={loadData}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()} 🌙</Text>
                        <Text style={styles.username}>{user?.username || 'Sister'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={18} color="#F59E0B" />
                            <Text style={styles.streakValue}>{user?.currentStreak || 0}</Text>
                        </View>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={24} color={colors.primary} />
                        </View>
                    </View>
                </View>

                {/* Daily Quote Card */}
                <Card variant="gradient" style={styles.quoteCard}>
                    <Ionicons name="sparkles" size={24} color={colors.secondary} />
                    <Text style={styles.quoteText}>"{quote.text}"</Text>
                    <Text style={styles.quoteReference}>— {quote.reference}</Text>
                </Card>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Your Journey</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.statIconBg}
                            >
                                <Ionicons name="book" size={20} color={colors.text} />
                            </LinearGradient>
                            <Text style={styles.statValue}>{stats.total || 0}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>

                        <View style={styles.statCard}>
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                style={styles.statIconBg}
                            >
                                <Ionicons name="flame" size={20} color={colors.text} />
                            </LinearGradient>
                            <Text style={styles.statValue}>{stats.memorizing || 0}</Text>
                            <Text style={styles.statLabel}>Learning</Text>
                        </View>

                        <View style={styles.statCard}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.statIconBg}
                            >
                                <Ionicons name="checkmark-circle" size={20} color={colors.text} />
                            </LinearGradient>
                            <Text style={styles.statValue}>{stats.mastered || 0}</Text>
                            <Text style={styles.statLabel}>Mastered</Text>
                        </View>
                    </View>
                </View>

                {/* Active Goals */}
                <View style={styles.goalsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Goals</Text>
                        <Text
                            style={styles.seeAll}
                            onPress={() => navigation.navigate('Hifz')}
                        >
                            See All
                        </Text>
                    </View>

                    {activeGoals.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Ionicons name="flag-outline" size={40} color={colors.textMuted} />
                            <Text style={styles.emptyText}>No active goals</Text>
                            <Text style={styles.emptySubtext}>
                                Set your first goal in the Hifz tracker!
                            </Text>
                        </Card>
                    ) : (
                        activeGoals.map((goal) => (
                            <Card key={goal.id} style={styles.goalCard}>
                                <View style={styles.goalHeader}>
                                    <View style={styles.goalTypeTag}>
                                        <Text style={styles.goalTypeText}>{goal.type}</Text>
                                    </View>
                                    <Text style={styles.goalProgress}>
                                        {goal.currentProgress}/{goal.targetValue}
                                    </Text>
                                </View>
                                {goal.description && (
                                    <Text style={styles.goalDescription}>{goal.description}</Text>
                                )}
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min((goal.currentProgress / goal.targetValue) * 100, 100)}%` }
                                        ]}
                                    />
                                </View>
                            </Card>
                        ))
                    )}
                </View>

                {/* Review Queue */}
                {reviewQueue.length > 0 && (
                    <View style={styles.goalsContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Ready for Review 🔁</Text>
                        </View>
                        {reviewQueue.slice(0, 3).map((item) => (
                            <Card key={item.id} style={styles.reviewCard}>
                                <View style={styles.goalHeader}>
                                    <Text style={styles.surahTitle}>{item.surahName}</Text>
                                    <View style={styles.reviewBadge}>
                                        <Text style={styles.reviewBadgeText}>Needs Review</Text>
                                    </View>
                                </View>
                                <Text style={styles.goalDescription}>Ayah {item.ayahStart} - {item.ayahEnd}</Text>
                            </Card>
                        ))}
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <QuickAction
                            icon="book-outline"
                            label="Track Hifz"
                            color={colors.primary}
                            onPress={() => navigation.navigate('Hifz')}
                        />
                        <QuickAction
                            icon="journal-outline"
                            label="Journal"
                            color={colors.secondary}
                            onPress={() => navigation.navigate('Journal')}
                        />
                        <QuickAction
                            icon="mic-outline"
                            label="Record"
                            color={colors.accent}
                            onPress={() => { }}
                        />
                        <QuickAction
                            icon="people-outline"
                            label="Circles"
                            color="#EC4899"
                            onPress={() => { }}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Quick Action Button Component
const QuickAction = ({ icon, label, color, onPress }) => (
    <View style={styles.actionItem}>
        <LinearGradient
            colors={[color, color + 'CC']}
            style={styles.actionIcon}
        >
            <Ionicons name={icon} size={24} color={colors.text} onPress={onPress} />
        </LinearGradient>
        <Text style={styles.actionLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    greeting: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
    username: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F59E0B20',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
    },
    streakValue: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: '#F59E0B',
        marginLeft: 4,
    },
    quoteCard: {
        marginBottom: spacing.xl,
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    quoteText: {
        fontSize: typography.fontSize.lg,
        color: colors.text,
        textAlign: 'center',
        marginTop: spacing.md,
        fontStyle: 'italic',
        lineHeight: 26,
    },
    quoteReference: {
        fontSize: typography.fontSize.sm,
        color: colors.secondary,
        marginTop: spacing.sm,
    },
    statsContainer: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
    },
    statIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    goalsContainer: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    seeAll: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.md,
        marginTop: spacing.md,
    },
    emptySubtext: {
        color: colors.textMuted,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.xs,
    },
    goalCard: {
        marginBottom: spacing.sm,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    goalTypeTag: {
        backgroundColor: colors.primaryLight + '30',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    goalTypeText: {
        color: colors.primary,
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    goalProgress: {
        color: colors.text,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    goalDescription: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.sm,
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    actionsContainer: {
        marginBottom: spacing.xl,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionItem: {
        alignItems: 'center',
        flex: 1,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    actionLabel: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.xs,
    },
    reviewCard: {
        marginBottom: spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: colors.secondary,
    },
    surahTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.text,
    },
    reviewBadge: {
        backgroundColor: colors.secondary + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    reviewBadgeText: {
        fontSize: 10,
        color: colors.secondary,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
