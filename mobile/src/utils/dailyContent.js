export const DAILY_AYAHS = [
    { text: "Indeed, with hardship comes ease.", reference: "Quran 94:6" },
    { text: "So remember Me; I will remember you.", reference: "Quran 2:152" },
    { text: "And He found you lost and guided you.", reference: "Quran 93:7" },
    { text: "My mercy encompasses all things.", reference: "Quran 7:156" },
    { text: "Indeed, Allah is with the patient.", reference: "Quran 2:153" },
    { text: "Allah does not burden a soul beyond that it can bear.", reference: "Quran 2:286" },
    { text: "And your Lord is the Forgiving, Full of Mercy.", reference: "Quran 18:58" },
    { text: "Call upon Me; I will respond to you.", reference: "Quran 40:60" },
    { text: "And He is with you wherever you are.", reference: "Quran 57:4" },
    { text: "Indeed, my Lord is near and responsive.", reference: "Quran 11:61" },
    { text: "Unquestionably, by the remembrance of Allah hearts are assured.", reference: "Quran 13:28" },
    { text: "And put your trust in Allah, and sufficient is Allah as a Disposer of affairs.", reference: "Quran 33:3" },
    { text: "If you are grateful, I will surely increase you [in favor].", reference: "Quran 14:7" },
    { text: "And seek help through patience and prayer.", reference: "Quran 2:45" },
    { text: "Indeed, what is to come will be better for you than what has gone by.", reference: "Quran 93:4" },
    { text: "Our Lord, pour upon us patience and let us die as Muslims.", reference: "Quran 7:126" },
    { text: "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?", reference: "Quran 54:17" },
    { text: "He is the First and the Last, the Ascendant and the Intimate, and He is, of all things, Knowing.", reference: "Quran 57:3" },
    { text: "Do not despair of the mercy of Allah.", reference: "Quran 39:53" },
    { text: "And Allah is the best of providers.", reference: "Quran 62:11" },
    { text: "So be patient. Indeed, the promise of Allah is truth.", reference: "Quran 30:60" },
    { text: "And He gives you of all that you ask for.", reference: "Quran 14:34" },
    { text: "Is not Allah sufficient for His servant?", reference: "Quran 39:36" },
    { text: "And whoever fears Allah - He will make for him a way out.", reference: "Quran 65:2" },
    { text: "And provide for him from where he does not expect.", reference: "Quran 65:3" },
    { text: "Say, 'It is Allah who saves you from it and from every distress.'", reference: "Quran 6:64" },
    { text: "Our Lord, forgive us our sins and the excess in our affairs.", reference: "Quran 3:147" },
    { text: "Indeed, the patient will be given their reward without account.", reference: "Quran 39:10" },
    { text: "And speak to people good [words].", reference: "Quran 2:83" },
    { text: "Show forgiveness, enjoin what is good, and turn away from the ignorant.", reference: "Quran 7:199" },
    { text: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.", reference: "Quran 21:107" }
];

export const DAILY_PROMPTS = [
    { category: "Gratitude", prompt: "What is one small blessing you noticed today that you usually take for granted?" },
    { category: "Reflection", prompt: "How have you felt Allah's presence in your life recently?" },
    { category: "Growth", prompt: "What is a habit you are trying to improve for the sake of Allah?" },
    { category: "Quran", prompt: "Which verse of the Quran resonated with you the most this week and why?" },
    { category: "Patience", prompt: "Describe a situation where you had to be patient. How did you handle it?" },
    { category: "Dua", prompt: "What is a dua you find yourself repeating often these days?" },
    { category: "Kindness", prompt: "How were you able to show kindness to someone today?" },
    { category: "Self-Care", prompt: "How are you taking care of the body and soul Allah entrusted to you?" },
    { category: "Forgiveness", prompt: "Is there anyone you need to forgive to find peace in your heart?" },
    { category: "Goals", prompt: "What is one spiritual goal you want to achieve by next month?" },
    { category: "Nature", prompt: "Reflect on a sign of Allah you saw in nature today." },
    { category: "Family", prompt: "How can you strengthen your ties of kinship this week?" },
    { category: "Knowledge", prompt: "What is something new you learned about Islam recently?" },
    { category: "Charity", prompt: "What is a non-monetary act of charity (Sadaqah) you can do tomorrow?" },
    { category: "Salah", prompt: "How can you improve your focus (Khushoo) in your next prayer?" },
    { category: "Reflection", prompt: "If you could give your younger self one piece of Islamic advice, what would it be?" },
    { category: "Hope", prompt: "What brings you hope when you feel down?" },
    { category: "Community", prompt: "How can you contribute positively to your community?" },
    { category: "Trust", prompt: "Reflect on a time when Allah's plan was better than your own." },
    { category: "Character", prompt: "Which attribute of the Prophet (SAW) do you wish to embody more?" },
    { category: "Time", prompt: "How match of your free time are you dedicating to your Deen?" },
    { category: "Akhirah", prompt: "What is one deed you hope to take with you to the Hereafter?" },
    { category: "Friendship", prompt: "Who is a friend that brings you closer to Allah? Make a dua for them." },
    { category: "Health", prompt: "Reflect on the blessing of health. How can you use it to please Allah?" },
    { category: "Challenges", prompt: "What is a challenge you are facing, and what does the Quran say about it?" },
    { category: "Balance", prompt: "Are you balancing your Dunya and Akhirah effectively? How?" },
    { category: "Silence", prompt: "Spend 5 minutes in silence reflecting on Allah. What came to your mind?" },
    { category: "Generosity", prompt: "What can you give away (possessions, time, advice) to help others?" },
    { category: "Intentions", prompt: "Check your intentions for your daily tasks. Are they for Allah?" },
    { category: "Guidance", prompt: "Reflect on how Allah guided you to where you are today." },
    { category: "Love", prompt: "What does loving Allah mean to you in a practical sense?" }
];

/**
 * Deterministically selects an item from an array based on the current date based on local time.
 * @param {Array} items - The array of items to choose from.
 * @returns {Object} - The selected item for today.
 */
export const getDailyContent = (items) => {
    if (!items || items.length === 0) return null;

    // Create a date object for "today"
    const today = new Date();

    // Use the day of the month (1-31) as the primary index
    // We add the month index to ensure it rotates differently each month if needed,
    // but simply using the date is good for a direct "Day 1 -> Item 1" mapping
    // or modulo for shorter lists.
    const day = today.getDate(); // 1-31 which changes daily
    const month = today.getMonth(); // 0-11
    const year = today.getFullYear();

    // Simple deterministic index: (Day of Year) % length
    // Calculate day of year approx
    const start = new Date(year, 0, 0);
    const diff = today - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const index = dayOfYear % items.length;

    return items[index];
};

export const getDailyAyah = () => getDailyContent(DAILY_AYAHS);
export const getDailyPrompt = () => getDailyContent(DAILY_PROMPTS);
