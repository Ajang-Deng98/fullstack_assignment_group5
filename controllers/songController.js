const { SongModel } = require('../models/Song');
const redisService = require('../utils/redisService');

class SongController {
  // Create a new song
  static async createSong(req, res, next) {
    try {
      const songData = {
        ...req.body,
        filePath: req.file ? `/uploads/${req.file.filename}` : null
      };
      
      const song = new SongModel(songData);
      await song.save();
      
      res.status(201).json({
        success: true,
        message: 'Song created successfully',
        data: song
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all songs with pagination
  static async getAllSongs(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const songs = await SongModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await SongModel.countDocuments();

      res.json({
        success: true,
        data: songs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get song by ID
  static async getSongById(req, res, next) {
    try {
      const song = await SongModel.findById(req.params.id);
      
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      res.json({
        success: true,
        data: song
      });
    } catch (error) {
      next(error);
    }
  }

  // Update song
  static async updateSong(req, res, next) {
    try {
      const song = await SongModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      res.json({
        success: true,
        message: 'Song updated successfully',
        data: song
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete song
  static async deleteSong(req, res, next) {
    try {
      const song = await SongModel.findByIdAndDelete(req.params.id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      res.json({
        success: true,
        message: 'Song deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Search songs
  static async searchSongs(req, res, next) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const songs = await SongModel.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { artist: { $regex: query, $options: 'i' } },
          { album: { $regex: query, $options: 'i' } },
          { genre: { $regex: query, $options: 'i' } }
        ]
      }).limit(20);

      res.json({
        success: true,
        data: songs
      });
    } catch (error) {
      next(error);
    }
  }

  // Play song (add to recently played)
  static async playSong(req, res, next) {
    try {
      const { userId } = req.body;
      const song = await SongModel.findById(req.params.id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      console.log('Adding song to recently played:', { userId, songId: song._id, title: song.title });
      
      // Add to recently played in Redis
      const added = await redisService.addRecentlyPlayed(userId, {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        filePath: song.filePath
      });
      
      console.log('Recently played added:', added);

      res.json({
        success: true,
        message: 'Song played successfully',
        data: song
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SongController;