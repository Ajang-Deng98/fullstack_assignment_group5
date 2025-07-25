// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
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
    
    navbar.style.transition = 'all 0.3s ease';
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
            } else if (entry.target.classList.contains('stats-grid')) {
                animateStatsCards();
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.hero-stats');
const statsCards = document.querySelector('.stats-grid');

if (statsSection) {
    observer.observe(statsSection);
}
if (statsCards) {
    observer.observe(statsCards);
}

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

function animateStatsCards() {
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    statCards.forEach((card, index) => {
        const target = parseInt(card.getAttribute('data-target'));
        const suffix = target === 99 ? '%' : '+';
        
        setTimeout(() => {
            animateNumber(card, target, suffix);
        }, index * 200);
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
        } else if (suffix === '%') {
            element.textContent = Math.floor(current) + '%';
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 20);
}

// Enhanced loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Enhanced animations
function addParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.music-note');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    addParallaxEffect();
});

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-active');
}