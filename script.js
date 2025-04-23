console.log("Script version 1.9 - Reverted Shopping Logic");

// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }
function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }

// --- ADDED: fetchData Utility Function ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // Ensure this is defined globally or passed around

async function fetchData(endpoint, options = {}) {
    console.log(`Fetching data from: ${BACKEND_URL}/api${endpoint}`, options);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Allow overriding default headers
    };

    // Add the insecure temporary user ID for admin checks (REPLACE WITH REAL AUTH LATER)
    const tempUserId = localStorage.getItem('userId');
    if (tempUserId) {
        headers['x-temp-userid'] = tempUserId;
        console.log("Added x-temp-userid header for admin check (INSECURE)");
    }


    const config = {
        method: options.method || 'GET',
        headers: headers,
    };

    if (options.body) {
        config.body = options.body; // Assume body is already stringified if method is POST/PUT etc.
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config);
        const data = await response.json(); // Attempt to parse JSON regardless of status

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`, data);
            // Try to use the message from the JSON response, otherwise use statusText
            throw new Error(data.message || response.statusText || `Request failed with status ${response.status}`);
        }

        console.log(`Successfully fetched data from ${endpoint}`);
        return data; // Return the parsed JSON data
    } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        // Rethrow the error so calling functions can handle it
        throw error;
    }
}
// --- END: fetchData Utility Function ---


// --- Header Scroll Effect ---
function setupHeaderScrollEffect() { const header = document.querySelector('.content-header'); if (!header) return; const scrollThreshold = 10; const checkScroll = () => { if (window.getComputedStyle(header).position === 'fixed') { header.classList.toggle('header-scrolled', window.scrollY > scrollThreshold); } else { header.classList.remove('header-scrolled'); } }; checkScroll(); window.addEventListener('scroll', checkScroll, { passive: true }); window.addEventListener('resize', checkScroll); }

// --- Mobile Menu Toggle ---
function setupMobileMenuToggle() { const toggleButton = document.getElementById('mobile-menu-toggle'); const mobileNav = document.getElementById('mobile-nav'); if (!toggleButton || !mobileNav) { console.warn("Mobile menu elements not found."); return; } toggleButton.addEventListener('click', (event) => { event.stopPropagation(); const isVisible = mobileNav.classList.toggle('visible'); toggleButton.setAttribute('aria-expanded', isVisible); }); mobileNav.addEventListener('click', (event) => { if (event.target.closest('.mobile-nav-link')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } }); document.addEventListener('click', (event) => { if (!mobileNav.contains(event.target) && !toggleButton.contains(event.target) && mobileNav.classList.contains('visible')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } }); document.addEventListener('keydown', (e) => { if (e.key === "Escape" && mobileNav.classList.contains('visible')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } }); }

// --- User Dropdown Toggle ---
function setupUserDropdown() { const trigger = document.getElementById('user-area-trigger'); const dropdown = document.getElementById('user-dropdown'); const userArea = document.querySelector('.user-area'); if (!trigger || !dropdown || !userArea) { console.warn("User dropdown elements not found."); return; } trigger.addEventListener('click', (event) => { event.stopPropagation(); dropdown.classList.toggle('visible'); userArea.classList.toggle('open'); }); document.addEventListener('click', (event) => { if (!userArea.contains(event.target) && dropdown.classList.contains('visible')) { dropdown.classList.remove('visible'); userArea.classList.remove('open'); } }); dropdown.addEventListener('click', (event) => { if (event.target.closest('a') && !event.target.closest('#admin-dropdown-section')) { dropdown.classList.remove('visible'); userArea.classList.remove('open'); } }); }

// --- Theme Toggle ---
function setupThemeToggle() { const themeButton = document.getElementById('theme-toggle'); if (!themeButton) { console.warn("Theme toggle button not found."); return; } const themeIcon = themeButton.querySelector('i'); if (!themeIcon) { console.warn("Theme toggle icon not found."); return; } const applyTheme = (theme) => { if (theme === 'light') { document.body.classList.add('light-theme'); document.body.classList.remove('dark-theme'); themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); } else { document.body.classList.add('dark-theme'); document.body.classList.remove('light-theme'); themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); } }; const storedTheme = localStorage.getItem('theme'); const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light'); applyTheme(initialTheme); themeButton.addEventListener('click', () => { const isDark = document.body.classList.contains('dark-theme'); const newTheme = isDark ? 'light' : 'dark'; applyTheme(newTheme); localStorage.setItem('theme', newTheme); }); }

// --- Language Toggle (Placeholder) ---
function setupLanguageToggle() { const langButton = document.getElementById('language-toggle'); if(langButton) { langButton.addEventListener('click', () => { alert('Language switching coming soon!'); }); } }

// --- GSAP Animations ---
function setupProfessionalAnimations() {
    console.log("Setting up GSAP animations...");
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']"); const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']"); const heroCta = document.querySelector(".hero-cta[data-animate='fade-up']"); if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); } if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); } if (heroCta) { gsap.from(heroCta, { ...defaultOnLoadAnimation, delay: parseFloat(heroCta.dataset.delay) || 0.7 }); }

    gsap.utils.toArray(document.querySelectorAll('[data-animate]:not(.gsap-initiated)')).forEach(element => {
        element.classList.add('gsap-initiated');
        const delay = parseFloat(element.dataset.delay) || 0; let staggerAmount = parseFloat(element.dataset.stagger) || 0; const animType = element.dataset.animate;
        let animProps = { opacity: 0, duration: 0.6, ease: "power2.out", delay: delay, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true, /* markers: true, */ } };
        if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; }
        let target = element;
        // Simplified target logic - apply animation to children if specified by class and has children
        if ((element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline') || element.classList.contains('product-grid') || element.classList.contains('product-category-section')) && element.children.length > 0 ) {
             target = Array.from(element.children).filter(child => !child.matches('h2.category-title') && !child.matches('h2.page-title')); // Exclude titles from stagger
             if (target.length > 0) {
                if (staggerAmount === 0 && target.length > 1) staggerAmount = 0.05; // Default stagger if not set and multiple items
                if (staggerAmount > 0) animProps.scrollTrigger.stagger = staggerAmount;
             } else {
                 target = element; // Fallback to animating the container itself if no suitable children
             }
        }
        gsap.from(target, animProps);
    });

    gsap.utils.toArray(document.querySelectorAll('.content-row .image-card')).forEach(card => { gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 } }); });
    document.querySelectorAll('.cta-button, .header-nav-link, .mobile-nav-link, .social-button, .icon-button, .user-dropdown-content a, #donate-button-header, .dropdown-link, .category-button, .product-buy-btn, .footer-link-button, #back-to-top-btn, .modal-close-btn, .summary-card, .view-toggle button') .forEach(button => { button.removeEventListener('mousedown', handleButtonMouseDown); button.removeEventListener('mouseup', handleButtonMouseUp); button.removeEventListener('mouseleave', handleButtonMouseLeave); button.addEventListener('mousedown', handleButtonMouseDown); button.addEventListener('mouseup', handleButtonMouseUp); if (!button.matches('#donate-button-header') && !button.matches('.header-nav-link')) { button.addEventListener('mouseleave', handleButtonMouseLeave); } });
}
function handleButtonMouseDown(event) { gsap.to(event.currentTarget, { scale: 0.97, duration: 0.1 }); }
function handleButtonMouseUp(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }
function handleButtonMouseLeave(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }

// --- Click-based Dropdowns ---
function setupClickDropdowns() { const wrappers = document.querySelectorAll('.nav-item-wrapper'); wrappers.forEach(wrapper => { const trigger = wrapper.querySelector('.nav-dropdown-trigger'); const menu = wrapper.querySelector('.dropdown-menu'); if (!trigger || !menu) return; trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); wrappers.forEach(otherWrapper => { if (otherWrapper !== wrapper) otherWrapper.classList.remove('open'); }); wrapper.classList.toggle('open'); }); }); document.addEventListener('click', (event) => { wrappers.forEach(wrapper => { if (!wrapper.contains(event.target) && wrapper.classList.contains('open')) wrapper.classList.remove('open'); }); }); document.addEventListener('keydown', (event) => { if (event.key === "Escape") wrappers.forEach(wrapper => wrapper.classList.remove('open')); }); }

// --- Authentication Logic ---
function setupActionButtons() {
    const authContainer = document.getElementById('auth-container'); const loginForm = document.getElementById('login-form'); const registerForm = document.getElementById('register-form'); const forgotForm = document.getElementById('forgot-form'); const resetForm = document.getElementById('reset-form'); const loginFormWrapper = document.getElementById('login-form-wrapper'); const registerFormWrapper = document.getElementById('register-form-wrapper'); const forgotFormWrapper = document.getElementById('forgot-form-wrapper'); const resetFormWrapper = document.getElementById('reset-form-wrapper'); const loginMessage = document.getElementById('login-message'); const registerMessage = document.getElementById('register-message'); const forgotMessage = document.getElementById('forgot-message'); const resetMessage = document.getElementById('reset-message'); const authActionLink = document.getElementById('auth-action-link'); const registerActionLink = document.getElementById('register-action-link'); const forgotActionLink = document.getElementById('forgot-action-link'); const logoutLink = document.getElementById('logout-link'); const userNameSpan = document.getElementById('user-name'); const userStatusSpan = document.getElementById('user-status'); const adminDropdownSection = document.getElementById('admin-dropdown-section'); function showMessage(element, message, isSuccess = false) { if (!element) return; element.textContent = message; element.className = 'auth-message ' + (isSuccess ? 'success' : 'error'); } function showForm(formToShow) { if (!authContainer) return; authContainer.style.display = 'flex'; authContainer.classList.add('visible'); [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => { if(form) form.style.display = form === formToShow ? 'block' : 'none'; }); [loginMessage, registerMessage, forgotMessage, resetMessage].forEach(msg => { if(msg) showMessage(msg, ''); }); } window.showLoginForm = () => showForm(loginFormWrapper); window.showRegisterForm = () => showForm(registerFormWrapper); window.showForgotForm = () => showForm(forgotFormWrapper); window.showResetForm = () => showForm(resetFormWrapper); window.closeAuthForms = () => { if(authContainer) { authContainer.classList.remove('visible'); setTimeout(() => { authContainer.style.display = 'none'; }, 300); } }; if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); }); if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); }); if (forgotActionLink) forgotActionLink.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); }); const closeAuthButtons = document.querySelectorAll('#auth-container .close-auth-btn'); closeAuthButtons.forEach(btn => btn.addEventListener('click', closeAuthForms));
    // LOGIN Handler - REVERTED: Does not fetch balance/admin status directly
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); showMessage(loginMessage, 'Đang đăng nhập...'); const username = e.target.username.value; const password = e.target.password.value;
            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
                const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
                showMessage(loginMessage, 'Đăng nhập thành công!', true);
                localStorage.setItem('userId', data.userId); localStorage.setItem('username', data.username);
                // NOTE: No balance/admin status stored here in this reverted version
                // Fetch user info AFTER login to get balance and admin status
                fetchAndUpdateUserInfo(); // Call this to update UI properly
                setTimeout(closeAuthForms, 1000);
            } catch (error) { console.error("Login failed:", error); showMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'); }
        });
    }
    // REGISTER Handler
    if (registerForm) { registerForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; if (password !== confirmPassword) { showMessage(registerMessage, 'Mật khẩu nhập lại không khớp.'); return; } showMessage(registerMessage, 'Đang đăng ký...'); const username = e.target.username.value; const email = e.target.email.value; try { const response = await fetch(`${BACKEND_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`); showMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 1500); } catch (error) { console.error("Registration failed:", error); showMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.'); } }); }
    // FORGOT PASSWORD
     if (forgotForm) { forgotForm.addEventListener('submit', async (e) => { e.preventDefault(); showMessage(forgotMessage, 'Đang xử lý yêu cầu...'); const email = e.target.email.value; try { const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const data = await response.json(); if (!response.ok && response.status !== 200) { throw new Error(data.message || `Error: ${response.status}`); } showMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true); } catch (error) { console.error("Forgot password failed:", error); showMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.'); } }); }
     // RESET PASSWORD
      if (resetForm) { resetForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; const token = e.target.token.value; if (password !== confirmPassword) { showMessage(resetMessage, 'Mật khẩu mới không khớp.'); return; } if (!token) { showMessage(resetMessage, 'Thiếu mã token đặt lại.'); return; } showMessage(resetMessage, 'Đang đặt lại mật khẩu...'); try { const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`); showMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 2000); } catch (error) { console.error("Reset password failed:", error); showMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.'); } }); }
    // LOGOUT
    if (logoutLink) { logoutLink.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('userId'); localStorage.removeItem('username'); localStorage.removeItem('isAdmin'); localStorage.removeItem('balance'); updateUserStatus(false); updateSidebarUserArea(false); console.log("User logged out."); }); }

    // Helper to Update Header UI (Uses isAdmin flag)
     function updateUserStatus(isLoggedIn, username = 'Khách', isAdmin = false) {
         const elements = { userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection };
         if (!elements.userNameSpan || !elements.userStatusSpan || !elements.logoutLink || !elements.adminDropdownSection) { /* console.warn("Header elements missing."); */ return; }
         if (isLoggedIn) {
            elements.userNameSpan.textContent = username;
            [elements.authActionLink, elements.registerActionLink, elements.forgotActionLink].forEach(link => { if (link) link.style.display = 'none'; });
            elements.logoutLink.style.display = 'flex';
            // Use the isAdmin flag fetched from the backend
            elements.adminDropdownSection.style.display = isAdmin ? 'block' : 'none';
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false'); // Store admin status
        } else {
            elements.userNameSpan.textContent = 'Khách';
            [elements.authActionLink, elements.registerActionLink, elements.forgotActionLink].forEach(link => { if (link) link.style.display = 'flex'; });
            elements.logoutLink.style.display = 'none';
            elements.adminDropdownSection.style.display = 'none';
            localStorage.removeItem('isAdmin'); // Clear admin status on logout
        }
     }
     // Check Login Status on Load (Fetches user info)
     const checkLoginAndToken = () => {
         const userId = localStorage.getItem('userId');
         if (userId) {
             fetchAndUpdateUserInfo(); // Fetch full info if userId exists
         } else {
             updateUserStatus(false);
             updateSidebarUserArea(false);
         }
         const urlParams = new URLSearchParams(window.location.search); const resetToken = urlParams.get('token'); if (resetToken) { showResetForm(); const tokenInput = document.getElementById('reset-token'); if (tokenInput) { tokenInput.value = resetToken; } else { console.warn("Reset token input field not found."); } window.history.replaceState({}, document.title, window.location.pathname); }
     };
     checkLoginAndToken();
}

// --- Fetch and Update User Info (Now uses fetchData) ---
async function fetchAndUpdateUserInfo() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.log("No userId found in localStorage, skipping user info fetch.");
        updateUserStatus(false); // Ensure UI is logged out
        updateSidebarUserArea(false);
        return;
    }

    console.log("Fetching user info for userId:", userId);
    try {
        // Use the new fetchData utility which includes the temporary header
        const userData = await fetchData('/users/me', {
            method: 'GET',
            // No need to manually add header here, fetchData handles it
        });

        console.log("User data received:", userData);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('balance', userData.balance); // Store balance
        localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false'); // Store admin status

        // Update UI elements with fetched data
        updateUserStatus(true, userData.username, userData.isAdmin);
        updateSidebarUserArea(true, userData.username, userData.balance);

    } catch (error) {
        console.error("Error fetching user info:", error);
        // If fetching fails (e.g., invalid ID, server error), log out the user
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('balance');
        localStorage.removeItem('isAdmin');
        updateUserStatus(false);
        updateSidebarUserArea(false);
    }
}


// --- Sidebar Update Function (Now uses real balance) ---
function updateSidebarUserArea(isLoggedIn, username = 'Khách', balance = 0) {
    const sidebarUserInfoDiv = document.getElementById('sidebar-user-info'); if (!sidebarUserInfoDiv) return; const loginBtn = document.getElementById('sidebar-login-btn'); const registerBtn = document.getElementById('sidebar-register-btn'); const depositBtn = document.getElementById('sidebar-deposit-btn'); const logoutBtn = document.getElementById('sidebar-logout-btn'); const usernameSpan = document.getElementById('sidebar-username'); const balanceSpan = document.getElementById('sidebar-balance'); if (!loginBtn || !registerBtn || !depositBtn || !logoutBtn || !usernameSpan || !balanceSpan) { console.warn("Sidebar elements missing for update."); return; }
    if (isLoggedIn) {
        usernameSpan.textContent = username;
        balanceSpan.textContent = formatPrice(balance); // Use formatted balance
        loginBtn.style.display = 'none'; registerBtn.style.display = 'none'; depositBtn.style.display = 'block'; logoutBtn.style.display = 'block';
    } else {
        usernameSpan.textContent = 'Khách'; balanceSpan.textContent = '0đ'; loginBtn.style.display = 'block'; registerBtn.style.display = 'block'; depositBtn.style.display = 'none'; logoutBtn.style.display = 'none';
    }
}

// --- Basic Dropdown Actions (Includes reverted buy button logic) ---
function setupDropdownActions() {
    const depositLink = document.getElementById('deposit-link'); const historyLink = document.getElementById('history-link'); const depositLinkMobile = document.getElementById('deposit-link-mobile'); const historyLinkMobile = document.getElementById('history-link-mobile'); const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); }; const handleHistoryClick = (e) => { e.preventDefault(); window.location.href = 'history.html'; }; if(depositLink) depositLink.addEventListener('click', handleDepositClick); if(historyLink) historyLink.addEventListener('click', handleHistoryClick); if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick); if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick);

    // Reverted Buy Button Logic
    if (document.body.classList.contains('shopping-page')) {
        console.log("Setting up reverted shopping page 'buy' listeners...");
        // Use event delegation on a static parent if product list might change,
        // but since it's hardcoded now, direct selection is fine.
         document.querySelectorAll('.product-buy-btn').forEach(button => {
             button.addEventListener('click', (e) => {
                 e.preventDefault();
                 const productCard = e.target.closest('.product-card');
                 const productTitle = productCard?.querySelector('.product-title')?.textContent || 'Sản phẩm';

                 if (!localStorage.getItem('userId')) {
                    alert('Vui lòng đăng nhập để mua hàng!');
                    if (typeof showLoginForm === 'function') { showLoginForm(); }
                    else { console.error("showLoginForm function not found"); }
                 } else {
                    // Simple alert instead of modal flow
                    alert(`Chức năng mua "${productTitle}" coming soon!`);
                 }
             });
         });
    }
}

// --- Back to Top Button ---
function setupBackToTopButton() { const backToTopButton = document.getElementById("back-to-top-btn"); if (!backToTopButton) { return; } const scrollThreshold = 200; const checkScroll = () => { if (!backToTopButton) return; if (window.scrollY > scrollThreshold) { backToTopButton.classList.add("visible"); } else { backToTopButton.classList.remove("visible"); } }; window.addEventListener("scroll", checkScroll, { passive: true }); checkScroll(); backToTopButton.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }); }

// --- Modal Handling (Only needed for Auth modals now) ---
function showModal(modalId) { const modal = document.getElementById(modalId); if (modal && modalId === 'auth-container') { modal.style.display = 'flex'; setTimeout(() => { modal.classList.add('visible'); }, 10); } else if (modal) { console.warn("ShowModal called for non-auth modal:", modalId); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function hideModal(modalId) { const modal = document.getElementById(modalId); if (modal && modalId === 'auth-container') { modal.classList.remove('visible'); setTimeout(() => { modal.style.display = 'none'; }, 300); } else if (modal) { console.warn("HideModal called for non-auth modal:", modalId); } else { console.error(`Modal with ID ${modalId} not found.`); } }
// Remove showMessageModal if only used for purchase flow

// --- Purchase Flow Logic (REMOVED) ---

// --- Load Dynamic Shopping Page Data (REMOVED) ---


// ----- Initialization -----
function initializePage() {
    console.log("Initializing page (v1.9 - Reverted Shopping JS)...");
    updateYear(); setupHeaderScrollEffect(); setupMobileMenuToggle(); setupUserDropdown(); setupThemeToggle(); setupLanguageToggle(); setupProfessionalAnimations(); /* setupAdminPanel only in admin.js */ setupActionButtons(); // Sets up auth forms/buttons
    setupDropdownActions(); // Handles simple buy alerts now
    setupClickDropdowns(); setupBackToTopButton(); // setupPurchaseModals(); // REMOVED
    // REMOVED check for shopping page and loadShoppingPageData call
     if (document.body.classList.contains('history-page')) { console.log("History page detected, loadHistoryPageData() needs implementation."); /* if (typeof loadHistoryPageData === 'function') { loadHistoryPageData(); } */ }
    const donateButtonHeader = document.getElementById('donate-button-header'); if (donateButtonHeader) { donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); }); } else { console.warn("Header donate button not found"); } const ageSpan = document.getElementById('age'); if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } } console.log("Page initialization complete.");
}

// --- Run Initialization ---
document.addEventListener('DOMContentLoaded', initializePage);