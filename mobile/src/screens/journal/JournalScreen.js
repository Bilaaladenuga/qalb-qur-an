import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    fetchEntries,
    createEntry,
    deleteEntry,
    fetchPrompts
} from '../../store/slices/journalSlice';
import { Card, Button, Input } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme';

const JournalScreen = () => {
    const dispatch = useDispatch();
    const { entries, prompts, isLoading } = useSelector((state) => state.journal);

    const [showAddModal, setShowAddModal] = useState(false);
    const [reflectionText, setReflectionText] = useState('');
    const [ayahReference, setAyahReference] = useState('');
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

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
    }, []);

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
            month: 'short',
            day: 'numeric',
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

            <Text style={styles.entryText} numberOfLines={4}>
                {item.reflectionText}
            </Text>

            {item.moodTags && item.moodTags.length > 0 && (
                <View style={styles.moodTagsRow}>
                    {item.moodTags.map((moodId) => {
                        const mood = moods.find(m => m.id === moodId);
                        return mood ? (
                            <View key={moodId} style={styles.moodTag}>
                                <Text>{mood.emoji}</Text>
                            </View>
                        ) : null;
                    })}
                </View>
            )}
        </Card>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Reflection Journal 📝</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Entries List */}
            <FlatList
                data={entries}
                renderItem={renderEntry}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Card variant="gradient" style={styles.inspirationCard}>
                        <Ionicons name="heart" size={24} color={colors.text} />
                        <Text style={styles.inspirationText}>
                            "Writing is the painting of the voice."
                        </Text>
                        <Text style={styles.inspirationSubtext}>
                            Let your heart speak through your pen
                        </Text>
                    </Card>
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

            {/* Add Entry Modal */}
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
                                    {/* Prompts */}
                                    <Text style={styles.inputLabel}>Need inspiration?</Text>
                                    <FlatList
                                        horizontal
                                        data={prompts}
                                        keyExtractor={(item) => item.id.toString()}
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.promptsList}
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

                                    {/* Ayah Reference */}
                                    <Input
                                        label="Ayah Reference (optional)"
                                        placeholder="e.g. Surah Al-Baqarah 2:152"
                                        value={ayahReference}
                                        onChangeText={setAyahReference}
                                        icon="book-outline"
                                    />

                                    {/* Reflection Text */}
                                    <Input
                                        label="Your Reflection"
                                        placeholder="What's on your heart today?"
                                        value={reflectionText}
                                        onChangeText={setReflectionText}
                                        multiline
                                        numberOfLines={6}
                                    />

                                    {/* Mood Selection */}
                                    <Text style={styles.inputLabel}>How are you feeling?</Text>
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
                                        style={styles.modalButton}
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
    listContent: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    inspirationCard: {
        marginBottom: spacing.lg,
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    inspirationText: {
        fontSize: typography.fontSize.md,
        color: colors.text,
        textAlign: 'center',
        marginTop: spacing.md,
        fontStyle: 'italic',
    },
    inspirationSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    entryCard: {
        marginBottom: spacing.md,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    entryDate: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    ayahBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
        marginBottom: spacing.sm,
    },
    ayahText: {
        fontSize: typography.fontSize.xs,
        color: colors.secondary,
        marginLeft: spacing.xs,
    },
    entryText: {
        fontSize: typography.fontSize.md,
        color: colors.text,
        lineHeight: 24,
    },
    moodTagsRow: {
        flexDirection: 'row',
        marginTop: spacing.md,
    },
    moodTag: {
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginRight: spacing.xs,
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
        maxHeight: '90%',
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
    promptsList: {
        marginBottom: spacing.lg,
    },
    promptCard: {
        width: 200,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    promptCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    promptCategory: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    promptText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    moodsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
    },
    moodChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    moodChipSelected: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
    },
    moodEmoji: {
        fontSize: 16,
        marginRight: spacing.xs,
    },
    moodLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    moodLabelSelected: {
        color: colors.primary,
    },
    modalButton: {
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
});

export default JournalScreen;
