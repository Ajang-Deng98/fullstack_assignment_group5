const express = require('express');
const SongController = require('../controllers/songController');
const ValidationMiddleware = require('../middleware/validation');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new song
router.post('/', auth, upload.single('audioFile'), SongController.createSong);

// Get all songs with pagination
router.get('/', SongController.getAllSongs);

// Search songs
router.get('/search', SongController.searchSongs);

// Get song by ID
router.get('/:id', ValidationMiddleware.validateObjectId, SongController.getSongById);

// Update song
router.put('/:id', auth, ValidationMiddleware.validateObjectId, ValidationMiddleware.validateSong, SongController.updateSong);

// Delete song
router.delete('/:id', auth, ValidationMiddleware.validateObjectId, SongController.deleteSong);

// Play song (add to recently played)
router.post('/:id/play', auth, ValidationMiddleware.validateObjectId, SongController.playSong);

module.exports = router;