import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Card } from '../../components';

const RecordingScreen = ({ navigation }) => {
    const [isRecording, setIsRecording] = useState(false);

    const toggleRecording = () => {
        setIsRecording(!isRecording);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Hifz Recording 🎙️</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Record Your Recitation</Text>
                    <Text style={styles.infoText}>
                        Listen back to your own voice to identify areas for improvement in your hifz journey.
                    </Text>
                </Card>

                <View style={styles.recordContainer}>
                    <View style={styles.timerContainer}>
                        <Text style={styles.timer}>00:00</Text>
                        <Text style={styles.statusText}>
                            {isRecording ? 'Recording your heart\'s light...' : 'Ready to record'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.recordButton, isRecording && styles.recordingActive]}
                        onPress={toggleRecording}
                    >
                        <LinearGradient
                            colors={isRecording ? ['#ef4444', '#b91c1c'] : colors.purpleGradient}
                            style={styles.buttonGradient}
                        >
                            <Ionicons
                                name={isRecording ? "stop" : "mic"}
                                size={48}
                                color="#fff"
                            />
                        </LinearGradient>
                    </TouchableOpacity>

                    {isRecording && (
                        <View style={styles.waveContainer}>
                            {/* Animated waves placeholder */}
                            <Text style={styles.wavePlaceholder}>━━━━━●━━━━━</Text>
                        </View>
                    )}
                </View>

                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>Recent Recordings</Text>
                    <View style={styles.emptyRecent}>
                        <Ionicons name="musical-notes-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No recordings yet.</Text>
                        <Text style={styles.emptySub}>Your recitations will appear here.</Text>
                    </View>
                </View>
            </ScrollView>
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
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    content: {
        padding: spacing.lg,
    },
    infoCard: {
        padding: spacing.lg,
        marginBottom: spacing.xxl,
        backgroundColor: colors.surface,
    },
    infoTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    recordContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.text,
        fontFamily: 'System', // Use monospace if available
    },
    statusText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    recordButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingActive: {
        transform: [{ scale: 1.1 }],
    },
    waveContainer: {
        marginTop: spacing.xl,
    },
    wavePlaceholder: {
        color: colors.primary,
        letterSpacing: 4,
        fontSize: 24,
    },
    recentSection: {
        marginTop: spacing.xxl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },
    emptyRecent: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
        backgroundColor: colors.surface + '50',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.md,
    },
    emptySub: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});

export default RecordingScreen;
