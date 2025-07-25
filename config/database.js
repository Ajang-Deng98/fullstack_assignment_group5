const mongoose = require('mongoose');
const redis = require('redis');

class DatabaseConnection {
  constructor() {
    this.mongoConnection = null;
    this.redisClient = null;
  }

  async connectMongoDB() {
    try {
      this.mongoConnection = await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async connectRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });
      
      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.redisClient.connect();
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Redis connection error:', error);
    }
  }

  getRedisClient() {
    return this.redisClient;
  }

  async disconnect() {
    if (this.mongoConnection) {
      await mongoose.disconnect();
    }
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

module.exports = new DatabaseConnection();