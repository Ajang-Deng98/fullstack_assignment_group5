require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const dbConnection = require('./config/database');
const redisService = require('./utils/redisService');
const ErrorHandler = require('./middleware/errorHandler');

// Load Swagger document
const swaggerDocument = YAML.load('./swagger.yaml');

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

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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