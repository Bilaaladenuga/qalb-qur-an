import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from '../screens/home/HomeScreen';
import HifzScreen from '../screens/hifz/HifzScreen';
import JournalScreen from '../screens/journal/JournalScreen';
import { colors, spacing } from '../theme';

const Tab = createBottomTabNavigator();

// Custom tab bar icon component
const TabIcon = ({ focused, iconName, size }) => {
    if (focused) {
        return (
            <LinearGradient
                colors={colors.purpleGradient}
                style={styles.activeIconBg}
            >
                <Ionicons name={iconName} size={size - 2} color={colors.text} />
            </LinearGradient>
        );
    }
    return <Ionicons name={iconName} size={size} color={colors.textMuted} />;
};

const MainNavigator = () => {
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
                component={ProfilePlaceholder}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <TabIcon focused={focused} iconName="person" size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Placeholder for profile screen
const ProfilePlaceholder = () => {
    const { useDispatch } = require('react-redux');
    const { logout } = require('../store/slices/authSlice');
    const { Button } = require('../components');
    const { SafeAreaView } = require('react-native-safe-area-context');
    const { Text } = require('react-native');

    const dispatch = useDispatch();

    return (
        <SafeAreaView style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>Profile</Text>
            <Text style={styles.placeholderText}>Coming soon...</Text>
            <Button
                title="Logout"
                onPress={() => dispatch(logout())}
                variant="outline"
                style={styles.logoutButton}
            />
        </SafeAreaView>
    );
};

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
