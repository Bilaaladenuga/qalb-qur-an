import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchSurahs, setCurrentSurah, setSelectedReciter, fetchAudio } from '../../store/slices/quranSlice';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Card } from '../../components';
import { Modal, ScrollView } from 'react-native';

const QuranListScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { surahs, isLoading, error, reciters, selectedReciter } = useSelector((state) => state.quran);
    const [showReciterModal, setShowReciterModal] = useState(false);

    useEffect(() => {
        dispatch(fetchSurahs());
    }, [dispatch]);

    const handleSurahPress = (surah) => {
        dispatch(setCurrentSurah(surah));
        navigation.navigate('SurahReader', { surahId: surah.id, surahName: surah.name_simple });
    };

    const handleReciterSelect = (id) => {
        dispatch(setSelectedReciter(id));
        setShowReciterModal(false);
    };

    const activeReciter = reciters.find(r => r.id === selectedReciter);

    const renderSurahItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleSurahPress(item)}>
            <Card style={styles.surahCard}>
                <View style={styles.surahNumberContainer}>
                    <Text style={styles.surahNumber}>{item.id}</Text>
                </View>
                <View style={styles.surahInfo}>
                    <Text style={styles.surahNameSimple}>{item.name_simple}</Text>
                    <Text style={styles.surahTranslation}>{item.translated_name.name}</Text>
                </View>
                <View style={styles.surahRight}>
                    <Text style={styles.surahNameArabic}>{item.name_arabic}</Text>
                    <Text style={styles.ayahCount}>{item.verses_count} Ayahs</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    if (isLoading && surahs.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading the Book of Allah...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>The Holy Quran 📖</Text>
                        <Text style={styles.subtitle}>Select a Surah to read and listen</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.reciterButton}
                        onPress={() => setShowReciterModal(true)}
                    >
                        <Ionicons name="mic-outline" size={24} color={colors.primary} />
                        <Text style={styles.reciterInitial}>{activeReciter?.name.charAt(0)}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={surahs}
                renderItem={renderSurahItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<View style={{ height: spacing.md }} />}
            />

            {/* Reciter Selection Modal */}
            <Modal
                visible={showReciterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowReciterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Reciter Voice</Text>
                            <TouchableOpacity onPress={() => setShowReciterModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {reciters.map((reciter) => (
                                <TouchableOpacity
                                    key={reciter.id}
                                    style={[
                                        styles.reciterItem,
                                        selectedReciter === reciter.id && styles.reciterItemSelected
                                    ]}
                                    onPress={() => handleReciterSelect(reciter.id)}
                                >
                                    <View style={styles.reciterIcon}>
                                        <Ionicons
                                            name="volume-high"
                                            size={20}
                                            color={selectedReciter === reciter.id ? '#fff' : colors.primary}
                                        />
                                    </View>
                                    <View style={styles.reciterInfo}>
                                        <Text style={[
                                            styles.reciterName,
                                            selectedReciter === reciter.id && styles.reciterTextSelected
                                        ]}>
                                            {reciter.name}
                                        </Text>
                                        <Text style={styles.reciterStyle}>{reciter.style}</Text>
                                    </View>
                                    {selectedReciter === reciter.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
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
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reciterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    reciterInitial: {
        marginLeft: spacing.xs,
        fontWeight: 'bold',
        color: colors.primary,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    surahCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    surahNumberContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    surahNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    surahInfo: {
        flex: 1,
    },
    surahNameSimple: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.text,
    },
    surahTranslation: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    surahRight: {
        alignItems: 'flex-end',
    },
    surahNameArabic: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    ayahCount: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: 4,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.textSecondary,
        fontSize: typography.fontSize.md,
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
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalBody: {
        padding: spacing.md,
    },
    reciterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
    },
    reciterItemSelected: {
        backgroundColor: colors.primary,
    },
    reciterIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    reciterInfo: {
        flex: 1,
    },
    reciterName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    reciterTextSelected: {
        color: '#fff',
    },
    reciterStyle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
});

export default QuranListScreen;
