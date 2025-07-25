const dbConnection = require('../config/database');

class RedisService {
  constructor() {
    this.client = null;
    this.fallbackStorage = new Map(); // In-memory fallback
  }

  initialize() {
    this.client = dbConnection.getRedisClient();
  }

  getClient() {
    if (!this.client) {
      this.client = dbConnection.getRedisClient();
    }
    return this.client;
  }

  // Add song to recently played list
  async addRecentlyPlayed(userId, songData) {
    try {
      const client = this.getClient();
      if (!client) {
        // Fallback to in-memory storage
        console.log('Redis not available, using fallback storage');
        const key = `recently_played:${userId}`;
        let userSongs = this.fallbackStorage.get(key) || [];
        
        userSongs.unshift({
          ...songData,
          playedAt: new Date().toISOString()
        });
        
        // Keep only last 20 songs in fallback
        if (userSongs.length > 20) {
          userSongs = userSongs.slice(0, 20);
        }
        
        this.fallbackStorage.set(key, userSongs);
        return true;
      }
      
      const key = `recently_played:${userId}`;
      const songJson = JSON.stringify({
        ...songData,
        playedAt: new Date().toISOString()
      });
      
      // Add to the beginning of the list
      await client.lPush(key, songJson);
      
      // Keep only the last 50 recently played songs
      await client.lTrim(key, 0, 49);
      
      // Set expiration to 30 days
      await client.expire(key, 30 * 24 * 60 * 60);
      
      return true;
    } catch (error) {
      console.error('Error adding to recently played:', error);
      return false;
    }
  }

  // Get recently played songs
  async getRecentlyPlayed(userId, limit = 20) {
    try {
      const client = this.getClient();
      if (!client) {
        // Fallback to in-memory storage
        const key = `recently_played:${userId}`;
        const userSongs = this.fallbackStorage.get(key) || [];
        return userSongs.slice(0, limit);
      }
      
      const key = `recently_played:${userId}`;
      const songs = await client.lRange(key, 0, limit - 1);
      
      return songs.map(song => JSON.parse(song));
    } catch (error) {
      console.error('Error getting recently played:', error);
      return [];
    }
  }

  // Clear recently played for a user
  async clearRecentlyPlayed(userId) {
    try {
      const client = this.getClient();
      if (!client) {
        // Fallback to in-memory storage
        const key = `recently_played:${userId}`;
        this.fallbackStorage.delete(key);
        return true;
      }
      
      const key = `recently_played:${userId}`;
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Error clearing recently played:', error);
      return false;
    }
  }

  // Cache playlist data
  async cachePlaylist(playlistId, playlistData) {
    try {
      const key = `playlist:${playlistId}`;
      await this.client.setEx(key, 3600, JSON.stringify(playlistData)); // Cache for 1 hour
      return true;
    } catch (error) {
      console.error('Error caching playlist:', error);
      return false;
    }
  }

  // Get cached playlist
  async getCachedPlaylist(playlistId) {
    try {
      const key = `playlist:${playlistId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached playlist:', error);
      return null;
    }
  }

  // Remove playlist from cache
  async removeCachedPlaylist(playlistId) {
    try {
      const key = `playlist:${playlistId}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Error removing cached playlist:', error);
      return false;
    }
  }
}

module.exports = new RedisService();