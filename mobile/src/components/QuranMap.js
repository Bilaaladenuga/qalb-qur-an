import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { SURAHS } from '../utils/surahs';

const { width } = Dimensions.get('window');

// Premium Palette for the "Tree"
const TREE_COLORS = {
    parchment: '#FDFCF0',
    deepGreen: '#1B4D3E',
    gold: '#D4AF37',
    bronze: '#CD7F32',
    mastered: '#1B4D3E',
    reviewing: '#CD7F32',
    memorizing: '#A5C9CA',
    unlocked: '#E5E5E5',
};

const QuranMap = ({ progress, onSurahPress }) => {
    // Memoized stats and maps
    const { masteryMap, stats } = useMemo(() => {
        const map = {};
        let totalAyahs = 0;

        progress.forEach(p => {
            const id = p.surahId;
            const status = p.status;

            if (!map[id] ||
                (status === 'mastered' && map[id] !== 'mastered') ||
                (status === 'reviewing' && map[id] === 'memorizing')) {
                map[id] = status;
            }
            totalAyahs += Math.abs(p.ayahEnd - p.ayahStart) + 1;
        });

        return {
            masteryMap: map,
            stats: {
                totalSurahs: Object.values(map).filter(s => s === 'mastered').length,
                totalAyahs,
                totalProgress: (Object.keys(map).length / 114) * 100
            }
        };
    }, [progress]);

    // Grouping surahs by juz
    const juzGroups = useMemo(() => {
        const groups = {};
        SURAHS.forEach(s => {
            if (!groups[s.juz]) groups[s.juz] = [];
            groups[s.juz].push(s);
        });
        return groups;
    }, []);

    const getStatusTheme = (id) => {
        const status = masteryMap[id];
        if (status === 'mastered') return { bg: [TREE_COLORS.deepGreen, '#0D2B22'], border: TREE_COLORS.gold, text: '#fff', icon: 'checkmark-circle' };
        if (status === 'reviewing') return { bg: [TREE_COLORS.bronze, '#8B4513'], border: TREE_COLORS.gold, text: '#fff', icon: 'refresh-circle' };
        if (status === 'memorizing') return { bg: ['#A5C9CA', '#395B64'], border: 'rgba(0,0,0,0.1)', text: '#fff', icon: 'book' };
        return { bg: ['#fff', '#f0f0f0'], border: 'rgba(0,0,0,0.05)', text: TREE_COLORS.deepGreen, icon: 'lock-closed' };
    };

    // Calculate position for the "Winding Path"
    const getSurahPosition = (index) => {
        const pattern = [0.5, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6]; // Relative X offsets
        const offset = pattern[index % pattern.length];
        return (width - 100) * offset;
    };

    return (
        <View style={styles.root}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Spiritual Header */}
                <View style={styles.treeHeader}>
                    <Text style={styles.treeSub}>Your Spiritual Growth</Text>
                    <Text style={styles.treeTitle}>The Qur'an Tree</Text>
                    <View style={styles.divider} />
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{stats.totalSurahs}</Text>
                            <Text style={styles.statLab}>Mastered</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{stats.totalAyahs}</Text>
                            <Text style={styles.statLab}>Ayahs</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{stats.totalProgress.toFixed(0)}%</Text>
                            <Text style={styles.statLab}>Complete</Text>
                        </View>
                    </View>
                </View>

                {/* The Path/Tree */}
                <View style={styles.treeBody}>
                    {/* Background "Vine" Path */}
                    <View style={styles.vinePath} />

                    {Object.keys(juzGroups).map((juz, juzIdx) => (
                        <View key={juz} style={styles.juzContainer}>
                            <View style={styles.juzMarker}>
                                <Text style={styles.juzText}>JUZ {juz}</Text>
                            </View>

                            {juzGroups[juz].map((surah, sIdx) => {
                                const theme = getStatusTheme(surah.id);
                                const leftPos = getSurahPosition(sIdx + (juzIdx * 5));

                                return (
                                    <View key={surah.id} style={[styles.nodeWrapper, { marginLeft: leftPos }]}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[styles.nodeInner, { borderColor: theme.border }]}
                                            onPress={() => onSurahPress?.(surah)}
                                        >
                                            <LinearGradient
                                                colors={theme.bg}
                                                style={styles.nodeGradient}
                                            >
                                                <Text style={[styles.surahNum, { color: theme.text }]}>{surah.id}</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                        <View style={styles.nodeLabels}>
                                            <Text style={styles.nodeName}>{surah.name}</Text>
                                            <Ionicons name={theme.icon} size={10} color={theme.border} />
                                        </View>

                                        {/* Decorative Branch/Connector */}
                                        <View style={styles.branchLine} />
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Ionicons name="leaf" size={24} color={TREE_COLORS.gold} />
                    <Text style={styles.footerText}>"Like a good tree, its root is firm and its branch is in the sky."</Text>
                    <Text style={styles.footerRef}>Surah Ibrahim 14:24</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: TREE_COLORS.parchment,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    treeHeader: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
        backgroundColor: TREE_COLORS.deepGreen,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    treeSub: {
        color: TREE_COLORS.gold,
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        opacity: 0.9,
    },
    treeTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 4,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    divider: {
        width: 40,
        height: 2,
        backgroundColor: TREE_COLORS.gold,
        marginVertical: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: spacing.xl,
    },
    stat: {
        alignItems: 'center',
    },
    statVal: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLab: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    treeBody: {
        paddingTop: spacing.xxl,
        position: 'relative',
        minHeight: 1000,
    },
    vinePath: {
        position: 'absolute',
        left: width / 2 - 1,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'rgba(27, 77, 62, 0.05)',
        borderStyle: 'dashed',
        borderRadius: 1,
    },
    juzContainer: {
        marginBottom: spacing.xxl,
    },
    juzMarker: {
        backgroundColor: TREE_COLORS.gold,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        alignSelf: 'center',
        marginBottom: spacing.xl,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    juzText: {
        color: TREE_COLORS.deepGreen,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    nodeWrapper: {
        marginBottom: spacing.xl,
        alignItems: 'center',
        flexDirection: 'row',
        zIndex: 2,
    },
    nodeInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        padding: 2,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    nodeGradient: {
        flex: 1,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    surahNum: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    nodeLabels: {
        marginLeft: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    nodeName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: TREE_COLORS.deepGreen,
    },
    branchLine: {
        position: 'absolute',
        top: 30,
        left: -40,
        width: 40,
        height: 2,
        backgroundColor: 'rgba(27, 77, 62, 0.1)',
        zIndex: -1,
    },
    footer: {
        padding: spacing.xxl,
        alignItems: 'center',
        opacity: 0.8,
    },
    footerText: {
        textAlign: 'center',
        color: TREE_COLORS.deepGreen,
        fontStyle: 'italic',
        marginTop: spacing.md,
        fontSize: 14,
        lineHeight: 22,
    },
    footerRef: {
        color: TREE_COLORS.gold,
        fontSize: 12,
        marginTop: spacing.sm,
        fontWeight: 'bold',
    }
});

export default QuranMap;
