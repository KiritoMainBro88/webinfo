console.log("Script version 1.9.2 - Fixing Scope Issues"); // Increment version

// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }
function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return '0đ'; // Default to 0đ if invalid
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// --- Global Constants & Variables ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';

// --- Global DOM Element References (Initialize after DOM loaded) ---
let userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection;
let sidebarUserInfoDiv, sidebarLoginBtn, sidebarRegisterBtn, sidebarDepositBtn, sidebarLogoutBtn, sidebarUsernameSpan, sidebarBalanceSpan;

function initializeDOMElements() {
    // Header Elements
    userNameSpan = document.getElementById('user-name');
    userStatusSpan = document.getElementById('user-status');
    authActionLink = document.getElementById('auth-action-link');
    registerActionLink = document.getElementById('register-action-link');
    forgotActionLink = document.getElementById('forgot-action-link');
    logoutLink = document.getElementById('logout-link');
    adminDropdownSection = document.getElementById('admin-dropdown-section');

    // Sidebar Elements
    sidebarUserInfoDiv = document.getElementById('sidebar-user-info');
    sidebarLoginBtn = document.getElementById('sidebar-login-btn');
    sidebarRegisterBtn = document.getElementById('sidebar-register-btn');
    sidebarDepositBtn = document.getElementById('sidebar-deposit-btn');
    sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
    sidebarUsernameSpan = document.getElementById('sidebar-username');
    sidebarBalanceSpan = document.getElementById('sidebar-balance');
}

// --- fetchData Utility Function ---
async function fetchData(endpoint, options = {}) {
    // console.log(`Fetching data from: ${BACKEND_URL}/api${endpoint}`, options); // Optional debug
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const tempUserId = localStorage.getItem('userId');
    if (tempUserId) {
        headers['x-temp-userid'] = tempUserId;
    }
    const config = {
        method: options.method || 'GET',
        headers: headers,
    };
    if (options.body) {
        config.body = options.body;
    }
    try {
        const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status} for ${endpoint}`, data);
            throw new Error(data.message || response.statusText || `Request failed with status ${response.status}`);
        }
        // console.log(`Successfully fetched data from ${endpoint}`); // Optional debug
        return data;
    } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        throw error;
    }
}

// --- Global UI Update Functions ---
function updateUserStatus(isLoggedIn, username = 'Khách', isAdmin = false) {
    console.log(`Updating header status: loggedIn=${isLoggedIn}, username=${username}, isAdmin=${isAdmin}`);
    // Ensure elements are available (they should be after initializeDOMElements runs)
    if (!userNameSpan || !adminDropdownSection || !logoutLink) {
       console.warn("Header user elements not ready for update status.");
       return; // Don't proceed if elements aren't found
    }

    const authLinks = [authActionLink, registerActionLink, forgotActionLink].filter(Boolean); // Filter out nulls

    if (isLoggedIn) {
       userNameSpan.textContent = username;
       authLinks.forEach(link => { if (link) link.style.display = 'none'; });
       logoutLink.style.display = 'flex';
       adminDropdownSection.style.display = isAdmin ? 'block' : 'none';
       localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
   } else {
       userNameSpan.textContent = 'Khách';
       authLinks.forEach(link => { if (link) link.style.display = 'flex'; });
       logoutLink.style.display = 'none';
       adminDropdownSection.style.display = 'none';
       localStorage.removeItem('isAdmin');
   }
}

function updateSidebarUserArea(isLoggedIn, username = 'Khách', balance = 0) {
    console.log(`Updating sidebar: loggedIn=${isLoggedIn}, username=${username}, balance=${balance}`);
    // Ensure elements are available
    if (!sidebarUserInfoDiv || !sidebarLoginBtn || !sidebarRegisterBtn || !sidebarDepositBtn || !sidebarLogoutBtn || !sidebarUsernameSpan || !sidebarBalanceSpan) {
        console.warn("Sidebar elements not ready for update.");
        return; // Don't proceed if elements aren't found
    }

    if (isLoggedIn) {
        sidebarUsernameSpan.textContent = username;
        sidebarBalanceSpan.textContent = formatPrice(balance);
        sidebarLoginBtn.style.display = 'none';
        sidebarRegisterBtn.style.display = 'none';
        sidebarDepositBtn.style.display = 'block';
        sidebarLogoutBtn.style.display = 'block';
    } else {
        sidebarUsernameSpan.textContent = 'Khách';
        sidebarBalanceSpan.textContent = '0đ';
        sidebarLoginBtn.style.display = 'block';
        sidebarRegisterBtn.style.display = 'block';
        sidebarDepositBtn.style.display = 'none';
        sidebarLogoutBtn.style.display = 'none';
    }
}


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
    // console.log("Setting up GSAP animations..."); // Optional debug log
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']"); const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']"); const heroCta = document.querySelector(".hero-cta[data-animate='fade-up']"); if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); } if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); } if (heroCta) { gsap.from(heroCta, { ...defaultOnLoadAnimation, delay: parseFloat(heroCta.dataset.delay) || 0.7 }); }

    gsap.utils.toArray(document.querySelectorAll('[data-animate]:not(.gsap-initiated)')).forEach(element => {
        element.classList.add('gsap-initiated');
        const delay = parseFloat(element.dataset.delay) || 0; let staggerAmount = parseFloat(element.dataset.stagger) || 0; const animType = element.dataset.animate;
        let animProps = { opacity: 0, duration: 0.6, ease: "power2.out", delay: delay, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true, /* markers: true, */ } };
        if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; }
        let target = element;
        if ((element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline') || element.classList.contains('product-grid') || element.classList.contains('product-category-section')) && element.children.length > 0 ) {
             target = Array.from(element.children).filter(child => !child.matches('h2.category-title') && !child.matches('h2.page-title'));
             if (target.length > 0) {
                if (staggerAmount === 0 && target.length > 1) staggerAmount = 0.05;
                if (staggerAmount > 0) animProps.scrollTrigger.stagger = staggerAmount;
             } else {
                 target = element;
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

// --- Authentication Logic Setup ---
function setupActionButtons() {
    // Get references to forms and messages
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const resetForm = document.getElementById('reset-form');
    const loginFormWrapper = document.getElementById('login-form-wrapper');
    const registerFormWrapper = document.getElementById('register-form-wrapper');
    const forgotFormWrapper = document.getElementById('forgot-form-wrapper');
    const resetFormWrapper = document.getElementById('reset-form-wrapper');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const forgotMessage = document.getElementById('forgot-message');
    const resetMessage = document.getElementById('reset-message');
    // Note: Auth action links (like login, register) are already grabbed globally

    // Helper to show messages within auth forms
    function showMessage(element, message, isSuccess = false) {
        if (!element) return;
        element.textContent = message;
        element.className = 'auth-message ' + (isSuccess ? 'success' : 'error');
    }

    // Helper to display specific auth forms
    function showForm(formToShow) {
        if (!authContainer) return;
        authContainer.style.display = 'flex';
        authContainer.classList.add('visible');
        [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => {
            if(form) form.style.display = form === formToShow ? 'block' : 'none';
        });
        [loginMessage, registerMessage, forgotMessage, resetMessage].forEach(msg => {
            if(msg) showMessage(msg, ''); // Clear previous messages
        });
    }
    window.showLoginForm = () => showForm(loginFormWrapper);
    window.showRegisterForm = () => showForm(registerFormWrapper);
    window.showForgotForm = () => showForm(forgotFormWrapper);
    window.showResetForm = () => showForm(resetFormWrapper);
    window.closeAuthForms = () => {
        if(authContainer) {
            authContainer.classList.remove('visible');
            setTimeout(() => { authContainer.style.display = 'none'; }, 300);
        }
    };

    // Setup trigger links
    if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    if (forgotActionLink) forgotActionLink.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); });

    // Setup close buttons
    const closeAuthButtons = document.querySelectorAll('#auth-container .close-auth-btn');
    closeAuthButtons.forEach(btn => btn.addEventListener('click', closeAuthForms));

    // LOGIN Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(loginMessage, 'Đang đăng nhập...');
            const username = e.target.username.value;
            const password = e.target.password.value;
            try {
                // Use fetchData directly (no need for global BACKEND_URL here)
                const data = await fetchData('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                 });
                showMessage(loginMessage, 'Đăng nhập thành công! Đang cập nhật thông tin...', true);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username);

                await fetchAndUpdateUserInfo(); // Fetch full details

                setTimeout(closeAuthForms, 1200); // Close modal after update attempt
            } catch (error) {
                console.error("Login failed:", error);
                showMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
                // No need to call updateUserStatus here, state remains logged out
            }
        });
    }

    // REGISTER Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = e.target.password.value;
            const confirmPassword = e.target.confirmPassword.value;
            if (password !== confirmPassword) {
                showMessage(registerMessage, 'Mật khẩu nhập lại không khớp.');
                return;
            }
            showMessage(registerMessage, 'Đang đăng ký...');
            const username = e.target.username.value;
            const email = e.target.email.value;
            try {
                await fetchData('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ username, email, password })
                });
                showMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true);
                setTimeout(() => { showLoginForm(); }, 1500);
            } catch (error) {
                console.error("Registration failed:", error);
                showMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        });
    }

    // FORGOT PASSWORD Handler
     if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(forgotMessage, 'Đang xử lý yêu cầu...');
            const email = e.target.email.value;
            try {
                const data = await fetchData('/auth/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify({ email })
                });
                // Backend returns 200 even if email not found for security
                showMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true);
            } catch (error) {
                // This catch might not be hit often if backend always returns 200/success message
                console.error("Forgot password failed:", error);
                showMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        });
    }

     // RESET PASSWORD Handler
      if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = e.target.password.value;
            const confirmPassword = e.target.confirmPassword.value;
            const token = e.target.token.value;
            if (password !== confirmPassword) {
                showMessage(resetMessage, 'Mật khẩu mới không khớp.');
                return;
            }
            if (!token) {
                showMessage(resetMessage, 'Thiếu mã token đặt lại.');
                return;
            }
            showMessage(resetMessage, 'Đang đặt lại mật khẩu...');
            try {
                await fetchData('/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify({ token, password })
                });
                showMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true);
                setTimeout(() => { showLoginForm(); }, 2000);
            } catch (error) {
                console.error("Reset password failed:", error);
                showMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.');
            }
        });
    }

    // LOGOUT Handler (Uses global logoutLink now)
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('balance');
            updateUserStatus(false); // Call global function
            updateSidebarUserArea(false); // Call global function
            console.log("User logged out.");
        });
    }

     // Check Initial Login Status on Load
     const checkLoginAndToken = () => {
         console.log("checkLoginAndToken triggered");
         const userId = localStorage.getItem('userId');
         if (userId) {
             console.log("User ID found in localStorage, fetching user info...");
             fetchAndUpdateUserInfo(); // Fetch full info if userId exists
         } else {
             console.log("No User ID found in localStorage, setting logged out state.");
             updateUserStatus(false);
             updateSidebarUserArea(false);
         }
         // Handle reset token in URL
         const urlParams = new URLSearchParams(window.location.search);
         const resetToken = urlParams.get('token');
         if (resetToken) {
            showResetForm();
            const tokenInput = document.getElementById('reset-token');
            if (tokenInput) {
                tokenInput.value = resetToken;
            } else {
                console.warn("Reset token input field not found.");
            }
            // Clean the token from URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
        }
     };
     checkLoginAndToken(); // Run check on setup
}

// --- Fetch and Update User Info ---
async function fetchAndUpdateUserInfo() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.log("No userId found in localStorage, skipping user info fetch.");
        updateUserStatus(false);
        updateSidebarUserArea(false);
        return;
    }
    console.log("Fetching user info for userId:", userId);
    try {
        const userData = await fetchData('/users/me'); // Endpoint is correct
        console.log("User data received:", userData);

        if (!userData || !userData.username) {
             console.error("Received invalid or incomplete user data from /users/me", userData);
             throw new Error("Received invalid user data"); // Trigger catch block
        }

        // Store necessary data
        localStorage.setItem('username', userData.username);
        // Use ?? to provide default value if balance or isAdmin is null/undefined
        localStorage.setItem('balance', userData.balance ?? 0);
        localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false');

        // Update UI
        updateUserStatus(true, userData.username, !!userData.isAdmin);
        updateSidebarUserArea(true, userData.username, userData.balance ?? 0);

    } catch (error) {
        console.error("Error fetching or processing user info:", error);
        // Log out user if fetch fails
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('balance');
        localStorage.removeItem('isAdmin');
        updateUserStatus(false);
        updateSidebarUserArea(false);
    }
}

// --- Basic Dropdown Actions (No change needed here) ---
function setupDropdownActions() {
    const depositLink = document.getElementById('deposit-link'); const historyLink = document.getElementById('history-link'); const depositLinkMobile = document.getElementById('deposit-link-mobile'); const historyLinkMobile = document.getElementById('history-link-mobile'); const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); }; const handleHistoryClick = (e) => { e.preventDefault(); window.location.href = 'history.html'; }; if(depositLink) depositLink.addEventListener('click', handleDepositClick); if(historyLink) historyLink.addEventListener('click', handleHistoryClick); if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick); if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick);
    if (document.body.classList.contains('shopping-page')) {
        console.log("Setting up reverted shopping page 'buy' listeners...");
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
                    alert(`Chức năng mua "${productTitle}" coming soon!`);
                 }
             });
         });
    }
}

// --- Back to Top Button (No change needed here) ---
function setupBackToTopButton() { const backToTopButton = document.getElementById("back-to-top-btn"); if (!backToTopButton) { return; } const scrollThreshold = 200; const checkScroll = () => { if (!backToTopButton) return; if (window.scrollY > scrollThreshold) { backToTopButton.classList.add("visible"); } else { backToTopButton.classList.remove("visible"); } }; window.addEventListener("scroll", checkScroll, { passive: true }); checkScroll(); backToTopButton.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }); }

// --- Modal Handling (No change needed here) ---
function showModal(modalId) { const modal = document.getElementById(modalId); if (modal && modalId === 'auth-container') { modal.style.display = 'flex'; setTimeout(() => { modal.classList.add('visible'); }, 10); } else if (modal) { console.warn("ShowModal called for non-auth modal:", modalId); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function hideModal(modalId) { const modal = document.getElementById(modalId); if (modal && modalId === 'auth-container') { modal.classList.remove('visible'); setTimeout(() => { modal.style.display = 'none'; }, 300); } else if (modal) { console.warn("HideModal called for non-auth modal:", modalId); } else { console.error(`Modal with ID ${modalId} not found.`); } }

// --- Purchase/Dynamic Load Logic (REMOVED) ---


// ----- Initialization Function -----
function initializePage() {
    console.log("Initializing page (v1.9.2)...");
    initializeDOMElements(); // Grab DOM elements first
    updateYear();
    setupHeaderScrollEffect();
    setupMobileMenuToggle();
    setupUserDropdown();
    setupThemeToggle();
    setupLanguageToggle();
    setupProfessionalAnimations();
    setupActionButtons(); // Sets up auth forms/buttons AND checks initial login state
    setupDropdownActions();
    setupClickDropdowns();
    setupBackToTopButton();

     if (document.body.classList.contains('history-page')) {
        console.log("History page detected.");
     }

    const donateButtonHeader = document.getElementById('donate-button-header');
    if (donateButtonHeader) {
        donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); });
    } else { console.warn("Header donate button not found"); }

    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; }
    }

    console.log("Page initialization complete.");
}

// --- Run Initialization on DOM Ready ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage(); // Already loaded
}