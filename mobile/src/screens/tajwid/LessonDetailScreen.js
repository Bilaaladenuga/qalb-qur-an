import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import Markdown from 'react-native-markdown-display';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import * as tajwidService from '../../services/tajwidService';

const LessonDetailScreen = ({ route, navigation }) => {
    const { lesson } = route.params;
    const [isCompleted, setIsCompleted] = useState(lesson.completed);
    const [updating, setUpdating] = useState(false);

    const toggleCompletion = async () => {
        try {
            setUpdating(true);
            const nextStatus = !isCompleted;
            await tajwidService.updateProgress(lesson.id, nextStatus);
            setIsCompleted(nextStatus);
        } catch (error) {
            console.error('Failed to update progress:', error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.categoryContainer}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{lesson.category}</Text>
                        </View>
                    </View>

                    {/* <Markdown style={markdownStyles}>
                        {lesson.content}
                    </Markdown> */}
                    <Text style={styles.nextStepsText}>{lesson.content}</Text>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.completeButton,
                                isCompleted && styles.completedButton
                            ]}
                            onPress={toggleCompletion}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color={colors.text} />
                            ) : (
                                <>
                                    <Ionicons
                                        name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                                        size={24}
                                        color={colors.text}
                                        style={{ marginRight: spacing.sm }}
                                    />
                                    <Text style={styles.buttonText}>
                                        {isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.nextStepsContainer}>
                    <Text style={styles.nextStepsTitle}>Keep Practicing</Text>
                    <Text style={styles.nextStepsText}>
                        Regular practice is key to mastering Tajwid. Try to apply this rule in your next Quran recitation session.
                    </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    categoryContainer: {
        marginBottom: spacing.md,
    },
    badge: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    footer: {
        marginTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
        paddingTop: spacing.xl,
    },
    completeButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    completedButton: {
        backgroundColor: colors.success,
    },
    buttonText: {
        color: colors.text,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    nextStepsContainer: {
        marginTop: spacing.xl,
        padding: spacing.lg,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
    },
    nextStepsTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    nextStepsText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

const markdownStyles = {
    body: {
        color: colors.text,
        fontSize: typography.fontSize.md,
        lineHeight: 24,
    },
    heading1: {
        color: colors.secondaryLight,
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        marginVertical: spacing.md,
    },
    heading2: {
        color: colors.primaryLight,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        marginVertical: spacing.sm,
    },
    heading3: {
        color: colors.accentLight,
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        marginVertical: spacing.xs,
    },
    strong: {
        color: colors.secondaryLight,
        fontWeight: 'bold',
    },
    em: {
        fontStyle: 'italic',
    },
    paragraph: {
        marginBottom: spacing.md,
    },
    bullet_list: {
        marginBottom: spacing.md,
    },
    list_item: {
        marginBottom: spacing.xs,
    },
};

export default LessonDetailScreen;
