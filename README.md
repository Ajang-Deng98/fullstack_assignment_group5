# Music Playlist Manager

A comprehensive music playlist management system built with Node.js, MongoDB, and Redis, demonstrating Object-Oriented Programming principles.

## Features

- **Song Management**: Create, read, update, delete songs
- **Playlist Management**: Create playlists, add/remove songs, organize music
- **User Management**: User profiles and playlist ownership
- **Recently Played**: Redis-powered recently played songs tracking
- **Search**: Search songs by title, artist, album, or genre
- **Caching**: Redis caching for improved performance
- **OOP Implementation**: Demonstrates encapsulation, inheritance, polymorphism, and abstraction

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Validation**: Joi
- **Testing**: Jest, Supertest

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- Redis (running on localhost:6379)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd music-playlist-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the services:
```bash
# Start MongoDB (if not running as service)
mongod

# Start Redis (if not running as service)
redis-server
```

5. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

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

## Testing with Postman

1. Import the provided Postman collection
2. Set the base URL to `http://localhost:3000`
3. Test the endpoints in the following order:
   - Create a user
   - Create songs
   - Create playlists
   - Add songs to playlists
   - Play songs to test recently played functionality

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
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License