const API_BASE = 'http://localhost:3000/api';

// Check if user is already logged in
if (localStorage.getItem('currentUser')) {
    window.location.href = 'dashboard.html';
}

// Auth Modal Functions
function showAuthModal(type) {
    const modal = document.getElementById('authModal');
    modal.style.display = 'block';
    
    if (type === 'login') {
        switchToLogin();
    } else {
        switchToRegister();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
    clearAuthMessage();
}

function switchToLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    clearAuthMessage();
}

function switchToRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    clearAuthMessage();
}

function showAuthMessage(message, type = 'error') {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.className = `auth-message ${type}`;
    setTimeout(() => {
        clearAuthMessage();
    }, 5000);
}

function clearAuthMessage() {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = '';
    messageDiv.className = 'auth-message';
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.data.user));
            localStorage.setItem('token', result.data.token);
            showAuthMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showAuthMessage(result.message || 'Login failed');
        }
    } catch (error) {
        showAuthMessage('Network error. Please try again.');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.data.user));
            localStorage.setItem('token', result.data.token);
            showAuthMessage('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showAuthMessage(result.message || 'Registration failed');
        }
    } catch (error) {
        showAuthMessage('Network error. Please try again.');
    }
}

// Landing Page Animations
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Enhanced navbar with scroll effects
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const scrolled = window.pageYOffset;
        
        if (scrolled > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.15)';
            navbar.style.padding = '12px 0';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            navbar.style.padding = '15px 0';
        }
    });

    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('hero-stats')) {
                    animateStats();
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Parallax effect for music notes
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.music-note');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
});

function animateStats() {
    const heroStats = document.querySelectorAll('.hero-stats .stat-number');
    const stats = [
        { element: heroStats[0], target: 50000, suffix: 'K+' },
        { element: heroStats[1], target: 15000, suffix: 'K+' },
        { element: heroStats[2], target: 5000, suffix: 'K+' }
    ];

    stats.forEach(stat => {
        if (stat.element) {
            animateNumber(stat.element, stat.target, stat.suffix);
        }
    });
}

function animateNumber(element, target, suffix) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (suffix === 'K+') {
            element.textContent = Math.floor(current / 1000) + 'K+';
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 20);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
}

// Enhanced loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});