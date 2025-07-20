        // Error handling for failed resources
        window.addEventListener('error', function(e) {
            console.warn('Resource failed to load:', e.target.src || e.target.href);
            // Handle broken images
            if (e.target.tagName === 'IMG') {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'image-fallback';
                fallback.innerHTML = '<i class="fas fa-image"></i><span>Image not available</span>';
                e.target.parentNode.appendChild(fallback);
            }
        }, true);

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('Page Load Performance:', {
                            'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                            'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
                            'Total Page Load': perfData.loadEventEnd - perfData.navigationStart
                        });
                    }
                }, 0);
            });
        }

        // Lazy loading for images
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Progress bar on scroll with better performance
        let ticking = false;
        function updateProgressBar() {
            const header = document.querySelector('.main-header');
            const scrollTop = document.querySelector('.scroll-top');
            const progressBar = document.querySelector('.progress-bar');
            
            // Calculate scroll progress
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = (window.scrollY / scrollHeight) * 100;
            
            if (progressBar) {
                progressBar.style.width = Math.min(scrollProgress, 100) + '%';
            }
            
            if (window.scrollY > 100) {
                header?.classList.add('scrolled');
                scrollTop?.classList.add('show');
            } else {
                header?.classList.remove('scrolled');
                scrollTop?.classList.remove('show');
            }
            
            ticking = false;
        }

        function requestProgressUpdate() {
            if (!ticking) {
                requestAnimationFrame(updateProgressBar);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestProgressUpdate, { passive: true });

        // Service Worker Registration for offline support
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('ServiceWorker registration successful');
                    })
                    .catch(function(error) {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });
        }

        // Enhanced error handling for external resources
        document.addEventListener('DOMContentLoaded', function() {
            // Check if critical resources loaded
            const criticalResources = [
                'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
                'https://unpkg.com/vanilla-tilt@1.7.0/dist/vanilla-tilt.min.js'
            ];
            
            criticalResources.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.onerror = function() {
                    console.warn('Failed to load:', src);
                    // Provide fallback functionality
                    if (src.includes('particles.js') && !window.particlesJS) {
                        window.particlesJS = function() { console.log('Particles.js fallback'); };
                    }
                    if (src.includes('vanilla-tilt') && !window.VanillaTilt) {
                        window.VanillaTilt = { init: function() { console.log('VanillaTilt fallback'); } };
                    }
                };
                document.head.appendChild(script);
            });
        });

        // Scroll to top with smooth animation
        document.querySelector('.scroll-top').addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Mobile Navigation Functionality
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        const mobileNavOverlay = document.getElementById('mobileNavOverlay');
        const mobileNavMenu = document.getElementById('mobileNavMenu');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

        // Toggle mobile navigation
        function toggleMobileNav() {
            mobileNavToggle.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            mobileNavMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (mobileNavMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }

        // Close mobile navigation
        function closeMobileNav() {
            mobileNavToggle.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            mobileNavMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Event listeners for mobile navigation
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', toggleMobileNav);
        }
        
        if (mobileNavOverlay) {
            mobileNavOverlay.addEventListener('click', closeMobileNav);
        }

        // Close mobile nav when clicking on menu links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileNav();
                
                // Smooth scroll to section after closing menu
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 300);
                }
            });
        });

        // Touch Gesture Support for Mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        // Touch gesture for closing mobile nav with swipe
        if (mobileNavMenu) {
            mobileNavMenu.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            mobileNavMenu.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                
                // Detect right swipe (close menu)
                const deltaX = touchEndX - touchStartX;
                const deltaY = Math.abs(touchEndY - touchStartY);
                
                if (deltaX > 50 && deltaY < 100) {
                    closeMobileNav();
                }
            }, { passive: true });
        }

        // Enhanced project cards touch interaction for mobile
        if (window.innerWidth <= 768) {
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                // Add touch feedback
                card.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                    this.style.transition = 'transform 0.1s ease';
                }, { passive: true });
                
                card.addEventListener('touchend', function() {
                    this.style.transform = 'scale(1)';
                    this.style.transition = 'transform 0.3s ease';
                }, { passive: true });
            });
        }

        // Responsive design adjustments
        function handleResize() {
            if (window.innerWidth > 768) {
                closeMobileNav();
            }
        }

        window.addEventListener('resize', handleResize);

        // Escape key to close mobile nav
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNavMenu && mobileNavMenu.classList.contains('active')) {
                closeMobileNav();
            }
        });
        
        // Initialize particles.js
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ff8906"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                },
                "size": {
                    "value": 3,
                    "random": true,
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#7f5af0",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "push": {
                        "particles_nb": 4
                    }
                }
            },
            "retina_detect": true
        });
        
        // Initialize tilt effect on project cards
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });
        
        // Reveal animations on scroll
        const revealElements = document.querySelectorAll('.fadeIn');
        const revealOnScroll = function() {
            const windowHeight = window.innerHeight;
            for (let i = 0; i < revealElements.length; i++) {
                const elementTop = revealElements[i].getBoundingClientRect().top;
                if (elementTop < windowHeight - 50) {
                    revealElements[i].style.opacity = 1;
                }
            }
        };
        
        window.addEventListener('scroll', revealOnScroll);
        window.addEventListener('load', revealOnScroll);

        // Enhanced scroll reveal with intersection observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Special handling for playground section
                    if (entry.target.id === 'playground') {
                        entry.target.style.display = 'block';
                        entry.target.style.visibility = 'visible';
                        entry.target.style.opacity = '1';
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fadeIn').forEach(el => {
            observer.observe(el);
            
            // Force visibility for playground elements
            if (el.closest('#playground')) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-bg');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        // Enhanced typing effect with multiple lines
        const typewriterTexts = [
            "Full-Stack Developer",
            "Mobile App Developer", 
            "IoT Enthusiast",
            "Cybersecurity Enthusiast",
            "Problem Solving",
            "Object-Oriented Programming",
            "Creative Thinker",

        ];
        
        let currentTextIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        
        function advancedTypewriter() {
            const typingElement = document.getElementById('typing-text');
            if (!typingElement) return;
            
            const currentText = typewriterTexts[currentTextIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                
                if (currentCharIndex === 0) {
                    isDeleting = false;
                    currentTextIndex = (currentTextIndex + 1) % typewriterTexts.length;
                    setTimeout(advancedTypewriter, 500);
                    return;
                }
                setTimeout(advancedTypewriter, 50);
            } else {
                typingElement.textContent = currentText.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                
                if (currentCharIndex === currentText.length) {
                    setTimeout(() => {
                        isDeleting = true;
                        advancedTypewriter();
                    }, 2000);
                    return;
                }
                setTimeout(advancedTypewriter, 100);
            }
        }
        
        // Start enhanced typewriter effect
        setTimeout(advancedTypewriter, 2500);

        // Theme Toggle Functionality
        const themeToggle = document.getElementById('themeToggle');
        const sunIcon = document.getElementById('sun');
        const sunRays = document.getElementById('sun-rays');
        const moonIcon = document.getElementById('moon');
        
        // Check for saved theme preference or default to 'dark'
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Update icon based on current theme
        function updateThemeIcon(theme) {
            if (theme === 'light') {
                sunIcon.style.display = 'block';
                sunRays.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                sunIcon.style.display = 'none';
                sunRays.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        }
        
        // Initialize icon
        updateThemeIcon(currentTheme);
        
        // Theme toggle event listener
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Update theme
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            updateThemeIcon(newTheme);
            
            // Add a subtle animation effect
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 150);
        });

        // Skills Progress Bar Animation
        function animateSkillBars() {
            const skillBars = document.querySelectorAll('.skill-progress');
            
            skillBars.forEach(bar => {
                const level = bar.getAttribute('data-level');
                const rect = bar.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible && !bar.hasAttribute('data-animated')) {
                    bar.style.width = level + '%';
                    bar.setAttribute('data-animated', 'true');
                }
            });
        }

        // Skills Section Intersection Observer
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate skill bars when skills section becomes visible
                    setTimeout(() => {
                        animateSkillBars();
                    }, 300);
                    
                    // Add entrance animations for skill items
                    const skillItems = entry.target.querySelectorAll('.skill-item, .skill-badge, .tool-item, .expertise-item');
                    skillItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                    
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        // Observe skills section
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            skillsObserver.observe(skillsSection);
            
            // Set initial state for skill items
            const skillItems = skillsSection.querySelectorAll('.skill-item, .skill-badge, .tool-item, .expertise-item');
            skillItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
        }

        // Enhanced Skills Interactions
        document.addEventListener('DOMContentLoaded', function() {
            // Skill item hover sound effect (optional)
            const skillItems = document.querySelectorAll('.skill-item, .badge-item, .tool-item, .expertise-item');
            
            skillItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.transform = this.classList.contains('tool-item') ? 
                        'translateY(-5px) scale(1.05)' : 
                        this.classList.contains('expertise-item') ?
                        'translateY(-8px)' :
                        'translateX(5px)';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.transform = this.classList.contains('tool-item') ? 
                        'translateY(0) scale(1)' : 
                        this.classList.contains('expertise-item') ?
                        'translateY(0)' :
                        'translateX(0)';
                });
            });

            // Progressive skill level display
            const skillLevels = document.querySelectorAll('.skill-level');
            skillLevels.forEach(level => {
                const skillProgress = level.closest('.skill-item').querySelector('.skill-progress');
                const dataLevel = skillProgress.getAttribute('data-level');
                
                if (dataLevel >= 85) {
                    level.style.color = 'var(--accent-color)';
                } else if (dataLevel >= 70) {
                    level.style.color = 'var(--primary-color)';
                } else {
                    level.style.color = 'var(--highlight-color)';
                }
            });

            // Badge item click effects
            const badgeItems = document.querySelectorAll('.badge-item');
            badgeItems.forEach(badge => {
                badge.addEventListener('click', function() {
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'translateY(-2px) scale(1.05)';
                    }, 100);
                });
            });

            // Tool item rotation on hover
            const toolItems = document.querySelectorAll('.tool-item');
            toolItems.forEach(tool => {
                tool.addEventListener('mouseenter', function() {
                    const icon = this.querySelector('.tool-icon');
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                });
                
                tool.addEventListener('mouseleave', function() {
                    const icon = this.querySelector('.tool-icon');
                    icon.style.transform = 'scale(1) rotate(0deg)';
                });
            });

            // Mobile touch interactions for skills
            if (window.innerWidth <= 768) {
                const touchElements = document.querySelectorAll('.skill-item, .tool-item, .expertise-item');
                
                touchElements.forEach(element => {
                    element.addEventListener('touchstart', function() {
                        this.style.transform = 'scale(0.98)';
                    }, { passive: true });
                    
                    element.addEventListener('touchend', function() {
                        this.style.transform = 'scale(1)';
                    }, { passive: true });
                });
            }
        });

        // Scroll-triggered skill bar animation
        window.addEventListener('scroll', function() {
            if (document.getElementById('skills')) {
                animateSkillBars();
            }
        });

        // Contact Form WhatsApp Integration
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();
            
            // Validate required fields
            if (!name || !email || !subject || !message) {
                alert('Please fill in all fields before sending.');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Format message for WhatsApp
            const whatsappMessage = `Hi Ferdinand! 👋

*Name:* ${name}
*Email:* ${email}
*Subject:* ${subject}

*Message:*
${message}`;
            
            // Encode message for URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            
            // WhatsApp URL with your number
            const whatsappURL = `https://wa.me/62816846662?text=${encodedMessage}`;
            
            // Show success message and redirect
            const submitBtn = document.querySelector('.form-submit-btn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Opening WhatsApp...';
            submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            submitBtn.disabled = true;
            
            // Detect device type for better handling
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
            const isAndroid = /android/i.test(userAgent);
            const isMobile = isIOS || isAndroid || /Mobi|Android/i.test(userAgent);
            
            // Function to handle the redirect
            function handleWhatsAppRedirect() {
                try {
                    if (isMobile) {
                        // For mobile devices, use direct navigation
                        window.location.href = whatsappURL;
                    } else {
                        // For desktop, try new window first
                        const newWindow = window.open(whatsappURL, '_blank', 'noopener,noreferrer');
                        if (!newWindow) {
                            // If popup blocked, redirect in same window
                            window.location.href = whatsappURL;
                        }
                    }
                } catch (error) {
                    console.log('WhatsApp redirect error:', error);
                    // Fallback: always redirect in same window
                    window.location.href = whatsappURL;
                }
            }
            
            // Execute redirect immediately for better mobile compatibility
            handleWhatsAppRedirect();
            
            // Reset form after a delay (for when user comes back)
            setTimeout(() => {
                document.getElementById('contactForm').reset();
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = 'linear-gradient(135deg, #25d366, #22c55e)';
                submitBtn.disabled = false;
            }, 2000);
        });

        // Live Code Playground Functionality
        class CodePlayground {
            constructor() {
                this.htmlEditor = document.getElementById('htmlEditor');
                this.cssEditor = document.getElementById('cssEditor');
                this.jsEditor = document.getElementById('jsEditor');
                this.previewFrame = document.getElementById('previewFrame');
                this.exampleSelector = document.getElementById('exampleSelector');
                this.runButton = document.getElementById('runCode');
                this.resetButton = document.getElementById('resetCode');
                
                this.currentTab = 'html';
                
                this.examples = {
                    card: {
                        html: `<div class="card">
  <div class="card-header">
    <h3>Animated Card</h3>
  </div>
  <div class="card-body">
    <p>This is a beautiful animated card with hover effects!</p>
    <button class="btn">Click me!</button>
  </div>
</div>`,
                        css: `.card {
  width: 300px;
  margin: 20px auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  color: white;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.card-header {
  padding: 20px;
  background: rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.card-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.card-body {
  padding: 20px;
}

.btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 15px;
}

.btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}`,
                        js: `document.querySelector('.btn').addEventListener('click', function() {
  this.style.background = 'rgba(255,255,255,0.4)';
  this.innerHTML = 'Clicked!';
  
  setTimeout(() => {
    this.style.background = 'rgba(255,255,255,0.2)';
    this.innerHTML = 'Click me!';
  }, 1000);
});

// Add sparkle effect on card hover
const card = document.querySelector('.card');
card.addEventListener('mouseenter', function() {
  this.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
});

card.addEventListener('mouseleave', function() {
  this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
});`
                    },
                    calculator: {
                        html: `<div class="calculator">
  <div class="display">
    <input type="text" id="display" readonly>
  </div>
  <div class="buttons">
    <button onclick="clearDisplay()">C</button>
    <button onclick="deleteLast()">⌫</button>
    <button onclick="appendToDisplay('/')">/</button>
    <button onclick="appendToDisplay('*')">×</button>
    
    <button onclick="appendToDisplay('7')">7</button>
    <button onclick="appendToDisplay('8')">8</button>
    <button onclick="appendToDisplay('9')">9</button>
    <button onclick="appendToDisplay('-')">-</button>
    
    <button onclick="appendToDisplay('4')">4</button>
    <button onclick="appendToDisplay('5')">5</button>
    <button onclick="appendToDisplay('6')">6</button>
    <button onclick="appendToDisplay('+')">+</button>
    
    <button onclick="appendToDisplay('1')">1</button>
    <button onclick="appendToDisplay('2')">2</button>
    <button onclick="appendToDisplay('3')">3</button>
    <button onclick="calculate()" class="equals" rowspan="2">=</button>
    
    <button onclick="appendToDisplay('0')" class="zero">0</button>
    <button onclick="appendToDisplay('.')">.</button>
  </div>
</div>`,
                        css: `.calculator {
  max-width: 320px;
  margin: 20px auto;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
}

.display {
  margin-bottom: 20px;
}

.display input {
  width: 100%;
  height: 60px;
  background: rgba(0,0,0,0.3);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.5rem;
  text-align: right;
  padding: 0 15px;
  box-sizing: border-box;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.buttons button {
  height: 60px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.buttons button:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.05);
}

.buttons button:active {
  transform: scale(0.95);
}

.equals {
  grid-row: span 2;
  background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
}

.zero {
  grid-column: span 2;
}`,
                        js: `let display = document.getElementById('display');
let currentInput = '0';
let operator = '';
let previousInput = '';

function updateDisplay() {
  display.value = currentInput;
}

function appendToDisplay(value) {
  if (currentInput === '0' && value !== '.') {
    currentInput = value;
  } else {
    currentInput += value;
  }
  updateDisplay();
}

function clearDisplay() {
  currentInput = '0';
  operator = '';
  previousInput = '';
  updateDisplay();
}

function deleteLast() {
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
}

function calculate() {
  try {
    // Replace × with * for calculation
    let expression = currentInput.replace(/×/g, '*');
    let result = eval(expression);
    currentInput = result.toString();
    updateDisplay();
  } catch (error) {
    currentInput = 'Error';
    updateDisplay();
    setTimeout(() => {
      currentInput = '0';
      updateDisplay();
    }, 2000);
  }
}

updateDisplay();`
                    },
                    todo: {
                        html: `<div class="todo-app">
  <div class="todo-header">
    <h2>📝 My Todo List</h2>
    <div class="input-container">
      <input type="text" id="todoInput" placeholder="Add new task...">
      <button onclick="addTodo()">Add</button>
    </div>
  </div>
  <div class="todo-list" id="todoList">
    <!-- Tasks will be added here -->
  </div>
</div>`,
                        css: `.todo-app {
  max-width: 400px;
  margin: 20px auto;
  background: linear-gradient(135deg, #8B5CF6, #A855F7);
  border-radius: 15px;
  color: white;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.3);
}

.todo-header {
  padding: 25px;
  background: rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.todo-header h2 {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 1.5rem;
}

.input-container {
  display: flex;
  gap: 10px;
}

.input-container input {
  flex: 1;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 1rem;
}

.input-container input::placeholder {
  color: rgba(255,255,255,0.7);
}

.input-container button {
  padding: 12px 20px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.input-container button:hover {
  background: rgba(255,255,255,0.3);
}

.todo-list {
  padding: 20px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background: rgba(255,255,255,0.15);
  transform: translateX(5px);
}

.todo-item.completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.todo-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-item span {
  flex: 1;
  font-size: 1rem;
}

.todo-item button {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  padding: 6px 12px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.todo-item button:hover {
  background: rgba(255,255,255,0.3);
}`,
                        js: `let todos = [];
let todoId = 0;

function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  
  if (text === '') return;
  
  const todo = {
    id: todoId++,
    text: text,
    completed: false
  };
  
  todos.push(todo);
  input.value = '';
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
}

function renderTodos() {
  const todoList = document.getElementById('todoList');
  
  if (todos.length === 0) {
    todoList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">No tasks yet. Add one above!</p>';
    return;
  }
  
  todoList.innerHTML = todos.map(todo => \`
    <div class="todo-item \${todo.completed ? 'completed' : ''}">
      <input type="checkbox" \${todo.completed ? 'checked' : ''} 
             onchange="toggleTodo(\${todo.id})">
      <span>\${todo.text}</span>
      <button onclick="deleteTodo(\${todo.id})">Delete</button>
    </div>
  \`).join('');
}

// Allow adding todo with Enter key
document.getElementById('todoInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addTodo();
  }
});

// Initial render
renderTodos();`
                    },
                    clock: {
                        html: `<div class="clock-container">
  <div class="digital-clock">
    <div class="time-display">
      <span id="hours">00</span>
      <span class="separator">:</span>
      <span id="minutes">00</span>
      <span class="separator">:</span>
      <span id="seconds">00</span>
    </div>
    <div class="date-display">
      <span id="date"></span>
    </div>
  </div>
  <div class="timezone-info">
    <span id="timezone"></span>
  </div>
</div>`,
                        css: `.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border-radius: 15px;
  color: white;
  font-family: 'Courier New', monospace;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(30, 60, 114, 0.3);
}

.digital-clock {
  text-align: center;
  margin-bottom: 30px;
}

.time-display {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.time-display span {
  display: inline-block;
  min-width: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.time-display span:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.separator {
  min-width: auto !important;
  background: none !important;
  padding: 0 !important;
  font-size: 3rem;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.date-display {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.timezone-info {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .time-display {
    font-size: 2.5rem;
  }
  
  .time-display span {
    min-width: 60px;
    padding: 10px;
  }
  
  .separator {
    font-size: 2rem;
  }
}`,
                        js: `function updateClock() {
  const now = new Date();
  
  // Get time components
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  // Update time display
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;
  
  // Update date display
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const dateString = now.toLocaleDateString('en-US', options);
  document.getElementById('date').textContent = dateString;
  
  // Update timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.getElementById('timezone').textContent = timezone;
}

// Update clock immediately
updateClock();

// Update every second
setInterval(updateClock, 1000);

// Add color change effect every 10 seconds
setInterval(() => {
  const colors = [
    'linear-gradient(135deg, #1e3c72, #2a5298)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)'
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  document.querySelector('.clock-container').style.background = randomColor;
}, 10000);`
                    }
                };
                
                this.init();
            }
            
            init() {
                this.setupEventListeners();
                this.loadExample('card'); // Load default example
            }
            
            setupEventListeners() {
                // Tab switching
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.switchTab(e.target.dataset.tab);
                    });
                });
                
                // Example selector
                this.exampleSelector.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.loadExample(e.target.value);
                    }
                });
                
                // Control buttons
                this.runButton.addEventListener('click', () => this.runCode());
                this.resetButton.addEventListener('click', () => this.resetCode());
                
                // Auto-run on code change (with debounce)
                let debounceTimer;
                [this.htmlEditor, this.cssEditor, this.jsEditor].forEach(editor => {
                    editor.addEventListener('input', () => {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => this.runCode(), 1000);
                    });
                });
            }
            
            switchTab(tab) {
                // Update active tab button
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
                
                // Update active editor
                document.querySelectorAll('.editor-tab').forEach(editor => {
                    editor.classList.remove('active');
                });
                document.querySelector('.editor-tab[data-tab="' + tab + '"]').classList.add('active');
                
                this.currentTab = tab;
            }
            
            loadExample(exampleName) {
                const example = this.examples[exampleName];
                if (example) {
                    this.htmlEditor.value = example.html;
                    this.cssEditor.value = example.css;
                    this.jsEditor.value = example.js;
                    this.runCode();
                }
            }
            
            runCode() {
                const html = this.htmlEditor.value;
                const css = this.cssEditor.value;
                const js = this.jsEditor.value;
                
                const iframe = this.previewFrame;
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                
                doc.open();
                doc.write('<!DOCTYPE html>');
                doc.write('<html><head>');
                doc.write('<style>body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#f5f5f5;}');
                doc.write(css);
                doc.write('</style></head><body>');
                doc.write(html);
                doc.write('<script>');
                doc.write('try{');
                doc.write(js);
                doc.write('}catch(e){console.error("Error:",e);document.body.innerHTML+="<div style=color:red;background:#fff;padding:10px;border-radius:5px;margin-top:10px;border:1px solid #ddd;><strong>Error:</strong> "+e.message+"</div>";}');
                doc.write('<\/script>');
                doc.write('</body></html>');
                doc.close();
            }
            
            resetCode() {
                this.htmlEditor.value = '';
                this.cssEditor.value = '';
                this.jsEditor.value = '';
                this.previewFrame.srcdoc = '';
                this.exampleSelector.value = '';
            }
        }
        
        // Initialize playground when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Force show playground section for Edge compatibility
            const playgroundSection = document.getElementById('playground');
            if (playgroundSection) {
                playgroundSection.style.display = 'block';
                playgroundSection.style.visibility = 'visible';
                playgroundSection.style.opacity = '1';
            }
            
            // Initialize playground if elements exist
            if (document.getElementById('htmlEditor')) {
                new CodePlayground();
            }
        });

        // Fallback initialization for older browsers
        window.addEventListener('load', function() {
            const playgroundSection = document.getElementById('playground');
            if (playgroundSection) {
                playgroundSection.style.display = 'block';
                playgroundSection.style.visibility = 'visible';
                playgroundSection.style.opacity = '1';
            }
        });

        // Debug function to check if playground is visible
        function checkPlaygroundVisibility() {
            const playground = document.getElementById('playground');
            if (playground) {
                console.log('Playground found:', playground);
                console.log('Playground display:', getComputedStyle(playground).display);
                console.log('Playground visibility:', getComputedStyle(playground).visibility);
                console.log('Playground opacity:', getComputedStyle(playground).opacity);
                
                // Force show if hidden
                if (getComputedStyle(playground).display === 'none' || 
                    getComputedStyle(playground).visibility === 'hidden' || 
                    getComputedStyle(playground).opacity === '0') {
                    
                    playground.style.display = 'block';
                    playground.style.visibility = 'visible';
                    playground.style.opacity = '1';
                    console.log('Playground forced visible');
                }
            } else {
                console.log('Playground not found');
            }
        }

        // Run debug function after page loads
        setTimeout(checkPlaygroundVisibility, 2000);

        // Additional fallback for Microsoft Edge
        if (navigator.userAgent.indexOf('Edge') > -1 || navigator.userAgent.indexOf('Edg') > -1) {
            console.log('Microsoft Edge detected - applying fixes');
            
            // Force show playground on Edge
            setTimeout(function() {
                const playground = document.getElementById('playground');
                if (playground) {
                    playground.style.display = 'block';
                    playground.style.visibility = 'visible';
                    playground.style.opacity = '1';
                    playground.style.position = 'relative';
                    playground.style.zIndex = '1';
                }
                
                const container = document.querySelector('.playground-container');
                if (container) {
                    container.style.display = 'block';
                    container.style.visibility = 'visible';
                    container.style.opacity = '1';
                    container.style.background = 'rgba(255, 255, 255, 0.1)';
                    container.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                }
            }, 100);
        }

        // Form field animations
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(field => {
            field.addEventListener('focus', function() {
                this.parentElement.style.transform = 'translateY(-2px)';
                this.style.borderColor = 'var(--primary-color)';
            });
            
            field.addEventListener('blur', function() {
                this.parentElement.style.transform = 'translateY(0)';
                if (!this.value) {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
            });
        });

        // Enhanced mobile touch handling for form submission
        const submitButton = document.querySelector('.form-submit-btn');
        if (submitButton) {
            // Prevent double-tap zoom on mobile
            submitButton.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.transform = 'translateY(0) scale(0.98)';
            }, { passive: false });
            
            submitButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.transform = 'translateY(-2px) scale(1)';
                // Trigger form submission
                document.getElementById('contactForm').dispatchEvent(new Event('submit'));
            }, { passive: false });
            
            // Also handle regular click for desktop
            submitButton.addEventListener('click', function(e) {
                if (!('ontouchstart' in window)) {
                    // Only handle click if not a touch device
                    e.preventDefault();
                    document.getElementById('contactForm').dispatchEvent(new Event('submit'));
                }
            });
        }