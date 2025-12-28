import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hifzReducer from './slices/hifzSlice';
import journalReducer from './slices/journalSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        hifz: hifzReducer,
        journal: journalReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
