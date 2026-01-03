const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const lessons = [
    // ============================================================
    // LEVEL 1: FOUNDATIONS (AL-JAZARIYYAH)
    // ============================================================
    {
        id: 'L1-01',
        title: 'Al-Muqaddimah (Introduction)',
        category: 'Foundations',
        level: 'Al-Jazariyyah 1',
        description: 'The Obligation of Tajwid, History, and Virtues.',
        sections: [
            {
                type: 'scholarly_definition',
                title: 'Definition of Tajwid',
                linguistic: 'To improve (At-Tahsin) and to make something better.',
                technical: 'Articulating every letter from its correct articulation point (Makhraj) giving it its rights (Sifat Lazimah) and dues (Sifat Aridah).'
            },
            {
                type: 'evidence',
                title: 'The Evidence',
                arabic: 'وَالأَخْـذُ بِالتَّـجْوِيـدِ حَـتْـمٌ لازِمُ ... مَــنْ لَــمْ يُـجَـوِّدِ الْـقُـرَآنَ آثِــمُ',
                translation: 'And applying Tajweed is an issue of absolute necessity, Whoever does not apply Tajweed to the Quran is a sinner.'
            },
            {
                type: 'highlight',
                title: 'Why is it Fard (Obligatory)?',
                content: 'Scholars agree that reading with Tajwid is Fard Ayn (Individual Obligation) upon every Muslim to the extent that preserves the validity of prayer. Advanced theory is Fard Kifayah.'
            }
        ]
    },
    {
        id: 'L1-02',
        title: 'Makharij: The Throat (Al-Halq)',
        category: 'Foundations',
        level: 'Al-Jazariyyah 1',
        description: 'The 3 distinct parts of the Throat and their letters.',
        sections: [
            {
                type: 'diagram',
                diagramType: 'throat'
            },
            {
                type: 'scholarly_definition',
                title: 'Al-Halq',
                linguistic: 'The throat.',
                technical: 'The empty space between the vocal cords and the root of the tongue.'
            },
            {
                type: 'text',
                title: '1. Aqsal-Halq (Deepest)',
                content: 'The furthest part of the throat from the mouth. It houses the vocal cords.'
            },
            {
                type: 'example',
                title: 'Hamzah & Haa',
                arabic: 'أَءْ   أَهْ',
                transliteration: 'A\' , Ah',
                description: 'Hamzah is sharp. Haa is breathy and deep.'
            },
            {
                type: 'evidence',
                title: 'Jazariyyah Line 10',
                arabic: 'ثُمَّ لأَقْصَى الْحَلْقِ هَمْزٌ هَاءُ ... ثُمَّ لِـوَسْـطِـهِ فَـعَـيْـنٌ حَــاءُ',
                translation: 'Then to the deepest part of the throat is Hamzah and Ha; Then to its middle is Ain and Ha.'
            }
        ]
    },
    {
        id: 'L1-03',
        title: 'Makharij: The Tongue (Al-Lisan)',
        category: 'Foundations',
        level: 'Al-Jazariyyah 1',
        description: 'The diverse sounds of the Tongue: Deep, Middle, Tip.',
        sections: [
            {
                type: 'diagram',
                diagramType: 'tongue'
            },
            {
                type: 'text',
                title: 'The Deep Tongue',
                content: 'Produces Qaf and Kaf. Notice the difference in the diagram (Red vs Dark Red).'
            },
            {
                type: 'evidence',
                title: 'Jazariyyah Line 11',
                arabic: 'أَدْنَــاهُ غَـيْـنٌ خَـاؤُهَـا وَالْـقَـافُ ... أَقْصَى اللِّسَانِ فَوْقُ ثُـمَّ الْكَـافُ',
                translation: '...And the Qaf is from the deepest tongue (above), then the Kaf (below it/closer).'
            },
            {
                type: 'example',
                title: 'Qaf (Heavy)',
                arabic: 'أَقْ',
                transliteration: 'Aq',
                description: 'Hits the soft palate (A-Lahah). Heavy and explosive (Qalqalah).'
            },
            {
                type: 'example',
                title: 'Kaf (Light)',
                arabic: 'أَكْ',
                transliteration: 'Ak',
                description: 'Hits the hard/soft palate junction. Produces Hams (breath) when stopped.'
            }
        ]
    },
    {
        id: 'L1-04',
        title: 'Makharij: The Lips (Shafatain)',
        category: 'Foundations',
        level: 'Al-Jazariyyah 1',
        description: 'The four letters of the lips: Fa, Waw, Ba, Mim.',
        sections: [
            {
                type: 'diagram',
                diagramType: 'lips'
            },
            {
                type: 'evidence',
                title: 'Jazariyyah Line 16',
                arabic: 'وَلِلشَّفَتَيْنِ الْوَاوُ بَـاءٌ مِـيْـمُ ... وَغُنَّةٌ مَخْرَجُهَا الْخَيْشُومُ',
                translation: 'And for the lips are Waw, Ba, and Mim... And the Ghunnah comes from the Nose.'
            },
            {
                type: 'text',
                title: 'Baa vs Mim',
                content: 'Baa (ب) uses the WET part of the lips (inside). Mim (م) uses the DRY part (outside).'
            }
        ]
    },

    // ============================================================
    // LEVEL 2: RULES (AL-JARARIYYAH - SIFAT)
    // ============================================================
    {
        id: 'L2-01',
        title: 'Sifat: Hams vs Jahr',
        category: 'Rules',
        level: 'Al-Jazariyyah 2',
        description: 'The flow of breath (Whisper) vs the trapping of breath (Loudness).',
        sections: [
            {
                type: 'scholarly_definition',
                title: 'Hams (Whisper)',
                linguistic: 'Concealment or faint sound.',
                technical: 'Running of breath when pronouncing the letter due to weakness of reliance on its Makhraj.'
            },
            {
                type: 'list',
                title: 'Letters of Hams',
                content: ['Fahathahu Shakhsun Sakat (فحثه شخص سكت)', 'Fa, Ha, Tha, Ha, Shin, Kha, Sad, Sin, Kaf, Ta']
            },
            {
                type: 'example',
                title: 'Hams in Kaf',
                arabic: 'أَكْ',
                transliteration: 'Ak(h)',
                description: 'You must hear the release of air.'
            }
        ]
    },
    {
        id: 'L2-02',
        title: 'Sifat: Isti\'la vs Istifal',
        category: 'Rules',
        level: 'Al-Jazariyyah 2',
        description: 'The root cause of Tafkhim (Heaviness).',
        sections: [
            {
                type: 'scholarly_definition',
                title: 'Isti\'la (Elevation)',
                linguistic: 'Rising or Elevation.',
                technical: 'The elevation of the back of the tongue to the soft palate, causing the sound to be trapped and echo.'
            },
            {
                type: 'evidence',
                title: 'Jazariyyah Line 23',
                arabic: 'وَسَبْعُ عُلْوٍ خُصَّ ضَغْطٍ قِظْ حَصَرْ ...',
                translation: 'And seven are elevated (Musta\'liya), restricted to: Kh, S, D, Gh, T, Q, Z.'
            }
        ]
    },
    {
        id: 'L2-03',
        title: 'Rules of Raa (Ahkam Ar-Ra)',
        category: 'Rules',
        level: 'Al-Jazariyyah 2',
        description: 'Detailed analysis of Raa states.',
        sections: [
            {
                type: 'text',
                title: 'The General Rule',
                content: 'Raa mirrors the vowel. Fatha/Dhamma = Heavy. Kasra = Light.'
            },
            {
                type: 'highlight',
                title: 'The Exception (Misr & Qitr)',
                content: 'In words like "Misr" (Egypt) and "Qitr" (Copper) where Raa has Sukoon and is preceded by a Heavy Letter... Scholars differ. Ibn Jazari allows both, but prefers Heavy for Misr and Light for Qitr.'
            },
            {
                type: 'example',
                title: 'Misr',
                arabic: 'مِصْرَ',
                transliteration: 'Misr',
                description: 'Can be heavy or light (Heavy preferred).'
            }
        ]
    },

    // ============================================================
    // LEVEL 3: ADVANCED
    // ============================================================
    {
        id: 'L3-01',
        title: 'Madd Lazim (Compulsory Prolongation)',
        category: 'Advanced',
        level: 'Al-Jazariyyah 3',
        description: 'The longest Madd in the Quran (6 Counts).',
        sections: [
            {
                type: 'evidence',
                title: 'Jazariyyah Definition',
                arabic: 'وَلاَزِمٌ إِنْ جَاءَ بَعْدَ حَرْفِ مَدْ ... سَاكِنُ حَالَيْنِ وَبِالطُّولِ يُمَدْ',
                translation: 'And it is Lazim if after the Madd letter comes a Sukoon that is permanent (in stopping and continuing)... and it is prolonged with Length (6 counts).'
            },
            {
                type: 'example',
                title: 'Kalimi Muthaqqal',
                arabic: 'الْحَاقَّةُ',
                transliteration: 'Al-Haaa-qqah',
                description: 'Heavy because of the Shaddah.'
            }
        ]
    }
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
