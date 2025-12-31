const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const badges = [
        {
            name: 'First Step',
            description: 'Wrote your first journal entry! 📝',
            icon: 'journal-outline',
            type: 'journal_count',
            requirement: 1
        },
        {
            name: 'Reflective Soul',
            description: 'Completed 10 journal entries. 💭',
            icon: 'book-outline',
            type: 'journal_count',
            requirement: 10
        },
        {
            name: 'Early Bird',
            description: 'Maintained a 7-day streak! 🌅',
            icon: 'sunny-outline',
            type: 'streak',
            requirement: 7
        },
        {
            name: 'Streak Master',
            description: 'Maintained a 30-day streak! 🔥',
            icon: 'flame-outline',
            type: 'streak',
            requirement: 30
        },
        {
            name: 'Community Sister',
            description: 'Shared your first reflection in a Sister Circle. 🌸',
            icon: 'heart-outline',
            type: 'circle_post',
            requirement: 1
        },
        {
            name: 'Pillar of Light',
            description: 'Shared 10 reflections in Sister Circles. ✨',
            icon: 'sparkles-outline',
            type: 'circle_post',
            requirement: 10
        }
    ];

    console.log('Seeding badges...');

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: badge,
            create: badge,
        });
    }

    console.log('Badges seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
