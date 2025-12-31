import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { badgeAPI } from '../../services/api';

// Async thunks
export const fetchMyBadges = createAsyncThunk(
    'badges/fetchMyBadges',
    async (_, { rejectWithValue }) => {
        try {
            const response = await badgeAPI.getMyBadges();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch badges');
        }
    }
);

export const fetchAllBadges = createAsyncThunk(
    'badges/fetchAllBadges',
    async (_, { rejectWithValue }) => {
        try {
            const response = await badgeAPI.getAllBadges();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all badges');
        }
    }
);

const initialState = {
    myBadges: [],
    allBadges: [],
    isLoading: false,
    error: null,
};

const badgeSlice = createSlice({
    name: 'badges',
    initialState,
    reducers: {
        clearBadgeError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyBadges.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyBadges.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myBadges = action.payload;
            })
            .addCase(fetchMyBadges.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllBadges.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllBadges.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allBadges = action.payload;
            })
            .addCase(fetchAllBadges.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearBadgeError } = badgeSlice.actions;
export default badgeSlice.reducer;
