/**
 * MANOS EXPERTAS — script.js (Optimizado)
 * Performance: lazy images, IntersectionObserver, passive listeners,
 *              requestAnimationFrame para parallax, debounce.
 */

'use strict';

// ═══════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════

/** Ejecutar cb cuando el DOM esté listo */
function ready(cb) {
    if (document.readyState !== 'loading') { cb(); }
    else { document.addEventListener('DOMContentLoaded', cb); }
}

/** Debounce — evita disparos excesivos en resize */
function debounce(fn, ms = 150) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** RAF throttle — para scroll de alta frecuencia */
function rafThrottle(fn) {
    let pending = false;
    return (...args) => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => { fn(...args); pending = false; });
    };
}


// ═══════════════════════════════════════
// MENU TOGGLE
// ═══════════════════════════════════════
ready(() => {
    const menuToggle = document.getElementById('menuToggle');
    const nav        = document.getElementById('nav');
    if (!menuToggle || !nav) return;

    function closeMenu() {
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        const [s0, s1, s2] = menuToggle.querySelectorAll('span');
        s0.style.transform = 'none';
        s1.style.opacity   = '1';
        s2.style.transform = 'none';
    }

    menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
        const [s0, s1, s2] = menuToggle.querySelectorAll('span');
        if (isOpen) {
            s0.style.transform = 'rotate(45deg) translateY(8px)';
            s1.style.opacity   = '0';
            s2.style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            closeMenu();
        }
    });

    // Cerrar al hacer click en cualquier enlace del nav
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('active')) closeMenu();
    });
});


// ═══════════════════════════════════════
// SMOOTH SCROLL
// ═══════════════════════════════════════
ready(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id     = this.getAttribute('href');
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const headerH = document.querySelector('.header')?.offsetHeight ?? 72;
            const top     = target.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
});


// ═══════════════════════════════════════
// HEADER SCROLL SHADOW
// ═══════════════════════════════════════
ready(() => {
    const header = document.getElementById('header');
    if (!header) return;

    const update = rafThrottle(() => {
        header.style.boxShadow = window.scrollY > 60
            ? '0 2px 16px rgba(0,0,0,0.25)'
            : 'none';
    });

    window.addEventListener('scroll', update, { passive: true });
});


// ═══════════════════════════════════════
// LAZY LOADING DE IMÁGENES
// Reemplaza el loading="lazy" nativo con
// IntersectionObserver para mayor control
// y soporte en parallax backgrounds.
// ═══════════════════════════════════════
ready(() => {

    // 1. Imágenes <img> con data-src (lazy mejorado)
    const lazyImgs = document.querySelectorAll('img[data-src]');

    if (lazyImgs.length > 0 && 'IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                // Cargar webp si el navegador lo soporta
                if (img.dataset.srcset) img.srcset = img.dataset.srcset;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.removeAttribute('data-srcset');
                observer.unobserve(img);
            });
        }, {
            rootMargin: '200px 0px',   // Precargar 200px antes de que sea visible
            threshold: 0
        });

        lazyImgs.forEach(img => imgObserver.observe(img));
    } else {
        // Fallback: carga directa
        lazyImgs.forEach(img => {
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            img.src = img.dataset.src;
        });
    }

    // 2. Backgrounds en parallax con data-bg (lazy)
    const lazyBgs = document.querySelectorAll('[data-bg]');

    if (lazyBgs.length > 0 && 'IntersectionObserver' in window) {
        const bgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.style.backgroundImage = `url('${el.dataset.bg}')`;
                el.removeAttribute('data-bg');
                observer.unobserve(el);
            });
        }, { rootMargin: '300px 0px', threshold: 0 });

        lazyBgs.forEach(el => bgObserver.observe(el));
    } else {
        lazyBgs.forEach(el => {
            el.style.backgroundImage = `url('${el.dataset.bg}')`;
        });
    }
});


// ═══════════════════════════════════════
// PARALLAX — service images
// Sólo en dispositivos no-táctiles sin
// preferencia de movimiento reducido.
// Usa RAF para evitar jank.
// ═══════════════════════════════════════
ready(() => {
    const isTouchDevice       = window.matchMedia('(hover: none)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) return;

    const parallaxImgs = document.querySelectorAll('[data-parallax]');
    if (parallaxImgs.length === 0) return;

    // Sólo animar imágenes visibles (performance)
    const visible = new Set();

    const visObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { visible.add(e.target); }
            else { visible.delete(e.target); e.target.style.transform = 'translateY(0%)'; }
        });
    }, { rootMargin: '100px 0px' });

    parallaxImgs.forEach(img => visObserver.observe(img));

    const updateParallax = rafThrottle(() => {
        const viewH = window.innerHeight;
        visible.forEach(img => {
            const container = img.closest('.parallax-container');
            if (!container) return;
            const rect    = container.getBoundingClientRect();
            const progress = 1 - (rect.bottom / (viewH + rect.height));
            const shift    = (progress - 0.5) * 16;
            img.style.transform = `translateY(${shift.toFixed(2)}%)`;
        });
    });

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
});


// ═══════════════════════════════════════
// CAROUSELES
// ═══════════════════════════════════════
ready(() => {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const track    = carousel.querySelector('.carousel-track');
        const slides   = carousel.querySelectorAll('.carousel-slide');
        const prevBtn  = carousel.querySelector('.carousel-prev');
        const nextBtn  = carousel.querySelector('.carousel-next');
        const dotsWrap = carousel.querySelector('.carousel-dots');

        if (!track || slides.length === 0) return;

        let current      = 0;
        let autoTimer    = null;
        let isHovered    = false;

        // Single slide
        if (slides.length <= 1) {
            carousel.setAttribute('data-single', '');
            if (dotsWrap) dotsWrap.style.display = 'none';
            return;
        }

        // Dots
        const dots = [];
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Foto ${i + 1}`);
            dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
            dotsWrap?.appendChild(dot);
            dots.push(dot);
        });

        function goTo(index) {
            current = ((index % slides.length) + slides.length) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

        // Autoplay — sólo cuando es visible (IntersectionObserver)
        let isVisible = false;

        const autoObserver = new IntersectionObserver(entries => {
            isVisible = entries[0].isIntersecting;
            isVisible ? startAutoplay() : stopAutoplay();
        }, { threshold: 0.2 });

        autoObserver.observe(carousel);

        function startAutoplay() {
            if (autoTimer || isHovered) return;
            autoTimer = setInterval(() => goTo(current + 1), 5000);
        }

        function stopAutoplay() {
            clearInterval(autoTimer);
            autoTimer = null;
        }

        function resetAutoplay() {
            stopAutoplay();
            if (isVisible && !isHovered) startAutoplay();
        }

        carousel.addEventListener('mouseenter', () => { isHovered = true;  stopAutoplay(); });
        carousel.addEventListener('mouseleave', () => { isHovered = false; if (isVisible) startAutoplay(); });
        carousel.addEventListener('focusin',    () => { isHovered = true;  stopAutoplay(); });
        carousel.addEventListener('focusout',   () => { isHovered = false; if (isVisible) startAutoplay(); });

        // Touch / swipe
        let touchStartX = 0, touchStartY = 0, isDragging = false;

        carousel.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isDragging  = false;
            stopAutoplay();
        }, { passive: true });

        carousel.addEventListener('touchmove', e => {
            const dx = Math.abs(e.touches[0].clientX - touchStartX);
            const dy = Math.abs(e.touches[0].clientY - touchStartY);
            if (dx > dy && dx > 6) isDragging = true;
        }, { passive: true });

        carousel.addEventListener('touchend', e => {
            if (isDragging) {
                const deltaX = e.changedTouches[0].clientX - touchStartX;
                if      (deltaX < -40) goTo(current + 1);
                else if (deltaX >  40) goTo(current - 1);
            }
            if (isVisible) startAutoplay();
        }, { passive: true });
    });
});


// ═══════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════
ready(() => {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    if (!contactForm || !formMessage) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn          = contactForm.querySelector('.btn-submit');
        submitBtn.textContent    = 'Enviando...';
        submitBtn.disabled       = true;

        formMessage.textContent  = 'Enviando mensaje...';
        formMessage.style.display = 'block';
        formMessage.className    = 'form-message';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body:   new FormData(contactForm),
                headers: { Accept: 'application/json' }
            });

            if (response.ok) {
                formMessage.textContent = '¡Mensaje enviado! Te contactaremos pronto.';
                formMessage.className   = 'form-message success';
                contactForm.reset();
                setTimeout(() => { formMessage.style.display = 'none'; }, 6000);
            } else {
                throw new Error('Server error');
            }
        } catch {
            formMessage.textContent = 'Error al enviar. Por favor intenta nuevamente.';
            formMessage.className   = 'form-message error';
        } finally {
            submitBtn.textContent = 'Enviar mensaje';
            submitBtn.disabled    = false;
        }
    });
});


// ═══════════════════════════════════════
// ANIMACIÓN DE ENTRADA (Fade-in sections)
// Usa IntersectionObserver para animar
// secciones al entrar al viewport.
// ═══════════════════════════════════════
ready(() => {
    if (!('IntersectionObserver' in window)) return;

    // Agrega la clase CSS que controla la animación
    const targets = document.querySelectorAll(
        '.service-block, .project-item, .testimonial-card, .contact-left, .contact-right'
    );

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => {
        el.classList.add('fade-in-ready');
        fadeObserver.observe(el);
    });
});


console.log('✓ Manos Expertas — sitio cargado y optimizado.');