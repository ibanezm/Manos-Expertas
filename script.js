// Menu toggle para móvil
const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    
    // Animación del icono hamburguesa
    const spans = menuToggle.querySelectorAll('span');
    if (nav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Cerrar menú al hacer clic en un enlace
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Header con scroll
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Cerrar franja de WhatsApp
const closeBanner = document.getElementById('close-banner');
const whatsappBanner = document.querySelector('.whatsapp-banner');

if (closeBanner && whatsappBanner) {
    closeBanner.addEventListener('click', () => {
        whatsappBanner.classList.add('hidden');
        // Guardar en localStorage que el usuario cerró el banner
        localStorage.setItem('whatsappBannerClosed', 'true');
    });
    
    // Si el usuario ya cerró el banner antes, no mostrarlo
    if (localStorage.getItem('whatsappBannerClosed') === 'true') {
        whatsappBanner.classList.add('hidden');
    }
}

// Animaciones al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observar todos los elementos con la clase scroll-fade
const scrollElements = document.querySelectorAll('.scroll-fade');
scrollElements.forEach(el => observer.observe(el));

// Hacer visibles los elementos que ya están en viewport al cargar
document.addEventListener('DOMContentLoaded', () => {
    const checkVisibleElements = () => {
        scrollElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            if (rect.top < windowHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    };
    
    checkVisibleElements();
    setTimeout(checkVisibleElements, 100);
    setTimeout(checkVisibleElements, 500);
});

// Smooth scroll para navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerHeight = header.offsetHeight;
            const whatsappBannerHeight = whatsappBanner && !whatsappBanner.classList.contains('hidden') ? whatsappBanner.offsetHeight : 0;
            const targetPosition = target.offsetTop - headerHeight - whatsappBannerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Efecto de hover en las tarjetas de proyecto
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

// Detección de scroll para animaciones adicionales
let scrollTimeout;
window.addEventListener('scroll', () => {
    document.body.classList.add('scrolling');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
    }, 150);
});

// Añadir clase activa al enlace del menú según la sección visible
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// Manejo del formulario de contacto con Formspree
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        
        // Mostrar mensaje de carga
        formMessage.textContent = 'Enviando mensaje...';
        formMessage.style.display = 'block';
        formMessage.style.background = '#d1ecf1';
        formMessage.style.color = '#0c5460';
        formMessage.style.border = '1px solid #bee5eb';
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Éxito
                formMessage.textContent = '¡Mensaje enviado correctamente! Te contactaremos pronto.';
                formMessage.className = 'form-message success';
                contactForm.reset();
                
                // Ocultar mensaje después de 5 segundos
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                // Error del servidor
                const data = await response.json();
                if (data.errors) {
                    formMessage.textContent = 'Error: ' + data.errors.map(error => error.message).join(', ');
                } else {
                    formMessage.textContent = 'Hubo un error al enviar. Por favor intenta nuevamente.';
                }
                formMessage.className = 'form-message error';
            }
        } catch (error) {
            // Error de conexión
            formMessage.textContent = 'Error de conexión. Por favor verifica tu internet e intenta nuevamente.';
            formMessage.className = 'form-message error';
        }
    });
}

// Añadir interacción táctil mejorada para dispositivos móviles
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    const interactiveCards = document.querySelectorAll('.service-card, .project-card, .testimonial-card');
    interactiveCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 300);
        });
    });
}

// Performance: reducir animaciones si el usuario prefiere movimiento reducido
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition', 'none');
}

// ========================================
// CARRUSEL DE PROYECTOS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los carruseles
    const projectCarouselCards = document.querySelectorAll('.project-card');
    
    projectCarouselCards.forEach(card => {
        const slides = card.querySelectorAll('.carousel-slide');
        const prevBtn = card.querySelector('.carousel-btn.prev');
        const nextBtn = card.querySelector('.carousel-btn.next');
        const indicatorsContainer = card.querySelector('.carousel-indicators');
        
        // Si no hay carrusel en esta tarjeta, saltar
        if (!slides.length || !prevBtn || !nextBtn || !indicatorsContainer) {
            return;
        }
        
        let currentSlide = 0;
        const totalSlides = slides.length;
        
        // Crear indicadores
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('carousel-indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
        
        const indicators = card.querySelectorAll('.carousel-indicator');
        
        // Función para ir a un slide específico
        function goToSlide(n) {
            slides[currentSlide].classList.remove('active');
            indicators[currentSlide].classList.remove('active');
            
            currentSlide = n;
            if (currentSlide >= totalSlides) currentSlide = 0;
            if (currentSlide < 0) currentSlide = totalSlides - 1;
            
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
        }
        
        // Botón siguiente
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentSlide + 1);
        });
        
        // Botón anterior
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentSlide - 1);
        });
        
        // Soporte táctil para dispositivos móviles
        let touchStartX = 0;
        let touchEndX = 0;
        
        card.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        card.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - siguiente
                    goToSlide(currentSlide + 1);
                } else {
                    // Swipe right - anterior
                    goToSlide(currentSlide - 1);
                }
            }
        }
    });
    
    console.log('✓ Carrusel de proyectos inicializado');
});

// Verificación de carga
console.log('✓ Página cargada correctamente');
console.log('✓ Navegación configurada');
console.log('✓ Animaciones de scroll activas');
console.log('✓ Formulario de contacto integrado con Formspree');
console.log('✓ WhatsApp banner y botón flotante activos');
console.log('✓ Elementos con animación encontrados:', scrollElements.length);
