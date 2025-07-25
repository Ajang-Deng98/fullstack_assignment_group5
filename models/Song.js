const mongoose = require('mongoose');

class Song {
  constructor(title, artist, album, duration, genre) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.duration = duration;
    this.genre = genre;
    this.createdAt = new Date();
  }

  // Encapsulation - getter methods
  getTitle() {
    return this.title;
  }

  getArtist() {
    return this.artist;
  }

  getDuration() {
    return this.duration;
  }

  // Method to format duration
  getFormattedDuration() {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Method to get song info
  getSongInfo() {
    return {
      title: this.title,
      artist: this.artist,
      album: this.album,
      duration: this.getFormattedDuration(),
      genre: this.genre
    };
  }

  // Validation method
  validate() {
    if (!this.title || !this.artist || !this.duration) {
      throw new Error('Title, artist, and duration are required');
    }
    if (this.duration <= 0) {
      throw new Error('Duration must be positive');
    }
  }
}

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  genre: {
    type: String,
    trim: true
  },
  filePath: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

songSchema.methods.getFormattedDuration = function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

module.exports = {
  Song,
  SongModel: mongoose.model('Song', songSchema)
};