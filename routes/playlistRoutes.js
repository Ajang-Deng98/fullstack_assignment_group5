const express = require('express');
const PlaylistController = require('../controllers/playlistController');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Create a new playlist
router.post('/', ValidationMiddleware.validatePlaylist, PlaylistController.createPlaylist);

// Get public playlists
router.get('/public', PlaylistController.getPublicPlaylists);

// Get user's playlists
router.get('/user/:userId', ValidationMiddleware.validateObjectId, PlaylistController.getUserPlaylists);

// Get playlist by ID
router.get('/:id', ValidationMiddleware.validateObjectId, PlaylistController.getPlaylistById);

// Update playlist
router.put('/:id', ValidationMiddleware.validateObjectId, PlaylistController.updatePlaylist);

// Delete playlist
router.delete('/:id', ValidationMiddleware.validateObjectId, PlaylistController.deletePlaylist);

// Add song to playlist
router.post('/:playlistId/songs/:songId', 
  PlaylistController.addSongToPlaylist
);

// Remove song from playlist
router.delete('/:playlistId/songs/:songId', 
  PlaylistController.removeSongFromPlaylist
);

module.exports = router;