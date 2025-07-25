const { User } = require('../models/User');
const { RegularPlaylist, SmartPlaylist } = require('../models/Playlist');
const { Song } = require('../models/Song');

describe('OOP Models', () => {
  describe('User Class', () => {
    it('should create user with valid data', () => {
      const user = new User('testuser', 'test@example.com');
      
      expect(user.getUsername()).toBe('testuser');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.playlists).toEqual([]);
    });

    it('should validate user data', () => {
      const user = new User('', '');
      
      expect(() => user.validate()).toThrow('Username and email are required');
    });

    it('should validate email format', () => {
      const user = new User('testuser', 'invalid-email');
      
      expect(() => user.validate()).toThrow('Invalid email format');
    });

    it('should add playlist to user', () => {
      const user = new User('testuser', 'test@example.com');
      const playlistId = 'playlist_123';
      
      user.addPlaylist(playlistId);
      
      expect(user.playlists).toContain(playlistId);
    });

    it('should remove playlist from user', () => {
      const user = new User('testuser', 'test@example.com');
      const playlistId = 'playlist_123';
      
      user.addPlaylist(playlistId);
      user.removePlaylist(playlistId);
      
      expect(user.playlists).not.toContain(playlistId);
    });
  });

  describe('Song Class', () => {
    it('should create song with valid data', () => {
      const song = new Song('Test Song', 'Test Artist', 180);
      
      expect(song.getTitle()).toBe('Test Song');
      expect(song.getArtist()).toBe('Test Artist');
      expect(song.getDuration()).toBe(180);
    });

    it('should validate song data', () => {
      const song = new Song('', '', 0);
      
      expect(() => song.validate()).toThrow('Title, artist, and duration are required');
    });

    it('should format duration correctly', () => {
      const song = new Song('Test Song', 'Test Artist', 125);
      
      expect(song.getFormattedDuration()).toBe('2:05');
    });
  });

  describe('Playlist Classes (Inheritance)', () => {
    it('should create regular playlist', () => {
      const playlist = new RegularPlaylist('My Playlist', 'Test description');
      
      expect(playlist.getName()).toBe('My Playlist');
      expect(playlist.getDescription()).toBe('Test description');
      expect(playlist.getType()).toBe('regular');
    });

    it('should create smart playlist', () => {
      const criteria = { genre: 'rock' };
      const playlist = new SmartPlaylist('Rock Playlist', 'Rock songs', criteria);
      
      expect(playlist.getName()).toBe('Rock Playlist');
      expect(playlist.getType()).toBe('smart');
      expect(playlist.getCriteria()).toEqual(criteria);
    });

    it('should not instantiate abstract BasePlaylist', () => {
      const { BasePlaylist } = require('../models/Playlist');
      
      expect(() => new BasePlaylist('Test', 'Test')).toThrow('Cannot instantiate abstract class');
    });

    it('should add and remove songs from playlist', () => {
      const playlist = new RegularPlaylist('Test Playlist', 'Test');
      const songId = 'song_123';
      
      playlist.addSong(songId);
      expect(playlist.songs).toContain(songId);
      
      playlist.removeSong(songId);
      expect(playlist.songs).not.toContain(songId);
    });

    it('should validate playlist data', () => {
      const playlist = new RegularPlaylist('', '');
      
      expect(() => playlist.validate()).toThrow('Playlist name is required');
    });
  });
});