import axios from 'axios';
import storage from './storage';

// Base URL for API - change this in production
const BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.log('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - could dispatch logout action
            console.log('Unauthorized - token may be expired');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Hifz API
export const hifzAPI = {
    getProgress: () => api.get('/hifz/progress'),
    addProgress: (data) => api.post('/hifz/progress', data),
    updateProgress: (id, data) => api.put(`/hifz/progress/${id}`, data),
    getGoals: () => api.get('/hifz/goals'),
    createGoal: (data) => api.post('/hifz/goals', data),
    updateGoal: (id, data) => api.put(`/hifz/goals/${id}`, data),
    reviewProgress: (id, quality) => api.post(`/hifz/progress/${id}/review`, { quality }),
    getReviewQueue: () => api.get('/hifz/review-queue'),
};

// Journal API
export const journalAPI = {
    getEntries: () => api.get('/journal'),
    createEntry: (data) => api.post('/journal', data),
    updateEntry: (id, data) => api.put(`/journal/${id}`, data),
    deleteEntry: (id) => api.delete(`/journal/${id}`),
    getPrompts: () => api.get('/journal/prompts'),
    getMoodStats: () => api.get('/journal/mood-stats'),
};

// Recordings API
export const recordingsAPI = {
    getRecordings: () => api.get('/recordings'),
    saveRecording: (data) => api.post('/recordings', data),
    deleteRecording: (id) => api.delete(`/recordings/${id}`),
};

export default api;
