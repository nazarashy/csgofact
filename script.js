// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Connect button functionality
const connectBtn = document.querySelector('.btn-connect');
if (connectBtn) {
    connectBtn.addEventListener('click', function() {
        // Copy server IP to clipboard
        navigator.clipboard.writeText('192.168.1.100:27015').then(() => {
            // Show feedback
            const originalText = this.textContent;
            this.textContent = 'Copied to Clipboard!';
            
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
}

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (name && email && message) {
            // In a real application, you would send this data to a server
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

// Server status simulation
function updateServerStatus() {
    const statusElements = document.querySelectorAll('.status-online, .status-offline');
    statusElements.forEach(element => {
        // Randomly change status for demonstration purposes
        if (Math.random() > 0.2) { // 80% chance online
            element.textContent = 'Online';
            element.className = 'status-online';
        } else {
            element.textContent = 'Offline';
            element.className = 'status-offline';
        }
    });
}

// Update server status every 30 seconds
setInterval(updateServerStatus, 30000);

// Initialize server status on page load
document.addEventListener('DOMContentLoaded', function() {
    updateServerStatus();
});

// Add animation to elements when they come into view
function animateOnScroll() {
    const elements = document.querySelectorAll('.server-card, .stat-card, .about-text');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Set initial styles for animations
document.querySelectorAll('.server-card, .stat-card, .about-text').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

window.addEventListener('scroll', animateOnScroll);
// Trigger once on page load as well
animateOnScroll();