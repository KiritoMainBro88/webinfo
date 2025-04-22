// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);

function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Header Scroll Effect ---
function setupHeaderScroll() { const header = document.querySelector('.site-header'); if (!header) return; ScrollTrigger.create({ start: "top top", end: 99999, onUpdate: (self) => { const threshold = 20; if (self.scroll() > threshold) header.classList.add('scrolled'); else header.classList.remove('scrolled'); } }); if (window.scrollY > 20) header.classList.add('scrolled'); }

// --- GSAP Animations ---
function setupProfessionalAnimations() {
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']");
    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }
    gsap.utils.toArray('[data-animate]:not(.hero-title):not(.hero-subtitle)').forEach(element => { const delay = parseFloat(element.dataset.delay) || 0; let staggerAmount = parseFloat(element.dataset.stagger) || 0; const animType = element.dataset.animate; let animProps = { duration: 0.6, ease: "power2.out", delay: delay, clearProps: "opacity,transform" }; if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; } let target = element; if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline')) { if (element.children.length > 0) { target = element.children; if (staggerAmount === 0 && target !== element) staggerAmount = 0.08; if (staggerAmount > 0) animProps.stagger = staggerAmount; } } if (target === element && animProps.stagger) delete animProps.stagger; gsap.from(target, { ...animProps, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true } }); });
    gsap.utils.toArray('.content-row .image-card').forEach(card => { gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 } }); });
    document.querySelectorAll('.cta-button, .nav-link, .social-button').forEach(button => { button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.95, duration: 0.1 })); button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 })); button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 })); });
}

// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing Admin Panel code) ... */ }

// --- Authentication Logic ---

// !! IMPORTANT: Replace this with your actual Render deployment URL !!
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // YOUR RENDER URL HERE

let authContainer = null, loginFormWrapper = null, registerFormWrapper = null, forgotFormWrapper = null, resetFormWrapper = null;
let loginForm = null, registerForm = null, forgotForm = null, resetForm = null;
let loginMessageEl = null, registerMessageEl = null, forgotMessageEl = null, resetMessageEl = null;
let authLink = null;

function showLoginForm() {
    if (registerFormWrapper) registerFormWrapper.style.display = 'none';
    if (forgotFormWrapper) forgotFormWrapper.style.display = 'none';
    if (resetFormWrapper) resetFormWrapper.style.display = 'none';
    if (loginFormWrapper) loginFormWrapper.style.display = 'block';
    if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = '';
    if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); }
}
function showRegisterForm() {
    if (loginFormWrapper) loginFormWrapper.style.display = 'none';
    if (forgotFormWrapper) forgotFormWrapper.style.display = 'none';
    if (resetFormWrapper) resetFormWrapper.style.display = 'none';
    if (registerFormWrapper) registerFormWrapper.style.display = 'block';
    if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = '';
    if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); }
}
function showForgotForm() {
    if (loginFormWrapper) loginFormWrapper.style.display = 'none';
    if (registerFormWrapper) registerFormWrapper.style.display = 'none';
    if (resetFormWrapper) resetFormWrapper.style.display = 'none';
    if (forgotFormWrapper) forgotFormWrapper.style.display = 'block';
    if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = '';
    if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); }
}
function showResetForm() { // Note: Called manually for now
    if (loginFormWrapper) loginFormWrapper.style.display = 'none';
    if (registerFormWrapper) registerFormWrapper.style.display = 'none';
    if (forgotFormWrapper) forgotFormWrapper.style.display = 'none';
    if (resetFormWrapper) resetFormWrapper.style.display = 'block';
    if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = '';
    if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); }
}
function closeAuthForms() {
    if (authContainer) { authContainer.classList.remove('visible'); setTimeout(() => { if (!authContainer.classList.contains('visible')) { authContainer.style.display = 'none'; } }, 300); }
    if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = '';
}
function displayAuthMessage(element, message, isError = false) { if (!element) return; element.textContent = message; element.className = 'auth-message'; element.classList.add(isError ? 'error' : 'success'); }

function updateUserLoginState() {
    const user = localStorage.getItem('portfolioUser');
    const authLinkEl = document.querySelector('.nav-link.auth-link');
    if (!authLinkEl) return;
    authLinkEl.removeEventListener('click', handleAuthLinkClick); authLinkEl.removeEventListener('click', handleLogoutClick);
    if (user) { try { const userData = JSON.parse(user); authLinkEl.textContent = `Logout (${userData.username})`; authLinkEl.addEventListener('click', handleLogoutClick); } catch (e) { localStorage.removeItem('portfolioUser'); authLinkEl.textContent = 'Login / Register'; authLinkEl.addEventListener('click', handleAuthLinkClick); } }
    else { authLinkEl.textContent = 'Login / Register'; authLinkEl.addEventListener('click', handleAuthLinkClick); }
}
function handleAuthLinkClick(e) { e.preventDefault(); showLoginForm(); }
function handleLogoutClick(e) { e.preventDefault(); localStorage.removeItem('portfolioUser'); alert('Logged out successfully!'); updateUserLoginState(); closeAuthForms(); }

async function handleRegisterSubmit(e) {
    e.preventDefault(); if (!registerForm || !registerMessageEl) return;
    const username = registerForm.username.value;
    const password = registerForm.password.value;
    const email = registerForm.email.value; // Get email
    displayAuthMessage(registerMessageEl, 'Registering...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) }); // Send email
        const data = await response.json(); if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
        displayAuthMessage(registerMessageEl, data.message, false); registerForm.reset(); setTimeout(() => { showLoginForm(); }, 1500);
    } catch (error) { console.error('Registration fetch error:', error); displayAuthMessage(registerMessageEl, error.message || 'Registration failed.', true); }
}
async function handleLoginSubmit(e) {
    e.preventDefault(); if (!loginForm || !loginMessageEl) return;
    const username = loginForm.username.value; const password = loginForm.password.value; displayAuthMessage(loginMessageEl, 'Logging in...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
        displayAuthMessage(loginMessageEl, data.message, false); localStorage.setItem('portfolioUser', JSON.stringify({ userId: data.userId, username: data.username })); loginForm.reset(); setTimeout(() => { closeAuthForms(); updateUserLoginState(); }, 1000);
    } catch (error) { console.error('Login fetch error:', error); displayAuthMessage(loginMessageEl, error.message || 'Login failed.', true); localStorage.removeItem('portfolioUser'); updateUserLoginState(); }
}
async function handleForgotSubmit(e) {
    e.preventDefault(); if (!forgotForm || !forgotMessageEl) return;
    const email = forgotForm.email.value; // Use email field now
    displayAuthMessage(forgotMessageEl, 'Sending reset link...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); // Send email
        const data = await response.json(); displayAuthMessage(forgotMessageEl, data.message, !response.ok); if (response.ok) { forgotForm.reset(); }
    } catch (error) { console.error('Forgot Password fetch error:', error); displayAuthMessage(forgotMessageEl, 'Failed to send request. Please try again.', true); }
}
async function handleResetSubmit(e) {
    e.preventDefault(); if (!resetForm || !resetMessageEl) return;
    const token = resetForm.token.value; const password = resetForm.password.value; displayAuthMessage(resetMessageEl, 'Resetting password...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
        displayAuthMessage(resetMessageEl, data.message, false); resetForm.reset(); setTimeout(() => { showLoginForm(); }, 2000);
    } catch (error) { console.error('Reset Password fetch error:', error); displayAuthMessage(resetMessageEl, error.message || 'Password reset failed.', true); }
}

function setupActionButtons() {
     const donateLink = document.querySelector('.nav-link[href="#donate"]'); authLink = document.querySelector('.nav-link.auth-link');
     if(donateLink) { donateLink.addEventListener('click', (e) => { e.preventDefault(); alert('Chức năng Donate đang được phát triển!'); }); }
     authContainer = document.getElementById('auth-container'); loginFormWrapper = document.getElementById('login-form-wrapper'); registerFormWrapper = document.getElementById('register-form-wrapper'); forgotFormWrapper = document.getElementById('forgot-form-wrapper'); resetFormWrapper = document.getElementById('reset-form-wrapper'); loginForm = document.getElementById('login-form'); registerForm = document.getElementById('register-form'); forgotForm = document.getElementById('forgot-form'); resetForm = document.getElementById('reset-form'); loginMessageEl = document.getElementById('login-message'); registerMessageEl = document.getElementById('register-message'); forgotMessageEl = document.getElementById('forgot-message'); resetMessageEl = document.getElementById('reset-message');
     if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit); else console.error("Login form not found");
     if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit); else console.error("Register form not found");
     if (forgotForm) forgotForm.addEventListener('submit', handleForgotSubmit); else console.error("Forgot Password form not found");
     if (resetForm) resetForm.addEventListener('submit', handleResetSubmit); else console.error("Reset Password form not found");
     updateUserLoginState(); // Set initial link state
     if(authContainer) { authContainer.addEventListener('click', (e) => { if (e.target === authContainer) { closeAuthForms(); } }); }

     // Basic URL token handling (enhancements needed for SPA)
     const urlParams = new URLSearchParams(window.location.search);
     const resetTokenFromUrl = urlParams.get('token');
     if (resetTokenFromUrl && resetForm) {
        console.log("Found reset token in URL:", resetTokenFromUrl);
        showResetForm(); // Show the form
        const tokenInput = document.getElementById('reset-token');
        if(tokenInput) tokenInput.value = resetTokenFromUrl;
        window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
     }
}

// ----- Initialization -----
function initializePage() {
    const ageSpan = document.getElementById('age'); if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    updateYear(); setupHeaderScroll(); setupProfessionalAnimations(); setupAdminPanel(); setupActionButtons();
}
document.addEventListener('DOMContentLoaded', initializePage);