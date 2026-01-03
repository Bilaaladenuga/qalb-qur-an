import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import HifzScreen from '../screens/hifz/HifzScreen';
import JournalScreen from '../screens/journal/JournalScreen';
import SisterCirclesScreen from '../screens/journal/SisterCirclesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import QuranListScreen from '../screens/quran/QuranListScreen';
import SurahReaderScreen from '../screens/quran/SurahReaderScreen';
import TajwidScreen from '../screens/tajwid/TajwidScreen';
import LessonDetailScreen from '../screens/tajwid/LessonDetailScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import RecordingScreen from '../screens/hifz/RecordingScreen';
import CircleDetailsScreen from '../screens/journal/CircleDetailsScreen';
import { colors, spacing } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const QuranStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="QuranList" component={QuranListScreen} />
        <Stack.Screen name="SurahReader" component={SurahReaderScreen} />
    </Stack.Navigator>
);

const TajwidStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TajwidList" component={TajwidScreen} />
        <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
    </Stack.Navigator>
);

// Custom tab bar icon component
const TabIcon = ({ focused, iconName, size }) => {
    if (focused) {
        return (
            <LinearGradient
                colors={colors.primaryGradient || ['#2563EB', '#60A5FA']}
                style={styles.activeIconBg}
            >
                <Ionicons name={iconName} size={size - 2} color={colors.text} />
            </LinearGradient>
        );
    }
    return <Ionicons name={iconName} size={size} color={colors.textMuted} />;
};

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="home" size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Hifz"
                component={HifzScreen}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="book" size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Quran"
                component={QuranStack}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="library-outline" size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Tajwid"
                component={TajwidStack}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="school" size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Circles"
                component={SisterCirclesScreen}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="people" size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Journal"
                component={JournalScreen}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="journal" size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="person" size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const MainNavigator = () => {
    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="MainTabs" component={TabNavigator} />
            <RootStack.Screen name="Notifications" component={NotificationScreen} />
            <RootStack.Screen name="Recording" component={RecordingScreen} />
            <RootStack.Screen name="CircleDetails" component={CircleDetailsScreen} />
        </RootStack.Navigator>
    );
};

// styles removed from this chunk as they are likely unchanged at the bottom

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.surface,
        borderTopColor: colors.surfaceLight,
        borderTopWidth: 1,
        height: 80,
        paddingBottom: spacing.md,
        paddingTop: spacing.sm,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: spacing.xs,
    },
    activeIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    placeholderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    placeholderText: {
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    logoutButton: {
        width: 200,
    },
});

export default MainNavigator;
