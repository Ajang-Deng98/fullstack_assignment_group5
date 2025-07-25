const { UserModel } = require('../models/User');
const redisService = require('../utils/redisService');

class UserController {
  // Create a new user
  static async createUser(req, res, next) {
    try {
      const user = new UserModel(req.body);
      await user.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  static async getAllUsers(req, res, next) {
    try {
      const users = await UserModel.find()
        .populate('playlists', 'name description')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static async getUserById(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id)
        .populate('playlists');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async updateUser(req, res, next) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async deleteUser(req, res, next) {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Clear user's recently played songs
      await redisService.clearRecentlyPlayed(req.params.id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's recently played songs
  static async getRecentlyPlayed(req, res, next) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      const recentlyPlayed = await redisService.getRecentlyPlayed(userId, limit);

      res.json({
        success: true,
        data: recentlyPlayed
      });
    } catch (error) {
      next(error);
    }
  }

  // Clear user's recently played songs
  static async clearRecentlyPlayed(req, res, next) {
    try {
      const { userId } = req.params;
      
      await redisService.clearRecentlyPlayed(userId);

      res.json({
        success: true,
        message: 'Recently played songs cleared successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;