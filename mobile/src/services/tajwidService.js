import api from './api';

export const getLessons = async () => {
    try {
        const response = await api.get('/tajwid/lessons');
        return response.data;
    } catch (error) {
        console.error('Error fetching Tajwid lessons:', error);
        throw error;
    }
};

export const updateProgress = async (lessonId, completed) => {
    try {
        const response = await api.post('/tajwid/progress', { lessonId, completed });
        return response.data;
    } catch (error) {
        console.error('Error updating Tajwid progress:', error);
        throw error;
    }
};
