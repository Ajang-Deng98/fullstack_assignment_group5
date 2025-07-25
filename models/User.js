const mongoose = require('mongoose');

class User {
  constructor(username, email) {
    this.username = username;
    this.email = email;
    this.createdAt = new Date();
    this.playlists = [];
  }

  // Encapsulation - getter methods
  getUsername() {
    return this.username;
  }

  getEmail() {
    return this.email;
  }

  // Method to add playlist
  addPlaylist(playlistId) {
    this.playlists.push(playlistId);
  }

  // Method to remove playlist
  removePlaylist(playlistId) {
    this.playlists = this.playlists.filter(id => id.toString() !== playlistId.toString());
  }

  // Validation
  validate() {
    if (!this.username || !this.email) {
      throw new Error('Username and email are required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Invalid email format');
    }
  }
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.addPlaylist = function(playlistId) {
  if (!this.playlists.includes(playlistId)) {
    this.playlists.push(playlistId);
  }
};

userSchema.methods.removePlaylist = function(playlistId) {
  this.playlists = this.playlists.filter(id => id.toString() !== playlistId.toString());
};

module.exports = {
  User,
  UserModel: mongoose.model('User', userSchema)
};