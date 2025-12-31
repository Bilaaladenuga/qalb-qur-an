import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hifzReducer from './slices/hifzSlice';
import journalReducer from './slices/journalSlice';
import circleReducer from './slices/circleSlice';
import quranReducer from './slices/quranSlice';
import notificationReducer from './slices/notificationSlice';
import badgeReducer from './slices/badgeSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        hifz: hifzReducer,
        journal: journalReducer,
        circles: circleReducer,
        quran: quranReducer,
        notifications: notificationReducer,
        badges: badgeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
