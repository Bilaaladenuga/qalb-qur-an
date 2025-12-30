import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Platform-aware storage utility
 * Uses SecureStore on iOS/Android and localStorage on Web
 */
const storage = {
    /**
     * Store item
     */
    setItem: async (key, value) => {
        if (Platform.OS === 'web') {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (error) {
                console.error('localStorage setItem error:', error);
                return false;
            }
        } else {
            try {
                await SecureStore.setItemAsync(key, value);
                return true;
            } catch (error) {
                console.error('SecureStore setItemAsync error:', error);
                return false;
            }
        }
    },

    /**
     * Get item
     */
    getItem: async (key) => {
        if (Platform.OS === 'web') {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                console.error('localStorage getItem error:', error);
                return null;
            }
        } else {
            try {
                return await SecureStore.getItemAsync(key);
            } catch (error) {
                console.error('SecureStore getItemAsync error:', error);
                return null;
            }
        }
    },

    /**
     * Delete item
     */
    removeItem: async (key) => {
        if (Platform.OS === 'web') {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('localStorage removeItem error:', error);
                return false;
            }
        } else {
            try {
                await SecureStore.deleteItemAsync(key);
                return true;
            } catch (error) {
                console.error('SecureStore deleteItemAsync error:', error);
                return false;
            }
        }
    }
};

export default storage;
