require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnection = require('./config/database');
const redisService = require('./utils/redisService');
const ErrorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve auth page separately
app.get('/auth', (req, res) => {
  res.sendFile(__dirname + '/public/auth.html');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Music Playlist Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for recently played
app.get('/api/debug/recently-played/:userId', async (req, res) => {
  try {
    const recentlyPlayed = await redisService.getRecentlyPlayed(req.params.userId);
    res.json({
      success: true,
      data: recentlyPlayed,
      count: recentlyPlayed.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Music Playlist Manager API Documentation',
    endpoints: {
      songs: {
        'POST /api/songs': 'Create a new song',
        'GET /api/songs': 'Get all songs with pagination',
        'GET /api/songs/search?query=': 'Search songs',
        'GET /api/songs/:id': 'Get song by ID',
        'PUT /api/songs/:id': 'Update song',
        'DELETE /api/songs/:id': 'Delete song',
        'POST /api/songs/:id/play': 'Play song (add to recently played)'
      },
      playlists: {
        'POST /api/playlists': 'Create a new playlist',
        'GET /api/playlists/public': 'Get public playlists',
        'GET /api/playlists/user/:userId': 'Get user playlists',
        'GET /api/playlists/:id': 'Get playlist by ID',
        'PUT /api/playlists/:id': 'Update playlist',
        'DELETE /api/playlists/:id': 'Delete playlist',
        'POST /api/playlists/:playlistId/songs/:songId': 'Add song to playlist',
        'DELETE /api/playlists/:playlistId/songs/:songId': 'Remove song from playlist'
      },
      users: {
        'POST /api/users': 'Create a new user',
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user',
        'GET /api/users/:userId/recently-played': 'Get recently played songs',
        'DELETE /api/users/:userId/recently-played': 'Clear recently played songs'
      }
    }
  });
});

// 404 handler
app.use(ErrorHandler.notFound);

// Error handling middleware
app.use(ErrorHandler.handle);

// Start server
async function startServer() {
  try {
    // Connect to databases
    await dbConnection.connectMongoDB();
    await dbConnection.connectRedis();
    
    // Initialize Redis service after connection
    redisService.initialize();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await dbConnection.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await dbConnection.disconnect();
  process.exit(0);
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;