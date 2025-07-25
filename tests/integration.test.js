const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { UserModel } = require('../models/User');
const { SongModel } = require('../models/Song');
const { PlaylistModel } = require('../models/Playlist');

describe('Integration Tests', () => {
  let authToken;
  let userId;
  let songId;
  let playlistId;

  beforeAll(async () => {
    // Clean database
    await UserModel.deleteMany({});
    await SongModel.deleteMany({});
    await PlaylistModel.deleteMany({});

    // Register user
    const userData = {
      username: 'integrationuser',
      email: 'integration@example.com',
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

  describe('Complete Workflow', () => {
    it('should create song, playlist, and add song to playlist', async () => {
      // 1. Create a song
      const songData = {
        title: 'Integration Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        genre: 'Rock'
      };

      const songResponse = await request(app)
        .post('/api/songs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(songData)
        .expect(201);

      expect(songResponse.body.success).toBe(true);
      songId = songResponse.body.data._id;

      // 2. Create a playlist
      const playlistData = {
        name: 'Integration Test Playlist',
        description: 'Test playlist for integration',
        userId: userId,
        isPublic: true
      };

      const playlistResponse = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistData)
        .expect(201);

      expect(playlistResponse.body.success).toBe(true);
      playlistId = playlistResponse.body.data._id;

      // 3. Add song to playlist
      const addSongResponse = await request(app)
        .post(`/api/playlists/${playlistId}/songs/${songId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(addSongResponse.body.success).toBe(true);

      // 4. Verify playlist contains song
      const getPlaylistResponse = await request(app)
        .get(`/api/playlists/${playlistId}`)
        .expect(200);

      expect(getPlaylistResponse.body.data.songs).toContain(songId);
    });

    it('should play song and add to recently played', async () => {
      // Play the song
      const playResponse = await request(app)
        .post(`/api/songs/${songId}/play`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId })
        .expect(200);

      expect(playResponse.body.success).toBe(true);

      // Check recently played
      const recentResponse = await request(app)
        .get(`/api/users/${userId}/recently-played`)
        .expect(200);

      expect(recentResponse.body.success).toBe(true);
      expect(recentResponse.body.data.length).toBeGreaterThan(0);
      expect(recentResponse.body.data[0].title).toBe('Integration Test Song');
    });

    it('should search for songs', async () => {
      const searchResponse = await request(app)
        .get('/api/songs/search?query=Integration')
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.length).toBeGreaterThan(0);
      expect(searchResponse.body.data[0].title).toContain('Integration');
    });

    it('should get public playlists', async () => {
      const publicResponse = await request(app)
        .get('/api/playlists/public')
        .expect(200);

      expect(publicResponse.body.success).toBe(true);
      expect(publicResponse.body.data.length).toBeGreaterThan(0);
    });

    it('should remove song from playlist', async () => {
      const removeResponse = await request(app)
        .delete(`/api/playlists/${playlistId}/songs/${songId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(removeResponse.body.success).toBe(true);

      // Verify song removed
      const getPlaylistResponse = await request(app)
        .get(`/api/playlists/${playlistId}`)
        .expect(200);

      expect(getPlaylistResponse.body.data.songs).not.toContain(songId);
    });
  });
});