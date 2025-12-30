import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import { SURAHS } from '../utils/surahs';

const { width } = Dimensions.get('window');

const QuranMap = ({ progress }) => {
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

            // Approximate ayah count (assuming they memorized the whole range)
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

    // Grouping surahs by juz for the "Tree/Path" feel
    const groupedSurahs = useMemo(() => {
        const groups = {};
        SURAHS.forEach(s => {
            if (!groups[s.juz]) groups[s.juz] = [];
            groups[s.juz].push(s);
        });
        return groups;
    }, []);

    const getStatusStyle = (id) => {
        const status = masteryMap[id];
        if (status === 'mastered') return { bg: '#10B981', border: '#059669', text: '#fff' };
        if (status === 'reviewing') return { bg: '#3B82F6', border: '#2563EB', text: '#fff' };
        if (status === 'memorizing') return { bg: '#F59E0B', border: '#D97706', text: '#fff' };
        return { bg: colors.surface, border: 'rgba(255, 255, 255, 0.1)', text: colors.textSecondary };
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Journey Stats Header */}
            <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.statsHeader}
            >
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>{stats.totalSurahs}</Text>
                    <Text style={styles.statLab}>Completed</Text>
                </View>
                <View style={[styles.statBox, styles.statDivider]}>
                    <Text style={styles.statNum}>{stats.totalAyahs}</Text>
                    <Text style={styles.statLab}>Total Ayahs</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>{stats.totalProgress.toFixed(1)}%</Text>
                    <Text style={styles.statLab}>Journey</Text>
                </View>
            </LinearGradient>

            <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#10B981' }]} /><Text style={styles.legendText}>Mastered</Text></View>
                <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#3B82F6' }]} /><Text style={styles.legendText}>Reviewing</Text></View>
                <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#F59E0B' }]} /><Text style={styles.legendText}>In Progress</Text></View>
            </View>

            {/* Path visualization */}
            <View style={styles.pathContainer}>
                <View style={styles.verticalPath} />
                {Object.keys(groupedSurahs).map((juz) => (
                    <View key={juz} style={styles.juzSection}>
                        <View style={styles.juzHeader}>
                            <View style={styles.juzMarker} />
                            <Text style={styles.juzTitle}>JUZ {juz}</Text>
                        </View>
                        <View style={styles.grid}>
                            {groupedSurahs[juz].map((surah) => {
                                const styles_node = getStatusStyle(surah.id);
                                return (
                                    <TouchableOpacity
                                        key={surah.id}
                                        style={[
                                            styles.surahNode,
                                            { backgroundColor: styles_node.bg, borderColor: styles_node.border }
                                        ]}
                                    >
                                        <Text style={[styles.surahNumber, { color: styles_node.text }]}>{surah.id}</Text>
                                        <Text style={styles.nodeName} numberOfLines={1}>{surah.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>

            <Text style={styles.finishingTouch}>Keep going, sister! Every ayah brings you closer to the Light. 💖</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    statsHeader: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    statNum: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLab: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    juzSection: {
        marginBottom: spacing.xl,
        paddingLeft: spacing.xl,
    },
    pathContainer: {
        position: 'relative',
    },
    verticalPath: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 5,
        width: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    juzHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        marginLeft: -spacing.xl - 2,
    },
    juzMarker: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.background,
        marginRight: spacing.md,
    },
    juzTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.textMuted,
        letterSpacing: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    surahNode: {
        width: (width - spacing.md * 4 - spacing.xl) / 3 - spacing.sm,
        height: 60,
        borderRadius: borderRadius.md,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    surahNumber: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    nodeName: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 2,
    },
    finishingTouch: {
        textAlign: 'center',
        marginTop: spacing.xxl,
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        fontStyle: 'italic',
        opacity: 0.8,
    }
});

export default QuranMap;
