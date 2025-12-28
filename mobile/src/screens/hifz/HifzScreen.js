import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    fetchProgress,
    addProgress,
    fetchGoals,
    createGoal
} from '../../store/slices/hifzSlice';
import { Card, Button, Input } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme';

// Surah data
const SURAHS = [
    { id: 1, name: 'Al-Fatihah', verses: 7 },
    { id: 2, name: 'Al-Baqarah', verses: 286 },
    { id: 3, name: 'Aal-Imran', verses: 200 },
    { id: 114, name: 'An-Nas', verses: 6 },
    { id: 113, name: 'Al-Falaq', verses: 5 },
    { id: 112, name: 'Al-Ikhlas', verses: 4 },
    { id: 111, name: 'Al-Masad', verses: 5 },
    { id: 110, name: 'An-Nasr', verses: 3 },
    // Add more surahs as needed
];

const HifzScreen = () => {
    const dispatch = useDispatch();
    const { progress, stats, goals, isLoading } = useSelector((state) => state.hifz);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [activeTab, setActiveTab] = useState('progress');

    // Form states
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [ayahStart, setAyahStart] = useState('');
    const [ayahEnd, setAyahEnd] = useState('');

    // Goal form states
    const [goalType, setGoalType] = useState('daily');
    const [targetValue, setTargetValue] = useState('');
    const [goalDescription, setGoalDescription] = useState('');

    useEffect(() => {
        dispatch(fetchProgress());
        dispatch(fetchGoals());
    }, []);

    const handleAddProgress = () => {
        if (!selectedSurah || !ayahStart || !ayahEnd) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }

        dispatch(addProgress({
            surahId: selectedSurah.id,
            surahName: selectedSurah.name,
            ayahStart: parseInt(ayahStart),
            ayahEnd: parseInt(ayahEnd),
            status: 'memorizing',
        }));

        setShowAddModal(false);
        setSelectedSurah(null);
        setAyahStart('');
        setAyahEnd('');
    };

    const handleCreateGoal = () => {
        if (!targetValue) {
            Alert.alert('Missing Fields', 'Please enter a target value');
            return;
        }

        const today = new Date();
        let endDate = new Date();

        switch (goalType) {
            case 'daily':
                endDate.setDate(today.getDate() + 1);
                break;
            case 'weekly':
                endDate.setDate(today.getDate() + 7);
                break;
            case 'monthly':
                endDate.setMonth(today.getMonth() + 1);
                break;
        }

        dispatch(createGoal({
            type: goalType,
            targetValue: parseInt(targetValue),
            description: goalDescription,
            startDate: today.toISOString(),
            endDate: endDate.toISOString(),
        }));

        setShowGoalModal(false);
        setTargetValue('');
        setGoalDescription('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'memorizing': return colors.secondary;
            case 'reviewing': return colors.primary;
            case 'mastered': return colors.accent;
            default: return colors.textMuted;
        }
    };

    const renderProgressItem = ({ item }) => (
        <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
                <View>
                    <Text style={styles.surahName}>{item.surahName}</Text>
                    <Text style={styles.ayahRange}>
                        Ayah {item.ayahStart} - {item.ayahEnd}
                    </Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) + '30' }
                    ]}
                >
                    <Text
                        style={[styles.statusText, { color: getStatusColor(item.status) }]}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>
            <View style={styles.progressMeta}>
                <View style={styles.metaItem}>
                    <Ionicons name="repeat" size={14} color={colors.textMuted} />
                    <Text style={styles.metaText}>{item.reviewCount} reviews</Text>
                </View>
            </View>
        </Card>
    );

    const renderGoalItem = ({ item }) => {
        const progressPercent = Math.min(
            (item.currentProgress / item.targetValue) * 100,
            100
        );

        return (
            <Card style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={styles.goalTypeTag}>
                        <Text style={styles.goalTypeText}>{item.type}</Text>
                    </View>
                    {item.isCompleted && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                    )}
                </View>
                {item.description && (
                    <Text style={styles.goalDescription}>{item.description}</Text>
                )}
                <View style={styles.goalProgressContainer}>
                    <View style={styles.progressBar}>
                        <LinearGradient
                            colors={colors.purpleGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${progressPercent}%` }]}
                        />
                    </View>
                    <Text style={styles.goalProgressText}>
                        {item.currentProgress}/{item.targetValue}
                    </Text>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Hifz Tracker 📖</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.memorizing}</Text>
                    <Text style={styles.statLabel}>Learning</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.mastered}</Text>
                    <Text style={styles.statLabel}>Mastered</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
                    onPress={() => setActiveTab('progress')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'progress' && styles.activeTabText
                        ]}
                    >
                        Progress
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
                    onPress={() => setActiveTab('goals')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'goals' && styles.activeTabText
                        ]}
                    >
                        Goals
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'progress' ? (
                <FlatList
                    data={progress}
                    renderItem={renderProgressItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="book-outline" size={60} color={colors.textMuted} />
                            <Text style={styles.emptyTitle}>No progress yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Start tracking your Quran memorization journey!
                            </Text>
                            <Button
                                title="Add First Entry"
                                onPress={() => setShowAddModal(true)}
                                style={styles.emptyButton}
                            />
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={goals}
                    renderItem={renderGoalItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Button
                            title="Set New Goal"
                            onPress={() => setShowGoalModal(true)}
                            variant="outline"
                            style={styles.newGoalButton}
                            icon={<Ionicons name="flag" size={18} color={colors.primary} />}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="flag-outline" size={60} color={colors.textMuted} />
                            <Text style={styles.emptyTitle}>No goals set</Text>
                            <Text style={styles.emptySubtitle}>
                                Set goals to stay motivated!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Add Progress Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Progress</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Select Surah</Text>
                            <View style={styles.surahGrid}>
                                {SURAHS.map((surah) => (
                                    <TouchableOpacity
                                        key={surah.id}
                                        style={[
                                            styles.surahChip,
                                            selectedSurah?.id === surah.id && styles.surahChipSelected
                                        ]}
                                        onPress={() => setSelectedSurah(surah)}
                                    >
                                        <Text
                                            style={[
                                                styles.surahChipText,
                                                selectedSurah?.id === surah.id && styles.surahChipTextSelected
                                            ]}
                                        >
                                            {surah.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.ayahRow}>
                                <View style={styles.ayahInput}>
                                    <Input
                                        label="From Ayah"
                                        placeholder="1"
                                        value={ayahStart}
                                        onChangeText={setAyahStart}
                                        keyboardType="number-pad"
                                    />
                                </View>
                                <View style={styles.ayahInput}>
                                    <Input
                                        label="To Ayah"
                                        placeholder="10"
                                        value={ayahEnd}
                                        onChangeText={setAyahEnd}
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>

                            <Button
                                title="Add to Tracker"
                                onPress={handleAddProgress}
                                loading={isLoading}
                                style={styles.modalButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Add Goal Modal */}
            <Modal
                visible={showGoalModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Set New Goal</Text>
                            <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Goal Type</Text>
                            <View style={styles.goalTypeRow}>
                                {['daily', 'weekly', 'monthly'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.goalTypeChip,
                                            goalType === type && styles.goalTypeChipSelected
                                        ]}
                                        onPress={() => setGoalType(type)}
                                    >
                                        <Text
                                            style={[
                                                styles.goalTypeChipText,
                                                goalType === type && styles.goalTypeChipTextSelected
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Input
                                label="Target (ayahs to memorize)"
                                placeholder="e.g. 5"
                                value={targetValue}
                                onChangeText={setTargetValue}
                                keyboardType="number-pad"
                            />

                            <Input
                                label="Description (optional)"
                                placeholder="What's your goal?"
                                value={goalDescription}
                                onChangeText={setGoalDescription}
                                multiline
                                numberOfLines={3}
                            />

                            <Button
                                title="Create Goal"
                                onPress={handleCreateGoal}
                                loading={isLoading}
                                style={styles.modalButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.surfaceLight,
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
    tabs: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: colors.primary,
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    progressCard: {
        marginBottom: spacing.md,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    surahName: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    ayahRange: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    progressMeta: {
        flexDirection: 'row',
        marginTop: spacing.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
        marginLeft: spacing.xs,
    },
    goalCard: {
        marginBottom: spacing.md,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalTypeTag: {
        backgroundColor: colors.primary + '30',
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
    goalDescription: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.sm,
    },
    goalProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.surfaceLight,
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: spacing.sm,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    goalProgressText: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: '600',
        minWidth: 50,
        textAlign: 'right',
    },
    newGoalButton: {
        marginBottom: spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    emptyButton: {
        marginTop: spacing.lg,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalBody: {
        padding: spacing.lg,
    },
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    surahGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
    },
    surahChip: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    surahChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    surahChipText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
    },
    surahChipTextSelected: {
        color: colors.text,
    },
    ayahRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    ayahInput: {
        flex: 1,
    },
    goalTypeRow: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    goalTypeChip: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    goalTypeChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    goalTypeChipText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    goalTypeChipTextSelected: {
        color: colors.text,
    },
    modalButton: {
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
});

export default HifzScreen;
