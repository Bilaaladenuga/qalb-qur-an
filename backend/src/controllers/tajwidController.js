const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const lessons = [
    {
        id: 'intro-1',
        title: 'Definition & Importance',
        category: 'Introduction',
        description: 'What is Tajwid and why is it important?',
        content: '# Introduction to Tajwid\n\n**Definition:** The word "Tajwid" literally means "proficiency" or "doing something well". In the context of the Quran, it refers to the set of rules for the correct pronunciation of the letters with all their qualities and attributes.\n\n**Importance:**\n1. Preserving the Quran from errors during recitation.\n2. Fulfilling the religious obligation of reciting the Quran as it was revealed.\n3. Understanding the meaning correctly, as wrong pronunciation can change meanings.\n4. Experiencing the spiritual beauty of Quranic recitation.',
    },
    {
        id: 'foundations-1',
        title: 'Alphabet & Makharij',
        category: 'Foundations',
        description: 'Points of articulation for Arabic letters.',
        content: '# Makharij al-Huroof\n\nThere are 17 main articulation points (Makharij) in the human speech system used for the 28 Arabic letters.\n\n### Main Areas:\n1. **The Throat (Al-Halq):** Letters like Hamza, Haa, Kha.\n2. **The Tongue (Al-Lisan):** Majority of letters (Qaaf, Kaaf, Jeem, etc.).\n3. **The Lips (Ash-Shafatain):** Baa, Meem, Waw, Faa.\n4. **The Oral Cavity (Al-Jawf):** For long vowels.\n5. **The Nasal Cavity (Al-Khayshum):** For Ghunnah (nasal sound).',
    },
    {
        id: 'vowels-1',
        title: 'Harakat & Madd',
        category: 'Foundations',
        description: 'Short and long vowels in Arabic.',
        content: '# Harakat and Madd\n\n### Short Vowels (Harakat):\n- **Fathah (a):** A slanted line above the letter.\n- **Kasrah (i):** A slanted line below the letter.\n- **Dhammah (u):** A small "waw" above the letter.\n\n### Long Vowels (Madd letters):\nThese letters prolong the vowel sound for 2 counts:\n1. **Alif (ا):** Follows a Fathah.\n2. **Ya (ي):** Follows a Kasrah.\n3. **Waw (و):** Follows a Dhammah.',
    },
    {
        id: 'noon-1',
        title: 'Noon Sakinah Rules',
        category: 'Rules',
        description: 'Izhar, Idgham, Iqlab, and Ikhfa.',
        content: '# Rules of Noon Sakinah and Tanween\n\nWhen a Noon Sakinah (silent Noon) or Tanween (double vowel) is followed by certain letters, four rules apply:\n\n1. **Izhar (Clarity):** Pronounce clearly if followed by throat letters (ء, ه, ع, ح, غ, خ).\n2. **Idgham (Merging):** Merge into the following letter (ي, ر, م, ل, و, ن).\n3. **Iqlab (Conversion):** Change to a Meem sound if followed by Baa (ب).\n4. **Ikhfa (Hiding):** Light nasal sound for the remaining 15 letters.',
    },
    {
        id: 'meem-1',
        title: 'Meem Sakinah Rules',
        category: 'Rules',
        description: 'Ikhfa Shafawi, Idgham Shafawi, and Izhar Shafawi.',
        content: '# Rules of Meem Sakinah\n\nWhen a silent Meem is followed by:\n1. **Meem (م):** Idgham (Merging).\n2. **Baa (ب):** Ikhfa Shafawi (Hiding).\n3. **Other letters:** Izhar Shafawi (Clarity).',
    },
    {
        id: 'chars-1',
        title: 'Ghunnah & Qalqalah',
        category: 'Characteristics',
        description: 'Nasal sounds and echoing sounds.',
        content: '# Ghunnah and Qalqalah\n\n### Ghunnah:\nA nasal sound emitted from the nose for 2 counts when Noon or Meem have a Shaddah (ّ).\n\n### Qalqalah (Echoing):\nWhen specific letters (ق, ط, ب, ج, د) have a Sukoon, they are pronounced with a slight "echo" or bounce.',
    },
    {
        id: 'special-1',
        title: 'Rules of Raa & Laam',
        category: 'Advanced',
        description: 'Heavy and light pronunciations.',
        content: '# Rules of Raa and Laam\n\n### The Letter Raa:\nCan be heavy (Tafkheem) or light (Tarqeeq) depending on the Harakat associated with it.\n\n### The Letter Laam:\nGenerally light, but heavy in the name "Allah" if preceded by a Fathah or Dhammah.',
    },
    {
        id: 'waqf-1',
        title: 'Rules of Waqf',
        category: 'Advanced',
        description: 'How and where to stop during recitation.',
        content: '# Rules of Waqf (Stopping)\n\nLearning when to stop and how to handle the ending of words is crucial for correct meaning and breath control.\n\n- Change the last vowel to a Sukoon when stopping.\n- Observe the small signs above the words (ج, م, لا, etc.) for guidance on stopping or continuing.',
    },
];

exports.getLessons = async (req, res) => {
    try {
        const userId = req.user.id;
        const userProgress = await prisma.tajwidProgress.findMany({
            where: { userId },
        });

        const lessonsWithStatus = lessons.map((lesson) => {
            const progress = userProgress.find((p) => p.lessonId === lesson.id);
            return {
                ...lesson,
                completed: progress ? progress.completed : false,
            };
        });

        res.json(lessonsWithStatus);
    } catch (error) {
        console.error('Error fetching Tajwid lessons:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { lessonId, completed } = req.body;

        if (!lessonId) {
            return res.status(400).json({ error: 'Lesson ID is required' });
        }

        const progress = await prisma.tajwidProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
            update: {
                completed,
                completedAt: completed ? new Date() : null,
            },
            create: {
                userId,
                lessonId,
                completed,
                completedAt: completed ? new Date() : null,
            },
        });

        res.json(progress);
    } catch (error) {
        console.error('Error updating Tajwid progress:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
};
