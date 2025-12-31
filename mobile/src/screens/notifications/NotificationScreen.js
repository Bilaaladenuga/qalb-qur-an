import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNotifications, markRead, markAllRead } from '../../store/slices/notificationSlice';
import { colors, spacing, typography, borderRadius } from '../../theme';

const NotificationScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { notifications, isLoading, unreadCount } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleNotificationPress = (notification) => {
        if (!notification.isRead) {
            dispatch(markRead(notification.id));
        }

        // Navigate based on type
        if (notification.type === 'post_created' && notification.data?.circleId) {
            navigation.navigate('MainTabs', {
                screen: 'Journal',
                params: {
                    activeTab: 'circles',
                    circleId: notification.data.circleId
                }
            });
        }
    };

    const renderNotificationItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.iconContainer}>
                <View style={[styles.iconBg, { backgroundColor: getIconColor(item.type) + '15' }]}>
                    <Ionicons
                        name={getIconName(item.type)}
                        size={22}
                        color={getIconColor(item.type)}
                    />
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
            </View>
        </TouchableOpacity>
    );

    const getIconName = (type) => {
        switch (type) {
            case 'post_created': return 'chatbubbles-outline';
            case 'circle_joined': return 'people-outline';
            case 'goal_reached': return 'trophy-outline';
            default: return 'notifications-outline';
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'post_created': return colors.primary;
            case 'circle_joined': return '#EC4899';
            case 'goal_reached': return '#F59E0B';
            default: return colors.textSecondary;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={() => dispatch(markAllRead())}>
                        <Text style={styles.markAll}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {notifications.length === 0 && !isLoading ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>No notifications yet</Text>
                    <Text style={styles.emptySubtitle}>We'll notify you when sisters share reflections or when you reach your goals!</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={() => dispatch(fetchNotifications())}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
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
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        flex: 1,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    markAll: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight + '50',
    },
    unreadItem: {
        backgroundColor: colors.primary + '05',
    },
    iconContainer: {
        position: 'relative',
        marginRight: spacing.lg,
    },
    iconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.background,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
        color: colors.textMuted,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default NotificationScreen;
