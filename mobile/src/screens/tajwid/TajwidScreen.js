import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SectionList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import * as tajwidService from '../../services/tajwidService';

const TajwidScreen = ({ navigation }) => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLessons = async () => {
        try {
            const data = await tajwidService.getLessons();
            setLessons(data);
        } catch (error) {
            console.error('Failed to load lessons:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLessons();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchLessons();
    };

    const calculateProgress = () => {
        if (lessons.length === 0) return 0;
        const completedCount = lessons.filter(l => l.completed).length;
        return (completedCount / lessons.length) * 100;
    };

    const groupedLessons = [
        { title: 'Level 1: Foundations (Makharij & Sifat)', data: lessons.filter(l => l.level === 'Al-Jazariyyah 1') },
        { title: 'Level 2: Rules (Tarqiq, Idgham)', data: lessons.filter(l => l.level === 'Al-Jazariyyah 2') },
        { title: 'Level 3: Advanced (Madd, Waqf)', data: lessons.filter(l => l.level === 'Al-Jazariyyah 3') },
    ].filter(section => section.data.length > 0);

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    const renderLessonItem = ({ item, index, section }) => {
        // Simple visual connector line logic could go here if needed
        return (
            <TouchableOpacity
                style={styles.lessonCard}
                onPress={() => navigation.navigate('LessonDetail', { lesson: item })}
            >
                <View style={[styles.lessonNumberBadge, { backgroundColor: item.completed ? colors.success : colors.primaryLight }]}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{item.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={1}>
                        {item.description}
                    </Text>
                </View>

                <View style={styles.statusContainer}>
                    {item.completed ? (
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    ) : (
                        <View style={styles.playIconContainer}>
                            <Ionicons name="play" size={12} color={colors.primary} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const progress = calculateProgress();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Tajwid Mastery</Text>
                <Text style={styles.title}>Refine Your Recitation</Text>
            </View>

            <View style={styles.statsCard}>
                <LinearGradient
                    colors={colors.purpleGradient}
                    style={styles.progressBanner}
                >
                    <View>
                        <Text style={styles.progressLabel}>Course Progress</Text>
                        <Text style={styles.progressPercent}>{Math.round(progress)}% Complete</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                </LinearGradient>
            </View>

            <SectionList
                sections={groupedLessons}
                keyExtractor={(item) => item.id}
                renderItem={renderLessonItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    greeting: {
        fontSize: typography.fontSize.md,
        color: colors.primaryLight,
        fontWeight: '600',
    },
    title: {
        fontSize: typography.fontSize.xxl,
        color: colors.text,
        fontWeight: 'bold',
    },
    statsCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    progressBanner: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },
    progressLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: typography.fontSize.sm,
    },
    progressPercent: {
        color: colors.text,
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.text,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    listContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    lessonCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    lessonNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    lessonNumberText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: typography.fontSize.md,
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    lessonDescription: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    statusContainer: {
        marginLeft: spacing.md,
    },
    playIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeaderContainer: {
        backgroundColor: colors.background,
        paddingVertical: spacing.sm,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    sectionHeaderText: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 0.5,
    },
});

export default TajwidScreen;
