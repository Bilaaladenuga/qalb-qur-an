require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const hifzRoutes = require('./routes/hifz');
const journalRoutes = require('./routes/journal');
const recordingRoutes = require('./routes/recordings');
const circleRoutes = require('./routes/circles');
const notificationRoutes = require('./routes/notifications');
const badgeRoutes = require('./routes/badges');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🌙 Welcome to Qalb & Quran API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      hifz: '/api/hifz',
      journal: '/api/journal',
      recordings: '/api/recordings',
      circles: '/api/circles',
      notifications: '/api/notifications',
      badges: '/api/badges'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hifz', hifzRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/badges', badgeRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🌙 Qalb & Quran API is running on port ${PORT}`);
  console.log(`📖 Visit http://localhost:${PORT} to get started\n`);
});

module.exports = app;
