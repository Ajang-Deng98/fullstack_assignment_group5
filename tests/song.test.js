const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Song API', () => {
  let songId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music_playlist_test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/songs', () => {
    it('should create a new song', async () => {
      const songData = {
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        genre: 'Rock'
      };

      const response = await request(app)
        .post('/api/songs')
        .send(songData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(songData.title);
      songId = response.body.data._id;
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        title: '',
        artist: 'Test Artist'
        // Missing required duration
      };

      const response = await request(app)
        .post('/api/songs')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/songs', () => {
    it('should get all songs', async () => {
      const response = await request(app)
        .get('/api/songs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/songs/:id', () => {
    it('should get song by ID', async () => {
      const response = await request(app)
        .get(`/api/songs/${songId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(songId);
    });
  });
});