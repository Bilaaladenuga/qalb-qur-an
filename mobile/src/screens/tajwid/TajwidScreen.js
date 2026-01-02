import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
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

    const renderLessonItem = ({ item }) => (
        <TouchableOpacity
            style={styles.lessonCard}
            onPress={() => navigation.navigate('LessonDetail', { lesson: item })}
        >
            <View style={styles.lessonInfo}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.lessonTitle}>{item.title}</Text>
                <Text style={styles.lessonDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
            <View style={styles.statusContainer}>
                {item.completed ? (
                    <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                ) : (
                    <Ionicons name="ellipse-outline" size={28} color={colors.textMuted} />
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: spacing.xs }} />
            </View>
        </TouchableOpacity>
    );

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

            <FlatList
                data={lessons}
                renderItem={renderLessonItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <Text style={styles.sectionTitle}>Curriculum</Text>
                )}
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
    },
    lessonInfo: {
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: spacing.xs,
    },
    categoryText: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    lessonTitle: {
        fontSize: typography.fontSize.md,
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    lessonDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.md,
    },
});

export default TajwidScreen;
