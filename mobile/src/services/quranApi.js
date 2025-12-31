import axios from 'axios';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

const quranApi = axios.create({
    baseURL: QURAN_API_BASE,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

export const quranService = {
    /**
     * Get all 114 surahs with basic info
     */
    getSurahList: () => quranApi.get('/chapters?language=en'),

    /**
     * Get specific surah details
     */
    getSurahDetail: (id) => quranApi.get(`/chapters/${id}?language=en`),

    /**
     * Get verses for a surah
     * @param {number} chapterId 
     * @param {number} translationId - Default 131 (The Clear Quran)
     */
    getVerses: (chapterId) =>
        quranApi.get(`/verses/by_chapter/${chapterId}`, {
            params: {
                language: 'en',
                fields: 'text_uthmani,image_url,verse_key',
                per_page: 300
            }
        }),

    /**
     * Get translations for a surah
     * @param {number} chapterId
     * @param {number} translationId - Default 20 (Saheeh International)
     */
    getTranslations: (chapterId, translationId = 20) =>
        quranApi.get(`/quran/translations/${translationId}`, {
            params: {
                chapter_number: chapterId,
                fields: 'verse_key'
            }
        }),

    /**
     * Get audio recitations for a surah
     * @param {number} reciterId - Default 7 (Mishary Rashid Alafasy)
     * @param {number} chapterId 
     */
    getAudio: (reciterId = 7, chapterId) =>
        quranApi.get(`/chapter_recitations/${reciterId}/${chapterId}?segments=true`),

    /**
     * Get list of available reciters
     */
    getReciters: () => quranApi.get('/resources/recitations?language=en'),
};

export default quranService;
