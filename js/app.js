// App principal
class EliteTalentApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupAgeVerification();
        this.setupNavigation();
        this.setupAnimations();
        this.setupParticles();
        this.setupCounters();
    }

    // Verificación de edad
    setupAgeVerification() {
        const overlay = document.getElementById('ageVerification');
        if (!overlay) return; // Si no existe el overlay, salir
        
        const slider = document.getElementById('ageSlider');
        const ageValue = document.getElementById('ageValue');
        const confirmBtn = document.getElementById('confirmAge');

        // Verificar si ya se confirmó la edad
        if (localStorage.getItem('ageVerified') === 'true') {
            overlay.classList.add('hidden');
            return;
        }

        if (slider && ageValue && confirmBtn) {
            slider.addEventListener('input', (e) => {
                const age = e.target.value;
                ageValue.textContent = age;
                
                if (age >= 18) {
                    confirmBtn.disabled = false;
                    confirmBtn.style.opacity = '1';
                } else {
                    confirmBtn.disabled = true;
                    confirmBtn.style.opacity = '0.5';
                }
            });

            confirmBtn.addEventListener('click', () => {
                if (slider.value >= 18) {
                    localStorage.setItem('ageVerified', 'true');
                    overlay.classList.add('hidden');
                }
            });
        }
    }

    // Navegación
    setupNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Smooth scroll para enlaces internos
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

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(10, 10, 15, 0.95)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
    }

    // Animaciones de scroll
    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observar elementos con clases de animación
        document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
            observer.observe(el);
        });

        // Efecto parallax simple
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Sistema de partículas con Canvas
    setupParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        particlesContainer.appendChild(canvas);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        const particleCount = 80;
        const colors = ['#FF4D8D', '#9D4EDD', '#FFFFFF'];

        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -10;
                this.size = Math.random() * 3 + 1;
                this.speedY = Math.random() * 1 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;

                if (this.y > canvas.height) {
                    this.reset();
                }

                if (this.x < 0 || this.x > canvas.width) {
                    this.speedX *= -1;
                }
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        };

        animate();
    }

    // Contadores animados
    setupCounters() {
        const counters = document.querySelectorAll('[data-target]');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000; // 2 segundos
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    // Utilidades
    static showNotification(message, type = 'info') {
        // Crear contenedor si no existe
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
            `;
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
                <span style="flex: 1;">${message}</span>
                <button class="toast-close" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            background: ${colors[type] || colors.info};
            backdrop-filter: blur(20px);
            border-radius: 8px;
            padding: 15px;
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
            opacity: 0;
            animation: slideIn 0.3s ease forwards;
        `;
        
        // Agregar animación si no existe
        if (!document.getElementById('toast-animation')) {
            const style = document.createElement('style');
            style.id = 'toast-animation';
            style.textContent = `
                @keyframes slideIn {
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.appendChild(notification);
        
        // Botón cerrar
        const closeBtn = notification.querySelector('.toast-close');
        const removeToast = () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                // Remover contenedor si está vacío
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', removeToast);
        
        // Auto-remove después de 4 segundos
        setTimeout(removeToast, 4000);
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Efectos de cursor personalizado
class CursorEffects {
    constructor() {
        this.cursor = null;
        this.init();
    }

    init() {
        // Solo en desktop
        if (window.innerWidth > 768) {
            this.createCursor();
            this.setupEvents();
        }
    }

    createCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: var(--accent-pink);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(this.cursor);
    }

    setupEvents() {
        document.addEventListener('mousemove', (e) => {
            if (this.cursor) {
                this.cursor.style.left = e.clientX - 10 + 'px';
                this.cursor.style.top = e.clientY - 10 + 'px';
            }
        });

        // Efectos hover
        document.querySelectorAll('a, button, .clickable').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.cursor) {
                    this.cursor.style.transform = 'scale(1.5)';
                }
            });

            el.addEventListener('mouseleave', () => {
                if (this.cursor) {
                    this.cursor.style.transform = 'scale(1)';
                }
            });
        });
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new EliteTalentApp();
    new CursorEffects();
});

// Service Worker para funcionamiento offline
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}