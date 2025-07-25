const express = require('express');
const UserController = require('../controllers/userController');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Create a new user
router.post('/', ValidationMiddleware.validateUser, UserController.createUser);

// Get all users
router.get('/', UserController.getAllUsers);

// Get user by ID
router.get('/:id', ValidationMiddleware.validateObjectId, UserController.getUserById);

// Update user
router.put('/:id', ValidationMiddleware.validateObjectId, ValidationMiddleware.validateUser, UserController.updateUser);

// Delete user
router.delete('/:id', ValidationMiddleware.validateObjectId, UserController.deleteUser);

// Get user's recently played songs
router.get('/:userId/recently-played', UserController.getRecentlyPlayed);

// Clear user's recently played songs
router.delete('/:userId/recently-played', UserController.clearRecentlyPlayed);

module.exports = router;