import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Share,
    Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { fetchSurahVerses, fetchAudio, fetchSurahs } from '../../store/slices/quranSlice';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Card } from '../../components';

const SurahReaderScreen = ({ route, navigation }) => {
    const params = route.params || {};
    const { surahId, surahName, autoPlay } = params;
    const dispatch = useDispatch();
    const { verses, surahs, isVersesLoading, audioUrls, audioTimestamps, selectedReciter, error } = useSelector((state) => state.quran);

    console.log('SurahReader Debug:', { surahId, isLoading: isVersesLoading, versesLength: verses?.length, error });

    const [sound, setSound] = useState();
    const soundRef = useRef(null);
    // Ref for FlatList to control scrolling
    const flatListRef = useRef(null);
    const [activeVerseKey, setActiveVerseKey] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [showTranslation, setShowTranslation] = useState(true);

    useEffect(() => {
        if (surahs && surahs.length === 0) dispatch(fetchSurahs());
        dispatch(fetchSurahVerses(surahId));
        dispatch(fetchAudio({ reciterId: selectedReciter, chapterId: surahId }));

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [dispatch, surahId, selectedReciter]);

    // Auto-play effect
    useEffect(() => {
        if (autoPlay && !isPlaying && !isLoadingAudio && audioUrls[surahId]) {
            playSound();
        }
    }, [autoPlay, audioUrls, surahId]);

    // Unload sound if audio URL changes
    useEffect(() => {
        if (soundRef.current) {
            soundRef.current.unloadAsync();
            soundRef.current = null;
            setSound(null);
            setIsPlaying(false);
        }
    }, [selectedReciter]);

    async function playSound() {
        if (soundRef.current) {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
                if (isPlaying) {
                    await soundRef.current.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await soundRef.current.playAsync();
                    setIsPlaying(true);
                }
                return;
            }
        }

        const audioUrl = audioUrls[surahId];
        if (!audioUrl) {
            Alert.alert('Audio Not Ready', 'Please wait a moment while we fetch the recitation.');
            return;
        }

        setIsLoadingAudio(true);
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );
            soundRef.current = newSound;
            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setIsPlaying(status.isPlaying);
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setActiveVerseKey(null);

                        // Auto-play next Surah
                        if (surahId < 114) {
                            const nextSurahId = surahId + 1;
                            const nextSurah = surahs.find(s => s.id === nextSurahId);
                            if (nextSurah) {
                                navigation.replace('SurahReader', {
                                    surahId: nextSurahId,
                                    surahName: nextSurah.name_simple,
                                    autoPlay: true
                                });
                            }
                        }
                    }

                    // Check for active verse based on timestamp
                    if (status.isPlaying) {
                        const currentPos = status.positionMillis;
                        const timestamps = audioTimestamps[surahId];

                        if (timestamps) {
                            const activeSegment = timestamps.find(
                                t => currentPos >= t.timestamp_from && currentPos < t.timestamp_to
                            );

                            if (activeSegment && activeSegment.verse_key !== activeVerseKey) {
                                setActiveVerseKey(activeSegment.verse_key);
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error playing sound:', error);
        } finally {
            setIsLoadingAudio(false);
        }
    }

    const handleShare = async (verse) => {
        try {
            await Share.share({
                message: `${verse.text_uthmani}\n\n"${verse.translations[0].text}"\n\n[Quran ${surahId}:${verse.verse_number}]`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };



    // Auto-scroll to active verse
    useEffect(() => {
        if (activeVerseKey && verses && verses.length > 0 && flatListRef.current) {
            const index = verses.findIndex(v => v.verse_key === activeVerseKey);
            if (index !== -1) {
                try {
                    flatListRef.current.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.3
                    });
                } catch (e) {
                    // Ignore errors if list isn't ready
                }
            }
        }
    }, [activeVerseKey, verses]);

    const renderVerseItem = ({ item }) => {
        const isActive = item.verse_key === activeVerseKey;

        return (
            <View style={[styles.verseContainer, isActive && styles.activeVerseContainer]}>
                <View style={styles.verseHeader}>
                    <View style={[styles.verseNumberBadge, isActive && styles.activeVerseNumberBadge]}>
                        <Text style={[styles.verseNumber, isActive && styles.activeVerseNumber]}>{item.verse_number}</Text>
                    </View>
                    <View style={styles.verseActions}>
                        <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionIcon}>
                            <Ionicons name="share-outline" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIcon}>
                            <Ionicons name="bookmark-outline" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={[styles.arabicText, isActive && styles.activeArabicText]}>
                    {item.text_uthmani || 'Text not available'}
                </Text>
                {showTranslation && (
                    <Text style={styles.translationText}>
                        {item.translations && item.translations[0]
                            ? item.translations[0].text.replace(/<[^>]*>?/gm, '')
                            : 'Translation not available'}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.surahTitle}>{surahName}</Text>
                    <Text style={styles.surahSub}>Surah {surahId}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                    <Text style={{ color: colors.text, fontSize: 12, marginRight: 6 }}>Translation</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: colors.primary }}
                        thumbColor={showTranslation ? "#fff" : "#f4f3f4"}
                        onValueChange={() => setShowTranslation(!showTranslation)}
                        value={showTranslation}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>
                <TouchableOpacity onPress={playSound} style={styles.playButton}>
                    {isLoadingAudio ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            {isVersesLoading && (!verses || verses.length === 0) ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={styles.errorText}>Oops! Failed to load verses.</Text>
                    <Text style={styles.errorSub}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(fetchSurahVerses(surahId))}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (!verses || verses.length === 0) ? (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>No verses found for this Surah.</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={verses}
                    renderItem={renderVerseItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onScrollToIndexFailed={(info) => {
                        const wait = new Promise(resolve => setTimeout(resolve, 500));
                        wait.then(() => {
                            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                        });
                    }}
                    ListHeaderComponent={
                        surahId !== 1 && surahId !== 9 ? (
                            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                        ) : null
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
    headerTitleContainer: {
        flex: 1,
    },
    surahTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    surahSub: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: spacing.xl,
    },
    bismillah: {
        fontSize: 24,
        textAlign: 'center',
        color: colors.text,
        marginBottom: spacing.xl,
        fontFamily: 'System', // Arabic fonts can be added later
    },
    verseContainer: {
        marginBottom: spacing.xxl,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight + '30',
        paddingBottom: spacing.lg,
    },
    activeVerseContainer: {
        backgroundColor: colors.primary + '08', // Very light primary bg
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        borderColor: colors.primary + '20',
        borderWidth: 1,
    },
    verseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    verseNumberBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verseNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    verseActions: {
        flexDirection: 'row',
    },
    actionIcon: {
        marginLeft: spacing.md,
    },
    arabicText: {
        fontSize: 28,
        color: colors.text,
        textAlign: 'right',
        lineHeight: 48,
        marginBottom: spacing.lg,
    },
    activeArabicText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    translationText: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    errorText: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    errorSub: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
    },
    retryText: {
        color: '#fff',
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
    },
});

export default SurahReaderScreen;
