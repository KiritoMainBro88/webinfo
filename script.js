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
        const isCollapsed = body.classList.contains('sidebar-collapsed');
        if (isCollapsed) {
            body.classList.remove('sidebar-collapsed');
            body.classList.add('sidebar-expanded'); // Use a class for expanded state
        } else {
            body.classList.add('sidebar-collapsed');
            body.classList.remove('sidebar-expanded');
        }
        body.classList.add('sidebar-manual-toggle'); // Mark that the user interacted
        // Optional: Save state in localStorage
        // localStorage.setItem('sidebarState', body.classList.contains('sidebar-collapsed') ? 'collapsed' : 'expanded');
        // Recalculate ScrollTrigger positions after layout shift
        ScrollTrigger.refresh(); // Important for animations
    };

    toggleButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', toggleSidebar);
        }
    });
}


// --- User Dropdown Toggle ---
function setupUserDropdown() {
    const trigger = document.getElementById('user-area-trigger');
    const dropdown = document.getElementById('user-dropdown');
    const userArea = document.querySelector('.user-area');

    if (trigger && dropdown && userArea) {
        trigger.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from closing immediately
            dropdown.classList.toggle('visible');
            userArea.classList.toggle('open');
        });
        // Close dropdown when clicking outside
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
         } else { // Handles 'dark' or null/undefined initial state
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
            // Optional: Refresh ScrollTrigger if theme change affects layout/colors significantly
            // ScrollTrigger.refresh();
        });
    }
}

// --- Language Toggle (Placeholder) ---
function setupLanguageToggle() {
     const langButton = document.getElementById('language-toggle');
     if(langButton) {
         langButton.addEventListener('click', () => {
             alert('Language switching coming soon!');
         });
     }
}


// --- GSAP Animations (Define scroller) ---
function setupProfessionalAnimations() {
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const mainContent = document.getElementById('main-content'); // *** Use the correct ID ***
    if (!mainContent) {
        console.error("Main content area for animations not found!");
        return;
    }

    // Animate Hero elements first
    const heroTitle = mainContent.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = mainContent.querySelector(".hero-subtitle[data-animate='fade-up']");
    const heroCta = mainContent.querySelector(".hero-cta[data-animate='fade-up']"); // Target CTA wrapper

    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }
    if (heroCta) { gsap.from(heroCta, { ...defaultOnLoadAnimation, delay: parseFloat(heroCta.dataset.delay) || 0.7 }); } // Stagger CTA slightly later

    // Animate other elements on scroll
    gsap.utils.toArray(mainContent.querySelectorAll('[data-animate]:not(.hero-title):not(.hero-subtitle):not(.hero-cta)')).forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0;
        let staggerAmount = parseFloat(element.dataset.stagger) || 0;
        const animType = element.dataset.animate;
        let animProps = {
            opacity: 0, // Start invisible
            duration: 0.6,
            ease: "power2.out",
            delay: delay,
            clearProps: "opacity,transform" // Clean up inline styles after animation
        };

        if (animType === 'fade-left') { animProps.x = -30; }
        else if (animType === 'fade-right') { animProps.x = 30; }
        else { animProps.y = 20; } // Default to fade-up

        let target = element;
        // Apply stagger to children of specific containers
        if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline')) {
             if (element.children.length > 0) {
                target = element.children;
                // Apply default stagger if none is specified and target is children
                if (staggerAmount === 0 && target !== element) staggerAmount = 0.08;
                // Add stagger property if applicable
                if (staggerAmount > 0) animProps.stagger = staggerAmount;
            }
        }
        // Remove stagger if the target hasn't changed (e.g., single element with stagger attribute)
        if (target === element && animProps.stagger) delete animProps.stagger;

        // Create the ScrollTrigger animation
        gsap.from(target, {
            ...animProps,
            scrollTrigger: {
                trigger: element,       // The element that triggers the animation
                start: "top 88%",       // When the top of the trigger hits 88% down from the top of the viewport
                toggleActions: "play none none none", // Play animation once on enter
                once: true,             // Ensure it only happens once
                scroller: mainContent   // *** Specify the scrolling container ***
            }
        });
    });

    // Parallax for image cards
    gsap.utils.toArray(mainContent.querySelectorAll('.content-row .image-card')).forEach(card => {
        gsap.to(card, {
            yPercent: -5, // Move up slightly as row scrolls
            ease: "none",
            scrollTrigger: {
                trigger: card.closest('.content-row'), // Trigger based on the parent row
                start: "top bottom", // Start when row top hits viewport bottom
                end: "bottom top",   // End when row bottom hits viewport top
                scrub: 1.9,          // Smooth scrubbing effect
                scroller: mainContent // *** Specify the scrolling container ***
            }
        });
    });

    // Microinteractions for buttons/links
    document.querySelectorAll('.cta-button, .sidebar-link, .social-button, .icon-button, .user-dropdown-content a, .auth-link') // Added auth-link
        .forEach(button => {
            button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.97, duration: 0.1 }));
            button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 }));
            button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 })); // Reset scale on leave
    });
}

// --- Admin Panel Logic ---
function setupAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    const saveButton = adminPanel?.querySelector('.cta-button');
    const editableElements = document.querySelectorAll('[data-editable]');
    const isAdmin = () => localStorage.getItem('portfolioUserRole') === 'admin'; // Example check

    if (!adminPanel || !saveButton || editableElements.length === 0) return;

    // Show panel if admin
    if (isAdmin()) {
        adminPanel.style.display = 'block';
        editableElements.forEach(el => {
            const key = el.dataset.editable;
            const textarea = adminPanel.querySelector(`textarea[name="${key}"]`);
            if (textarea) {
                // Load initial content (replace innerHTML carefully)
                textarea.value = el.innerHTML.trim(); // Use innerHTML to preserve simple tags like <strong>
            }
        });
    }

    // Save changes
    saveButton.addEventListener('click', async () => {
        if (!isAdmin()) {
            alert("Access denied.");
            return;
        }
        const updates = {};
        editableElements.forEach(el => {
            const key = el.dataset.editable;
            const textarea = adminPanel.querySelector(`textarea[name="${key}"]`);
            if (textarea) {
                updates[key] = textarea.value;
            }
        });

        // --- Replace with your actual API call to save content ---
        try {
            console.log("Attempting to save:", updates);
            alert("Simulating save. Check console. Implement actual API call here.");
            // Example: await fetch('/api/content', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(updates) });

            // If save is successful, update the page elements
            editableElements.forEach(el => {
                const key = el.dataset.editable;
                if (updates[key] !== undefined) {
                    el.innerHTML = updates[key]; // Update the element's content
                }
            });
            alert("Content updated successfully (simulated).");
        } catch (error) {
            console.error("Error saving content:", error);
            alert("Failed to save content.");
        }
        // --- End of API call section ---
    });
}


// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // YOUR RENDER URL HERE

let authContainer = null, loginFormWrapper = null, registerFormWrapper = null, forgotFormWrapper = null, resetFormWrapper = null;
let loginForm = null, registerForm = null, forgotForm = null, resetForm = null;
let loginMessageEl = null, registerMessageEl = null, forgotMessageEl = null, resetMessageEl = null;
let loginActionLink = null, registerActionLink = null, forgotActionLink = null, logoutActionLink = null;
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
    userStatusEl = document.getElementById('user-status'); // Check if element exists
    userNameEl = document.getElementById('user-name');
    userAvatarEl = document.getElementById('user-avatar'); // We already changed the src in HTML
    loginActionLink = document.getElementById('auth-action-link');
    registerActionLink = document.getElementById('register-action-link');
    forgotActionLink = document.getElementById('forgot-action-link');
    logoutActionLink = document.getElementById('logout-link');

    if (!userNameEl || !userAvatarEl || !loginActionLink || !registerActionLink || !forgotActionLink || !logoutActionLink) {
        console.error("Auth UI elements not found!");
        return;
    }

    // Detach previous listeners to prevent duplicates
    loginActionLink.removeEventListener('click', handleAuthLinkClick);
    registerActionLink.removeEventListener('click', handleRegisterLinkClick);
    forgotActionLink.removeEventListener('click', handleForgotLinkClick);
    logoutActionLink.removeEventListener('click', handleLogoutClick);

    if (user) {
        try {
            const userData = JSON.parse(user);
            userNameEl.textContent = userData.username;
            userAvatarEl.style.display = 'inline-block'; // Ensure avatar is visible

            // Hide login/register/forgot, show logout
            loginActionLink.style.display = 'none';
            registerActionLink.style.display = 'none';
            forgotActionLink.style.display = 'none';
            logoutActionLink.style.display = 'flex'; // Use flex for icon alignment

            // Attach only the logout listener
            logoutActionLink.addEventListener('click', handleLogoutClick);
        } catch (e) {
            console.error("Error parsing user data from localStorage", e);
            localStorage.removeItem('portfolioUser'); // Clear invalid data
            // Fallback to logged-out state
            userNameEl.textContent = 'Khách';
            userAvatarEl.style.display = 'inline-block'; // Keep avatar visible

            loginActionLink.style.display = 'flex';
            registerActionLink.style.display = 'flex';
            forgotActionLink.style.display = 'flex';
            logoutActionLink.style.display = 'none';

            loginActionLink.addEventListener('click', handleAuthLinkClick);
            registerActionLink.addEventListener('click', handleRegisterLinkClick);
            forgotActionLink.addEventListener('click', handleForgotLinkClick);
        }
    } else {
        // Logged-out state
        userNameEl.textContent = 'Khách';
        userAvatarEl.style.display = 'inline-block'; // Keep avatar frame visible

        loginActionLink.style.display = 'flex';
        registerActionLink.style.display = 'flex';
        forgotActionLink.style.display = 'flex';
        logoutActionLink.style.display = 'none';

        // Attach login/register/forgot listeners
        loginActionLink.addEventListener('click', handleAuthLinkClick);
        registerActionLink.addEventListener('click', handleRegisterLinkClick);
        forgotActionLink.addEventListener('click', handleForgotLinkClick);
    }
}

// --- Event Handlers for Auth Links/Forms ---
function handleAuthLinkClick(e) { e.preventDefault(); showLoginForm(); }
function handleRegisterLinkClick(e) { e.preventDefault(); showRegisterForm(); }
function handleForgotLinkClick(e) { e.preventDefault(); showForgotForm(); }
function handleLogoutClick(e) {
    e.preventDefault();
    localStorage.removeItem('portfolioUser');
    // localStorage.removeItem('portfolioUserRole'); // Also remove role if you store it
    alert('Đăng xuất thành công!');
    updateUserLoginState();
    closeAuthForms(); // Close any open forms
    // Optionally reload or redirect
    // window.location.reload();
}

// --- Form Submission Handlers ---
async function handleRegisterSubmit(e) {
    e.preventDefault();
    const username = registerForm.username.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;
    const confirmPassword = registerForm.confirmPassword.value;

    if (password !== confirmPassword) { displayAuthMessage(registerMessageEl, 'Passwords do not match!', true); return; }
    displayAuthMessage(registerMessageEl, 'Registering...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || `HTTP error! status: ${response.status}`); }
        displayAuthMessage(registerMessageEl, 'Registration successful! Please log in.', false);
        setTimeout(() => { closeAuthForms(); showLoginForm(); }, 1500);
    } catch (error) { console.error("Registration failed:", error); displayAuthMessage(registerMessageEl, `Registration failed: ${error.message}`, true); }
}
async function handleLoginSubmit(e) {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    displayAuthMessage(loginMessageEl, 'Logging in...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || `HTTP error! status: ${response.status}`); }
        displayAuthMessage(loginMessageEl, 'Login successful!', false);
        localStorage.setItem('portfolioUser', JSON.stringify({ userId: data.userId, username: data.username }));
        updateUserLoginState();
        setTimeout(closeAuthForms, 1000);
    } catch (error) { console.error("Login failed:", error); displayAuthMessage(loginMessageEl, `Login failed: ${error.message}`, true); }
}
async function handleForgotSubmit(e) {
    e.preventDefault();
    const email = forgotForm.email.value;
    displayAuthMessage(forgotMessageEl, 'Sending reset instructions...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || `HTTP error! status: ${response.status}`); }
        displayAuthMessage(forgotMessageEl, data.message, false);
    } catch (error) { console.error("Forgot password request failed:", error); displayAuthMessage(forgotMessageEl, `Request failed: ${error.message}`, true); }
}
async function handleResetSubmit(e) {
    e.preventDefault();
    const token = resetForm.token.value;
    const password = resetForm.password.value;
    const confirmPassword = resetForm.confirmPassword.value;

    if (password !== confirmPassword) { displayAuthMessage(resetMessageEl, 'New passwords do not match!', true); return; }
    if (!token) { displayAuthMessage(resetMessageEl, 'Reset token is missing.', true); return; }
    displayAuthMessage(resetMessageEl, 'Resetting password...', false);
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || `HTTP error! status: ${response.status}`); }
        displayAuthMessage(resetMessageEl, 'Password reset successfully! Please log in.', false);
        setTimeout(() => { closeAuthForms(); showLoginForm(); }, 2000);
    } catch (error) { console.error("Password reset failed:", error); displayAuthMessage(resetMessageEl, `Reset failed: ${error.message}`, true); }
}


// Setup Action Buttons
function setupActionButtons() {
    authContainer = document.getElementById('auth-container');
    loginFormWrapper = document.getElementById('login-form-wrapper');
    registerFormWrapper = document.getElementById('register-form-wrapper');
    forgotFormWrapper = document.getElementById('forgot-form-wrapper');
    resetFormWrapper = document.getElementById('reset-form-wrapper');
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    forgotForm = document.getElementById('forgot-form');
    resetForm = document.getElementById('reset-form');
    loginMessageEl = document.getElementById('login-message');
    registerMessageEl = document.getElementById('register-message');
    forgotMessageEl = document.getElementById('forgot-message');
    resetMessageEl = document.getElementById('reset-message');

    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit); else console.error("Login form not found");
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit); else console.error("Register form not found");
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotSubmit); else console.error("Forgot Password form not found");
    if (resetForm) resetForm.addEventListener('submit', handleResetSubmit); else console.error("Reset Password form not found");

    updateUserLoginState();

    if(authContainer) { authContainer.addEventListener('click', (e) => { if (e.target === authContainer) { closeAuthForms(); } }); }
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && authContainer && authContainer.classList.contains('visible')) { closeAuthForms(); } });

    const urlParams = new URLSearchParams(window.location.search);
    const resetTokenFromUrl = urlParams.get('token');
    if (resetTokenFromUrl && resetFormWrapper) {
        console.log("Found reset token in URL:", resetTokenFromUrl);
        showResetForm();
        const tokenInput = document.getElementById('reset-token');
        if(tokenInput) { tokenInput.value = resetTokenFromUrl; }
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// ----- Initialization -----
function initializePage() {
    console.log("Initializing page...");
    updateYear();
    setupSidebarToggle();
    setupUserDropdown();
    setupThemeToggle();
    setupLanguageToggle();
    setupProfessionalAnimations();
    setupAdminPanel();
    setupActionButtons();

    // Listener for Fixed Donate Button
    const donateButtonMain = document.getElementById('donate-button-main');
    if (donateButtonMain) {
        donateButtonMain.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Chức năng Donate đang được phát triển!');
        });
        // Add micro-interaction
        donateButtonMain.addEventListener('mousedown', () => gsap.to(donateButtonMain, { scale: 0.97, duration: 0.1 }));
        donateButtonMain.addEventListener('mouseup', () => gsap.to(donateButtonMain, { scale: 1, duration: 0.1 }));
        donateButtonMain.addEventListener('mouseleave', () => gsap.to(donateButtonMain, { scale: 1, duration: 0.1 }));
    } else {
        console.warn("Main donate button (#donate-button-main) not found");
    }

    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        try { ageSpan.textContent = calculateAge('2006-08-08'); }
        catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; }
    } else {
        console.warn("Age span element not found.");
    }
    console.log("Page initialization complete.");
}

document.addEventListener('DOMContentLoaded', initializePage);