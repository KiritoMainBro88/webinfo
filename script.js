// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); /*const sidebarYear=document.getElementById('sidebar-year');*/ if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } /*if(sidebarYear){sidebarYear.textContent = new Date().getFullYear();}*/ }

// --- Header Scroll Effect (Not really needed with sticky sidebar/fixed content header) ---
// function setupHeaderScroll() { ... } // Can be removed or left commented

// --- GSAP Animations (Target elements within .site-main) ---
function setupProfessionalAnimations() {
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    // Find elements within the main content area now
    const mainContent = document.querySelector('.site-main');
    if (!mainContent) return; // Exit if main content area isn't found

    const heroTitle = mainContent.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = mainContent.querySelector(".hero-subtitle[data-animate='fade-up']");
    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }

    gsap.utils.toArray(mainContent.querySelectorAll('[data-animate]:not(.hero-title):not(.hero-subtitle)')).forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0; let staggerAmount = parseFloat(element.dataset.stagger) || 0; const animType = element.dataset.animate; let animProps = { duration: 0.6, ease: "power2.out", delay: delay, clearProps: "opacity,transform" }; if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; } let target = element; if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline')) { if (element.children.length > 0) { target = element.children; if (staggerAmount === 0 && target !== element) staggerAmount = 0.08; if (staggerAmount > 0) animProps.stagger = staggerAmount; } } if (target === element && animProps.stagger) delete animProps.stagger;
        gsap.from(target, { ...animProps, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true, scroller: ".main-content-area" } }); // IMPORTANT: Define scroller if needed
    });
    gsap.utils.toArray(mainContent.querySelectorAll('.content-row .image-card')).forEach(card => { gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9, scroller: ".main-content-area" } }); }); // IMPORTANT: Define scroller
    document.querySelectorAll('.cta-button, .sidebar-link, .social-button, .auth-dropdown').forEach(button => { button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.97, duration: 0.1 })); button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 })); button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 })); });
}

// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing Admin Panel code) ... */ }

// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // YOUR RENDER URL HERE

let authContainer = null, loginFormWrapper = null, registerFormWrapper = null, forgotFormWrapper = null, resetFormWrapper = null;
let loginForm = null, registerForm = null, forgotForm = null, resetForm = null;
let loginMessageEl = null, registerMessageEl = null, forgotMessageEl = null, resetMessageEl = null;
let authLink = null; // Now refers to the link inside the dropdown
let userStatusEl = null; // Span containing guest icon/username
let userNameEl = null;   // Span for the actual name
let userAvatarEl = null; // Avatar image
let profileLinkEl = null; // Link to profile (optional)
let guestIconEl = null; // Guest icon element


function showLoginForm() { /* ... (keep existing) ... */ }
function showRegisterForm() { /* ... (keep existing) ... */ }
function showForgotForm() { /* ... (keep existing) ... */ }
function showResetForm() { /* ... (keep existing) ... */ }
function closeAuthForms() { /* ... (keep existing) ... */ }
function displayAuthMessage(element, message, isError = false) { /* ... (keep existing) ... */ }

// --- MODIFIED: Update UI for new layout ---
function updateUserLoginState() {
    const user = localStorage.getItem('portfolioUser');
    // Target new elements
    authLink = document.getElementById('auth-action-link'); // Link in dropdown
    userStatusEl = document.getElementById('user-status');
    userNameEl = document.getElementById('user-name');
    userAvatarEl = document.getElementById('user-avatar');
    profileLinkEl = document.getElementById('profile-link');
    guestIconEl = userStatusEl?.querySelector('.guest-icon'); // Find guest icon within status

    if (!authLink || !userStatusEl || !userNameEl || !userAvatarEl || !profileLinkEl || !guestIconEl) {
        console.error("Auth UI elements not found!");
        return;
    }

    // Clean up previous listeners to avoid duplicates
    authLink.removeEventListener('click', handleAuthLinkClick);
    authLink.removeEventListener('click', handleLogoutClick);

    if (user) {
        try {
            const userData = JSON.parse(user);
            userNameEl.textContent = userData.username;    // Show username
            userAvatarEl.style.display = 'inline-block';   // Show avatar
            guestIconEl.style.display = 'none';           // Hide guest icon
            authLink.textContent = 'Đăng Xuất';             // Change link text
            authLink.addEventListener('click', handleLogoutClick); // Add logout listener
            profileLinkEl.style.display = 'block';        // Show profile link
        } catch (e) {
             // Invalid data, treat as logged out
             localStorage.removeItem('portfolioUser');
             userNameEl.textContent = 'Khách';
             userAvatarEl.style.display = 'none';
             guestIconEl.style.display = 'inline-block';
             authLink.textContent = 'Đăng Nhập / Đăng Ký';
             authLink.addEventListener('click', handleAuthLinkClick);
             profileLinkEl.style.display = 'none';
        }
    } else {
        // Logged out state
        userNameEl.textContent = 'Khách';
        userAvatarEl.style.display = 'none';           // Hide avatar
        guestIconEl.style.display = 'inline-block';    // Show guest icon
        authLink.textContent = 'Đăng Nhập / Đăng Ký';
        authLink.addEventListener('click', handleAuthLinkClick); // Add login listener
        profileLinkEl.style.display = 'none';          // Hide profile link
    }
}

// --- Event Handlers ---
function handleAuthLinkClick(e) { e.preventDefault(); showLoginForm(); } // Still show login form first
function handleLogoutClick(e) { e.preventDefault(); localStorage.removeItem('portfolioUser'); alert('Đăng xuất thành công!'); updateUserLoginState(); closeAuthForms(); }
async function handleRegisterSubmit(e) { /* ... (Keep existing - check confirm password) ... */
    e.preventDefault(); if (!registerForm || !registerMessageEl) return;
    const username = registerForm.username.value; const password = registerForm.password.value; const email = registerForm.email.value; const confirmPassword = registerForm.confirmPassword.value;
    if (password !== confirmPassword) { displayAuthMessage(registerMessageEl, 'Mật khẩu nhập lại không khớp.', true); return; }
    displayAuthMessage(registerMessageEl, 'Đang đăng ký...', false);
    try { const response = await fetch(`${BACKEND_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`); displayAuthMessage(registerMessageEl, data.message, false); registerForm.reset(); setTimeout(() => { showLoginForm(); }, 1500); } catch (error) { console.error('Registration fetch error:', error); displayAuthMessage(registerMessageEl, error.message || 'Đăng ký thất bại.', true); }
}
async function handleLoginSubmit(e) { /* ... (Keep existing) ... */ }
async function handleForgotSubmit(e) { /* ... (Keep existing) ... */ }
async function handleResetSubmit(e) { /* ... (Keep existing - check confirm password) ... */
    e.preventDefault(); if (!resetForm || !resetMessageEl) return;
    const token = resetForm.token.value; const password = resetForm.password.value; const confirmPassword = resetForm.confirmPassword.value;
    if (password !== confirmPassword) { displayAuthMessage(resetMessageEl, 'Mật khẩu nhập lại không khớp.', true); return; }
    displayAuthMessage(resetMessageEl, 'Đang đặt lại mật khẩu...', false);
    try { const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`); displayAuthMessage(resetMessageEl, data.message, false); resetForm.reset(); setTimeout(() => { showLoginForm(); }, 2000); } catch (error) { console.error('Reset Password fetch error:', error); displayAuthMessage(resetMessageEl, error.message || 'Đặt lại mật khẩu thất bại.', true); }
}

// --- Setup Action Buttons (incl. Auth for new layout) ---
function setupActionButtons() {
     const donateLink = document.querySelector('.sidebar-link.donate-link'); // Target donate link in sidebar
     authLink = document.getElementById('auth-action-link'); // Target the link inside the dropdown

     if(donateLink) { donateLink.addEventListener('click', (e) => { e.preventDefault(); alert('Chức năng Donate đang được phát triển!'); }); }

     // Get references to auth elements
     authContainer = document.getElementById('auth-container'); loginFormWrapper = document.getElementById('login-form-wrapper'); registerFormWrapper = document.getElementById('register-form-wrapper'); forgotFormWrapper = document.getElementById('forgot-form-wrapper'); resetFormWrapper = document.getElementById('reset-form-wrapper'); loginForm = document.getElementById('login-form'); registerForm = document.getElementById('register-form'); forgotForm = document.getElementById('forgot-form'); resetForm = document.getElementById('reset-form'); loginMessageEl = document.getElementById('login-message'); registerMessageEl = document.getElementById('register-message'); forgotMessageEl = document.getElementById('forgot-message'); resetMessageEl = document.getElementById('reset-message'); userStatusEl = document.getElementById('user-status'); userNameEl = document.getElementById('user-name'); userAvatarEl = document.getElementById('user-avatar'); profileLinkEl = document.getElementById('profile-link'); guestIconEl = userStatusEl?.querySelector('.guest-icon');

    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit); else console.error("Login form not found");
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit); else console.error("Register form not found");
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotSubmit); else console.error("Forgot Password form not found");
    if (resetForm) resetForm.addEventListener('submit', handleResetSubmit); else console.error("Reset Password form not found");

    updateUserLoginState(); // Set initial link state & listeners
    if(authContainer) { authContainer.addEventListener('click', (e) => { if (e.target === authContainer) { closeAuthForms(); } }); }

    // Handle token in URL on page load
    const urlParams = new URLSearchParams(window.location.search); const resetTokenFromUrl = urlParams.get('token');
    if (resetTokenFromUrl && resetFormWrapper) { // Check wrapper exists
        console.log("Found reset token in URL:", resetTokenFromUrl); showResetForm(); const tokenInput = document.getElementById('reset-token');
        if(tokenInput) tokenInput.value = resetTokenFromUrl; window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// ----- Initialization -----
function initializePage() {
    const ageSpan = document.getElementById('age'); if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    updateYear();
    // setupHeaderScroll(); // Remove or comment out if not needed
    setupProfessionalAnimations();
    setupAdminPanel();
    setupActionButtons(); // Sets up auth listeners and initial state
}
document.addEventListener('DOMContentLoaded', initializePage);