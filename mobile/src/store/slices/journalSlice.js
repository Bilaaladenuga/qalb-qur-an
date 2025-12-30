import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { journalAPI } from '../../services/api';

// Async thunks
export const fetchEntries = createAsyncThunk(
    'journal/fetchEntries',
    async (_, { rejectWithValue }) => {
        try {
            const response = await journalAPI.getEntries();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch entries'
            );
        }
    }
);

export const createEntry = createAsyncThunk(
    'journal/createEntry',
    async (entryData, { rejectWithValue }) => {
        try {
            const response = await journalAPI.createEntry(entryData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create entry'
            );
        }
    }
);

export const updateEntry = createAsyncThunk(
    'journal/updateEntry',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await journalAPI.updateEntry(id, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update entry'
            );
        }
    }
);

export const deleteEntry = createAsyncThunk(
    'journal/deleteEntry',
    async (id, { rejectWithValue }) => {
        try {
            await journalAPI.deleteEntry(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete entry'
            );
        }
    }
);

export const fetchPrompts = createAsyncThunk(
    'journal/fetchPrompts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await journalAPI.getPrompts();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch prompts'
            );
        }
    }
);

export const fetchMoodStats = createAsyncThunk(
    'journal/fetchMoodStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await journalAPI.getMoodStats();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch mood stats'
            );
        }
    }
);

const initialState = {
    entries: [],
    prompts: [],
    moodStats: {},
    isLoading: false,
    error: null,
};

const journalSlice = createSlice({
    name: 'journal',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Entries
            .addCase(fetchEntries.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEntries.fulfilled, (state, action) => {
                state.isLoading = false;
                state.entries = action.payload;
            })
            .addCase(fetchEntries.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create Entry
            .addCase(createEntry.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createEntry.fulfilled, (state, action) => {
                state.isLoading = false;
                state.entries.unshift(action.payload);
            })
            .addCase(createEntry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update Entry
            .addCase(updateEntry.fulfilled, (state, action) => {
                const index = state.entries.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.entries[index] = action.payload;
                }
            })
            // Delete Entry
            .addCase(deleteEntry.fulfilled, (state, action) => {
                state.entries = state.entries.filter(e => e.id !== action.payload);
            })
            // Fetch Prompts
            .addCase(fetchPrompts.fulfilled, (state, action) => {
                state.prompts = action.payload;
            })
            // Fetch Mood Stats
            .addCase(fetchMoodStats.fulfilled, (state, action) => {
                state.moodStats = action.payload;
            });
    },
});

export const { clearError } = journalSlice.actions;
export default journalSlice.reducer;
