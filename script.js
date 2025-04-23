console.log("Script version 1.2 running!"); // Updated version

// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }
function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }

// --- Header Scroll Effect ---
function setupHeaderScrollEffect() {
    const header = document.querySelector('.content-header');
    if (!header) return;
    const scrollThreshold = 10; // Pixels scrolled to trigger effect
    const checkScroll = () => {
        if (window.getComputedStyle(header).position === 'fixed') {
             header.classList.toggle('header-scrolled', window.scrollY > scrollThreshold);
        } else {
            header.classList.remove('header-scrolled');
        }
    };
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
}

// --- Mobile Menu Toggle ---
function setupMobileMenuToggle() {
    const toggleButton = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (!toggleButton || !mobileNav) { console.warn("Mobile menu elements not found."); return; }
    toggleButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isVisible = mobileNav.classList.toggle('visible');
        toggleButton.setAttribute('aria-expanded', isVisible);
    });
    mobileNav.addEventListener('click', (event) => {
        if (event.target.closest('.mobile-nav-link')) {
            mobileNav.classList.remove('visible');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('click', (event) => {
        if (!mobileNav.contains(event.target) && !toggleButton.contains(event.target) && mobileNav.classList.contains('visible')) {
            mobileNav.classList.remove('visible');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && mobileNav.classList.contains('visible')) {
            mobileNav.classList.remove('visible');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });
}

// --- User Dropdown Toggle ---
function setupUserDropdown() {
    const trigger = document.getElementById('user-area-trigger');
    const dropdown = document.getElementById('user-dropdown');
    const userArea = document.querySelector('.user-area');
    if (!trigger || !dropdown || !userArea) { console.warn("User dropdown elements not found."); return; }
    trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdown.classList.toggle('visible');
        userArea.classList.toggle('open');
    });
    document.addEventListener('click', (event) => {
        if (!userArea.contains(event.target) && dropdown.classList.contains('visible')) {
            dropdown.classList.remove('visible');
            userArea.classList.remove('open');
        }
    });
    dropdown.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            dropdown.classList.remove('visible');
            userArea.classList.remove('open');
        }
    });
}

// --- Theme Toggle ---
function setupThemeToggle() {
    const themeButton = document.getElementById('theme-toggle');
    if (!themeButton) { console.warn("Theme toggle button not found."); return; }
    const themeIcon = themeButton.querySelector('i');
    if (!themeIcon) { console.warn("Theme toggle icon not found."); return; }
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme'); document.body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun');
        } else {
            document.body.classList.add('dark-theme'); document.body.classList.remove('light-theme');
            themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon');
        }
    };
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
    themeButton.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// --- Language Toggle (Placeholder) ---
function setupLanguageToggle() {
     const langButton = document.getElementById('language-toggle');
     if(langButton) { langButton.addEventListener('click', () => { alert('Language switching coming soon!'); }); }
}

// --- GSAP Animations ---
function setupProfessionalAnimations() {
    // ... (Keep existing GSAP animation setup code) ...
     const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };
    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']");
    const heroCta = document.querySelector(".hero-cta[data-animate='fade-up']");

    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }
    if (heroCta) { gsap.from(heroCta, { ...defaultOnLoadAnimation, delay: parseFloat(heroCta.dataset.delay) || 0.7 }); }

    gsap.utils.toArray(document.querySelectorAll('[data-animate]:not(.hero-title):not(.hero-subtitle):not(.hero-cta)')).forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0;
        let staggerAmount = parseFloat(element.dataset.stagger) || 0;
        const animType = element.dataset.animate;
        let animProps = { opacity: 0, duration: 0.6, ease: "power2.out", delay: delay };
        if (animType === 'fade-left') { animProps.x = -30; }
        else if (animType === 'fade-right') { animProps.x = 30; }
        else { animProps.y = 20; }
        let target = element;
        if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline') || element.classList.contains('product-grid') || element.classList.contains('info-box') || element.classList.contains('notification-bar') ) {
             if (element.children.length > 0) {
                target = element.children;
                if (staggerAmount === 0) staggerAmount = 0.05;
                if (staggerAmount > 0) animProps.stagger = staggerAmount;
            }
        }
        if (target === element && animProps.stagger) delete animProps.stagger;
        gsap.from(target, { ...animProps, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true } });
    });

     gsap.utils.toArray(document.querySelectorAll('.content-row .image-card')).forEach(card => {
        gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 } });
    });

    document.querySelectorAll('.cta-button, .header-nav-link, .mobile-nav-link, .social-button, .icon-button, .user-dropdown-content a, .auth-link, #donate-button-header, .dropdown-link, .category-button, .product-buy-btn, .footer-link-button, #back-to-top-btn, .modal-close-btn')
        .forEach(button => {
            button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.97, duration: 0.1 }));
            button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 }));
            if (!button.matches('#donate-button-header') && !button.matches('.header-nav-link')) {
                 button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 }));
            }
    });
}

// --- Click-based Dropdowns ---
function setupClickDropdowns() {
    // ... (Keep existing dropdown code) ...
     const wrappers = document.querySelectorAll('.nav-item-wrapper');
    wrappers.forEach(wrapper => {
        const trigger = wrapper.querySelector('.nav-dropdown-trigger');
        const menu = wrapper.querySelector('.dropdown-menu');
        if (!trigger || !menu) return;
        trigger.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation();
            wrappers.forEach(otherWrapper => { if (otherWrapper !== wrapper) otherWrapper.classList.remove('open'); });
            wrapper.classList.toggle('open');
        });
    });
    document.addEventListener('click', (event) => {
        wrappers.forEach(wrapper => { if (!wrapper.contains(event.target) && wrapper.classList.contains('open')) wrapper.classList.remove('open'); });
    });
    document.addEventListener('keydown', (event) => {
         if (event.key === "Escape") wrappers.forEach(wrapper => wrapper.classList.remove('open'));
     });
}

// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing code) ... */ }

// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';
function setupActionButtons() {
    // ... (Keep existing Auth setup, form listeners, login/register/forgot/reset handlers) ...
    // Important: Ensure the showForm, showMessage, updateUserStatus functions are kept
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

    const authActionLink = document.getElementById('auth-action-link');
    const registerActionLink = document.getElementById('register-action-link');
    const forgotActionLink = document.getElementById('forgot-action-link');
    const logoutLink = document.getElementById('logout-link');

    const userNameSpan = document.getElementById('user-name');
    const userStatusSpan = document.getElementById('user-status');

    function showMessage(element, message, isSuccess = false) {
        if (!element) return;
        element.textContent = message;
        element.className = 'auth-message ' + (isSuccess ? 'success' : 'error');
    }

    function showForm(formToShow) {
        if (!authContainer) return;
        authContainer.style.display = 'flex'; // Use flex instead of block
        authContainer.classList.add('visible'); // Use class for animation control
        [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => {
           if(form) form.style.display = form === formToShow ? 'block' : 'none';
        });
        [loginMessage, registerMessage, forgotMessage, resetMessage].forEach(msg => { if(msg) showMessage(msg, ''); });
    }

    window.showLoginForm = () => showForm(loginFormWrapper);
    window.showRegisterForm = () => showForm(registerFormWrapper);
    window.showForgotForm = () => showForm(forgotFormWrapper);
    window.showResetForm = () => showForm(resetFormWrapper);
    window.closeAuthForms = () => {
        if(authContainer) {
            authContainer.classList.remove('visible');
            // Optional: Wait for fade-out before setting display none
            setTimeout(() => { authContainer.style.display = 'none'; }, 300); // Match transition duration
        }
    }

    if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    if (forgotActionLink) forgotActionLink.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); });

     // Add listener to close button inside auth modal
     const closeAuthButtons = document.querySelectorAll('#auth-container .close-auth-btn');
     closeAuthButtons.forEach(btn => btn.addEventListener('click', closeAuthForms));


    // --- Form Submissions (Keep existing) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { e.preventDefault(); showMessage(loginMessage, 'Đang đăng nhập...'); const username = e.target.username.value; const password = e.target.password.value; try { const response = await fetch(`${BACKEND_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`); showMessage(loginMessage, 'Đăng nhập thành công!', true); localStorage.setItem('userId', data.userId); localStorage.setItem('username', data.username); updateUserStatus(true, data.username); updateSidebarUserArea(true, data.username); setTimeout(closeAuthForms, 1000); } catch (error) { console.error("Login failed:", error); showMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'); } });
    }
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; if (password !== confirmPassword) { showMessage(registerMessage, 'Mật khẩu nhập lại không khớp.'); return; } showMessage(registerMessage, 'Đang đăng ký...'); const username = e.target.username.value; const email = e.target.email.value; try { const response = await fetch(`${BACKEND_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`); showMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 1500); } catch (error) { console.error("Registration failed:", error); showMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.'); } });
    }
     if (forgotForm) {
         forgotForm.addEventListener('submit', async (e) => { e.preventDefault(); showMessage(forgotMessage, 'Đang xử lý yêu cầu...'); const email = e.target.email.value; try { const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const data = await response.json(); if (!response.ok && response.status !== 200) { throw new Error(data.message || `Error: ${response.status}`); } showMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true); } catch (error) { console.error("Forgot password failed:", error); showMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.'); } });
     }
     if (resetForm) {
         resetForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; const token = e.target.token.value; if (password !== confirmPassword) { showMessage(resetMessage, 'Mật khẩu mới không khớp.'); return; } if (!token) { showMessage(resetMessage, 'Thiếu mã token đặt lại.'); return; } showMessage(resetMessage, 'Đang đặt lại mật khẩu...'); try { const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Error: ${response.status}`); showMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 2000); } catch (error) { console.error("Reset password failed:", error); showMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.'); } });
     }
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('userId'); localStorage.removeItem('username'); updateUserStatus(false); updateSidebarUserArea(false); console.log("User logged out."); });
    }

    // --- Helper to Update Header UI (Keep existing) ---
     function updateUserStatus(isLoggedIn, username = 'Khách') { if (!userNameSpan || !userStatusSpan || !authActionLink || !registerActionLink || !forgotActionLink || !logoutLink) { console.warn("Header user area elements not found for UI update."); return; } if (isLoggedIn) { userNameSpan.textContent = username; if(authActionLink) authActionLink.style.display = 'none'; if(registerActionLink) registerActionLink.style.display = 'none'; if(forgotActionLink) forgotActionLink.style.display = 'none'; if(logoutLink) logoutLink.style.display = 'flex'; } else { userNameSpan.textContent = 'Khách'; if(authActionLink) authActionLink.style.display = 'flex'; if(registerActionLink) registerActionLink.style.display = 'flex'; if(forgotActionLink) forgotActionLink.style.display = 'flex'; if(logoutLink) logoutLink.style.display = 'none'; } }

     // --- Check Login Status on Load and Handle Reset Token (Keep existing)---
     const checkLoginAndToken = () => { const userId = localStorage.getItem('userId'); const username = localStorage.getItem('username'); if (userId && username) { console.log("User logged in:", username); updateUserStatus(true, username); updateSidebarUserArea(true, username); } else { updateUserStatus(false); updateSidebarUserArea(false); } const urlParams = new URLSearchParams(window.location.search); const resetToken = urlParams.get('token'); if (resetToken) { console.log("Password reset token found in URL."); showResetForm(); const tokenInput = document.getElementById('reset-token'); if (tokenInput) { tokenInput.value = resetToken; } else { console.warn("Reset token input field not found."); } window.history.replaceState({}, document.title, window.location.pathname); } };
     checkLoginAndToken();
}

// --- Sidebar Update Function ---
function updateSidebarUserArea(isLoggedIn, username = 'Khách') {
    // ... (Keep existing sidebar update code) ...
     const sidebarUserInfoDiv = document.getElementById('sidebar-user-info'); if (!sidebarUserInfoDiv) return; const loginBtn = document.getElementById('sidebar-login-btn'); const registerBtn = document.getElementById('sidebar-register-btn'); const depositBtn = document.getElementById('sidebar-deposit-btn'); const logoutBtn = document.getElementById('sidebar-logout-btn'); const usernameSpan = document.getElementById('sidebar-username'); const balanceSpan = document.getElementById('sidebar-balance'); if (!loginBtn || !registerBtn || !depositBtn || !logoutBtn || !usernameSpan || !balanceSpan) { console.warn("Sidebar elements missing for update."); return; } if (isLoggedIn) { usernameSpan.textContent = username; balanceSpan.textContent = 'N/A'; loginBtn.style.display = 'none'; registerBtn.style.display = 'none'; depositBtn.style.display = 'block'; logoutBtn.style.display = 'block'; } else { usernameSpan.textContent = 'Khách'; balanceSpan.textContent = '0đ'; loginBtn.style.display = 'block'; registerBtn.style.display = 'block'; depositBtn.style.display = 'none'; logoutBtn.style.display = 'none'; }
}

// --- Basic Dropdown Actions ---
function setupDropdownActions() {
    // ... (Keep existing deposit/history alert placeholders) ...
     const depositLink = document.getElementById('deposit-link'); const historyLink = document.getElementById('history-link'); const depositLinkMobile = document.getElementById('deposit-link-mobile'); const historyLinkMobile = document.getElementById('history-link-mobile'); const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); }; const handleHistoryClick = (e) => { e.preventDefault(); alert('Lịch sử mua hàng function coming soon!'); }; if(depositLink) depositLink.addEventListener('click', handleDepositClick); if(historyLink) historyLink.addEventListener('click', handleHistoryClick); if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick); if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick);
    // NOTE: Buy button listeners moved to setupPurchaseModals
}

// --- Back to Top Button ---
function setupBackToTopButton() {
    // ... (Keep existing back-to-top code) ...
     const backToTopButton = document.getElementById("back-to-top-btn"); if (!backToTopButton) { return; } const scrollThreshold = 200; const checkScroll = () => { if (!backToTopButton) return; if (window.scrollY > scrollThreshold) { backToTopButton.classList.add("visible"); } else { backToTopButton.classList.remove("visible"); } }; window.addEventListener("scroll", checkScroll, { passive: true }); checkScroll(); backToTopButton.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
}

// --- NEW: Modal Handling ---
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // Set display flex first
        // Use setTimeout to allow the display change to render before adding class
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10); // Small delay
    } else {
        console.error(`Modal with ID ${modalId} not found.`);
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('visible');
        // Wait for fade out animation before setting display none
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Should match CSS transition duration
    } else {
        console.error(`Modal with ID ${modalId} not found.`);
    }
}

function showMessageModal(title, message, type = 'info') { // types: success, error, warning, info
    const modal = document.getElementById('message-modal');
    const titleEl = document.getElementById('message-modal-title');
    const textEl = document.getElementById('message-modal-text');
    const iconContainer = document.getElementById('message-modal-icon-container');

    if (!modal || !titleEl || !textEl || !iconContainer) {
        console.error("Message modal elements not found.");
        alert(message); // Fallback
        return;
    }

    titleEl.textContent = title;
    textEl.textContent = message;
    iconContainer.innerHTML = ''; // Clear previous icon

    let iconClass = 'fas ';
    let iconColorClass = '';
    switch (type) {
        case 'success':
            iconClass += 'fa-check-circle';
            iconColorClass = 'success';
            break;
        case 'error':
            iconClass += 'fa-times-circle';
            iconColorClass = 'error';
             break;
        case 'warning':
            iconClass += 'fa-exclamation-triangle';
             iconColorClass = 'warning';
            break;
        default: // info
            iconClass += 'fa-info-circle';
            iconColorClass = 'info';
            break;
    }

    const icon = document.createElement('i');
    icon.className = `${iconClass} modal-icon ${iconColorClass}`;
    iconContainer.appendChild(icon);

    showModal('message-modal');
}

// --- NEW: Purchase Flow Logic ---
function setupPurchaseModals() {
    const buyButtons = document.querySelectorAll('.product-buy-btn');
    const purchaseModal = document.getElementById('purchase-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const processingModal = document.getElementById('processing-modal');
    const purchaseForm = document.getElementById('purchase-form');

    if (!purchaseModal || !confirmModal || !processingModal || !purchaseForm) {
        console.warn("One or more purchase-related modals or form not found.");
        return;
    }

    // --- Populate Purchase Modal ---
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

             // 1. Check Login Status
            if (!localStorage.getItem('userId')) {
                 // Use the new message modal for better UX
                showMessageModal('Lỗi', 'Vui lòng đăng nhập để mua hàng!', 'error');
                // Optionally show the login form after the message modal is closed
                // setTimeout(showLoginForm, 1500); // Delay might be needed depending on modal close timing
                return; // Stop the purchase process
            }

            const card = e.target.closest('.product-card');
            if (!card) return;

            const productId = card.dataset.productId;
            const productName = card.dataset.productName || 'Sản phẩm không rõ';
            const productPrice = parseInt(card.dataset.productPrice, 10) || 0;

            // Special handling for "Contact" or "View Price List" items
            if (productPrice === 0) {
                showMessageModal('Thông tin', `Vui lòng liên hệ Admin qua Discord hoặc Facebook để ${productName === 'Bán Robux Chính Hãng' ? 'xem bảng giá Robux' : 'biết chi tiết dịch vụ cày thuê'}.`, 'info');
                return;
            }

            // Populate the purchase modal
            document.getElementById('purchase-item-name').textContent = productName;
            document.getElementById('purchase-item-id').value = productId;
            document.getElementById('purchase-total-price').textContent = formatPrice(productPrice);

            // Reset form fields
            purchaseForm.reset();

            showModal('purchase-modal');
        });
    });

    // --- Handle Purchase Form Submission ---
    purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Basic validation (checkbox) - browser handles 'required' on inputs
         if (!document.getElementById('purchase-confirm-details').checked) {
             showMessageModal('Lỗi', 'Bạn cần xác nhận đã cung cấp đúng thông tin.', 'warning');
            return;
         }

        hideModal('purchase-modal');
        // Populate confirmation text (optional, can be generic)
        const productName = document.getElementById('purchase-item-name').textContent;
        const price = document.getElementById('purchase-total-price').textContent;
         document.getElementById('confirm-modal-text').textContent = `Bạn sẽ mua "${productName}" với giá ${price}?`;
        showModal('confirm-modal');
    });

    // --- Handle Confirmation ---
    document.getElementById('confirm-agree-btn')?.addEventListener('click', () => {
        hideModal('confirm-modal');
        showModal('processing-modal');

        // ** SIMULATE PURCHASE **
        // In a real app, you would send data from purchaseForm to your backend here
        console.log("Simulating purchase...");
        const formData = new FormData(purchaseForm);
        const purchaseData = Object.fromEntries(formData.entries());
        console.log("Purchase Data:", purchaseData);

        // Simulate network delay and success/failure
        const isSuccess = Math.random() > 0.2; // 80% chance of success for demo
        setTimeout(() => {
            hideModal('processing-modal');
            if (isSuccess) {
                showMessageModal('Thành công!', 'Mua vật phẩm thành công! Vui lòng kiểm tra tài khoản của bạn.', 'success');
                 // TODO: Update user balance if applicable (needs backend call)
            } else {
                 showMessageModal('Thất bại!', 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.', 'error');
            }
        }, 2500); // Simulate 2.5 second processing time
    });

    document.getElementById('confirm-cancel-btn')?.addEventListener('click', () => {
        hideModal('confirm-modal');
    });

    // --- Close Buttons for Modals ---
    document.querySelectorAll('.modal-overlay .modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    document.getElementById('message-ok-btn')?.addEventListener('click', () => hideModal('message-modal'));
    document.getElementById('notification-ok-btn')?.addEventListener('click', () => hideModal('notification-modal'));
    document.querySelector('#purchase-modal .modal-cancel-btn')?.addEventListener('click', () => hideModal('purchase-modal'));

     // --- Close Modal on Overlay Click ---
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // If the click is directly on the overlay (not the content inside)
            if (e.target === overlay) {
                // Don't close processing or confirmation modals this way
                 if (overlay.id !== 'processing-modal' && overlay.id !== 'confirm-modal') {
                    hideModal(overlay.id);
                 }
            }
        });
    });
}


// ----- Initialization -----
function initializePage() {
    console.log("Initializing page (v1.2)..."); // Update log
    updateYear();
    setupHeaderScrollEffect();
    setupMobileMenuToggle();
    setupUserDropdown();
    setupThemeToggle();
    setupLanguageToggle();
    setupProfessionalAnimations(); // Handles GSAP scroll/load animations
    setupAdminPanel();
    setupActionButtons(); // Auth modals + login/logout etc.
    setupDropdownActions(); // Basic dropdown alerts
    setupClickDropdowns(); // Header 'Dịch vụ' dropdown
    setupBackToTopButton();
    setupPurchaseModals(); // NEW: Handle purchase flow

    // Donate Button Listener
    const donateButtonHeader = document.getElementById('donate-button-header');
    if (donateButtonHeader) {
        donateButtonHeader.addEventListener('click', (e) => {
            e.preventDefault(); alert('Donate function coming soon!');
        });
    } else { console.warn("Header donate button not found"); }

    // Age calculation
    const ageSpan = document.getElementById('age');
    if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }

    console.log("Page initialization complete.");
}

// --- Run Initialization ---
document.addEventListener('DOMContentLoaded', initializePage);