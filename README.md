# Qalb & Quran 🌙

A beautiful mobile app for Muslim women to support Quran memorization, personal spiritual growth, and community connection.

## Features

- 📖 **Hifz Tracker** - Track your Quran memorization progress
- 🎯 **Goal Setting** - Set daily, weekly, and monthly memorization goals
- 📝 **Reflection Journal** - Write spiritual reflections with prompts
- 🎤 **Audio Recording** - Record and review your recitations
- 🌟 **Beautiful UI** - Premium Islamic-inspired dark theme

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- Expo Go app (for mobile testing)

### Backend Setup
```bash
cd backend
npm install
# Update .env with your database credentials
npx prisma migrate dev
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
npm start
```

## Project Structure

```
├── backend/          # Node.js API server
│   ├── prisma/       # Database schema
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   └── package.json
│
└── mobile/           # React Native app
    ├── src/
    │   ├── components/
    │   ├── navigation/
    │   ├── screens/
    │   ├── services/
    │   ├── store/
    │   └── theme/
    └── package.json
```

## License

MIT

---

*May this app be a source of barakah for all who use it* 🤲
