import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
    fetchMyCircles,
    createCircle,
    joinCircle,
} from '../../store/slices/circleSlice';
import { Card, Button, Input } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../theme';

const SisterCirclesScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { myCircles, isLoading } = useSelector((state) => state.circles);

    const [showCircleModal, setShowCircleModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [circleName, setCircleName] = useState('');
    const [circleDescription, setCircleDescription] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    useEffect(() => {
        dispatch(fetchMyCircles());
    }, []);

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

    const handleSelectCircle = (circle) => {
        navigation.navigate('CircleDetails', { circle });
    };

    const renderCircleItem = ({ item }) => (
        <TouchableOpacity
            style={styles.circleCard}
            onPress={() => handleSelectCircle(item)}
        >
            <View style={styles.circleIcon}>
                <Text style={styles.circleInitial}>{item.name[0]}</Text>
            </View>
            <View style={styles.circleInfo}>
                <Text style={styles.circleName}>{item.name}</Text>
                <Text style={styles.circleMembers}>{item._count?.members || 1} sisters</Text>
                {item.description && (
                    <Text style={styles.circleDesc} numberOfLines={1}>{item.description}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Sister Circles 👯‍♀️</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => setShowJoinModal(true)}
                    >
                        <Ionicons name="enter-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowCircleModal(true)}
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
                    data={myCircles}
                    renderItem={renderCircleItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={60} color={colors.textMuted} />
                            <Text style={styles.emptyTitle}>No circles joined</Text>
                            <Text style={styles.emptySubtitle}>Join or create a circle to start your journey with others</Text>
                            <Button
                                title="Join First Circle"
                                onPress={() => setShowJoinModal(true)}
                                style={styles.emptyButton}
                            />
                        </View>
                    }
                />
            )}

            {/* Modals for Create/Join */}
            <Modal visible={showCircleModal} animationType="slide" transparent={true}>
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
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showJoinModal} animationType="slide" transparent={true}>
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
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    joinButton: { marginRight: spacing.md, padding: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    listContent: { padding: spacing.lg },
    circleCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, marginBottom: spacing.md, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    circleIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    circleInitial: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
    circleInfo: { flex: 1 },
    circleName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    circleMembers: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    circleDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: spacing.lg },
    emptySubtitle: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.sm, paddingHorizontal: spacing.xl },
    emptyButton: { marginTop: spacing.xl },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    modalBody: { gap: spacing.md }
});

export default SisterCirclesScreen;
