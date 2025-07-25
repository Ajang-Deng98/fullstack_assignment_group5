const mongoose = require('mongoose');

// Abstract base class for playlists
class BasePlaylist {
  constructor(name, description) {
    if (this.constructor === BasePlaylist) {
      throw new Error('Cannot instantiate abstract class');
    }
    this.name = name;
    this.description = description;
    this.createdAt = new Date();
    this.songs = [];
  }

  // Abstract method - must be implemented by subclasses
  getPlaylistType() {
    throw new Error('getPlaylistType method must be implemented');
  }

  // Common methods for all playlists
  addSong(song) {
    this.songs.push(song);
  }

  removeSong(songId) {
    this.songs = this.songs.filter(song => song.toString() !== songId.toString());
  }

  getTotalDuration() {
    return this.songs.length; // This would be calculated based on actual song durations
  }

  getSongCount() {
    return this.songs.length;
  }
}

// Concrete implementation - Regular Playlist
class RegularPlaylist extends BasePlaylist {
  constructor(name, description, userId) {
    super(name, description);
    this.userId = userId;
    this.isPublic = false;
  }

  getPlaylistType() {
    return 'regular';
  }

  makePublic() {
    this.isPublic = true;
  }

  makePrivate() {
    this.isPublic = false;
  }
}

// Concrete implementation - Smart Playlist (example of inheritance)
class SmartPlaylist extends BasePlaylist {
  constructor(name, description, userId, criteria) {
    super(name, description);
    this.userId = userId;
    this.criteria = criteria; // e.g., genre, artist, etc.
  }

  getPlaylistType() {
    return 'smart';
  }

  updateCriteria(newCriteria) {
    this.criteria = { ...this.criteria, ...newCriteria };
  }
}

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  playlistType: {
    type: String,
    enum: ['regular', 'smart'],
    default: 'regular'
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

playlistSchema.methods.addSong = function(songId) {
  if (!this.songs.includes(songId)) {
    this.songs.push(songId);
    this.updatedAt = new Date();
  }
};

playlistSchema.methods.removeSong = function(songId) {
  this.songs = this.songs.filter(song => song.toString() !== songId.toString());
  this.updatedAt = new Date();
};

playlistSchema.methods.getSongCount = function() {
  return this.songs.length;
};

module.exports = {
  BasePlaylist,
  RegularPlaylist,
  SmartPlaylist,
  PlaylistModel: mongoose.model('Playlist', playlistSchema)
};