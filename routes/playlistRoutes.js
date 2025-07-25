const express = require('express');
const PlaylistController = require('../controllers/playlistController');
const ValidationMiddleware = require('../middleware/validation');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new playlist
router.post('/', auth, ValidationMiddleware.validatePlaylist, PlaylistController.createPlaylist);

// Get public playlists
router.get('/public', PlaylistController.getPublicPlaylists);

// Get user's playlists
router.get('/user/:userId', ValidationMiddleware.validateObjectId, PlaylistController.getUserPlaylists);

// Get playlist by ID
router.get('/:id', ValidationMiddleware.validateObjectId, PlaylistController.getPlaylistById);

// Update playlist
router.put('/:id', auth, ValidationMiddleware.validateObjectId, PlaylistController.updatePlaylist);

// Delete playlist
router.delete('/:id', auth, ValidationMiddleware.validateObjectId, PlaylistController.deletePlaylist);

// Add song to playlist
router.post('/:playlistId/songs/:songId', auth, PlaylistController.addSongToPlaylist);

// Remove song from playlist
router.delete('/:playlistId/songs/:songId', auth, PlaylistController.removeSongFromPlaylist);

module.exports = router;