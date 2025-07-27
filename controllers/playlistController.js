const { PlaylistModel } = require('../models/Playlist');
const { SongModel } = require('../models/Song');
const { UserModel } = require('../models/User');
const redisService = require('../utils/redisService');

class PlaylistController {
  // Create a new playlist
  static async createPlaylist(req, res, next) {
    try {
      const playlist = new PlaylistModel(req.body);
      await playlist.save();

      // Add playlist to user's playlists
      await UserModel.findByIdAndUpdate(
        req.body.userId,
        { $push: { playlists: playlist._id } }
      );

      res.status(201).json({
        success: true,
        message: 'Playlist created successfully',
        data: playlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all playlists for a user
  static async getUserPlaylists(req, res, next) {
    try {
      const { userId } = req.params;
      const playlists = await PlaylistModel.find({ userId })
        .populate('songs', 'title artist duration')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: playlists
      });
    } catch (error) {
      next(error);
    }
  }

  // Get playlist by ID
  static async getPlaylistById(req, res, next) {
    try {
      // Check cache first
      const cachedPlaylist = await redisService.getCachedPlaylist(req.params.id);
      if (cachedPlaylist) {
        return res.json({
          success: true,
          data: cachedPlaylist,
          cached: true
        });
      }

      const playlist = await PlaylistModel.findById(req.params.id)
        .populate('songs')
        .populate('userId', 'username');

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      // Cache the playlist
      await redisService.cachePlaylist(req.params.id, playlist);

      res.json({
        success: true,
        data: playlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Update playlist
  static async updatePlaylist(req, res, next) {
    try {
      const playlist = await PlaylistModel.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      // Remove from cache
      await redisService.removeCachedPlaylist(req.params.id);

      res.json({
        success: true,
        message: 'Playlist updated successfully',
        data: playlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete playlist
  static async deletePlaylist(req, res, next) {
    try {
      const playlist = await PlaylistModel.findByIdAndDelete(req.params.id);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      // Remove from user's playlists
      await UserModel.findByIdAndUpdate(
        playlist.userId,
        { $pull: { playlists: playlist._id } }
      );

      // Remove from cache
      await redisService.removeCachedPlaylist(req.params.id);

      res.json({
        success: true,
        message: 'Playlist deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Add song to playlist
  static async addSongToPlaylist(req, res, next) {
    try {
      const { playlistId, songId } = req.params;

      const [playlist, song] = await Promise.all([
        PlaylistModel.findById(playlistId),
        SongModel.findById(songId)
      ]);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      if (playlist.songs.includes(songId)) {
        return res.status(400).json({
          success: false,
          message: 'Song already in playlist'
        });
      }

      playlist.addSong(songId);
      await playlist.save();

      // Remove from cache
      await redisService.removeCachedPlaylist(playlistId);

      res.json({
        success: true,
        message: 'Song added to playlist successfully',
        data: playlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove song from playlist
  static async removeSongFromPlaylist(req, res, next) {
    try {
      const { playlistId, songId } = req.params;

      const playlist = await PlaylistModel.findById(playlistId);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      if (!playlist.songs.includes(songId)) {
        return res.status(400).json({
          success: false,
          message: 'Song not in playlist'
        });
      }

      playlist.removeSong(songId);
      await playlist.save();

      // Remove from cache
      await redisService.removeCachedPlaylist(playlistId);

      res.json({
        success: true,
        message: 'Song removed from playlist successfully',
        data: playlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all playlists
  static async getAllPlaylists(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const playlists = await PlaylistModel.find({})
        .populate('userId', 'username')
        .populate('songs', 'title artist')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await PlaylistModel.countDocuments({});

      res.json({
        success: true,
        data: playlists,
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

  // Get public playlists
  static async getPublicPlaylists(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const playlists = await PlaylistModel.find({ isPublic: true })
        .populate('userId', 'username')
        .populate('songs', 'title artist')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await PlaylistModel.countDocuments({ isPublic: true });

      res.json({
        success: true,
        data: playlists,
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
}

module.exports = PlaylistController;