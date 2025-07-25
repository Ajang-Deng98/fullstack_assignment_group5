const redisService = require('../utils/redisService');

describe('Redis Service', () => {
  const testUserId = 'test_user_123';
  const testSong = {
    _id: 'song_123',
    title: 'Test Song',
    artist: 'Test Artist'
  };

  beforeEach(async () => {
    // Clear test data
    await redisService.clearRecentlyPlayed(testUserId);
  });

  afterAll(async () => {
    await redisService.clearRecentlyPlayed(testUserId);
  });

  describe('addToRecentlyPlayed', () => {
    it('should add song to recently played', async () => {
      await redisService.addToRecentlyPlayed(testUserId, testSong);
      
      const recentlyPlayed = await redisService.getRecentlyPlayed(testUserId);
      
      expect(recentlyPlayed).toHaveLength(1);
      expect(recentlyPlayed[0].title).toBe(testSong.title);
      expect(recentlyPlayed[0].artist).toBe(testSong.artist);
    });

    it('should maintain order (most recent first)', async () => {
      const song1 = { ...testSong, _id: 'song1', title: 'Song 1' };
      const song2 = { ...testSong, _id: 'song2', title: 'Song 2' };
      
      await redisService.addToRecentlyPlayed(testUserId, song1);
      await redisService.addToRecentlyPlayed(testUserId, song2);
      
      const recentlyPlayed = await redisService.getRecentlyPlayed(testUserId);
      
      expect(recentlyPlayed[0].title).toBe('Song 2'); // Most recent first
      expect(recentlyPlayed[1].title).toBe('Song 1');
    });

    it('should limit to maximum songs', async () => {
      // Add more than the limit
      for (let i = 0; i < 12; i++) {
        await redisService.addToRecentlyPlayed(testUserId, {
          ...testSong,
          _id: `song_${i}`,
          title: `Song ${i}`
        });
      }
      
      const recentlyPlayed = await redisService.getRecentlyPlayed(testUserId);
      
      expect(recentlyPlayed.length).toBeLessThanOrEqual(10); // Assuming limit is 10
    });
  });

  describe('getRecentlyPlayed', () => {
    it('should return empty array for new user', async () => {
      const recentlyPlayed = await redisService.getRecentlyPlayed('new_user');
      expect(recentlyPlayed).toEqual([]);
    });
  });

  describe('clearRecentlyPlayed', () => {
    it('should clear all recently played songs', async () => {
      await redisService.addToRecentlyPlayed(testUserId, testSong);
      await redisService.clearRecentlyPlayed(testUserId);
      
      const recentlyPlayed = await redisService.getRecentlyPlayed(testUserId);
      expect(recentlyPlayed).toEqual([]);
    });
  });
});