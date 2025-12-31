const INSPIRATIONAL_AYAHS = [
    {
        reference: 'Al-Baqarah 2:152',
        text: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
        translation: 'English',
        category: 'Remembrance'
    },
    {
        reference: 'Ash-Sharh 94:6',
        text: 'Indeed, with hardship [will be] ease.',
        translation: 'English',
        category: 'Ease'
    },
    {
        reference: 'Az-Zumar 39:53',
        text: 'Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.',
        translation: 'English',
        category: 'Mercy'
    },
    {
        reference: 'Al-Anfal 8:2',
        text: 'The believers are only those who, when Allah is mentioned, their hearts become fearful...',
        translation: 'English',
        category: 'Faith'
    },
    {
        reference: 'Al-Imran 3:139',
        text: 'So do not weaken and do not grieve, and you will be superior if you are [true] believers.',
        translation: 'English',
        category: 'Strength'
    },
    {
        reference: 'Ar-Ra\'d 13:28',
        text: 'Unquestionably, by the remembrance of Allah hearts are assured.',
        translation: 'English',
        category: 'Peace'
    },
    {
        reference: 'Al-Baqarah 2:186',
        text: 'And when My servants ask you, [O Muhammad], concerning Me - indeed I am near.',
        translation: 'English',
        category: 'Closeness'
    }
];

const getAyahOfTheDay = () => {
    // Select based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    return INSPIRATIONAL_AYAHS[day % INSPIRATIONAL_AYAHS.length];
};

module.exports = {
    getAyahOfTheDay,
    INSPIRATIONAL_AYAHS
};
