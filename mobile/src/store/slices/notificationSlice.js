import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '../../services/api';

// Async thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationAPI.getNotifications();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const markRead = createAsyncThunk(
    'notifications/markRead',
    async (id, { rejectWithValue }) => {
        try {
            const response = await notificationAPI.markAsRead(id);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
        }
    }
);

export const markAllRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationAPI.markAllAsRead();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
        }
    }
);

const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotificationError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload;
                state.unreadCount = action.payload.filter(n => !n.isRead).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(markRead.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n.id === action.payload.id);
                if (index !== -1) {
                    state.notifications[index].isRead = true;
                    state.unreadCount = state.notifications.filter(n => !n.isRead).length;
                }
            })
            .addCase(markAllRead.fulfilled, (state) => {
                state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
                state.unreadCount = 0;
            });
    }
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;
