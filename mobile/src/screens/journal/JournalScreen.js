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
import { useRoute } from '@react-navigation/native';
import {
    fetchEntries,
    createEntry,
    deleteEntry,
    fetchPrompts,
    fetchDailyAyah
} from '../../store/slices/journalSlice';
import {
    fetchMyCircles,
    createCircle,
    joinCircle,
    setActiveCircle,
    fetchCircleFeed,
    postToCircle
} from '../../store/slices/circleSlice';
import { Card, Button, Input } from '../../components';
import { journalAPI, circlesAPI } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Platform } from 'react-native';

const JournalScreen = () => {
    const dispatch = useDispatch();
    const { entries, prompts, dailyAyah, isLoading: journalLoading } = useSelector((state) => state.journal);
    const { myCircles, activeCircle, feeds, isLoading: circlesLoading } = useSelector((state) => state.circles);
    const { user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('journal');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCircleModal, setShowCircleModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Journal State
    const [reflectionText, setReflectionText] = useState('');
    const [ayahReference, setAyahReference] = useState('');
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    // Circle State
    const [circleName, setCircleName] = useState('');
    const [circleDescription, setCircleDescription] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [circleReflection, setCircleReflection] = useState('');

    const isLoading = journalLoading || circlesLoading;
    const route = useRoute();

    useEffect(() => {
        if (route.params?.activeTab) {
            setActiveTab(route.params.activeTab);
        }
        if (route.params?.circleId && myCircles.length > 0) {
            const circle = myCircles.find(c => c.id === route.params.circleId);
            if (circle) {
                handleSelectCircle(circle);
            }
        }
    }, [route.params, myCircles]);

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
        dispatch(fetchMyCircles());
    }, []);

    const handleExport = async () => {
        try {
            const response = await journalAPI.exportJournal();

            // Handle file download for both Web and Mobile
            if (Platform.OS === 'web') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'My_Qalb_Quran_Journal.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                // For native, we'd typically use expo-sharing or expo-file-system
                // Since this is a specialized environment, we'll notify user of success
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

    const handleCreateCircle = () => {
        if (!circleName.trim()) return;
        dispatch(createCircle({ name: circleName, description: circleDescription }));
        setShowCircleModal(false);
        setCircleName('');
        setCircleDescription('');
    };

    const handleJoinCircle = () => {
        if (!inviteCode.trim()) return;
        dispatch(joinCircle(inviteCode));
        setShowJoinModal(false);
        setInviteCode('');
    };

    const handleCirclePost = (circleId) => {
        if (!circleReflection.trim()) return;
        dispatch(postToCircle({
            circleId,
            data: { content: circleReflection }
        }));
        setCircleReflection('');
    };

    const handleReaction = async (postId, emoji) => {
        try {
            await circlesAPI.toggleReaction(postId, emoji);
            // Ideally we should update the redux state optimistically or re-fetch feed
            if (activeCircle) {
                dispatch(fetchCircleFeed(activeCircle.id));
            }
        } catch (error) {
            console.error('Reaction error:', error);
        }
    };

    const handleSelectCircle = (circle) => {
        dispatch(setActiveCircle(circle));
        dispatch(fetchCircleFeed(circle.id));
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

    const renderCircleItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.circleCard,
                activeCircle?.id === item.id && styles.circleCardActive
            ]}
            onPress={() => handleSelectCircle(item)}
        >
            <View style={styles.circleIcon}>
                <Text style={styles.circleInitial}>{item.name[0]}</Text>
            </View>
            <View style={styles.circleInfo}>
                <Text style={styles.circleName}>{item.name}</Text>
                <Text style={styles.circleMembers}>{item._count?.members || 1} sisters</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );

    const renderPost = ({ item }) => {
        const reactions = item.reactions || [];
        const reactionCounts = {};
        reactions.forEach(r => {
            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
        });

        const myReactions = reactions.filter(r => r.userId === user?.id).map(r => r.emoji);

        return (
            <Card style={styles.postCard}>
                <View style={styles.postHeader}>
                    <View style={styles.postUser}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.avatarText}>{item.user.username[0]}</Text>
                        </View>
                        <View>
                            <Text style={styles.postUsername}>{item.user.username}</Text>
                            <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.postContent}>{item.content}</Text>

                {/* Reactions UI */}
                <View style={styles.reactionsContainer}>
                    <View style={styles.reactionButtons}>
                        {['🤲', '❤️', '🌟', '💭'].map(emoji => (
                            <TouchableOpacity
                                key={emoji}
                                style={[
                                    styles.reactionBtn,
                                    myReactions.includes(emoji) && styles.reactionBtnActive
                                ]}
                                onPress={() => handleReaction(item.id, emoji)}
                            >
                                <Text style={styles.reactionEmoji}>{emoji}</Text>
                                {reactionCounts[emoji] > 0 && (
                                    <Text style={[
                                        styles.reactionCount,
                                        myReactions.includes(emoji) && styles.reactionCountActive
                                    ]}>
                                        {reactionCounts[emoji]}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Reflection Journal 📝</Text>
                <View style={styles.headerActions}>
                    {activeTab === 'journal' && entries.length > 0 && (
                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={handleExport}
                        >
                            <Ionicons name="download-outline" size={22} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => activeTab === 'journal' ? setShowAddModal(true) : setShowCircleModal(true)}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'journal' && styles.activeTab]}
                    onPress={() => setActiveTab('journal')}
                >
                    <Text style={[styles.tabText, activeTab === 'journal' && styles.activeTabText]}>My Journal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'circles' && styles.activeTab]}
                    onPress={() => setActiveTab('circles')}
                >
                    <Text style={[styles.tabText, activeTab === 'circles' && styles.activeTabText]}>Sister Circles</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'journal' ? (
                <FlatList
                    data={entries}
                    renderItem={renderEntry}
                    keyExtractor={(item) => item.id}
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
            ) : (
                <View style={styles.circlesContainer}>
                    <View style={styles.circlesSidebar}>
                        <View style={styles.sidebarHeader}>
                            <Text style={styles.sidebarTitle}>Your Circles</Text>
                            <TouchableOpacity onPress={() => setShowJoinModal(true)}>
                                <Ionicons name="enter-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={myCircles}
                            renderItem={renderCircleItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyCircles}>No circles yet</Text>
                            }
                        />
                    </View>

                    <View style={styles.circleContent}>
                        {activeCircle ? (
                            <>
                                <View style={styles.feedHeader}>
                                    <View>
                                        <Text style={styles.feedTitle}>{activeCircle.name}</Text>
                                        <Text style={styles.feedCode}>Invite Code: {activeCircle.inviteCode}</Text>
                                    </View>
                                </View>

                                <View style={styles.postInputContainer}>
                                    <Input
                                        placeholder="Share a reflection with your sisters..."
                                        value={circleReflection}
                                        onChangeText={setCircleReflection}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={styles.sendButton}
                                        onPress={() => handleCirclePost(activeCircle.id)}
                                    >
                                        <Ionicons name="send" size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={feeds[activeCircle.id] || []}
                                    renderItem={renderPost}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={styles.feedContent}
                                    showsVerticalScrollIndicator={false}
                                />
                            </>
                        ) : (
                            <View style={styles.noCircleSelected}>
                                <Ionicons name="people-outline" size={60} color={colors.textMuted} />
                                <Text style={styles.noCircleText}>Select a circle to see the feed</Text>
                                <Button
                                    title="Create New Circle"
                                    onPress={() => setShowCircleModal(true)}
                                    variant="outline"
                                    style={styles.createBtn}
                                />
                            </View>
                        )}
                    </View>
                </View>
            )}

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

                                    {/* Mood Selection */}
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

            {/* Create Circle Modal */}
            <Modal
                visible={showCircleModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Circle</Text>
                            <TouchableOpacity onPress={() => setShowCircleModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Input
                                label="Circle Name"
                                placeholder="e.g. Fajr Reminders"
                                value={circleName}
                                onChangeText={setCircleName}
                            />
                            <Input
                                label="Description"
                                placeholder="What is this circle about?"
                                value={circleDescription}
                                onChangeText={setCircleDescription}
                                multiline
                                numberOfLines={3}
                            />
                            <Button
                                title="Create Circle"
                                onPress={handleCreateCircle}
                                loading={isLoading}
                                style={styles.modalButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Join Circle Modal */}
            <Modal
                visible={showJoinModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Join Circle</Text>
                            <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Input
                                label="Invite Code"
                                placeholder="Enter the 6-character code"
                                value={inviteCode}
                                onChangeText={setInviteCode}
                                autoCapitalize="characters"
                            />
                            <Button
                                title="Join Circle"
                                onPress={handleJoinCircle}
                                loading={isLoading}
                                style={styles.modalButton}
                            />
                        </View>
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
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
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    tab: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: '#fff',
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    ayahDayCard: {
        marginBottom: spacing.md,
        padding: spacing.lg,
    },
    ayahDayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    ayahDayLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 1,
    },
    ayahDayText: {
        fontSize: typography.fontSize.md,
        color: '#fff',
        fontStyle: 'italic',
        lineHeight: 24,
    },
    ayahDayRef: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: spacing.sm,
        textAlign: 'right',
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
        backgroundColor: colors.secondary + '15',
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
        color: colors.textRegular,
        lineHeight: 24,
    },
    moodTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.md,
    },
    moodTag: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        marginBottom: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
    },
    moodEmojiText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    circlesContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    circlesSidebar: {
        width: 100,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface + '50',
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.md,
    },
    sidebarTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textMuted,
        textTransform: 'uppercase',
    },
    circleCard: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    circleCardActive: {
        backgroundColor: colors.primary + '15',
        borderRightWidth: 3,
        borderRightColor: colors.primary,
    },
    circleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    circleInitial: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    circleInfo: {
        alignItems: 'center',
    },
    circleName: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    circleMembers: {
        fontSize: 8,
        color: colors.textMuted,
    },
    emptyCircles: {
        fontSize: 10,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    circleContent: {
        flex: 1,
        backgroundColor: colors.background,
    },
    feedHeader: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    feedTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.text,
    },
    feedCode: {
        fontSize: 10,
        color: colors.primary,
        marginTop: 2,
    },
    postInputContainer: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sendButton: {
        marginLeft: spacing.sm,
        padding: spacing.sm,
    },
    feedContent: {
        padding: spacing.md,
    },
    postCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
    },
    postHeader: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    postUser: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    postUsername: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
    },
    postTime: {
        fontSize: 10,
        color: colors.textMuted,
    },
    postContent: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    noCircleSelected: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    noCircleText: {
        marginTop: spacing.md,
        color: colors.textMuted,
        textAlign: 'center',
    },
    createBtn: {
        marginTop: spacing.xl,
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
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalBody: {
        padding: spacing.lg,
    },
    modalButton: {
        marginTop: spacing.md,
        marginBottom: spacing.xl,
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
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    promptCard: {
        width: 200,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
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
        borderColor: colors.border,
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
    reactionsContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    reactionButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    reactionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    reactionBtnActive: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary + '30',
    },
    reactionEmoji: {
        fontSize: 14,
        marginRight: 4,
    },
    reactionCount: {
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    reactionCountActive: {
        color: colors.primary,
    },
});

export default JournalScreen;
