import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hifzAPI } from '../../services/api';

// Async thunks
export const fetchProgress = createAsyncThunk(
    'hifz/fetchProgress',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hifzAPI.getProgress();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch progress'
            );
        }
    }
);

export const addProgress = createAsyncThunk(
    'hifz/addProgress',
    async (progressData, { rejectWithValue }) => {
        try {
            const response = await hifzAPI.addProgress(progressData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to add progress'
            );
        }
    }
);

export const updateProgress = createAsyncThunk(
    'hifz/updateProgress',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await hifzAPI.updateProgress(id, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update progress'
            );
        }
    }
);

export const fetchGoals = createAsyncThunk(
    'hifz/fetchGoals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hifzAPI.getGoals();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch goals'
            );
        }
    }
);

export const createGoal = createAsyncThunk(
    'hifz/createGoal',
    async (goalData, { rejectWithValue }) => {
        try {
            const response = await hifzAPI.createGoal(goalData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create goal'
            );
        }
    }
);

export const fetchReviewQueue = createAsyncThunk(
    'hifz/fetchReviewQueue',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hifzAPI.getReviewQueue();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch review queue'
            );
        }
    }
);

export const reviewProgress = createAsyncThunk(
    'hifz/reviewProgress',
    async ({ id, quality }, { rejectWithValue }) => {
        try {
            const response = await hifzAPI.reviewProgress(id, quality);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to record review'
            );
        }
    }
);

const initialState = {
    progress: [],
    goals: [],
    reviewQueue: [],
    stats: {
        total: 0,
        memorizing: 0,
        reviewing: 0,
        mastered: 0,
    },
    isLoading: false,
    error: null,
};

const hifzSlice = createSlice({
    name: 'hifz',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Progress
            .addCase(fetchProgress.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProgress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.progress = action.payload.progress;
                state.stats = action.payload.stats;
            })
            .addCase(fetchProgress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Add Progress
            .addCase(addProgress.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addProgress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.progress.unshift(action.payload);
                state.stats.total += 1;
                state.stats.memorizing += 1;
                // Fetch goals again to reflect auto-updates
                // Note: We can't dispatch from here, but the UI should handle reload or we can update state if we return updated goals from backend.
            })
            .addCase(addProgress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update Progress
            .addCase(updateProgress.fulfilled, (state, action) => {
                const index = state.progress.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.progress[index] = action.payload;
                }
            })
            // Fetch Goals
            .addCase(fetchGoals.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.isLoading = false;
                state.goals = action.payload;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create Goal
            .addCase(createGoal.fulfilled, (state, action) => {
                state.goals.unshift(action.payload);
            })
            // Fetch Review Queue
            .addCase(fetchReviewQueue.fulfilled, (state, action) => {
                state.reviewQueue = action.payload;
            })
            // Review Progress
            .addCase(reviewProgress.fulfilled, (state, action) => {
                // Update progress in the list
                const idx = state.progress.findIndex(p => p.id === action.payload.id);
                if (idx !== -1) {
                    state.progress[idx] = action.payload;
                }
                // Remove from queue
                state.reviewQueue = state.reviewQueue.filter(p => p.id !== action.payload.id);
            });
    },
});

export const { clearError } = hifzSlice.actions;
export default hifzSlice.reducer;
