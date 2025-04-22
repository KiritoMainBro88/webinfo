// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);

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
            const threshold = 20;
            if (self.scroll() > threshold) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });
    if (window.scrollY > 20) header.classList.add('scrolled');
}

// --- GSAP Animations ---
function setupProfessionalAnimations() {
    const defaultOnLoadAnimation = {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
    };

    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']");

    if (heroTitle) {
        gsap.from(heroTitle, {
            opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3
        });
    }
    if (heroSubtitle) {
        gsap.from(heroSubtitle, {
            ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5
        });
    }

    gsap.utils.toArray('[data-animate]:not(.hero-title):not(.hero-subtitle)').forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0;
        let staggerAmount = parseFloat(element.dataset.stagger) || 0;
        const animType = element.dataset.animate;

        let animProps = {
             duration: 0.6, ease: "power2.out", delay: delay, clearProps: "opacity,transform"
        };
        if (animType === 'fade-left') { animProps.x = -30; }
        else if (animType === 'fade-right') { animProps.x = 30; }
        else { animProps.y = 20; }

        let target = element;
         if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline')) {
             if (element.children.length > 0) {
                target = element.children;
                if (staggerAmount === 0 && target !== element) staggerAmount = 0.08;
                if (staggerAmount > 0) animProps.stagger = staggerAmount;
             }
         }
         if (target === element && animProps.stagger) delete animProps.stagger;

        gsap.from(target, {
            ...animProps,
            scrollTrigger: {
                trigger: element, start: "top 88%", toggleActions: "play none none none", once: true
            }
        });
    });

    gsap.utils.toArray('.content-row .image-card').forEach(card => {
         gsap.to(card, {
             yPercent: -5, ease: "none",
             scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 }
         });
     });

    document.querySelectorAll('.cta-button, .nav-link, .social-button').forEach(button => {
         button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.95, duration: 0.1 }));
         button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 }));
         button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 }));
     });
}

// --- Admin Panel Logic ---
function setupAdminPanel() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminPanel = document.getElementById('admin-panel');
    const editables = document.querySelectorAll('[data-editable]');
    const adminSaveBtn = document.querySelector('#admin-panel button.cta-button');

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
                        const newValue = textarea.value;
                        el.innerHTML = newValue;
                        localStorage.setItem(key, newValue);
                    }
                });
                alert('Nội dung đã được cập nhật!');
                 editables.forEach(el => {
                    el.style.border = 'none';
                    el.style.cursor = 'default';
                 });
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

// --- NEW: Authentication Logic ---

// !! IMPORTANT: Replace this with your actual Render deployment URL !!
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // YOUR RENDER URL HERE

// --- Auth Form Elements (will be assigned in setupActionButtons) ---
let authContainer = null;
let loginFormWrapper = null;
let registerFormWrapper = null;
let loginForm = null;
let registerForm = null;
let loginMessageEl = null;
let registerMessageEl = null;
let authLink = null;

// --- Auth Helper Functions ---
function showLoginForm() {
    if (registerFormWrapper) registerFormWrapper.style.display = 'none';
    if (loginFormWrapper) loginFormWrapper.style.display = 'block';
    if (loginMessageEl) loginMessageEl.textContent = '';
    if (registerMessageEl) registerMessageEl.textContent = '';
    if (authContainer && !authContainer.classList.contains('visible')) {
         authContainer.style.display = 'flex';
         setTimeout(() => { authContainer.classList.add('visible'); }, 10); // Allow display change
    }
}

function showRegisterForm() {
    if (loginFormWrapper) loginFormWrapper.style.display = 'none';
    if (registerFormWrapper) registerFormWrapper.style.display = 'block';
    if (loginMessageEl) loginMessageEl.textContent = '';
    if (registerMessageEl) registerMessageEl.textContent = '';
    if (authContainer && !authContainer.classList.contains('visible')) {
         authContainer.style.display = 'flex';
         setTimeout(() => { authContainer.classList.add('visible'); }, 10);
    }
}

function closeAuthForms() {
    if (authContainer) {
        authContainer.classList.remove('visible');
        setTimeout(() => {
            // Only hide completely if it wasn't immediately reopened
            if (!authContainer.classList.contains('visible')) {
                authContainer.style.display = 'none';
            }
        }, 300); // Match CSS transition time (0.3s)
    }
     // Clear any previous messages
    if (loginMessageEl) loginMessageEl.textContent = '';
    if (registerMessageEl) registerMessageEl.textContent = '';
}

function displayAuthMessage(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.className = 'auth-message'; // Reset classes
    element.classList.add(isError ? 'error' : 'success');
}

// --- Update UI based on login state ---
function updateUserLoginState() {
    const user = localStorage.getItem('portfolioUser');
    const authLinkEl = document.querySelector('.nav-link.auth-link'); // Get fresh reference

    if (!authLinkEl) return;

    // Clean up previous listeners before adding new ones
    authLinkEl.removeEventListener('click', handleAuthLinkClick);
    authLinkEl.removeEventListener('click', handleLogoutClick);

    if (user) {
        try {
            const userData = JSON.parse(user);
            authLinkEl.textContent = `Logout (${userData.username})`;
            authLinkEl.addEventListener('click', handleLogoutClick); // Add logout listener
        } catch (e) {
             localStorage.removeItem('portfolioUser');
             authLinkEl.textContent = 'Login / Register';
             authLinkEl.addEventListener('click', handleAuthLinkClick); // Add login listener
        }
    } else {
        authLinkEl.textContent = 'Login / Register';
        authLinkEl.addEventListener('click', handleAuthLinkClick); // Add login listener
    }
}

// --- Event Handlers ---
function handleAuthLinkClick(e) {
    e.preventDefault();
    showLoginForm();
}

function handleLogoutClick(e) {
    e.preventDefault();
    localStorage.removeItem('portfolioUser');
    alert('Logged out successfully!');
    updateUserLoginState();
    closeAuthForms(); // Close forms if open
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (!registerForm || !registerMessageEl) return;
    const username = registerForm.username.value;
    const password = registerForm.password.value;
    displayAuthMessage(registerMessageEl, 'Registering...', false);

    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
        displayAuthMessage(registerMessageEl, data.message, false);
        registerForm.reset(); // Clear form
        setTimeout(() => { showLoginForm(); }, 1500); // Switch to login after success
    } catch (error) {
        console.error('Registration fetch error:', error);
        displayAuthMessage(registerMessageEl, error.message || 'Registration failed.', true);
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!loginForm || !loginMessageEl) return;
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    displayAuthMessage(loginMessageEl, 'Logging in...', false);

     try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);

        displayAuthMessage(loginMessageEl, data.message, false);
        localStorage.setItem('portfolioUser', JSON.stringify({ userId: data.userId, username: data.username }));
        loginForm.reset(); // Clear form
        setTimeout(() => {
            closeAuthForms();
            updateUserLoginState(); // Update header link
        }, 1000);
    } catch (error) {
        console.error('Login fetch error:', error);
        displayAuthMessage(loginMessageEl, error.message || 'Login failed.', true);
         localStorage.removeItem('portfolioUser'); // Clear bad login attempts
         updateUserLoginState(); // Ensure header shows "Login / Register"
    }
}


// --- Setup Action Buttons (including Auth) ---
function setupActionButtons() {
     const donateLink = document.querySelector('.nav-link[href="#donate"]');
     authLink = document.querySelector('.nav-link.auth-link'); // Assign global variable

     if(donateLink) {
        donateLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Chức năng Donate đang được phát triển!');
        });
     }

     // Get references to auth elements
     authContainer = document.getElementById('auth-container');
     loginFormWrapper = document.getElementById('login-form-wrapper');
     registerFormWrapper = document.getElementById('register-form-wrapper');
     loginForm = document.getElementById('login-form');
     registerForm = document.getElementById('register-form');
     loginMessageEl = document.getElementById('login-message');
     registerMessageEl = document.getElementById('register-message');

    // Attach submit listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    } else { console.error("Login form not found"); }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    } else { console.error("Register form not found"); }

    // Set initial state of the Login/Register/Logout link
     updateUserLoginState();

     // Add listener for clicks outside the auth form to close it (optional)
     if(authContainer) {
         authContainer.addEventListener('click', (e) => {
             // Close only if clicked on the background overlay itself
             if (e.target === authContainer) {
                 closeAuthForms();
             }
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
    setupProfessionalAnimations();
    setupAdminPanel();
    setupActionButtons(); // This now sets up auth listeners
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializePage);