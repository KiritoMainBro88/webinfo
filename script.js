// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Sidebar Toggle ---
function setupSidebarToggle() {
    const toggleButtons = document.querySelectorAll('.sidebar-toggle-btn'); // Select both buttons
    const body = document.body;

    // Function to toggle sidebar state
    const toggleSidebar = () => {
        body.classList.toggle('sidebar-collapsed');
        body.classList.add('sidebar-manual-toggle'); // Mark that the user interacted
        // Optional: Save state in localStorage
        // localStorage.setItem('sidebarCollapsed', body.classList.contains('sidebar-collapsed'));
        // Recalculate ScrollTrigger positions after layout shift
        ScrollTrigger.refresh(); // Important for animations
    };

    toggleButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', toggleSidebar);
        }
    });

    // Optional: Load saved state (uncomment if using localStorage)
    // if (localStorage.getItem('sidebarCollapsed') === 'true') {
    //    body.classList.add('sidebar-collapsed');
    // } else {
    //    body.classList.remove('sidebar-collapsed'); // Ensure default is expanded if nothing saved
    // }
    // Add initial class if starting collapsed is desired
    // body.classList.add('sidebar-collapsed');
}


// --- User Dropdown Toggle ---
function setupUserDropdown() {
    const trigger = document.getElementById('user-area-trigger');
    const dropdown = document.getElementById('user-dropdown');
    const userArea = document.querySelector('.user-area');

    if (trigger && dropdown && userArea) {
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdown.classList.toggle('visible');
            userArea.classList.toggle('open');
        });
        document.addEventListener('click', (event) => {
            if (!trigger.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('visible');
                userArea.classList.remove('open');
            }
        });
        // Close dropdown when a link inside it is clicked
        dropdown.addEventListener('click', (event) => {
             if (event.target.tagName === 'A') {
                 dropdown.classList.remove('visible');
                 userArea.classList.remove('open');
             }
         });
    }
}

// --- Theme Toggle ---
function setupThemeToggle() {
    const themeButton = document.getElementById('theme-toggle');
    const themeIcon = themeButton?.querySelector('i');

    if (themeButton && themeIcon) {
         const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
         if (currentTheme === 'light') {
             document.body.classList.add('light-theme');
             document.body.classList.remove('dark-theme');
             themeIcon.classList.remove('fa-moon');
             themeIcon.classList.add('fa-sun');
         } else {
             document.body.classList.add('dark-theme');
             document.body.classList.remove('light-theme');
             themeIcon.classList.remove('fa-sun');
             themeIcon.classList.add('fa-moon');
         }

        themeButton.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            if (isDark) {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'dark');
            }
            console.log("Theme toggled");
        });
    }
}

// --- Language Toggle (Placeholder) ---
function setupLanguageToggle() {
     const langButton = document.getElementById('language-toggle');
     if(langButton) { langButton.addEventListener('click', () => { alert('Language switching coming soon!'); }); }
}


// --- GSAP Animations (Define scroller) ---
function setupProfessionalAnimations() {
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const mainContent = document.querySelector('.main-content-area');
    if (!mainContent) return;

    const heroTitle = mainContent.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = mainContent.querySelector(".hero-subtitle[data-animate='fade-up']");
    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }

    gsap.utils.toArray(mainContent.querySelectorAll('[data-animate]:not(.hero-title):not(.hero-subtitle)')).forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0; let staggerAmount = parseFloat(element.dataset.stagger) || 0; const animType = element.dataset.animate; let animProps = { duration: 0.6, ease: "power2.out", delay: delay, clearProps: "opacity,transform" }; if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; } let target = element; if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline')) { if (element.children.length > 0) { target = element.children; if (staggerAmount === 0 && target !== element) staggerAmount = 0.08; if (staggerAmount > 0) animProps.stagger = staggerAmount; } } if (target === element && animProps.stagger) delete animProps.stagger;
        gsap.from(target, { ...animProps, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true, scroller: mainContent } }); // *** Use mainContent as scroller ***
    });
    gsap.utils.toArray(mainContent.querySelectorAll('.content-row .image-card')).forEach(card => { gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9, scroller: mainContent } }); }); // *** Use mainContent as scroller ***
    // Microinteractions
    document.querySelectorAll('.cta-button, .sidebar-link, .social-button, .icon-button, .user-dropdown-content a').forEach(button => { button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.97, duration: 0.1 })); button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 })); button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 })); });
}

// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing Admin Panel code) ... */ }

// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // YOUR RENDER URL HERE

let authContainer = null, loginFormWrapper = null, registerFormWrapper = null, forgotFormWrapper = null, resetFormWrapper = null;
let loginForm = null, registerForm = null, forgotForm = null, resetForm = null;
let loginMessageEl = null, registerMessageEl = null, forgotMessageEl = null, resetMessageEl = null;
// Dropdown action links
let loginActionLink = null, registerActionLink = null, forgotActionLink = null, logoutActionLink = null;
// User display elements
let userStatusEl = null, userNameEl = null, userAvatarEl = null;

function showLoginForm() { if (registerFormWrapper) registerFormWrapper.style.display = 'none'; if (forgotFormWrapper) forgotFormWrapper.style.display = 'none'; if (resetFormWrapper) resetFormWrapper.style.display = 'none'; if (loginFormWrapper) loginFormWrapper.style.display = 'block'; if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = ''; if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); } }
function showRegisterForm() { if (loginFormWrapper) loginFormWrapper.style.display = 'none'; if (forgotFormWrapper) forgotFormWrapper.style.display = 'none'; if (resetFormWrapper) resetFormWrapper.style.display = 'none'; if (registerFormWrapper) registerFormWrapper.style.display = 'block'; if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = ''; if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); } }
function showForgotForm() { if (loginFormWrapper) loginFormWrapper.style.display = 'none'; if (registerFormWrapper) registerFormWrapper.style.display = 'none'; if (resetFormWrapper) resetFormWrapper.style.display = 'none'; if (forgotFormWrapper) forgotFormWrapper.style.display = 'block'; if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = ''; if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); } }
function showResetForm() { if (loginFormWrapper) loginFormWrapper.style.display = 'none'; if (registerFormWrapper) registerFormWrapper.style.display = 'none'; if (forgotFormWrapper) forgotFormWrapper.style.display = 'none'; if (resetFormWrapper) resetFormWrapper.style.display = 'block'; if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = ''; if (authContainer && !authContainer.classList.contains('visible')) { authContainer.style.display = 'flex'; setTimeout(() => { authContainer.classList.add('visible'); }, 10); } }
function closeAuthForms() { if (authContainer) { authContainer.classList.remove('visible'); setTimeout(() => { if (!authContainer.classList.contains('visible')) { authContainer.style.display = 'none'; } }, 300); } if (loginMessageEl) loginMessageEl.textContent = ''; if (registerMessageEl) registerMessageEl.textContent = ''; if (forgotMessageEl) forgotMessageEl.textContent = ''; if (resetMessageEl) resetMessageEl.textContent = ''; }
function displayAuthMessage(element, message, isError = false) { if (!element) return; element.textContent = message; element.className = 'auth-message'; element.classList.add(isError ? 'error' : 'success'); }

// Update UI for new dropdown structure
function updateUserLoginState() {
    const user = localStorage.getItem('portfolioUser');
    userStatusEl = document.getElementById('user-status'); userNameEl = document.getElementById('user-name'); userAvatarEl = document.getElementById('user-avatar');
    loginActionLink = document.getElementById('auth-action-link'); registerActionLink = document.getElementById('register-action-link'); forgotActionLink = document.getElementById('forgot-action-link'); logoutActionLink = document.getElementById('logout-link');
    // profileLinkEl = document.getElementById('profile-link'); // Add back if needed

    if (!userNameEl || !userAvatarEl || !loginActionLink || !registerActionLink || !forgotActionLink || !logoutActionLink) { console.error("Auth UI elements not found!"); return; }

    // Remove all listeners first
    loginActionLink.removeEventListener('click', handleAuthLinkClick); registerActionLink.removeEventListener('click', handleRegisterLinkClick); forgotActionLink.removeEventListener('click', handleForgotLinkClick); logoutActionLink.removeEventListener('click', handleLogoutClick);

    if (user) {
        try {
            const userData = JSON.parse(user);
            userNameEl.textContent = userData.username; userAvatarEl.style.display = 'inline-block'; // Show avatar
            loginActionLink.style.display = 'none'; registerActionLink.style.display = 'none'; forgotActionLink.style.display = 'none';
            logoutActionLink.style.display = 'flex'; // Use flex for icon alignment
            // if (profileLinkEl) profileLinkEl.style.display = 'flex';
            logoutActionLink.addEventListener('click', handleLogoutClick); // Add logout listener
        } catch (e) { localStorage.removeItem('portfolioUser'); // Force logged out state on error
            userNameEl.textContent = 'Khách'; userAvatarEl.style.display = 'inline-block'; // Keep avatar visible maybe? Or hide: userAvatarEl.style.display = 'none';
            loginActionLink.style.display = 'flex'; registerActionLink.style.display = 'flex'; forgotActionLink.style.display = 'flex'; logoutActionLink.style.display = 'none';
            // if (profileLinkEl) profileLinkEl.style.display = 'none';
            loginActionLink.addEventListener('click', handleAuthLinkClick); registerActionLink.addEventListener('click', handleRegisterLinkClick); forgotActionLink.addEventListener('click', handleForgotLinkClick); }
    } else {
        userNameEl.textContent = 'Khách'; userAvatarEl.style.display = 'inline-block'; // Keep avatar frame visible? Or hide: userAvatarEl.style.display = 'none';
        loginActionLink.style.display = 'flex'; registerActionLink.style.display = 'flex'; forgotActionLink.style.display = 'flex'; logoutActionLink.style.display = 'none';
        // if (profileLinkEl) profileLinkEl.style.display = 'none';
        loginActionLink.addEventListener('click', handleAuthLinkClick); registerActionLink.addEventListener('click', handleRegisterLinkClick); forgotActionLink.addEventListener('click', handleForgotLinkClick);
    }
}

// Event Handlers (Updated for new links/forms)
function handleAuthLinkClick(e) { e.preventDefault(); showLoginForm(); }
function handleRegisterLinkClick(e) { e.preventDefault(); showRegisterForm(); }
function handleForgotLinkClick(e) { e.preventDefault(); showForgotForm(); }
function handleLogoutClick(e) { e.preventDefault(); localStorage.removeItem('portfolioUser'); alert('Đăng xuất thành công!'); updateUserLoginState(); closeAuthForms(); }
async function handleRegisterSubmit(e) { /* ... (keep existing with confirm password check) ... */ }
async function handleLoginSubmit(e) { /* ... (keep existing) ... */ }
async function handleForgotSubmit(e) { /* ... (keep existing) ... */ }
async function handleResetSubmit(e) { /* ... (keep existing with confirm password check) ... */ }

// Setup Action Buttons (incl. Auth for new layout)
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

    // Listener to close modal on background click
    if(authContainer) { authContainer.addEventListener('click', (e) => { if (e.target === authContainer) { closeAuthForms(); } }); }

    // Handle token in URL on page load (no changes needed here)
    const urlParams = new URLSearchParams(window.location.search); const resetTokenFromUrl = urlParams.get('token'); if (resetTokenFromUrl && resetFormWrapper) { console.log("Found reset token in URL:", resetTokenFromUrl); showResetForm(); const tokenInput = document.getElementById('reset-token'); if(tokenInput) tokenInput.value = resetTokenFromUrl; window.history.replaceState({}, document.title, window.location.pathname); }
}

// ----- Initialization -----
function initializePage() {
    updateYear();
    setupSidebarToggle(); // Add this
    setupUserDropdown();  // Add this
    setupThemeToggle();   // Add this
    setupLanguageToggle();// Add this
    setupProfessionalAnimations();
    setupAdminPanel();
    setupActionButtons(); // Sets up auth listeners and initial state

    // Initial age calculation (ensure element exists)
    const ageSpan = document.getElementById('age');
    if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    else { console.warn("Age span element not found in the current HTML structure.")}
}
document.addEventListener('DOMContentLoaded', initializePage);