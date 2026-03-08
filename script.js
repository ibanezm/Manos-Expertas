// ═══════════════════════════════════════
// MENU TOGGLE
// ═══════════════════════════════════════
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);

        const spans = menuToggle.querySelectorAll('span');
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close menu when a nav link is clicked
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// ═══════════════════════════════════════
// SMOOTH SCROLL
// ═══════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header')?.offsetHeight || 72;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ═══════════════════════════════════════
// HEADER SCROLL SHADOW
// ═══════════════════════════════════════
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (header) {
        header.style.boxShadow = window.scrollY > 60
            ? '0 2px 16px rgba(0,0,0,0.25)'
            : 'none';
    }
}, { passive: true });

// ═══════════════════════════════════════
// PARALLAX — service images
// Only runs on non-touch, non-reduced-motion devices
// ═══════════════════════════════════════
const isTouchDevice = window.matchMedia('(hover: none)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!isTouchDevice && !prefersReducedMotion) {
    const parallaxImgs = document.querySelectorAll('[data-parallax]');

    function updateParallax() {
        parallaxImgs.forEach(img => {
            const container = img.closest('.parallax-container');
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const viewH = window.innerHeight;

            // Only animate when visible
            if (rect.bottom < 0 || rect.top > viewH) return;

            // Progress: 0 (container enters bottom) → 1 (container leaves top)
            const progress = 1 - (rect.bottom / (viewH + rect.height));
            // Shift range: -8% to +8%
            const shift = (progress - 0.5) * 16;
            img.style.transform = `translateY(${shift}%)`;
        });
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
}

// ═══════════════════════════════════════
// CAROUSELS
// ═══════════════════════════════════════
document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track     = carousel.querySelector('.carousel-track');
    const slides    = carousel.querySelectorAll('.carousel-slide');
    const prevBtn   = carousel.querySelector('.carousel-prev');
    const nextBtn   = carousel.querySelector('.carousel-next');
    const dotsWrap  = carousel.querySelector('.carousel-dots');

    if (!track || slides.length === 0) return;

    let current = 0;
    let autoplayTimer = null;

    // ── Single-slide: hide controls ──────────
    if (slides.length <= 1) {
        carousel.setAttribute('data-single', '');
        if (dotsWrap) dotsWrap.style.display = 'none';
        return;
    }

    // ── Build dots ───────────────────────────
    const dots = [];
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Foto ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
    });

    // ── Go to slide ──────────────────────────
    function goTo(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // ── Arrow buttons ────────────────────────
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

    // ── Autoplay (subtle, 5s) ────────────────
    function startAutoplay() {
        autoplayTimer = setInterval(() => goTo(current + 1), 5000);
    }
    function resetAutoplay() {
        clearInterval(autoplayTimer);
        startAutoplay();
    }

    startAutoplay();

    // Pause on hover / focus
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin',    () => clearInterval(autoplayTimer));
    carousel.addEventListener('focusout',   startAutoplay);

    // ── Touch / swipe support ────────────────
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging  = false;

    carousel.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging  = false;
        clearInterval(autoplayTimer);
    }, { passive: true });

    carousel.addEventListener('touchmove', e => {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > dy && dx > 6) isDragging = true;
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
        if (!isDragging) { startAutoplay(); return; }
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if      (deltaX < -40) goTo(current + 1);
        else if (deltaX >  40) goTo(current - 1);
        startAutoplay();
    }, { passive: true });
});

// ═══════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm && formMessage) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.btn-submit');
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        formMessage.textContent = 'Enviando mensaje...';
        formMessage.style.display = 'block';
        formMessage.className = 'form-message';
        formMessage.style.background = '#d1ecf1';
        formMessage.style.color = '#0c5460';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formMessage.textContent = '¡Mensaje enviado correctamente! Te contactaremos pronto.';
                formMessage.className = 'form-message success';
                contactForm.reset();
                setTimeout(() => { formMessage.style.display = 'none'; }, 6000);
            } else {
                throw new Error('Server error');
            }
        } catch {
            formMessage.textContent = 'Hubo un error al enviar. Por favor intenta nuevamente.';
            formMessage.className = 'form-message error';
        } finally {
            submitBtn.textContent = 'Enviar mensaje';
            submitBtn.disabled = false;
        }
    });
}

console.log('✓ Manos Expertas — sitio cargado correctamente');