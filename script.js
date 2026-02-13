// Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        
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
}

// Close menu on link click
const navLinks = document.querySelectorAll('.nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = 80;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Form Handling
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        
        formMessage.textContent = 'Enviando mensaje...';
        formMessage.style.display = 'block';
        formMessage.className = 'form-message';
        formMessage.style.background = '#d1ecf1';
        formMessage.style.color = '#0c5460';
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                formMessage.textContent = 'Â¡Mensaje enviado correctamente! Te contactaremos pronto.';
                formMessage.className = 'form-message success';
                contactForm.reset();
                
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                formMessage.textContent = 'Hubo un error al enviar. Por favor intenta nuevamente.';
                formMessage.className = 'form-message error';
            }
        } catch (error) {
            formMessage.textContent = 'Error de conexiÃ³n. Por favor verifica tu internet.';
            formMessage.className = 'form-message error';
        }
    });
}

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    } else {
        header.style.boxShadow = 'none';
    }
});

console.log('âœ“ Manos Expertas - Sitio cargado correctamente');