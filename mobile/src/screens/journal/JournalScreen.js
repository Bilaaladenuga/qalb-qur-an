import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import {
    fetchEntries,
    createEntry,
    deleteEntry,
    fetchPrompts,
    fetchDailyAyah
} from '../../store/slices/journalSlice';
import { getDailyAyah, getDailyPrompt } from '../../utils/dailyContent';
import { Card, Button, Input } from '../../components';
import { journalAPI } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

const JournalScreen = () => {
    const dispatch = useDispatch();
    const { entries, prompts, isLoading } = useSelector((state) => state.journal);

    // Use the daily content utility directly
    const dailyAyah = getDailyAyah();
    const dailyPrompt = getDailyPrompt();

    const [showAddModal, setShowAddModal] = useState(false);
    const [reflectionText, setReflectionText] = useState('');
    const [ayahReference, setAyahReference] = useState('');
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    const route = useRoute();

    const moods = [
        { id: 'grateful', emoji: '🤲', label: 'Grateful' },
        { id: 'peaceful', emoji: '☮️', label: 'Peaceful' },
        { id: 'hopeful', emoji: '🌟', label: 'Hopeful' },
        { id: 'reflective', emoji: '💭', label: 'Reflective' },
        { id: 'motivated', emoji: '💪', label: 'Motivated' },
        { id: 'struggling', emoji: '🌧️', label: 'Struggling' },
    ];

    useEffect(() => {
        dispatch(fetchEntries());
        dispatch(fetchPrompts());
        dispatch(fetchDailyAyah());
    }, []);

    const handleExport = async () => {
        try {
            const response = await journalAPI.exportJournal();
            if (Platform.OS === 'web') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'My_Qalb_Quran_Journal.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                Alert.alert('Success', 'Journal exported successfully! (PDF generated)');
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Export Failed', 'There was an error generating your journal PDF.');
        }
    };

    const handleCreateEntry = () => {
        if (!reflectionText.trim()) {
            Alert.alert('Empty Reflection', 'Please write something in your reflection');
            return;
        }

        dispatch(createEntry({
            reflectionText,
            ayahReference,
            moodTags: selectedMoods,
        }));

        setShowAddModal(false);
        setReflectionText('');
        setAyahReference('');
        setSelectedMoods([]);
        setSelectedPrompt(null);
    };

    const handleDeleteEntry = (id) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this reflection?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => dispatch(deleteEntry(id))
                },
            ]
        );
    };

    const toggleMood = (moodId) => {
        if (selectedMoods.includes(moodId)) {
            setSelectedMoods(selectedMoods.filter(m => m !== moodId));
        } else {
            setSelectedMoods([...selectedMoods, moodId]);
        }
    };

    const selectPrompt = (prompt) => {
        setSelectedPrompt(prompt);
        setReflectionText(`${prompt.prompt}\n\n`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderEntry = ({ item }) => (
        <Card style={styles.entryCard}>
            <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
                <TouchableOpacity onPress={() => handleDeleteEntry(item.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </View>

            {item.ayahReference && (
                <View style={styles.ayahBadge}>
                    <Ionicons name="book" size={12} color={colors.secondary} />
                    <Text style={styles.ayahText}>{item.ayahReference}</Text>
                </View>
            )}

            <Text style={styles.entryText}>{item.reflectionText}</Text>

            {item.moodTags && item.moodTags.length > 0 && (
                <View style={styles.moodTagsRow}>
                    {item.moodTags.map((moodId) => {
                        const mood = moods.find(m => m.id === moodId);
                        return mood ? (
                            <View key={moodId} style={styles.moodTag}>
                                <Text style={styles.moodEmojiText}>{mood.emoji} {mood.label}</Text>
                            </View>
                        ) : null;
                    })}
                </View>
            )}
        </Card>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Reflection Journal 📝</Text>
                <View style={styles.headerActions}>
                    {entries.length > 0 && (
                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={handleExport}
                        >
                            <Ionicons name="download-outline" size={22} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={entries || []}
                    renderItem={renderEntry}
                    keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            {dailyAyah && (
                                <Card variant="gradient" style={styles.ayahDayCard}>
                                    <View style={styles.ayahDayHeader}>
                                        <Text style={styles.ayahDayLabel}>AYAH OF THE DAY ✨</Text>
                                        <Ionicons name="sparkles" size={16} color="#fff" />
                                    </View>
                                    <Text style={styles.ayahDayText}>"{dailyAyah.text}"</Text>
                                    <Text style={styles.ayahDayRef}>{dailyAyah.reference}</Text>
                                </Card>
                            )}
                            <Card style={styles.inspirationCard}>
                                <Ionicons name="heart" size={24} color={colors.primary} />
                                <Text style={styles.inspirationText}>
                                    "Writing is the painting of the voice."
                                </Text>
                                <Text style={styles.inspirationSubtext}>
                                    Let your heart speak through your pen
                                </Text>
                            </Card>
                        </>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="journal-outline" size={60} color={colors.textMuted} />
                            <Text style={styles.emptyTitle}>No reflections yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Start your spiritual journaling journey
                            </Text>
                            <Button
                                title="Write First Entry"
                                onPress={() => setShowAddModal(true)}
                                style={styles.emptyButton}
                            />
                        </View>
                    }
                />
            )}

            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Reflection</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={[1]}
                            renderItem={() => (
                                <View style={styles.modalBody}>
                                    <Text style={styles.inputLabel}>Need inspiration?</Text>
                                    <FlatList
                                        horizontal
                                        data={prompts}
                                        keyExtractor={(item) => item.id.toString()}
                                        showsHorizontalScrollIndicator={false}
                                        style={{ marginBottom: spacing.lg }}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[
                                                    styles.promptCard,
                                                    selectedPrompt?.id === item.id && styles.promptCardSelected
                                                ]}
                                                onPress={() => selectPrompt(item)}
                                            >
                                                <Text style={styles.promptCategory}>{item.category}</Text>
                                                <Text style={styles.promptText} numberOfLines={2}>
                                                    {item.prompt}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />

                                    <Input
                                        label="Ayah Reference (optional)"
                                        placeholder="e.g. Surah Al-Baqarah 2:152"
                                        value={ayahReference}
                                        onChangeText={setAyahReference}
                                    />

                                    <Input
                                        label="Your Reflection"
                                        placeholder="What's on your heart today?"
                                        value={reflectionText}
                                        onChangeText={setReflectionText}
                                        multiline
                                        numberOfLines={6}
                                    />

                                    <View style={styles.moodsGrid}>
                                        {moods.map((mood) => (
                                            <TouchableOpacity
                                                key={mood.id}
                                                style={[
                                                    styles.moodChip,
                                                    selectedMoods.includes(mood.id) && styles.moodChipSelected
                                                ]}
                                                onPress={() => toggleMood(mood.id)}
                                            >
                                                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                                <Text
                                                    style={[
                                                        styles.moodLabel,
                                                        selectedMoods.includes(mood.id) && styles.moodLabelSelected
                                                    ]}
                                                >
                                                    {mood.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Button
                                        title="Save Reflection"
                                        onPress={handleCreateEntry}
                                        loading={isLoading}
                                    />
                                </View>
                            )}
                            keyExtractor={() => 'form'}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    exportButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
    title: { fontSize: typography.fontSize.xxl, fontWeight: 'bold', color: colors.text },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    listContent: { padding: spacing.lg, paddingTop: 0 },
    ayahDayCard: { marginBottom: spacing.md, padding: spacing.lg },
    ayahDayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    ayahDayLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: 1 },
    ayahDayText: { fontSize: typography.fontSize.md, color: '#fff', fontStyle: 'italic', lineHeight: 24 },
    ayahDayRef: { fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', marginTop: spacing.sm, textAlign: 'right' },
    inspirationCard: { marginBottom: spacing.lg, alignItems: 'center', paddingVertical: spacing.xl },
    inspirationText: { fontSize: typography.fontSize.md, color: colors.text, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
    inspirationSubtext: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
    entryCard: { marginBottom: spacing.md },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    entryDate: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
    ayahBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary + '15', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignSelf: 'flex-start', marginBottom: spacing.sm },
    ayahText: { fontSize: typography.fontSize.xs, color: colors.secondary, marginLeft: spacing.xs },
    entryText: { fontSize: typography.fontSize.md, color: colors.textRegular, lineHeight: 24 },
    moodTagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
    moodTag: { backgroundColor: colors.surface, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginRight: spacing.sm, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border },
    moodEmojiText: { fontSize: 12, color: colors.textSecondary },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
    emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: '600', color: colors.text, marginTop: spacing.md },
    emptySubtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
    emptyButton: { marginTop: spacing.lg },
    inputLabel: { fontSize: typography.fontSize.sm, fontWeight: '500', color: colors.text, marginBottom: spacing.sm },
    promptCard: { width: 200, backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
    promptCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    promptCategory: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: '600', marginBottom: spacing.xs },
    promptText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
    moodsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
    moodChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, marginRight: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    moodChipSelected: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
    moodEmoji: { fontSize: 16, marginRight: spacing.xs },
    moodLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
    moodLabelSelected: { color: colors.primary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.text },
    modalBody: { padding: spacing.lg },
});

export default JournalScreen;
