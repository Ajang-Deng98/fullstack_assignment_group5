const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../server');
const { UserModel } = require('../models/User');
const { PlaylistModel } = require('../models/Playlist');

describe('Playlist API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await PlaylistModel.deleteMany({});

    // Create and login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      const playlistData = {
        name: 'My Test Playlist',
        description: 'Test description',
        userId: userId,
        isPublic: true
      };

      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(playlistData.name);
      expect(response.body.data.isPublic).toBe(true);
    });

    it('should not create playlist without auth', async () => {
      const playlistData = {
        name: 'My Test Playlist',
        userId: userId
      };

      const response = await request(app)
        .post('/api/playlists')
        .send(playlistData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/playlists/public', () => {
    it('should get public playlists', async () => {
      await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Public Playlist',
          userId: userId,
          isPublic: true
        });

      const response = await request(app)
        .get('/api/playlists/public')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});