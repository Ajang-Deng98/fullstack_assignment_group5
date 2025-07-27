# Music Playlist Manager

A comprehensive, full-stack music playlist management system built with modern web technologies. Upload your music, create playlists, and enjoy seamless audio playback with a beautiful, responsive interface.

## LINK TO THE VIDEO AND DOCUMENTATION
https://youtu.be/yj_IzXHWjsg


API Documentation: http://localhost:3000/api/docs

![License](https://img.shields.io/github/license/Ajang-Deng98/fullstack_assignment_group5)
![Node](https://img.shields.io/badge/Node.js-18+-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-Running-green)
![Redis](https://img.shields.io/badge/Redis-Required-red)

## Features

### Core Functionality
- **Audio Upload & Playback**: Upload MP3, WAV, M4A, OGG, FLAC files with built-in HTML5 player
- **Smart Playlist Management**: Create unlimited playlists with drag-and-drop organization
- **Advanced Search**: Real-time search by title, artist, album, or genre
- **Recently Played**: Redis-powered listening history with timestamps
- **User Profiles**: Secure user management with session handling

### Modern Frontend
- **Responsive Design**: Mobile-first approach with smooth animations
- **Professional Landing Page**: Hero section, features, testimonials, and CTAs
- **Interactive Dashboard**: Real-time updates with smooth transitions
- **Audio Player**: Fixed bottom player with progress tracking
- **Glassmorphism UI**: Modern design with blur effects and gradients

### Technical Excellence
- **Object-Oriented Programming**: Full implementation of OOP principles
- **RESTful API**: Complete CRUD operations with proper HTTP status codes
- **Redis Caching**: High-performance caching and session management
- **File Upload**: Secure file handling with validation and storage
- **Error Handling**: Comprehensive error management and user feedback

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for sessions and recently played
- **File Upload**: Multer for audio file handling
- **Validation**: Joi for request validation
- **Testing**: Jest & Supertest

### Frontend
- **Languages**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with animations and transitions
- **Audio**: HTML5 Audio API for playback
- **Design**: Responsive, mobile-first approach
- **Effects**: Glassmorphism, gradients, and micro-interactions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- Redis (running on localhost:6379)

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running on localhost:27017
- Redis running on localhost:6379

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ajang-Deng98/fullstack_assignment_group5.git
cd fullstack_assignment_group5
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# The .env file is already configured for local development
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/music_playlist_db
# REDIS_URL=redis://localhost:6379
```

4. **Start required services**
```bash
# Start MongoDB (if not running as service)
mongod

# Start Redis (if not running as service)
redis-server
```

5. **Run the application**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

6. **Access the application**
- Landing Page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard.html
- API Docs: http://localhost:3000/api/docs

## API Endpoints

### Songs
- `POST /api/songs` - Create a new song
- `GET /api/songs` - Get all songs (paginated)
- `GET /api/songs/search?query=` - Search songs
- `GET /api/songs/:id` - Get song by ID
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song
- `POST /api/songs/:id/play` - Play song (add to recently played)

### Playlists
- `POST /api/playlists` - Create a new playlist
- `GET /api/playlists` - Get all playlists (paginated)
- `GET /api/playlists/public` - Get public playlists
- `GET /api/playlists/user/:userId` - Get user's playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:playlistId/songs/:songId` - Add song to playlist
- `DELETE /api/playlists/:playlistId/songs/:songId` - Remove song from playlist

### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:userId/recently-played` - Get recently played songs
- `DELETE /api/users/:userId/recently-played` - Clear recently played songs

## Testing

### Postman Collection
1. Import `postman_collection.json` into Postman
2. Set base URL to `http://localhost:3000/api`
3. Test endpoints in this order:
   - Create a user
   - Upload songs with audio files
   - Create playlists
   - Add songs to playlists
   - Play songs to test recently played

### Manual Testing
1. Visit http://localhost:3000
2. Register a new account
3. Upload audio files
4. Create playlists
5. Test audio playback
6. Check recently played section

### Unit Tests
```bash
# Run working tests
npx jest tests/simple.test.js

# Run all tests (some may require database setup)
npm test
```

## OOP Concepts Demonstrated

### Encapsulation
- Private properties and methods in classes
- Getter methods for accessing data
- Data validation within classes

### Inheritance
- `BasePlaylist` abstract class
- `RegularPlaylist` and `SmartPlaylist` extending base class
- Shared methods and properties

### Polymorphism
- Different playlist types implementing same interface
- Method overriding in subclasses

### Abstraction
- Abstract `BasePlaylist` class
- Interface-like behavior for different playlist types
- Hidden implementation details

## Database Schema

### Songs
```javascript
{
  title: String (required),
  artist: String (required),
  album: String,
  duration: Number (required),
  genre: String,
  createdAt: Date
}
```

### Playlists
```javascript
{
  name: String (required),
  description: String,
  userId: ObjectId (required),
  songs: [ObjectId],
  isPublic: Boolean,
  playlistType: String (enum: ['regular', 'smart']),
  criteria: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

### Users
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  playlists: [ObjectId],
  createdAt: Date
}
```

## Redis Usage

- **Recently Played**: Stores user's recently played songs as lists
- **Caching**: Caches frequently accessed playlist data
- **TTL**: Automatic expiration for cache entries

## Error Handling

- Comprehensive error handling middleware
- Validation errors with detailed messages
- Database error handling
- Redis connection error handling

## Testing

Run tests:
```bash
# Working tests (9 passing tests)
npx jest tests/simple.test.js

# All tests
npm test
```

## Project Structure

```
fullstack_assignment_group5/
├── config/
│   └── database.js          # MongoDB & Redis connections
├── controllers/
│   ├── songController.js    # Song CRUD operations
│   ├── playlistController.js # Playlist management
│   └── userController.js    # User management
├── middleware/
│   ├── validation.js        # Request validation
│   ├── errorHandler.js      # Error handling
│   └── upload.js           # File upload handling
├── models/
│   ├── Song.js             # Song schema & OOP
│   ├── Playlist.js         # Playlist schema & inheritance
│   └── User.js             # User schema
├── public/
│   ├── css/                # Stylesheets
│   ├── js/                 # Frontend JavaScript
│   ├── landing.html        # Landing page
│   ├── index.html          # Auth page
│   └── dashboard.html      # Main dashboard
├── routes/
│   └── *.js               # API routes
├── uploads/               # Audio file storage
├── utils/
│   └── redisService.js    # Redis operations
└── server.js              # Main server file
```

## OOP Implementation

### Encapsulation
- Private properties and methods in classes
- Getter methods for data access
- Data validation within classes

### Inheritance
```javascript
// Abstract base class
class BasePlaylist {
  constructor(name, description) {
    if (this.constructor === BasePlaylist) {
      throw new Error('Cannot instantiate abstract class');
    }
  }
}

// Concrete implementations
class RegularPlaylist extends BasePlaylist {}
class SmartPlaylist extends BasePlaylist {}
```

### Polymorphism
- Different playlist types implementing same interface
- Method overriding in subclasses

### Abstraction
- Abstract BasePlaylist class
- Hidden implementation details

## API Endpoints

### Songs
- `POST /api/songs` - Upload song with audio file
- `GET /api/songs` - Get all songs (paginated)
- `GET /api/songs/search?query=` - Search songs
- `POST /api/songs/:id/play` - Play song (add to recently played)

### Playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists` - Get all playlists (paginated)
- `GET /api/playlists/public` - Get public playlists
- `GET /api/playlists/user/:userId` - Get user playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:playlistId/songs/:songId` - Add song to playlist
- `DELETE /api/playlists/:playlistId/songs/:songId` - Remove song from playlist

### Users
- `POST /api/users` - Create user
- `GET /api/users/:userId/recently-played` - Get recently played

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team Members

- Ajang Chol Aguer Deng — Lead Developer & System Architect  
- Collins Otieno — Backend Developer  
- Nana Koramah — Frontend Developer  
- Stella Remember — Database & Documentation Lead


## Acknowledgments

- Built with modern web technologies
- Inspired by popular music streaming platforms
- Designed for educational purposes demonstrating full-stack development

---

Star this repository if you found it helpful!
