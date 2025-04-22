// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Sidebar Toggle ---
function setupSidebarToggle() {
    const toggleButton = document.getElementById('sidebar-toggle');
    const body = document.body;
    // const sidebar = document.getElementById('app-sidebar'); // Not directly needed if using body class

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('sidebar-collapsed');
            body.classList.add('sidebar-manual-toggle'); // Indicate user action
            // Optional: Save state in localStorage
            // localStorage.setItem('sidebarCollapsed', body.classList.contains('sidebar-collapsed'));
            // Optional: Recalculate ScrollTrigger positions if needed
            // ScrollTrigger.refresh();
        });
    }

    // Optional: Check localStorage on load
    // if (localStorage.getItem('sidebarCollapsed') === 'true') {
    //     body.classList.add('sidebar-collapsed');
    // }
}

// --- User Dropdown Toggle ---
function setupUserDropdown() {
    const trigger = document.getElementById('user-area-trigger');
    const dropdown = document.getElementById('user-dropdown');
    const userArea = document.querySelector('.user-area'); // For styling chevron

    if (trigger && dropdown && userArea) {
        trigger.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from immediately closing dropdown
            dropdown.classList.toggle('visible');
            userArea.classList.toggle('open'); // Toggle class for chevron rotation
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!trigger.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('visible');
                userArea.classList.remove('open');
            }
        });
    }
}

// --- Theme Toggle (Placeholder) ---
function setupThemeToggle() {
    const themeButton = document.getElementById('theme-toggle');
    const themeIcon = themeButton?.querySelector('i'); // Get icon inside button

    if (themeButton && themeIcon) {
        themeButton.addEventListener('click', () => {
            document.body.classList.toggle('light-theme'); // Need to define .light-theme styles
            document.body.classList.toggle('dark-theme');

            // Toggle icon
            if (document.body.classList.contains('light-theme')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                // Optional: localStorage.setItem('theme', 'light');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                 // Optional: localStorage.setItem('theme', 'dark');
            }
            console.log("Theme toggled");
        });

         // Optional: Check localStorage on load
         // const savedTheme = localStorage.getItem('theme');
         // if (savedTheme === 'light') {
         //    document.body.classList.remove('dark-theme');
         //    document.body.classList.add('light-theme');
         //    themeIcon.classList.remove('fa-moon');
         //    themeIcon.classList.add('fa-sun');
         // }
    }
}

// --- Language Toggle (Placeholder) ---
function setupLanguageToggle() {
     const langButton = document.getElementById('language-toggle');
     if(langButton) {
        langButton.addEventListener('click', () => {
            alert('Language switching coming soon!');
            console.log('Language toggle clicked');
        });
     }
}


// --- GSAP Animations (Adjust scroller) ---
function setupProfessionalAnimations() {
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const mainContent = document.querySelector('.main-content-area'); // Main scrollable area
    if (!mainContent) return;

    const heroTitle = mainContent.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = mainContent.querySelector(".hero-subtitle[data-animate='fade-up']");
    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }

    gsap.utils.toArray(mainContent.querySelectorAll('[data-animate]:not(.hero-title):not(.hero-subtitle)')).forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0; let staggerAmount = parseFloat(element.dataset.stagger) || 0; const animType = element.dataset.animate; let animProps = { duration: 0.6, ease: "power2.out", delay: delay, clearProps: "opacity,transform" }; if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; } let target = element; if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline')) { if (element.children.length > 0) { target = element.children; if (staggerAmount === 0 && target !== element) staggerAmount = 0.08; if (staggerAmount > 0) animProps.stagger = staggerAmount; } } if (target === element && animProps.stagger) delete animProps.stagger;
        gsap.from(target, { ...animProps, scrollTrigger: {
            trigger: element,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
            scroller: mainContent // *** Define the scroll container ***
        }});
    });
    gsap.utils.toArray(mainContent.querySelectorAll('.content-row .image-card')).forEach(card => { gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: {
        trigger: card.closest('.content-row'),
        start: "top bottom", end: "bottom top",
        scrub: 1.9,
        scroller: mainContent // *** Define the scroll container ***
    }}); });
    // Microinteractions - include new buttons
    document.querySelectorAll('.cta-button, .sidebar-link, .social-button, .icon-button, .user-dropdown-content a').forEach(button => { button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.97, duration: 0.1 })); button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 })); button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 })); });
}

// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing Admin Panel code) ... */ }

// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // YOUR RENDER URL HERE

let authContainer = null, loginFormWrapper = null, registerFormWrapper = null, forgotFormWrapper = null, resetFormWrapper = null;
let loginForm = null, registerForm = null, forgotForm = null, resetForm = null;
let loginMessageEl = null, registerMessageEl = null, forgotMessageEl = null, resetMessageEl = null;
// Auth links are now inside the dropdown
let loginActionLink = null;
let registerActionLink = null;
let forgotActionLink = null;
let logoutActionLink = null;
// User display elements
let userStatusEl = null, userNameEl = null, userAvatarEl = null, profileLinkEl = null;


function showLoginForm() { /* ... */ }
function showRegisterForm() { /* ... */ }
function showForgotForm() { /* ... */ }
function showResetForm() { /* ... */ }
function closeAuthForms() { /* ... */ }
function displayAuthMessage(element, message, isError = false) { /* ... */ }

// --- MODIFIED: Update UI for new layout (handles dropdown links) ---
function updateUserLoginState() {
    const user = localStorage.getItem('portfolioUser');
    // Target elements in the new structure
    userStatusEl = document.getElementById('user-status');
    userNameEl = document.getElementById('user-name');
    userAvatarEl = document.getElementById('user-avatar');
    // profileLinkEl = document.getElementById('profile-link'); // Enable if needed
    loginActionLink = document.getElementById('auth-action-link');
    registerActionLink = document.getElementById('register-action-link');
    forgotActionLink = document.getElementById('forgot-action-link');
    logoutActionLink = document.getElementById('logout-link');

    if (!userNameEl || !userAvatarEl || !loginActionLink || !registerActionLink || !forgotActionLink || !logoutActionLink) {
        console.error("Auth UI elements not found!");
        return;
    }

    // Remove all potential listeners first to prevent duplicates
    loginActionLink.removeEventListener('click', handleAuthLinkClick);
    registerActionLink.removeEventListener('click', handleRegisterLinkClick);
    forgotActionLink.removeEventListener('click', handleForgotLinkClick);
    logoutActionLink.removeEventListener('click', handleLogoutClick);

    if (user) {
        try {
            const userData = JSON.parse(user);
            userNameEl.textContent = userData.username;
            userAvatarEl.style.display = 'inline-block';
            // Hide irrelevant links
            loginActionLink.style.display = 'none';
            registerActionLink.style.display = 'none';
            forgotActionLink.style.display = 'none';
            // Show relevant links
            logoutActionLink.style.display = 'flex'; // Use flex for icon alignment
            // if (profileLinkEl) profileLinkEl.style.display = 'block';
            // Add logout listener
            logoutActionLink.addEventListener('click', handleLogoutClick);
        } catch (e) {
             localStorage.removeItem('portfolioUser');
             // Force logged out state
             userNameEl.textContent = 'Khách';
             userAvatarEl.style.display = 'none';
             loginActionLink.style.display = 'flex';
             registerActionLink.style.display = 'flex';
             forgotActionLink.style.display = 'flex';
             logoutActionLink.style.display = 'none';
             // if (profileLinkEl) profileLinkEl.style.display = 'none';
             loginActionLink.addEventListener('click', handleAuthLinkClick);
             registerActionLink.addEventListener('click', handleRegisterLinkClick);
             forgotActionLink.addEventListener('click', handleForgotLinkClick);
        }
    } else {
        // Logged out state
        userNameEl.textContent = 'Khách';
        userAvatarEl.style.display = 'none';
        loginActionLink.style.display = 'flex';
        registerActionLink.style.display = 'flex';
        forgotActionLink.style.display = 'flex';
        logoutActionLink.style.display = 'none';
        // if (profileLinkEl) profileLinkEl.style.display = 'none';
        // Add listeners for auth actions
        loginActionLink.addEventListener('click', handleAuthLinkClick);
        registerActionLink.addEventListener('click', handleRegisterLinkClick);
        forgotActionLink.addEventListener('click', handleForgotLinkClick);
    }
    // Close dropdown after action potentially changes state
    document.getElementById('user-dropdown')?.classList.remove('visible');
    document.querySelector('.user-area')?.classList.remove('open');
}

// --- Event Handlers (Updated for new links/forms) ---
function handleAuthLinkClick(e) { e.preventDefault(); showLoginForm(); }
function handleRegisterLinkClick(e) { e.preventDefault(); showRegisterForm(); } // New handler
function handleForgotLinkClick(e) { e.preventDefault(); showForgotForm(); } // New handler
function handleLogoutClick(e) { /* ... (keep existing) ... */ }
async function handleRegisterSubmit(e) { /* ... (keep existing - with confirm password check) ... */ }
async function handleLoginSubmit(e) { /* ... (keep existing) ... */ }
async function handleForgotSubmit(e) { /* ... (keep existing) ... */ }
async function handleResetSubmit(e) { /* ... (keep existing - with confirm password check) ... */ }

// --- Setup Action Buttons (Handles Auth Forms and Token) ---
function setupActionButtons() {
    const donateLink = document.querySelector('.sidebar-link.donate-link');
    if(donateLink) { donateLink.addEventListener('click', (e) => { e.preventDefault(); alert('Chức năng Donate đang được phát triển!'); }); }

    // Get references to auth form elements
    authContainer = document.getElementById('auth-container'); loginFormWrapper = document.getElementById('login-form-wrapper'); registerFormWrapper = document.getElementById('register-form-wrapper'); forgotFormWrapper = document.getElementById('forgot-form-wrapper'); resetFormWrapper = document.getElementById('reset-form-wrapper'); loginForm = document.getElementById('login-form'); registerForm = document.getElementById('register-form'); forgotForm = document.getElementById('forgot-form'); resetForm = document.getElementById('reset-form'); loginMessageEl = document.getElementById('login-message'); registerMessageEl = document.getElementById('register-message'); forgotMessageEl = document.getElementById('forgot-message'); resetMessageEl = document.getElementById('reset-message');

    // Attach submit listeners
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit); else console.error("Login form not found");
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit); else console.error("Register form not found");
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotSubmit); else console.error("Forgot Password form not found");
    if (resetForm) resetForm.addEventListener('submit', handleResetSubmit); else console.error("Reset Password form not found");

    // Set initial state of the user area and dropdown links
    updateUserLoginState();

    // Listener to close modal
    if(authContainer) { authContainer.addEventListener('click', (e) => { if (e.target === authContainer) { closeAuthForms(); } }); }

    // Handle token in URL on page load
    const urlParams = new URLSearchParams(window.location.search); const resetTokenFromUrl = urlParams.get('token');
    if (resetTokenFromUrl && resetFormWrapper) { console.log("Found reset token in URL:", resetTokenFromUrl); showResetForm(); const tokenInput = document.getElementById('reset-token'); if(tokenInput) tokenInput.value = resetTokenFromUrl; window.history.replaceState({}, document.title, window.location.pathname); }
}

// ----- Initialization -----
function initializePage() {
    updateYear();
    // setupHeaderScroll(); // Not needed now
    setupSidebarToggle(); // Add this
    setupUserDropdown();  // Add this
    setupThemeToggle();   // Add this
    setupLanguageToggle();// Add this
    setupProfessionalAnimations();
    setupAdminPanel();
    setupActionButtons(); // Sets up auth listeners and initial state
}
document.addEventListener('DOMContentLoaded', initializePage);