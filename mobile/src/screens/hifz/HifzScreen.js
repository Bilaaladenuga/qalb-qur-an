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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    fetchProgress,
    addProgress,
    fetchGoals,
    createGoal,
    fetchReviewQueue,
    reviewProgress
} from '../../store/slices/hifzSlice';
import { Audio } from 'expo-av';
import { Card, Button, Input, QuranMap } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { quranService } from '../../services/quranApi';

import { SURAHS } from '../../utils/surahs';

const HifzScreen = () => {
    const dispatch = useDispatch();
    const { progress, stats, goals, reviewQueue, isLoading } = useSelector((state) => state.hifz);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentReviewItem, setCurrentReviewItem] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Recording State
    const [recording, setRecording] = useState(null);
    const [sound, setSound] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingUri, setRecordingUri] = useState(null);
    const [activeTab, setActiveTab] = useState('progress');

    // Verses for self-correction
    const [versesData, setVersesData] = useState([]);
    const [isVersesLoading, setIsVersesLoading] = useState(false);

    // Form states
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [ayahStart, setAyahStart] = useState('');
    const [ayahEnd, setAyahEnd] = useState('');

    // Goal form states
    const [goalType, setGoalType] = useState('daily');
    const [targetValue, setTargetValue] = useState('');
    const [goalDescription, setGoalDescription] = useState('');

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                dispatch(fetchProgress()),
                dispatch(fetchGoals()),
                dispatch(fetchReviewQueue())
            ]);
        };
        loadData();
    }, [dispatch]);

    const handleAddProgress = async () => {
        if (!selectedSurah || !ayahStart || !ayahEnd) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }

        try {
            await dispatch(addProgress({
                surahId: selectedSurah.id,
                surahName: selectedSurah.name,
                ayahStart: parseInt(ayahStart),
                ayahEnd: parseInt(ayahEnd),
                status: 'memorizing',
            })).unwrap(); // Unwrap to catch errors from createAsyncThunk

            // Refresh goals to show immediate progress
            dispatch(fetchGoals());

            // Only close and clear if successful
            setShowAddModal(false);
            setSelectedSurah(null);
            setAyahStart('');
            setAyahEnd('');
            Alert.alert('Success', `Added ${selectedSurah.name} to your Tracker! 🌱`);
        } catch (err) {
            console.error('Failed to add progress:', err);
            Alert.alert('Error', typeof err === 'string' ? err : 'Failed to add progress. Please try again.');
        }
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

    const fetchVersesForReview = async (item) => {
        setIsVersesLoading(true);
        try {
            const response = await quranService.getVerses(item.surahId);
            const allVerses = response.data.verses;

            // Filter verses based on ayahStart and ayahEnd
            const filtered = allVerses.filter(v =>
                v.verse_number >= item.ayahStart &&
                v.verse_number <= item.ayahEnd
            );

            setVersesData(filtered);
        } catch (error) {
            console.error('Error fetching verses for review:', error);
            Alert.alert('Error', 'Failed to load Quran verses for self-correction.');
        } finally {
            setIsVersesLoading(false);
        }
    };

    const startReviewSession = () => {
        if (reviewQueue && reviewQueue.length > 0) {
            const firstItem = reviewQueue[0];
            setCurrentReviewItem(firstItem);
            setShowReviewModal(true);
            setIsFlipped(false);
            setRecording(null);
            setRecordingUri(null);
            fetchVersesForReview(firstItem);
        } else {
            Alert.alert("All caught up!", "No verses due for review right now.");
        }
    };

    // Audio Logic
    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                setIsRecording(true);
            } else {
                Alert.alert("Permission needed", "Please grant microphone access to record.");
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setRecording(undefined);
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordingUri(uri);

        // Auto-play for verification (optional, improved UX)
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
        // await sound.playAsync(); 
    };

    const playRecording = async () => {
        if (recordingUri) {
            const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
            setSound(sound);
            await sound.playAsync();
        }
    };

    const handleReviewSubmit = async (quality) => {
        if (!currentReviewItem) return;

        dispatch(reviewProgress({
            id: currentReviewItem.id,
            quality
        }));

        // Move to next item or close
        // Safeguard reviewQueue in case it's undefined
        const queue = reviewQueue || [];
        const currentIndex = queue.findIndex(i => i.id === currentReviewItem.id);

        if (currentIndex < queue.length - 1) {
            const nextItem = queue[currentIndex + 1];
            setCurrentReviewItem(nextItem);
            setIsFlipped(false);
            setRecordingUri(null);
            fetchVersesForReview(nextItem);
        } else {
            setShowReviewModal(false);
            setCurrentReviewItem(null);
            Alert.alert('Session Complete', 'Great job! You\'ve reviewed all pending items. 🎉');
        }
    };

    const handleMarkAsMemorized = async () => {
        if (!currentReviewItem) return;

        Alert.alert(
            'Mark as Memorized',
            'Have you successfully memorized this portion by heart? This will move it to your Mastered list.',
            [
                { text: 'Not yet', style: 'cancel' },
                {
                    text: 'Yes, Alhamdulillah!',
                    onPress: async () => {
                        // Import updateProgress at top level or handle here
                        const { updateProgress } = require('../../store/slices/hifzSlice');
                        await dispatch(updateProgress({
                            id: currentReviewItem.id,
                            data: {
                                status: 'mastered',
                                memorizedDate: new Date().toISOString()
                            }
                        })).unwrap();

                        // Close or move to next
                        handleReviewSubmit(3); // Count as perfect review too
                    }
                }
            ]
        );
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

            {/* Review Queue Hero */}
            {reviewQueue && reviewQueue.length > 0 && (
                <View style={styles.reviewHero}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.reviewHeroGradient}
                    >
                        <View style={styles.reviewHeroContent}>
                            <View>
                                <Text style={styles.reviewHeroTitle}>Review Time! 🧠</Text>
                                <Text style={styles.reviewHeroSubtitle}>
                                    {reviewQueue.length} items due for spaced repetition
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.startReviewButton}
                                onPress={() => startReviewSession()}
                            >
                                <Text style={styles.startReviewText}>Start</Text>
                                <Ionicons name="play" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            )}

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
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'map' && styles.activeTab]}
                    onPress={() => setActiveTab('map')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'map' && styles.activeTabText
                        ]}
                    >
                        Map
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'progress' && (
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
            )}
            {activeTab === 'goals' && (
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
            {activeTab === 'map' && (
                <View style={styles.mapContainer}>
                    <QuranMap progress={progress} />
                </View>
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

            {/* Review Modal */}
            <Modal
                visible={showReviewModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowReviewModal(false)}
            >
                <View style={styles.reviewModalContent}>
                    {currentReviewItem && (
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
                            showsVerticalScrollIndicator={false}
                            style={{ width: '100%' }}
                        >
                            <View style={styles.reviewCard}>
                                <Text style={styles.reviewSurahName}>
                                    {currentReviewItem.surahName}
                                </Text>
                                <Text style={styles.reviewAyahRange}>
                                    Ayah {currentReviewItem.ayahStart} - {currentReviewItem.ayahEnd}
                                </Text>

                                <View style={{ height: 2, width: 50, backgroundColor: colors.primary, marginTop: spacing.md }} />

                                {/* Recording Controls */}
                                {!isFlipped && (
                                    <View style={styles.recordingSection}>
                                        {recordingUri ? (
                                            <View style={styles.playbackContainer}>
                                                <TouchableOpacity style={styles.playButton} onPress={playRecording}>
                                                    <Ionicons name="play-circle" size={48} color={colors.primary} />
                                                    <Text style={styles.playText}>Listen to your Hifz</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setRecordingUri(null)}>
                                                    <Text style={styles.retryText}>Retry</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                                                onPress={isRecording ? stopRecording : startRecording}
                                            >
                                                <Ionicons
                                                    name={isRecording ? "stop" : "mic"}
                                                    size={32}
                                                    color="#fff"
                                                />
                                                <Text style={styles.recordBtnText}>
                                                    {isRecording ? "Stop & Check" : "Tap to Recite"}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}

                                {/* Verification Reveal */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[styles.revealButton, isFlipped && { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.primary }]}
                                    onPress={() => setIsFlipped(!isFlipped)}
                                >
                                    <Ionicons name={isFlipped ? "eye-off" : "eye"} size={24} color={isFlipped ? colors.primary : '#fff'} />
                                    <Text style={[styles.revealText, isFlipped && { color: colors.primary }]}>
                                        {isFlipped ? 'Hide Verse Text' : 'Reveal Verse Text'}
                                    </Text>
                                </TouchableOpacity>

                                {isFlipped && (
                                    <>
                                        <View style={styles.verseScrollContainer}>
                                            <ScrollView
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                                contentContainerStyle={styles.verseScrollContent}
                                            >
                                                {isVersesLoading ? (
                                                    <ActivityIndicator size="small" color={colors.primary} />
                                                ) : (
                                                    versesData.map((verse, index) => (
                                                        <View key={index} style={styles.verseItem}>
                                                            <Text style={styles.arabicReviewText}>
                                                                {verse.text_uthmani}
                                                            </Text>
                                                            <View style={styles.verseNumberBadgeSm}>
                                                                <Text style={styles.verseNumberTextSm}>{verse.verse_number}</Text>
                                                            </View>
                                                        </View>
                                                    ))
                                                )}
                                            </ScrollView>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.masteredButton}
                                            onPress={handleMarkAsMemorized}
                                        >
                                            <Ionicons name="trophy" size={20} color="#fff" />
                                            <Text style={styles.masteredButtonText}>Mark as Mastered</Text>
                                        </TouchableOpacity>

                                        <Text style={{ marginTop: spacing.md, color: colors.textSecondary, marginBottom: spacing.sm, textAlign: 'center', fontWeight: 'bold' }}>
                                            Rate your Recitation:
                                        </Text>

                                        <View style={styles.reviewActions}>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                style={[styles.reviewBtn, styles.reviewBtnHard]}
                                                onPress={() => handleReviewSubmit(1)}
                                            >
                                                <Text style={styles.reviewEmoji}>😰</Text>
                                                <Text style={[styles.reviewBtnText, { color: colors.error }]}>Hard</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                style={[styles.reviewBtn, styles.reviewBtnGood]}
                                                onPress={() => handleReviewSubmit(2)}
                                            >
                                                <Text style={styles.reviewEmoji}>🙂</Text>
                                                <Text style={[styles.reviewBtnText, { color: colors.warning }]}>Good</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                style={[styles.reviewBtn, styles.reviewBtnPerfect]}
                                                onPress={() => handleReviewSubmit(3)}
                                            >
                                                <Text style={styles.reviewEmoji}>🤩</Text>
                                                <Text style={[styles.reviewBtnText, { color: colors.success }]}>Perfect</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* "Hide" button at bottom for convenience */}
                                        <TouchableOpacity
                                            style={{ marginTop: spacing.lg, padding: 10 }}
                                            onPress={() => setIsFlipped(false)}
                                        >
                                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>^ Hide Text</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                <Button
                                    title="Exit Session"
                                    variant="ghost"
                                    onPress={() => setShowReviewModal(false)}
                                    style={{ marginTop: spacing.xl, width: '100%' }}
                                />
                            </View>
                        </ScrollView>
                    )}
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
    mapContainer: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        margin: spacing.md,
        // Elevation for Android
        elevation: 2,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    reviewHero: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: borderRadius.xl, // Softer curves
        overflow: 'hidden',
        elevation: 2, // Softer shadow
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    reviewHeroGradient: {
        padding: spacing.xl, // More breathing room
    },
    reviewHeroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reviewHeroTitle: {
        color: '#fff',
        fontSize: typography.fontSize.xxl, // Larger, more impactful
        fontWeight: '700',
        marginBottom: spacing.xs,
        letterSpacing: 0.5,
    },
    reviewHeroSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: typography.fontSize.md,
    },
    startReviewButton: {
        backgroundColor: 'rgba(255,255,255,0.2)', // Glass effect
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    startReviewText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: typography.fontSize.md,
    },
    reviewModalContent: {
        flex: 1,
        backgroundColor: 'rgba(26, 42, 38, 0.95)', // Deep spiritual green overlay
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    reviewCard: {
        width: '100%',
        backgroundColor: '#FDFBF7', // Parchment white
        borderRadius: 24,
        padding: spacing.xl,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(184, 158, 101, 0.2)', // Subtle gold border
    },
    reviewSurahName: {
        fontSize: 32,
        fontFamily: 'Amiri-Bold',
        color: '#2A4A3E', // Rich deep green
        marginBottom: spacing.xs,
    },
    reviewAyahRange: {
        fontSize: 16,
        fontWeight: '500',
        color: '#B89E65', // Bronze/Gold
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    recordingSection: {
        width: '100%',
        marginVertical: spacing.xl,
        alignItems: 'center',
    },
    recordBtn: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    recordBtnActive: {
        backgroundColor: colors.error,
        transform: [{ scale: 1.1 }],
    },
    recordBtnText: {
        color: '#fff',
        fontWeight: '700',
        marginTop: spacing.sm,
        fontSize: 14,
    },
    playbackContainer: {
        alignItems: 'center',
    },
    playButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(184, 158, 101, 0.1)',
        padding: spacing.xl,
        borderRadius: 100,
    },
    playText: {
        marginTop: spacing.sm,
        color: '#B89E65',
        fontWeight: '600',
    },
    retryText: {
        color: colors.textSecondary,
        marginTop: spacing.md,
        textDecorationLine: 'underline',
    },
    revealButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A4A3E',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 100,
        marginVertical: spacing.md,
    },
    revealText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: spacing.sm,
    },
    verseScrollContainer: {
        maxHeight: 300,
        width: '100%',
        backgroundColor: '#F7F3E9', // Aged paper color
        borderRadius: 16,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(184, 158, 101, 0.15)',
        marginVertical: spacing.lg,
    },
    verseScrollContent: {
        paddingBottom: spacing.lg,
    },
    verseItem: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    arabicReviewText: {
        fontSize: 28,
        fontFamily: 'Amiri-Regular',
        textAlign: 'center',
        lineHeight: 52,
        color: '#1A2A26',
    },
    verseNumberBadgeSm: {
        backgroundColor: 'rgba(184, 158, 101, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: spacing.md,
    },
    verseNumberTextSm: {
        fontSize: 12,
        color: '#8E733E',
        fontWeight: 'bold',
    },
    masteredButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#B89E65',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 100,
        marginBottom: spacing.xl,
        elevation: 3,
    },
    masteredButtonText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: spacing.sm,
    },
    reviewActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: spacing.md,
    },
    reviewBtn: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    reviewBtnHard: {
        borderColor: '#E74C3C',
        backgroundColor: '#FDEDEC',
    },
    reviewBtnGood: {
        borderColor: '#F39C12',
        backgroundColor: '#FEF5E7',
    },
    reviewBtnPerfect: {
        borderColor: '#27AE60',
        backgroundColor: '#E9F7EF',
    },
    reviewBtnText: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 4,
    },
    reviewEmoji: {
        fontSize: 24,
    },
});

export default HifzScreen;
