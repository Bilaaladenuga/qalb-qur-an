import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quranService } from '../../services/quranApi';

// Async thunks
export const fetchSurahs = createAsyncThunk(
    'quran/fetchSurahs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await quranService.getSurahList();
            return response.data.chapters;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch surahs');
        }
    }
);

export const fetchSurahVerses = createAsyncThunk(
    'quran/fetchSurahVerses',
    async (chapterId, { rejectWithValue }) => {
        try {
            const [versesResponse, translationsResponse] = await Promise.all([
                quranService.getVerses(chapterId),
                quranService.getTranslations(chapterId)
            ]);

            const verses = versesResponse.data.verses;
            const translations = translationsResponse.data.translations;

            // Merge translations into verses
            const mergedVerses = verses.map(verse => {
                const translation = translations.find(t => t.verse_key === verse.verse_key);
                return {
                    ...verse,
                    translations: translation ? [{ text: translation.text }] : []
                };
            });

            return {
                chapterId,
                verses: mergedVerses
            };
        } catch (error) {
            console.error('Fetch verses error:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch verses');
        }
    }
);

export const fetchAudio = createAsyncThunk(
    'quran/fetchAudio',
    async ({ reciterId, chapterId }, { rejectWithValue }) => {
        try {
            const response = await quranService.getAudio(reciterId, chapterId);
            return {
                chapterId,
                audioData: response.data.audio_file
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch audio');
        }
    }
);

const initialState = {
    surahs: [],
    currentSurah: null,
    verses: [],
    audioUrls: {}, // chapterId -> audioUrl
    audioTimestamps: {}, // chapterId -> timestamps array
    isLoading: false,
    isVersesLoading: false,
    error: null,
    selectedReciter: 7, // Default: Mishary Rashid Alafasy
    reciters: [
        { id: 7, name: 'Mishary Rashid Alafasy', style: 'Melodious' },
        { id: 1, name: 'AbdulBaset AbdulSamad', style: 'Powerful' },
        { id: 10, name: 'Saad El Ghamidi', style: 'Smooth' },
        { id: 5, name: 'Maher Al-Muaiqly', style: 'Haram Style' },
        { id: 12, name: 'Mahmoud Khalil Al-Husary', style: 'Educational' },
        { id: 6, name: 'Mohamed Siddiq Al-Minshawi', style: 'Spiritual' },
    ],
};

const quranSlice = createSlice({
    name: 'quran',
    initialState,
    reducers: {
        setCurrentSurah: (state, action) => {
            state.currentSurah = action.payload;
            state.verses = []; // Clear verses when switching
        },
        setSelectedReciter: (state, action) => {
            state.selectedReciter = action.payload;
        },
        clearQuranError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Surahs
            .addCase(fetchSurahs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSurahs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.surahs = action.payload;
            })
            .addCase(fetchSurahs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Verses
            .addCase(fetchSurahVerses.pending, (state) => {
                state.isVersesLoading = true;
            })
            .addCase(fetchSurahVerses.fulfilled, (state, action) => {
                state.isVersesLoading = false;
                state.verses = action.payload.verses;
            })
            .addCase(fetchSurahVerses.rejected, (state, action) => {
                state.isVersesLoading = false;
                state.error = action.payload;
            })
            // Fetch Audio
            .addCase(fetchAudio.fulfilled, (state, action) => {
                state.audioUrls[action.payload.chapterId] = action.payload.audioData.audio_url;
                state.audioTimestamps[action.payload.chapterId] = action.payload.audioData.timestamps;
            });
    }
});

export const { setCurrentSurah, setSelectedReciter, clearQuranError } = quranSlice.actions;
export default quranSlice.reducer;
