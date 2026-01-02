import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    fetchCircleFeed,
    postToCircle,
    deleteCircle
} from '../../store/slices/circleSlice';
import { circlesAPI } from '../../services/api';
import { Card, Button, Input } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme';

const CircleDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { circle } = route.params;

    const { feeds, isLoading } = useSelector((state) => state.circles);
    const { user } = useSelector((state) => state.auth);

    const [postContent, setPostContent] = useState('');
    const [localFeed, setLocalFeed] = useState([]);

    const feed = feeds[circle.id] || [];

    useEffect(() => {
        dispatch(fetchCircleFeed(circle.id));
    }, [circle.id]);

    useEffect(() => {
        setLocalFeed(feed);
    }, [feed]);

    const handlePost = async () => {
        if (!postContent.trim()) return;

        try {
            await dispatch(postToCircle({
                circleId: circle.id,
                data: { content: postContent }
            })).unwrap();
            setPostContent('');
            dispatch(fetchCircleFeed(circle.id));
        } catch (error) {
            Alert.alert('Error', 'Failed to share reflection');
        }
    };

    const handleReaction = async (postId, emoji) => {
        try {
            await circlesAPI.toggleReaction(postId, emoji);
            // Optimistic update
            const updatedFeed = localFeed.map(post => {
                if (post.id === postId) {
                    const myExisting = post.reactions.find(r => r.userId === user.id && r.emoji === emoji);
                    let newReactions;
                    if (myExisting) {
                        newReactions = post.reactions.filter(r => r.id !== myExisting.id);
                    } else {
                        newReactions = [...post.reactions, { userId: user.id, emoji, id: Math.random().toString() }]; // temp id
                    }
                    return { ...post, reactions: newReactions };
                }
                return post;
            });
            setLocalFeed(updatedFeed);
            // Re-fetch in background
            dispatch(fetchCircleFeed(circle.id));
        } catch (error) {
            console.error('Reaction error:', error);
        }
    };

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
                            <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.postContent}>{item.content}</Text>

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

    const handleDeleteCircle = () => {
        Alert.alert(
            'Delete Circle',
            'Are you sure? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(deleteCircle(circle.id)).unwrap();
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to delete circle');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>{circle.name}</Text>
                    <Text style={styles.subtitle}>{circle._count?.members || 1} sisters • {circle.inviteCode}</Text>
                </View>
                {circle.creatorId === user?.id && (
                    <TouchableOpacity style={styles.menuButton} onPress={handleDeleteCircle}>
                        <Ionicons name="trash-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={localFeed}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.inputCard}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Share a reflection with your sisters..."
                                value={postContent}
                                onChangeText={setPostContent}
                                multiline
                                placeholderTextColor={colors.textMuted}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !postContent.trim() && styles.sendButtonDisabled]}
                                onPress={handlePost}
                                disabled={!postContent.trim()}
                            >
                                <Ionicons name="send" size={20} color={postContent.trim() ? '#fff' : colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="leaf-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.emptyText}>Be the first to share a reflection!</Text>
                    </View>
                }
            />
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
        backgroundColor: colors.surface,
    },
    backButton: {
        marginRight: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    menuButton: {
        marginLeft: 'auto',
    },
    listContent: {
        padding: spacing.md,
    },
    inputCard: {
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        minHeight: 60,
        maxHeight: 120,
        color: colors.text,
        fontSize: typography.fontSize.md,
        paddingTop: spacing.xs,
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.sm,
    },
    sendButtonDisabled: {
        backgroundColor: colors.surfaceLight,
    },
    postCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
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
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    avatarText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    postUsername: {
        fontWeight: '600',
        color: colors.text,
        fontSize: typography.fontSize.sm,
    },
    postTime: {
        color: colors.textMuted,
        fontSize: typography.fontSize.xs,
    },
    postContent: {
        color: colors.text,
        fontSize: typography.fontSize.md,
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    reactionsContainer: {
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
    },
    reactionButtons: {
        flexDirection: 'row',
    },
    reactionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginRight: 8,
        backgroundColor: colors.background,
    },
    reactionBtnActive: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
        borderWidth: 1,
    },
    reactionEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    reactionCount: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    reactionCountActive: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        color: colors.textMuted,
        marginTop: spacing.md,
    },
});

export default CircleDetailsScreen;
