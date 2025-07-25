const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let songs = [];
let playlists = [];
let currentPlaylist = null;
let selectedSongs = new Set();

// Check authentication
const userData = localStorage.getItem('currentUser');
if (!userData) {
    window.location.href = 'index.html';
} else {
    currentUser = JSON.parse(userData);
    document.getElementById('userName').textContent = `Welcome, ${currentUser.username}!`;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    showLoadingState();
    
    // Load data with staggered animation
    setTimeout(() => {
        loadSongs();
    }, 200);
    
    setTimeout(() => {
        loadPlaylists();
    }, 400);
    
    setTimeout(() => {
        loadRecentlyPlayed();
        hideLoadingState();
    }, 600);
    
    // Add welcome animation
    animateWelcome();
});

function showLoadingState() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.opacity = '0.5';
        section.style.pointerEvents = 'none';
    });
}

function hideLoadingState() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.opacity = '1';
        section.style.pointerEvents = 'auto';
        section.style.transition = 'opacity 0.5s ease';
    });
}

function animateWelcome() {
    const userName = document.getElementById('userName');
    userName.style.animation = 'pulse 2s ease-in-out';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function showSection(section) {
    // Hide all sections with fade out
    document.querySelectorAll('.content-section').forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(20px)';
        setTimeout(() => {
            s.classList.add('hidden');
        }, 200);
    });
    
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // Show selected section with fade in
    setTimeout(() => {
        const targetSection = document.getElementById(section + 'Section');
        targetSection.classList.remove('hidden');
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            targetSection.style.transition = 'all 0.4s ease';
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 50);
        
        event.target.classList.add('active');
    }, 200);
}

function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.animation = 'slideInUp 0.4s ease-out';
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutDown 0.4s ease-in';
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
            messageDiv.style.animation = '';
        }, 400);
    }, 3000);
}

// Songs functionality
async function loadSongs() {
    try {
        const response = await fetch(`${API_BASE}/songs`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success) {
            songs = result.data;
            displaySongs(songs);
        } else {
            showMessage('No songs found');
        }
    } catch (error) {
        console.error('Load songs error:', error);
        showMessage('Failed to load songs. Please check if the server is running.');
    }
}

function displaySongs(songsToShow) {
    const container = document.getElementById('songsList');
    container.innerHTML = '';
    
    if (songsToShow.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><h3>No songs found</h3><p>Add some songs to get started!</p></div>';
        return;
    }
    
    songsToShow.forEach(song => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <div class="song-title">${song.title}</div>
            <div class="song-artist">by ${song.artist}</div>
            <div class="song-info">
                <span>${song.album || 'Unknown Album'} • ${formatDuration(song.duration)}</span>
                <button class="play-btn" onclick="playSong('${song._id}', '${song.filePath || ''}')">▶ Play</button>
            </div>
        `;
        container.appendChild(songCard);
    });
}

function searchSongs() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        (song.album && song.album.toLowerCase().includes(query))
    );
    displaySongs(filtered);
}

async function playSong(songId, filePath) {
    try {
        console.log('Playing song:', { songId, userId: currentUser._id });
        
        const response = await fetch(`${API_BASE}/songs/${songId}/play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser._id })
        });
        
        const result = await response.json();
        console.log('Play song result:', result);
        
        if (result.success) {
            if (filePath && filePath !== 'null' && filePath !== 'undefined') {
                playAudioFile(filePath, result.data.title, result.data.artist);
            }
            showMessage('Song played!', 'success');
            // Reload recently played after a short delay
            setTimeout(() => {
                loadRecentlyPlayed();
            }, 500);
        } else {
            showMessage(result.message || 'Failed to play song');
        }
    } catch (error) {
        console.error('Play song error:', error);
        showMessage('Failed to play song');
    }
}

function playAudioFile(filePath, title, artist) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioElement = document.getElementById('audioElement');
    const currentSong = document.getElementById('currentSong');
    
    audioElement.src = filePath;
    currentSong.textContent = `${title} - ${artist}`;
    audioPlayer.classList.remove('hidden');
    audioElement.play();
}

function closePlayer() {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioElement = document.getElementById('audioElement');
    
    audioElement.pause();
    audioElement.src = '';
    audioPlayer.classList.add('hidden');
}

function showAddSongModal() {
    document.getElementById('addSongModal').style.display = 'block';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        document.getElementById('songTitle').value = fileName;
        
        // Try to extract duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.addEventListener('loadedmetadata', function() {
            document.getElementById('songDuration').value = Math.round(audio.duration);
            URL.revokeObjectURL(audio.src);
        });
    }
}

async function addSong(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const audioFile = document.getElementById('audioFile').files[0];
    
    if (audioFile) {
        formData.append('audioFile', audioFile);
    }
    
    formData.append('title', document.getElementById('songTitle').value);
    formData.append('artist', document.getElementById('songArtist').value);
    formData.append('album', document.getElementById('songAlbum').value);
    formData.append('duration', document.getElementById('songDuration').value);
    formData.append('genre', document.getElementById('songGenre').value);
    
    try {
        const response = await fetch(`${API_BASE}/songs`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('Song added successfully!', 'success');
            closeModal('addSongModal');
            loadSongs();
            event.target.reset();
        } else {
            showMessage(result.message || 'Failed to add song');
        }
    } catch (error) {
        showMessage('Failed to add song');
    }
}

// Playlists functionality
async function loadPlaylists() {
    try {
        const response = await fetch(`${API_BASE}/playlists/user/${currentUser._id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success) {
            playlists = result.data;
            displayPlaylists(playlists);
        } else {
            displayPlaylists([]);
        }
    } catch (error) {
        console.error('Load playlists error:', error);
        displayPlaylists([]);
        showMessage('Failed to load playlists');
    }
}

function displayPlaylists(playlistsToShow) {
    const container = document.getElementById('playlistsList');
    container.innerHTML = '';
    
    if (playlistsToShow.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><h3>No playlists found</h3><p>Create your first playlist!</p></div>';
        return;
    }
    
    playlistsToShow.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        playlistCard.style.cursor = 'pointer';
        playlistCard.onclick = () => showPlaylistDetails(playlist);
        playlistCard.innerHTML = `
            <div class="playlist-title">${playlist.name}</div>
            <div class="playlist-desc">${playlist.description || 'No description'}</div>
            <div class="playlist-info">
                <span>${playlist.songs.length} songs</span>
                <span>${playlist.isPublic ? '🌐 Public' : '🔒 Private'}</span>
            </div>
        `;
        container.appendChild(playlistCard);
    });
}

function showAddPlaylistModal() {
    document.getElementById('addPlaylistModal').style.display = 'block';
}

async function addPlaylist(event) {
    event.preventDefault();
    
    const playlistData = {
        name: document.getElementById('playlistName').value,
        description: document.getElementById('playlistDesc').value,
        userId: currentUser._id,
        isPublic: document.getElementById('playlistPublic').checked
    };
    
    try {
        const response = await fetch(`${API_BASE}/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playlistData)
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('Playlist created successfully!', 'success');
            closeModal('addPlaylistModal');
            loadPlaylists();
            event.target.reset();
        } else {
            showMessage(result.message || 'Failed to create playlist');
        }
    } catch (error) {
        showMessage('Failed to create playlist');
    }
}

// Recently played functionality
async function loadRecentlyPlayed() {
    try {
        const response = await fetch(`${API_BASE}/users/${currentUser._id}/recently-played`);
        const result = await response.json();
        
        if (result.success) {
            displayRecentlyPlayed(result.data);
        }
    } catch (error) {
        showMessage('Failed to load recently played');
    }
}

function displayRecentlyPlayed(recentSongs) {
    const container = document.getElementById('recentList');
    container.innerHTML = '';
    
    if (recentSongs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No recently played songs</p>';
        return;
    }
    
    recentSongs.forEach(song => {
        const recentItem = document.createElement('div');
        recentItem.className = 'recent-item';
        recentItem.innerHTML = `
            <div class="recent-info">
                <h4>${song.title}</h4>
                <p>by ${song.artist}</p>
            </div>
            <div class="recent-time">${formatPlayTime(song.playedAt)}</div>
        `;
        container.appendChild(recentItem);
    });
}

async function clearRecentlyPlayed() {
    try {
        const response = await fetch(`${API_BASE}/users/${currentUser._id}/recently-played`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('Recently played cleared!', 'success');
            loadRecentlyPlayed();
        }
    } catch (error) {
        showMessage('Failed to clear recently played');
    }
}

// Utility functions
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatPlayTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function showPlaylistDetails(playlist) {
    currentPlaylist = playlist;
    document.getElementById('playlistsList').classList.add('hidden');
    document.getElementById('playlistDetails').classList.remove('hidden');
    document.getElementById('playlistDetailsTitle').textContent = playlist.name;
    
    // Load playlist songs
    try {
        const response = await fetch(`${API_BASE}/playlists/${playlist._id}`);
        const result = await response.json();
        
        if (result.success) {
            displayPlaylistSongs(result.data.songs);
        }
    } catch (error) {
        showMessage('Failed to load playlist songs');
    }
}

function hidePlaylistDetails() {
    document.getElementById('playlistDetails').classList.add('hidden');
    document.getElementById('playlistsList').classList.remove('hidden');
    currentPlaylist = null;
}

function displayPlaylistSongs(playlistSongs) {
    const container = document.getElementById('playlistSongs');
    container.innerHTML = '';
    
    if (playlistSongs.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No songs in this playlist</div>';
        return;
    }
    
    playlistSongs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.className = 'recent-item';
        songItem.innerHTML = `
            <div class="recent-info">
                <h4>${song.title}</h4>
                <p>by ${song.artist}</p>
            </div>
            <div>
                <button class="play-btn" onclick="playSong('${song._id}', '${song.filePath || ''}')">▶ Play</button>
                <button class="btn-secondary" onclick="removeSongFromPlaylist('${song._id}')">Remove</button>
            </div>
        `;
        container.appendChild(songItem);
    });
}

function showAddToPlaylistModal() {
    document.getElementById('addToPlaylistModal').style.display = 'block';
    displayAvailableSongs();
}

function displayAvailableSongs() {
    const container = document.getElementById('availableSongs');
    container.innerHTML = '';
    
    songs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.onclick = () => toggleSongSelection(song._id, songItem);
        songItem.innerHTML = `
            <div>
                <strong>${song.title}</strong><br>
                <small>by ${song.artist}</small>
            </div>
            <button onclick="addSongToCurrentPlaylist('${song._id}'); event.stopPropagation();" class="btn-primary">Add</button>
        `;
        container.appendChild(songItem);
    });
}

function toggleSongSelection(songId, element) {
    if (selectedSongs.has(songId)) {
        selectedSongs.delete(songId);
        element.classList.remove('selected');
    } else {
        selectedSongs.add(songId);
        element.classList.add('selected');
    }
}

async function addSongToCurrentPlaylist(songId) {
    if (!currentPlaylist) return;
    
    try {
        const response = await fetch(`${API_BASE}/playlists/${currentPlaylist._id}/songs/${songId}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('Song added to playlist!', 'success');
            showPlaylistDetails(currentPlaylist); // Refresh playlist view
        } else {
            showMessage(result.message || 'Failed to add song to playlist');
        }
    } catch (error) {
        showMessage('Failed to add song to playlist');
    }
}

async function removeSongFromPlaylist(songId) {
    if (!currentPlaylist) return;
    
    try {
        const response = await fetch(`${API_BASE}/playlists/${currentPlaylist._id}/songs/${songId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('Song removed from playlist!', 'success');
            showPlaylistDetails(currentPlaylist); // Refresh playlist view
        } else {
            showMessage(result.message || 'Failed to remove song from playlist');
        }
    } catch (error) {
        showMessage('Failed to remove song from playlist');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}