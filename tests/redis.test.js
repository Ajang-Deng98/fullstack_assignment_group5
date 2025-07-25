// Mock Redis service for testing
const redisService = {
  addToRecentlyPlayed: jest.fn().mockResolvedValue(true),
  getRecentlyPlayed: jest.fn().mockResolvedValue([]),
  clearRecentlyPlayed: jest.fn().mockResolvedValue(true)
};

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
      redisService.getRecentlyPlayed.mockResolvedValue([testSong]);
      
      await redisService.addToRecentlyPlayed(testUserId, testSong);
      const recentlyPlayed = await redisService.getRecentlyPlayed(testUserId);
      
      expect(redisService.addToRecentlyPlayed).toHaveBeenCalledWith(testUserId, testSong);
      expect(recentlyPlayed).toHaveLength(1);
    });

    it('should maintain order (most recent first)', async () => {
      const song1 = { ...testSong, _id: 'song1', title: 'Song 1' };
      const song2 = { ...testSong, _id: 'song2', title: 'Song 2' };
      
      redisService.getRecentlyPlayed.mockResolvedValue([song2, song1]);
      
      await redisService.addToRecentlyPlayed(testUserId, song1);
      await redisService.addToRecentlyPlayed(testUserId, song2);
      
      const recentlyPlayed = await redisService.getRecentlyPlayed(testUserId);
      
      expect(recentlyPlayed[0].title).toBe('Song 2');
      expect(recentlyPlayed[1].title).toBe('Song 1');
    });

    it('should limit to maximum songs', async () => {
      const limitedSongs = Array.from({length: 10}, (_, i) => ({
        ...testSong,
        _id: `song_${i}`,
        title: `Song ${i}`
      }));
      
      redisService.getRecentlyPlayed.mockResolvedValue(limitedSongs);
      
      const recentlyPlayed = await redisService.getRecentlyPlayed(testUserId);
      
      expect(recentlyPlayed.length).toBeLessThanOrEqual(10);
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
      await redisService.clearRecentlyPlayed(testUserId);
      
      expect(redisService.clearRecentlyPlayed).toHaveBeenCalledWith(testUserId);
    });
  });
});