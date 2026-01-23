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

// Animaciones al hacer scroll - CORREGIDO
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

// SOLUCIÓN: Hacer visibles los elementos que ya están en viewport al cargar
document.addEventListener('DOMContentLoaded', () => {
    const checkVisibleElements = () => {
        scrollElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            // Si el elemento ya está visible al cargar la página
            if (rect.top < windowHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    };
    
    // Ejecutar inmediatamente y después de un pequeño delay
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
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Parallax suave en hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < hero.offsetHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
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

// Añadir interacción táctil mejorada para dispositivos móviles
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    const interactiveCards = document.querySelectorAll('.service-card, .project-card, .about-item');
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

// Verificación de carga
console.log('✓ Página cargada correctamente');
console.log('✓ Elementos con animación encontrados:', scrollElements.length);