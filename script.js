// Đăng ký plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// Hàm tiện ích (giữ nguyên)
function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
 }
function updateYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
 }

// --- Header Scroll Effect ---
function setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    ScrollTrigger.create({
        start: "top top", end: 99999,
        onUpdate: (self) => {
            const threshold = 20; // Trigger sớm hơn
            if (self.scroll() > threshold) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });
    // Initial check in case the page loads already scrolled
    if (window.scrollY > 20) header.classList.add('scrolled');
}

// --- GSAP Animations (Phong cách GitHub/Netflix) ---
function setupProfessionalAnimations() {

    // Default animation settings for elements fading in ON LOAD
    const defaultOnLoadAnimation = {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
    };

    // 1. Animate Hero Content (Visible on Load)
    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']");
    const heroCta = document.querySelector(".hero-cta[data-animate='fade-up']"); // Target the container

    if (heroTitle) {
        gsap.from(heroTitle, {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "expo.out",
            delay: 0.3 // Keep original delay
        });
    }
    if (heroSubtitle) {
        gsap.from(heroSubtitle, {
            ...defaultOnLoadAnimation,
            delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 // Use data-delay or default
        });
    }
     if (heroCta) {
         // Animate the button *inside* the CTA container
         gsap.from(heroCta.children, { // Target the child (the <a> tag)
             ...defaultOnLoadAnimation,
             delay: parseFloat(heroCta.dataset.delay) || 0.7 // Use data-delay or default
         });
     }


    // 2. General Fade/Slide In Animations ON SCROLL for other sections
    //    Target elements NOT inside the hero section
    gsap.utils.toArray('[data-animate]:not(.hero-title):not(.hero-subtitle):not(.hero-cta)').forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0; // Keep individual delays if needed
        const staggerAmount = parseFloat(element.dataset.stagger) || 0.08; // Keep stagger
        const animType = element.dataset.animate;

        let animProps = { // Base scroll animation props
             opacity: 0,
             duration: 0.6,
             ease: "power2.out",
             delay: delay, // Apply delay relative to trigger
             stagger: staggerAmount
        };

        // Add direction
        if (animType === 'fade-left') { animProps.x = -30; }
        else if (animType === 'fade-right') { animProps.x = 30; }
        else { animProps.y = 20; } // Default to fade-up if not left/right


        // Check if the element itself should be animated or its children (for lists/grids)
        let target = element;
         if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline')) {
             // Only animate children if they exist
             if (element.children.length > 0) {
                target = element.children;
             }
         }


        gsap.from(target, {
            ...animProps,
            scrollTrigger: {
                trigger: element, // Trigger based on the container element
                start: "top 88%", // Trigger when element is 88% from top of viewport
                toggleActions: "play none none none",
                once: true // Animate only once
            }
        });
    });

    // 3. Parallax for Images (Subtle - Keep As Is)
     gsap.utils.toArray('.content-row .image-card').forEach(card => {
         gsap.to(card, {
             yPercent: -5, // Parallax rất nhẹ
             ease: "none",
             scrollTrigger: {
                 trigger: card.closest('.content-row'),
                 start: "top bottom", end: "bottom top",
                 scrub: 1.9, // Mượt
             }
         });
     });

     // 4. Button Hover Microinteraction (Keep As Is)
     document.querySelectorAll('.cta-button, .nav-button, .social-button').forEach(button => {
         button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.95, duration: 0.1 }));
         button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 }));
         button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 }));
     });
}


// Admin Panel & Action Buttons Logic (Keep As Is)
function setupAdminPanel() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminPanel = document.getElementById('admin-panel');
    const editables = document.querySelectorAll('[data-editable]');
    const adminSaveBtn = document.querySelector('#admin-panel .cta-button');

    if (urlParams.has('admin')) {
        if (!adminPanel) return;
        adminPanel.style.display = 'block';

        editables.forEach(el => {
            const key = el.dataset.editable;
            const textarea = adminPanel.querySelector(`textarea[name="${key}"]`);
            if (textarea) {
                textarea.value = localStorage.getItem(key) || el.innerHTML.trim();
            }
             el.style.border = '1px dashed var(--accent-primary)';
             el.style.cursor = 'pointer';
             el.addEventListener('click', () => {
                 const correspondingTextarea = adminPanel.querySelector(`textarea[name="${key}"]`);
                 if (correspondingTextarea) correspondingTextarea.focus();
             });
        });

        if (adminSaveBtn) {
            adminSaveBtn.addEventListener('click', () => {
                editables.forEach(el => {
                    const key = el.dataset.editable;
                    const textarea = adminPanel.querySelector(`textarea[name="${key}"]`);
                    if (textarea) {
                        const newValue = textarea.value.trim();
                        el.innerHTML = newValue;
                        localStorage.setItem(key, newValue);
                    }
                });
                alert('Nội dung đã được cập nhật!');
            });
        }

    } else {
         if (adminPanel) adminPanel.style.display = 'none';
        editables.forEach(el => {
            const key = el.dataset.editable;
            const savedValue = localStorage.getItem(key);
            if (savedValue) {
                el.innerHTML = savedValue;
            }
        });
    }
}

function setupActionButtons() {
     const donateLink = document.querySelector('.nav-link[href="#donate"]');
     const authLink = document.querySelector('.nav-link.auth-link');

     if(donateLink) {
        donateLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Chức năng Donate đang được phát triển!');
        });
     }
      if(authLink) {
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Chức năng Login/Register đang được phát triển!');
        });
     }
}

// ----- Initialization -----
function initializePage() {
    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        try {
            ageSpan.textContent = calculateAge('2006-08-08');
        } catch (e) {
            console.error("Error calculating age:", e);
            ageSpan.textContent = "??";
        }
    }
    updateYear();
    setupHeaderScroll();
    setupProfessionalAnimations(); // Call the revised animation function
    setupAdminPanel();
    setupActionButtons();
}

document.addEventListener('DOMContentLoaded', initializePage);