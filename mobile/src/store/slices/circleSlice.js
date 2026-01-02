import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { circlesAPI } from '../../services/api';

export const fetchMyCircles = createAsyncThunk(
    'circles/fetchMyCircles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await circlesAPI.getMyCircles();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching circles');
        }
    }
);

export const createCircle = createAsyncThunk(
    'circles/createCircle',
    async (data, { rejectWithValue }) => {
        try {
            const response = await circlesAPI.createCircle(data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error creating circle');
        }
    }
);

export const joinCircle = createAsyncThunk(
    'circles/joinCircle',
    async (inviteCode, { rejectWithValue }) => {
        try {
            const response = await circlesAPI.joinCircle(inviteCode);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error joining circle');
        }
    }
);

export const fetchCircleFeed = createAsyncThunk(
    'circles/fetchCircleFeed',
    async (circleId, { rejectWithValue }) => {
        try {
            const response = await circlesAPI.getCircleFeed(circleId);
            return { circleId, posts: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching feed');
        }
    }
);

export const postToCircle = createAsyncThunk(
    'circles/postToCircle',
    async ({ circleId, data }, { rejectWithValue }) => {
        try {
            const response = await circlesAPI.postToCircle(circleId, data);
            return { circleId, post: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error sharing reflection');
        }
    }
);

export const deleteCircle = createAsyncThunk(
    'circles/deleteCircle',
    async (circleId, { rejectWithValue }) => {
        try {
            await circlesAPI.deleteCircle(circleId);
            return circleId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error deleting circle');
        }
    }
);

const circleSlice = createSlice({
    name: 'circles',
    initialState: {
        myCircles: [],
        activeCircle: null,
        feeds: {}, // circleId -> posts[]
        isLoading: false,
        error: null,
    },
    reducers: {
        setActiveCircle: (state, action) => {
            state.activeCircle = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Circles
            .addCase(fetchMyCircles.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMyCircles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myCircles = action.payload;
            })
            .addCase(fetchMyCircles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create Circle
            .addCase(createCircle.fulfilled, (state, action) => {
                state.myCircles.push(action.payload);
                state.activeCircle = action.payload;
            })
            // Join Circle
            .addCase(joinCircle.fulfilled, (state, action) => {
                state.myCircles.push(action.payload);
                state.activeCircle = action.payload;
            })
            // Fetch Feed
            .addCase(fetchCircleFeed.fulfilled, (state, action) => {
                state.feeds[action.payload.circleId] = action.payload.posts;
            })
            // Post to Circle
            .addCase(postToCircle.fulfilled, (state, action) => {
                if (state.feeds[action.payload.circleId]) {
                    state.feeds[action.payload.circleId].unshift(action.payload.post);
                }
            })
            // Delete Circle
            .addCase(deleteCircle.fulfilled, (state, action) => {
                state.myCircles = state.myCircles.filter(c => c.id !== action.payload);
                if (state.activeCircle?.id === action.payload) {
                    state.activeCircle = null;
                }
            });
    },
});

export const { setActiveCircle, clearError } = circleSlice.actions;
export default circleSlice.reducer;
