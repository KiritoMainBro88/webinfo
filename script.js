console.log("Script version 1.8 running!"); // Use a consistent version number

// --- Fetch Helper ---
async function fetchData(endpoint, options = {}) {
    const API_BASE = 'https://webinfo-zbkq.onrender.com/api';
    const url = `${API_BASE}${endpoint}`;
    const tempUserId = localStorage.getItem('userId');
    options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'X-Temp-UserId': tempUserId || ''
    };
    try {
        const response = await fetch(url, options);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json().catch(() => null) : await response.text();
        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && data?.message) ? data.message : (data || response.statusText);
            console.error(`API Error (${response.status}) on ${endpoint}:`, errorMessage);
            throw new Error(errorMessage);
        }
        if (response.status === 204 || (isJson && data === null)) {
            return { success: true, message: 'Operation successful (No Content)' };
        }
        return data;
    } catch (error) {
        console.error(`Network or Fetch Error on ${endpoint}:`, error);
        throw error;
    }
}

// --- Global Variables ---
let currentUserBalance = 0;
let currentUserIsAdmin = false;

// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }
function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }

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
    console.log("Setting up GSAP animations..."); // Debug log
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']");
    const heroCta = document.querySelector(".hero-cta[data-animate='fade-up']");

    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }
    if (heroCta) { gsap.from(heroCta, { ...defaultOnLoadAnimation, delay: parseFloat(heroCta.dataset.delay) || 0.7 }); }

    // Select ALL elements with data-animate, including dynamically added ones if this runs after loadShoppingPageData
    gsap.utils.toArray(document.querySelectorAll('[data-animate]:not(.gsap-initiated)')).forEach(element => {
        element.classList.add('gsap-initiated'); // Mark as processed
        const delay = parseFloat(element.dataset.delay) || 0;
        let staggerAmount = parseFloat(element.dataset.stagger) || 0;
        const animType = element.dataset.animate;

        let animProps = {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            delay: delay,
            scrollTrigger: {
                trigger: element,
                start: "top 88%",
                toggleActions: "play none none none",
                once: true,
                // markers: true, // Uncomment for debugging
            }
        };

        if (animType === 'fade-left') { animProps.x = -30; }
        else if (animType === 'fade-right') { animProps.x = 30; }
        else { animProps.y = 20; } // Default to fade-up

        let target = element;
        // Apply stagger to direct children of these specific container types
        if (element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline') || element.classList.contains('product-grid') || element.classList.contains('summary-card-container')) {
            if (element.children.length > 0) {
                target = element.children;
                if (staggerAmount === 0) staggerAmount = 0.05;
                animProps.scrollTrigger.stagger = staggerAmount; // Add stagger to scrollTrigger
            }
        }
         // Remove stagger if target is the element itself (redundant check but safe)
         // if (target === element && animProps.stagger) delete animProps.stagger;
         // Stagger is now part of scrollTrigger, so no need to delete separately

        gsap.from(target, animProps);
    });

    // Parallax (runs independently)
    gsap.utils.toArray(document.querySelectorAll('.content-row .image-card')).forEach(card => {
        gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 } });
    });

    // Microinteractions (runs independently)
    document.querySelectorAll('.cta-button, .header-nav-link, .mobile-nav-link, .social-button, .icon-button, .user-dropdown-content a, #donate-button-header, .dropdown-link, .category-button, .product-buy-btn, .footer-link-button, #back-to-top-btn, .modal-close-btn, .summary-card, .view-toggle button')
        .forEach(button => {
            // Remove previous listeners if any to prevent duplicates if called multiple times
            button.removeEventListener('mousedown', handleButtonMouseDown);
            button.removeEventListener('mouseup', handleButtonMouseUp);
            button.removeEventListener('mouseleave', handleButtonMouseLeave);
            // Add new listeners
            button.addEventListener('mousedown', handleButtonMouseDown);
            button.addEventListener('mouseup', handleButtonMouseUp);
            if (!button.matches('#donate-button-header') && !button.matches('.header-nav-link')) {
                 button.addEventListener('mouseleave', handleButtonMouseLeave);
            }
    });
}
// Separate handlers for microinteractions
function handleButtonMouseDown(event) { gsap.to(event.currentTarget, { scale: 0.97, duration: 0.1 }); }
function handleButtonMouseUp(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }
function handleButtonMouseLeave(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }


// --- Click-based Dropdowns ---
function setupClickDropdowns() { const wrappers = document.querySelectorAll('.nav-item-wrapper'); wrappers.forEach(wrapper => { const trigger = wrapper.querySelector('.nav-dropdown-trigger'); const menu = wrapper.querySelector('.dropdown-menu'); if (!trigger || !menu) return; trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); wrappers.forEach(otherWrapper => { if (otherWrapper !== wrapper) otherWrapper.classList.remove('open'); }); wrapper.classList.toggle('open'); }); }); document.addEventListener('click', (event) => { wrappers.forEach(wrapper => { if (!wrapper.contains(event.target) && wrapper.classList.contains('open')) wrapper.classList.remove('open'); }); }); document.addEventListener('keydown', (event) => { if (event.key === "Escape") wrappers.forEach(wrapper => wrapper.classList.remove('open')); }); }

// --- Authentication Logic ---
function setupActionButtons() {
    const authContainer = document.getElementById('auth-container'); const loginForm = document.getElementById('login-form'); const registerForm = document.getElementById('register-form'); const forgotForm = document.getElementById('forgot-form'); const resetForm = document.getElementById('reset-form'); const loginFormWrapper = document.getElementById('login-form-wrapper'); const registerFormWrapper = document.getElementById('register-form-wrapper'); const forgotFormWrapper = document.getElementById('forgot-form-wrapper'); const resetFormWrapper = document.getElementById('reset-form-wrapper'); const loginMessage = document.getElementById('login-message'); const registerMessage = document.getElementById('register-message'); const forgotMessage = document.getElementById('forgot-message'); const resetMessage = document.getElementById('reset-message'); const authActionLink = document.getElementById('auth-action-link'); const registerActionLink = document.getElementById('register-action-link'); const forgotActionLink = document.getElementById('forgot-action-link'); const logoutLink = document.getElementById('logout-link'); const userNameSpan = document.getElementById('user-name'); const userStatusSpan = document.getElementById('user-status'); const adminDropdownSection = document.getElementById('admin-dropdown-section'); function showMessage(element, message, isSuccess = false) { if (!element) return; element.textContent = message; element.className = 'auth-message ' + (isSuccess ? 'success' : 'error'); } function showForm(formToShow) { if (!authContainer) return; authContainer.style.display = 'flex'; authContainer.classList.add('visible'); [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => { if(form) form.style.display = form === formToShow ? 'block' : 'none'; }); [loginMessage, registerMessage, forgotMessage, resetMessage].forEach(msg => { if(msg) showMessage(msg, ''); }); } window.showLoginForm = () => showForm(loginFormWrapper); window.showRegisterForm = () => showForm(registerFormWrapper); window.showForgotForm = () => showForm(forgotFormWrapper); window.showResetForm = () => showForm(resetFormWrapper); window.closeAuthForms = () => { if(authContainer) { authContainer.classList.remove('visible'); setTimeout(() => { authContainer.style.display = 'none'; }, 300); } }; if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); }); if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); }); if (forgotActionLink) forgotActionLink.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); }); const closeAuthButtons = document.querySelectorAll('#auth-container .close-auth-btn'); closeAuthButtons.forEach(btn => btn.addEventListener('click', closeAuthForms));
    // LOGIN
    if (loginForm) { loginForm.addEventListener('submit', async (e) => { e.preventDefault(); showMessage(loginMessage, 'Đang đăng nhập...'); const username = e.target.username.value; const password = e.target.password.value; try { const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }); const loginData = await loginResponse.json(); if (!loginResponse.ok) throw new Error(loginData.message || `Error: ${loginResponse.status}`); showMessage(loginMessage, 'Đăng nhập thành công! Đang tải thông tin...', true); localStorage.setItem('userId', loginData.userId); localStorage.setItem('username', loginData.username); await fetchAndUpdateUserInfo(); setTimeout(closeAuthForms, 500); } catch (error) { console.error("Login failed:", error); showMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'); } }); }
    // REGISTER
    if (registerForm) { registerForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; if (password !== confirmPassword) { showMessage(registerMessage, 'Mật khẩu nhập lại không khớp.'); return; } showMessage(registerMessage, 'Đang đăng ký...'); const username = e.target.username.value; const email = e.target.email.value; try { const response = await fetch(`${BACKEND_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`); showMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 1500); } catch (error) { console.error("Registration failed:", error); showMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.'); } }); }
    // FORGOT PASSWORD
     if (forgotForm) { forgotForm.addEventListener('submit', async (e) => { e.preventDefault(); showMessage(forgotMessage, 'Đang xử lý yêu cầu...'); const email = e.target.email.value; try { const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const data = await response.json(); if (!response.ok && response.status !== 200) { throw new Error(data.message || `Error: ${response.status}`); } showMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true); } catch (error) { console.error("Forgot password failed:", error); showMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.'); } }); }
     // RESET PASSWORD
      if (resetForm) { resetForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; const token = e.target.token.value; if (password !== confirmPassword) { showMessage(resetMessage, 'Mật khẩu mới không khớp.'); return; } if (!token) { showMessage(resetMessage, 'Thiếu mã token đặt lại.'); return; } showMessage(resetMessage, 'Đang đặt lại mật khẩu...'); try { const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`); showMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 2000); } catch (error) { console.error("Reset password failed:", error); showMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.'); } }); }
    // LOGOUT
    if (logoutLink) { logoutLink.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('userId'); localStorage.removeItem('username'); currentUserBalance = 0; currentUserIsAdmin = false; updateUserStatus(false); updateSidebarUserArea(false); console.log("User logged out."); }); }
    // Helper to Update Header UI
     function updateUserStatus(isLoggedIn, username = 'Khách') { const elements = { userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection }; if (!elements.userNameSpan || !elements.userStatusSpan || !elements.logoutLink || !elements.adminDropdownSection) { /* console.warn("Header user area elements missing."); */ return; } if (isLoggedIn) { elements.userNameSpan.textContent = username; [elements.authActionLink, elements.registerActionLink, elements.forgotActionLink].forEach(link => { if (link) link.style.display = 'none'; }); elements.logoutLink.style.display = 'flex'; elements.adminDropdownSection.style.display = currentUserIsAdmin ? 'block' : 'none'; } else { elements.userNameSpan.textContent = 'Khách'; [elements.authActionLink, elements.registerActionLink, elements.forgotActionLink].forEach(link => { if (link) link.style.display = 'flex'; }); elements.logoutLink.style.display = 'none'; elements.adminDropdownSection.style.display = 'none'; } }
     // Check Login Status on Load
     const checkLoginAndToken = async () => { const userId = localStorage.getItem('userId'); const username = localStorage.getItem('username'); if (userId && username) { console.log("User found in localStorage:", username); await fetchAndUpdateUserInfo(); } else { updateUserStatus(false); updateSidebarUserArea(false); } const urlParams = new URLSearchParams(window.location.search); const resetToken = urlParams.get('token'); if (resetToken) { showResetForm(); const tokenInput = document.getElementById('reset-token'); if (tokenInput) { tokenInput.value = resetToken; } else { console.warn("Reset token input field not found."); } window.history.replaceState({}, document.title, window.location.pathname); } };
     checkLoginAndToken();
}

// --- Fetch and Update User Info ---
async function fetchAndUpdateUserInfo() { console.log("Fetching user info..."); try { const userData = await fetchData('/users/me'); console.log("Fetched user data:", userData); currentUserBalance = userData.balance || 0; currentUserIsAdmin = userData.isAdmin || false; localStorage.setItem('username', userData.username); localStorage.setItem('userId', userData.userId); updateUserStatus(true, userData.username); updateSidebarUserArea(true, userData.username); } catch (error) { console.error("Failed to fetch user info:", error); localStorage.removeItem('userId'); localStorage.removeItem('username'); currentUserBalance = 0; currentUserIsAdmin = false; updateUserStatus(false); updateSidebarUserArea(false); } }

// --- Sidebar Update Function ---
function updateSidebarUserArea(isLoggedIn, username = 'Khách') { const sidebarUserInfoDiv = document.getElementById('sidebar-user-info'); if (!sidebarUserInfoDiv) return; const loginBtn = document.getElementById('sidebar-login-btn'); const registerBtn = document.getElementById('sidebar-register-btn'); const depositBtn = document.getElementById('sidebar-deposit-btn'); const logoutBtn = document.getElementById('sidebar-logout-btn'); const usernameSpan = document.getElementById('sidebar-username'); const balanceSpan = document.getElementById('sidebar-balance'); if (!loginBtn || !registerBtn || !depositBtn || !logoutBtn || !usernameSpan || !balanceSpan) { console.warn("Sidebar elements missing for update."); return; } if (isLoggedIn) { usernameSpan.textContent = username; balanceSpan.textContent = formatPrice(currentUserBalance); loginBtn.style.display = 'none'; registerBtn.style.display = 'none'; depositBtn.style.display = 'block'; logoutBtn.style.display = 'block'; } else { usernameSpan.textContent = 'Khách'; balanceSpan.textContent = '0đ'; loginBtn.style.display = 'block'; registerBtn.style.display = 'block'; depositBtn.style.display = 'none'; logoutBtn.style.display = 'none'; } }

// --- Basic Dropdown Actions ---
function setupDropdownActions() { const depositLink = document.getElementById('deposit-link'); const historyLink = document.getElementById('history-link'); const depositLinkMobile = document.getElementById('deposit-link-mobile'); const historyLinkMobile = document.getElementById('history-link-mobile'); const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); }; const handleHistoryClick = (e) => { e.preventDefault(); window.location.href = 'history.html'; }; if(depositLink) depositLink.addEventListener('click', handleDepositClick); if(historyLink) historyLink.addEventListener('click', handleHistoryClick); if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick); if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick); }

// --- Back to Top Button ---
function setupBackToTopButton() { const backToTopButton = document.getElementById("back-to-top-btn"); if (!backToTopButton) { return; } const scrollThreshold = 200; const checkScroll = () => { if (!backToTopButton) return; if (window.scrollY > scrollThreshold) { backToTopButton.classList.add("visible"); } else { backToTopButton.classList.remove("visible"); } }; window.addEventListener("scroll", checkScroll, { passive: true }); checkScroll(); backToTopButton.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }); }

// --- Modal Handling ---
function showModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.style.display = 'flex'; setTimeout(() => { modal.classList.add('visible'); }, 10); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function hideModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.classList.remove('visible'); setTimeout(() => { modal.style.display = 'none'; }, 300); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function showMessageModal(title, message, type = 'info') { const modal = document.getElementById('message-modal'); const titleEl = document.getElementById('message-modal-title'); const textEl = document.getElementById('message-modal-text'); const iconContainer = document.getElementById('message-modal-icon-container'); if (!modal || !titleEl || !textEl || !iconContainer) { console.error("Message modal elements not found."); alert(message); return; } titleEl.textContent = title; textEl.textContent = message; iconContainer.innerHTML = ''; let iconClass = 'fas '; let iconColorClass = ''; switch (type) { case 'success': iconClass += 'fa-check-circle'; iconColorClass = 'success'; break; case 'error': iconClass += 'fa-times-circle'; iconColorClass = 'error'; break; case 'warning': iconClass += 'fa-exclamation-triangle'; iconColorClass = 'warning'; break; default: iconClass += 'fa-info-circle'; iconColorClass = 'info'; break; } const icon = document.createElement('i'); icon.className = `${iconClass} modal-icon ${iconColorClass}`; iconContainer.appendChild(icon); showModal('message-modal'); }

// --- Purchase Flow Logic ---
function setupPurchaseModals() {
    const productArea = document.getElementById('dynamic-product-area'); const purchaseModal = document.getElementById('purchase-modal'); const confirmModal = document.getElementById('confirm-modal'); const processingModal = document.getElementById('processing-modal'); const purchaseForm = document.getElementById('purchase-form'); if (!productArea || !purchaseModal || !confirmModal || !processingModal || !purchaseForm) { /*console.warn("Purchase flow elements not found on this page.");*/ return; } let currentPurchaseData = {};
    productArea.addEventListener('click', (e) => { if (e.target.classList.contains('product-buy-btn')) { e.preventDefault(); if (!localStorage.getItem('userId')) { showMessageModal('Lỗi', 'Vui lòng đăng nhập để mua hàng!', 'error'); return; } const card = e.target.closest('.product-card'); if (!card) return; const productId = card.dataset.productId; const productName = card.dataset.productName || 'Sản phẩm'; const productPrice = parseInt(card.dataset.productPrice, 10) || 0; const stockStatus = card.dataset.stockStatus || 'in_stock'; if (stockStatus === 'contact' || stockStatus === 'check_price' || productPrice === 0) { let contactMsg = `Vui lòng liên hệ Admin qua Discord hoặc Facebook để ${productName === 'Bán Robux Chính Hãng' ? 'xem bảng giá Robux' : 'biết chi tiết dịch vụ này'}.`; showMessageModal('Thông tin', contactMsg, 'info'); return; } if (stockStatus === 'out_of_stock') { showMessageModal('Thông báo', `Sản phẩm "${productName}" hiện đã hết hàng.`, 'warning'); return; } if (currentUserBalance < productPrice) { showMessageModal('Thất bại!', 'Số dư của bạn không đủ để mua vật phẩm này. Vui lòng nạp thêm.', 'error'); return; } currentPurchaseData = { productId, productName, productPrice }; document.getElementById('purchase-item-name').textContent = productName; document.getElementById('purchase-item-id').value = productId; document.getElementById('purchase-total-price').textContent = formatPrice(productPrice); purchaseForm.reset(); showModal('purchase-modal'); } });
    purchaseForm.addEventListener('submit', (e) => { e.preventDefault(); if (!document.getElementById('purchase-confirm-details').checked) { showMessageModal('Lỗi', 'Bạn cần xác nhận đã cung cấp đúng thông tin.', 'warning'); return; } hideModal('purchase-modal'); document.getElementById('confirm-modal-text').textContent = `Bạn sẽ mua "${currentPurchaseData.productName}" với giá ${formatPrice(currentPurchaseData.productPrice)}?`; showModal('confirm-modal'); });
    document.getElementById('confirm-agree-btn')?.addEventListener('click', () => { hideModal('confirm-modal'); showModal('processing-modal'); const formData = new FormData(purchaseForm); const purchaseDetails = Object.fromEntries(formData.entries()); console.log("Attempting Purchase (will simulate backend call):", { ...currentPurchaseData, ...purchaseDetails }); const canAfford = currentUserBalance >= currentPurchaseData.productPrice; setTimeout(async () => { hideModal('processing-modal'); if (canAfford) { try { console.log("Simulating successful purchase backend call..."); await new Promise(resolve => setTimeout(resolve, 500)); await fetchAndUpdateUserInfo(); showMessageModal('Thành công!', 'Mua vật phẩm thành công!', 'success'); } catch (backendError) { console.error("Simulated backend purchase error:", backendError); showMessageModal('Thất bại!', `Lỗi khi xử lý giao dịch: ${backendError.message}`, 'error'); } } else { showMessageModal('Thất bại!', 'Số dư không đủ hoặc đã xảy ra lỗi. (Simulation)', 'error'); } }, 1500); });
    document.getElementById('confirm-cancel-btn')?.addEventListener('click', () => { hideModal('confirm-modal'); }); document.querySelectorAll('.modal-overlay .modal-close-btn').forEach(button => { button.addEventListener('click', (e) => { const modal = e.target.closest('.modal-overlay'); if (modal) { hideModal(modal.id); } }); }); document.getElementById('message-ok-btn')?.addEventListener('click', () => hideModal('message-modal')); document.getElementById('notification-ok-btn')?.addEventListener('click', () => hideModal('notification-modal')); document.querySelector('#purchase-modal .modal-cancel-btn')?.addEventListener('click', () => hideModal('purchase-modal')); document.querySelectorAll('.modal-overlay').forEach(overlay => { overlay.addEventListener('click', (e) => { if (e.target === overlay && overlay.id !== 'processing-modal' && overlay.id !== 'confirm-modal') { hideModal(overlay.id); } }); });
}


// --- Load Dynamic Shopping Page Data ---
async function loadShoppingPageData() {
    const productArea = document.getElementById('dynamic-product-area'); if (!productArea) { console.error("Dynamic product area container not found!"); return; } productArea.innerHTML = '<p style="text-align: center; padding: 2rem 0;">Đang tải sản phẩm...</p>';
    try {
        const [categories, products] = await Promise.all([ fetchData('/categories'), fetchData('/products') ]);
        productArea.innerHTML = ''; if (!categories || categories.length === 0) { productArea.innerHTML = '<p style="text-align: center; padding: 2rem 0;">Không tìm thấy danh mục nào.</p>'; return; }
        const productsByCategory = products.reduce((acc, product) => { const categoryId = product.category?._id || 'uncategorized'; if (!acc[categoryId]) acc[categoryId] = []; acc[categoryId].push(product); return acc; }, {});
        categories.forEach(category => { const categorySection = document.createElement('section'); categorySection.className = 'product-category-section'; categorySection.id = `category-${category._id}`; categorySection.dataset.animate = "fade-up"; const categoryTitle = document.createElement('h2'); categoryTitle.className = 'category-title'; categoryTitle.innerHTML = `<i class="${category.iconClass || 'fas fa-tag'} icon-left"></i>${category.name}`; categorySection.appendChild(categoryTitle); const productGrid = document.createElement('div'); productGrid.className = 'product-grid'; const categoryProducts = productsByCategory[category._id] || []; if (categoryProducts.length > 0) { categoryProducts.sort((a, b) => (a.displayOrder - b.displayOrder) || a.name.localeCompare(b.name)); categoryProducts.forEach(product => { productGrid.appendChild(createProductCardElement(product)); }); } else { productGrid.innerHTML = '<p>Chưa có sản phẩm nào trong danh mục này.</p>'; } categorySection.appendChild(productGrid); productArea.appendChild(categorySection); });
        ScrollTrigger.refresh(); // Refresh ScrollTrigger
        // Re-run animations AFTER content is added AND ScrollTrigger refreshed
        setTimeout(() => { setupProfessionalAnimations(); }, 50); // Small delay to ensure DOM update

    } catch (error) { console.error("Failed to load shopping page data:", error); productArea.innerHTML = `<p class="error" style="text-align: center; padding: 2rem 0;">Lỗi tải dữ liệu sản phẩm. Vui lòng thử lại. (${error.message})</p>`; }
}

function createProductCardElement(product) { const card = document.createElement('div'); card.className = 'product-card'; card.dataset.productId = product._id; card.dataset.productName = product.name; card.dataset.productPrice = product.price; card.dataset.stockStatus = product.stockStatus; let tagsHTML = product.tags?.map(tag => { let tagClass = ''; if (tag === 'hot') tagClass = 'hot-tag'; else if (tag === 'sale') tagClass = 'sale-tag'; return tagClass ? `<span class="product-tag ${tagClass}">${tag}</span>` : ''; }).join('') || ''; let priceHTML = ''; let buttonText = "Mua ngay"; let buttonDisabled = false; switch (product.stockStatus) { case 'contact': priceHTML = `<span class="sale-price">Liên hệ</span>`; buttonText = "Xem chi tiết"; break; case 'check_price': priceHTML = `<span class="sale-price">Xem giá</span>`; buttonText = "Xem bảng giá"; break; case 'out_of_stock': priceHTML = `<span class="sale-price">${formatPrice(product.price)}</span>`; buttonText = "Hết hàng"; buttonDisabled = true; break; default: if (product.originalPrice && product.originalPrice > product.price) { priceHTML = `<span class="original-price">${formatPrice(product.originalPrice)}</span> <span class="sale-price">${formatPrice(product.price)}</span>`; } else { priceHTML = `<span class="sale-price">${formatPrice(product.price)}</span>`; } break; } card.innerHTML = ` <div class="product-image-placeholder"> <img src="${product.imageUrl || 'images/product-placeholder.png'}" alt="${product.name}" loading="lazy"> ${tagsHTML} </div> <div class="product-info"> <h3 class="product-title">${product.name}</h3> <p class="product-meta">Đã bán: ${product.purchaseCount || 0}</p> <p class="product-price"> ${priceHTML} </p> <button class="cta-button product-buy-btn" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button> </div> `; return card; }


// ----- Initialization -----
function initializePage() {
    console.log("Initializing page (v1.8)...");
    updateYear(); setupHeaderScrollEffect(); setupMobileMenuToggle(); setupUserDropdown(); setupThemeToggle(); setupLanguageToggle(); setupProfessionalAnimations(); /* AdminPanel only in admin.js */ setupActionButtons(); setupDropdownActions(); setupClickDropdowns(); setupBackToTopButton();
    // Initialize purchase modals IF the elements exist
    if (document.getElementById('purchase-modal')) { setupPurchaseModals(); }
    // Load shopping data ONLY if on the shopping page
     if (document.body.classList.contains('shopping-page')) {
         if (typeof loadShoppingPageData === 'function') { loadShoppingPageData(); }
         else { console.error("loadShoppingPageData function not found!"); }
     }
     // Placeholder for history page loading
     if (document.body.classList.contains('history-page')) { console.log("History page detected, loadHistoryPageData() needs implementation."); /* if (typeof loadHistoryPageData === 'function') { loadHistoryPageData(); } */ }
    // Donate button listener
    const donateButtonHeader = document.getElementById('donate-button-header'); if (donateButtonHeader) { donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); }); } else { console.warn("Header donate button not found"); }
    // Age calculation
    const ageSpan = document.getElementById('age'); if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    console.log("Page initialization complete.");
}

// --- Run Initialization ---
document.addEventListener('DOMContentLoaded', initializePage);