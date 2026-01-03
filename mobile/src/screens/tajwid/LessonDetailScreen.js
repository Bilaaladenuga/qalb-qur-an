import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Animated,
    Easing,
    Linking,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import * as tajwidService from '../../services/tajwidService';

// Animation Component
const PulseView = ({ children, style, delay = 0 }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [delay]);

    return (
        <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
            {children}
        </Animated.View>
    );
};

const LessonDetailScreen = ({ route, navigation }) => {
    const { lesson } = route.params;
    const [isCompleted, setIsCompleted] = useState(lesson.completed);
    const [updating, setUpdating] = useState(false);
    const [debugMsg, setDebugMsg] = useState('Audio initializing...');
    const [showAudioHelp, setShowAudioHelp] = useState(false);

    // DEBUG: Check for voice availability
    useEffect(() => {
        const checkVoices = async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();
                const arabicVoice = voices.find(v => v.language.includes('ar'));
                if (!arabicVoice) {
                    const availableLangs = voices.slice(0, 3).map(v => v.language).join(', ');
                    setDebugMsg(`Missing Arabic Voice! Found: [${availableLangs}, ...]`);
                    setShowAudioHelp(true);
                } else {
                    setDebugMsg(`Ready. Using: ${arabicVoice.name}`);
                    setShowAudioHelp(false);
                }
            } catch (e) {
                setDebugMsg(`Voice Check Error: ${e.message}`);
            }
        };
        checkVoices();
    }, []);

    const toggleCompletion = async () => {
        try {
            setUpdating(true);
            const nextStatus = !isCompleted;
            await tajwidService.updateProgress(lesson.id, nextStatus);
            setIsCompleted(nextStatus);
        } catch (error) {
            console.error('Failed to update progress:', error);
        } finally {
            setUpdating(false);
        }
    };

    const playExample = async (text) => {
        try {
            setDebugMsg(`Playing: ${text.substring(0, 10)}...`);
            const isSpeaking = await Speech.isSpeakingAsync();
            if (isSpeaking) {
                await Speech.stop();
            }

            Speech.speak(text, {
                language: 'ar',
                pitch: 1.0,
                rate: 0.9,
                onError: (e) => setDebugMsg(`Error: ${e.message}`),
                onDone: () => setDebugMsg('Playback finished'),
                onStopped: () => setDebugMsg('Playback stopped')
            });
        } catch (error) {
            setDebugMsg(`JS Error: ${error.message}`);
        }
    };

    const renderAudioHelp = () => {
        if (!showAudioHelp) return null;
        return (
            <View style={styles.helpCard}>
                <View style={styles.helpHeader}>
                    <Ionicons name="warning" size={24} color="#B45309" />
                    <Text style={styles.helpTitle}>Audio Missing?</Text>
                </View>
                <Text style={styles.helpText}>
                    Your device doesn't have an Arabic voice installed. The audio buttons won't work.
                </Text>
                <Text style={styles.helpSubTitle}>To Fix (Windows):</Text>
                <Text style={styles.helpStep}>1. Settings {'>'} Time & Language {'>'} Language</Text>
                <Text style={styles.helpStep}>2. Add Language {'>'} "Arabic (Saudi Arabia)"</Text>
                <Text style={styles.helpStep}>3. Make sure "Text-to-speech" is selected.</Text>
                <Text style={styles.helpStep}>4. Restart this app.</Text>
            </View>
        );
    };

    const renderDiagram = (diagramType) => {
        switch (diagramType) {
            case 'throat':
                return (
                    <View style={styles.diagramContainer}>
                        <PulseView delay={0} style={[styles.throatSection, { backgroundColor: '#FCE7F3' }]}>
                            <Text style={styles.diagramLabel}>TOP (Kha, Ghain)</Text>
                            <Ionicons name="arrow-up" size={16} color="#DB2777" />
                        </PulseView>
                        <PulseView delay={300} style={[styles.throatSection, { backgroundColor: '#E0E7FF' }]}>
                            <Text style={styles.diagramLabel}>MIDDLE (Ha, Ain)</Text>
                            <Ionicons name="remove-outline" size={16} color="#4F46E5" />
                        </PulseView>
                        <PulseView delay={600} style={[styles.throatSection, { backgroundColor: '#DCFCE7' }]}>
                            <Text style={styles.diagramLabel}>DEEP (Hamza, Ha)</Text>
                            <Ionicons name="arrow-down" size={16} color="#16A34A" />
                        </PulseView>
                        <Text style={styles.diagramCaption}>Visualizing the 3 Parts of the Throat (Pulsating)</Text>
                    </View>
                );
            case 'tongue':
                return (
                    <View style={styles.diagramContainer}>
                        <View style={styles.tongueShape}>
                            <PulseView delay={0} style={styles.tongueDeep}><Text style={styles.diagramLabelWhite}>Qaf/Kaf</Text></PulseView>
                            <PulseView delay={500} style={styles.tongueMiddle}><Text style={styles.diagramLabelWhite}>Gym/Shin/Ya</Text></PulseView>
                            <PulseView delay={1000} style={styles.tongueTip}><Text style={styles.diagramLabelWhite}>Tip Letters</Text></PulseView>
                        </View>
                        <Text style={styles.diagramCaption}>The Tongue (Al-Lisan) Areas</Text>
                    </View>
                );
            case 'lips':
                return (
                    <View style={styles.diagramContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                            <PulseView delay={0} style={styles.lipCircle}><Text style={styles.lipText}>Waw</Text></PulseView>
                            <PulseView delay={500} style={[styles.lipCircle, { borderRadius: 4 }]}><Text style={styles.lipText}>Ba/Mim</Text></PulseView>
                        </View>
                        <Text style={styles.diagramCaption}>Circular (Waw) vs Closed (Ba/Mim)</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    const renderSection = (section, index) => {
        switch (section.type) {
            case 'diagram':
                return renderDiagram(section.diagramType);

            case 'scholarly_definition':
                return (
                    <View key={index} style={styles.card}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                            <Ionicons name="school" size={20} color={colors.primary} style={{ marginRight: spacing.xs }} />
                            <Text style={styles.cardLabel}>SCHOLARLY DEFINITION</Text>
                        </View>
                        <Text style={[styles.cardText, { marginBottom: 8 }]}>
                            <Text style={{ fontWeight: 'bold', color: colors.primary }}>Linguistically:</Text> {section.linguistic}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={{ fontWeight: 'bold', color: colors.primary }}>Technically:</Text> {section.technical}
                        </Text>
                    </View>
                );

            case 'evidence':
                return (
                    <View key={index} style={[styles.card, { backgroundColor: '#F8FAFC', borderColor: colors.textSecondary }]}>
                        <Text style={[styles.cardLabel, { alignSelf: 'center', color: colors.textSecondary }]}>THE EVIDENCE (AL-JAZARIYYAH)</Text>
                        <Text style={[styles.arabicText, { fontSize: 22, lineHeight: 36, textAlign: 'center', color: '#1E293B', marginBottom: 8 }]}>
                            {section.arabic}
                        </Text>
                        <Text style={[styles.cardText, { fontSize: 12, fontStyle: 'italic', textAlign: 'center', color: colors.textMuted }]}>
                            "{section.translation}"
                        </Text>
                    </View>
                );

            case 'definition':
            case 'text':
                return (
                    <View key={index} style={styles.card}>
                        <Text style={styles.cardLabel}>{section.title}</Text>
                        <Text style={styles.cardText}>{section.content}</Text>
                    </View>
                );

            case 'highlight':
                return (
                    <View key={index} style={[styles.card, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                            <Ionicons name="information-circle" size={20} color={colors.primary} style={{ marginRight: spacing.xs }} />
                            <Text style={[styles.cardLabel, { color: colors.primary, marginBottom: 0 }]}>{section.title}</Text>
                        </View>
                        <Text style={styles.cardText}>{section.content}</Text>
                    </View>
                );

            case 'mistake':
                return (
                    <View key={index} style={[styles.card, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                            <Ionicons name="warning" size={20} color="#EF4444" style={{ marginRight: spacing.xs }} />
                            <Text style={[styles.cardLabel, { color: '#EF4444', marginBottom: 0 }]}>COMMON MISTAKE</Text>
                        </View>
                        <Text style={[styles.cardText, { color: '#7F1D1D' }]}>{section.content}</Text>
                    </View>
                );

            case 'tip':
                return (
                    <View key={index} style={[styles.card, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                            <Ionicons name="bulb" size={20} color="#10B981" style={{ marginRight: spacing.xs }} />
                            <Text style={[styles.cardLabel, { color: '#10B981', marginBottom: 0 }]}>PRO TIP</Text>
                        </View>
                        <Text style={[styles.cardText, { color: '#064E3B' }]}>{section.content}</Text>
                    </View>
                );

            case 'list':
                return (
                    <View key={index} style={styles.card}>
                        <Text style={styles.cardLabel}>{section.title}</Text>
                        {section.content.map((item, i) => (
                            <View key={i} style={styles.listItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.cardText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                );

            case 'example':
                return (
                    <View key={index} style={styles.exampleCard}>
                        <View style={styles.exampleHeader}>
                            <Text style={styles.exampleLabel}>EXAMPLE</Text>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={() => playExample(section.arabic)}
                            >
                                <Ionicons name="volume-high" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.arabicContainer}>
                            <Text style={styles.arabicText}>{section.arabic}</Text>
                        </View>

                        <View style={styles.exampleFooter}>
                            <Text style={styles.transliteration}>{section.transliteration}</Text>
                            {section.description && (
                                <Text style={styles.exampleDescription}>{section.description}</Text>
                            )}
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerSubtitle}>{lesson.level}</Text>
                    <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Audio Help Card (Conditional) */}
                {renderAudioHelp()}

                {/* Debug Header */}
                <Text style={{ color: 'red', fontSize: 10, textAlign: 'center', marginBottom: 10, opacity: 0.6 }}>Debug: {debugMsg}</Text>

                {/* Description Header */}
                <Text style={styles.introText}>{lesson.description}</Text>

                {/* Dynamic Sections */}
                {lesson.sections && lesson.sections.map((section, index) => renderSection(section, index))}

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.completeButton,
                            isCompleted && styles.completedButton
                        ]}
                        onPress={toggleCompletion}
                        disabled={updating}
                    >
                        {updating ? (
                            <ActivityIndicator color={colors.text} />
                        ) : (
                            <>
                                <Ionicons
                                    name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                                    size={24}
                                    color={colors.text}
                                    style={{ marginRight: spacing.sm }}
                                />
                                <Text style={styles.buttonText}>
                                    {isCompleted ? "Completed" : "Mark as Complete"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
        backgroundColor: colors.surface,
    },
    backButton: {
        padding: spacing.xs,
        width: 40,
    },
    headerTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    introText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        lineHeight: 24,
    },

    // Cards
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.textMuted,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    cardText: {
        fontSize: typography.fontSize.md,
        color: colors.text,
        lineHeight: 24,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginRight: spacing.sm,
    },

    // Example Card
    exampleCard: {
        backgroundColor: '#fff',
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.md,
    },
    exampleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.surfaceLight,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    exampleLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    arabicContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    arabicText: {
        fontSize: 40,
        color: colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    exampleFooter: {
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    transliteration: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 4,
    },
    exampleDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },

    // Footer
    footer: {
        marginTop: spacing.lg,
    },
    completeButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    completedButton: {
        backgroundColor: colors.success,
    },
    buttonText: {
        color: colors.text,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    // Diagrams
    diagramContainer: {
        backgroundColor: '#fff',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    throatSection: {
        width: '80%',
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 8,
    },
    diagramLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    diagramLabelWhite: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    diagramCaption: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: spacing.md,
        fontStyle: 'italic',
    },
    tongueShape: {
        width: 200,
        height: 120,
        backgroundColor: '#FDA4AF', // pink-300
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    tongueDeep: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '40%',
        backgroundColor: '#BE123C', // darker red
        justifyContent: 'center',
        alignItems: 'center',
    },
    tongueMiddle: {
        position: 'absolute',
        top: '30%',
        width: '100%',
        height: '30%',
        backgroundColor: '#E11D48',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tongueTip: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '30%',
        backgroundColor: '#F43F5E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lipCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
    },
    // Help Card
    helpCard: {
        backgroundColor: '#FFF7ED', // orange-50
        borderWidth: 1,
        borderColor: '#FDBA74', // orange-300
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    helpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#9A3412', // orange-800
        marginLeft: spacing.xs,
    },
    helpText: {
        fontSize: 14,
        color: '#9A3412',
        marginBottom: spacing.sm,
    },
    helpSubTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9A3412',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    helpStep: {
        fontSize: 12,
        color: '#C2410C', // orange-700
        marginBottom: 2,
        marginLeft: spacing.sm,
    },
});

export default LessonDetailScreen;
