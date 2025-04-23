console.log("Script version 1.9.6 - Global Auth Form Functions"); // Increment version

// --- Global Constants & Variables ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';

// --- Global DOM Element References ---
let userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection;
let sidebarUserInfoDiv, sidebarLoginBtn, sidebarRegisterBtn, sidebarDepositBtn, sidebarLogoutBtn, sidebarUsernameSpan, sidebarBalanceSpan;
let dynamicProductArea;
let purchaseModal, purchaseForm, purchaseItemId, purchaseItemName, purchaseTotalPrice, purchaseMessage, purchaseCloseBtn, purchaseCancelBtn;
// --- ADDED: Auth Modal Wrappers (Global) ---
let authContainer, loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper;


function initializeDOMElements() {
    // Header Elements
    userNameSpan = document.getElementById('user-name'); userStatusSpan = document.getElementById('user-status'); authActionLink = document.getElementById('auth-action-link'); registerActionLink = document.getElementById('register-action-link'); forgotActionLink = document.getElementById('forgot-action-link'); logoutLink = document.getElementById('logout-link'); adminDropdownSection = document.getElementById('admin-dropdown-section');
    // Sidebar Elements
    sidebarUserInfoDiv = document.getElementById('sidebar-user-info'); sidebarLoginBtn = document.getElementById('sidebar-login-btn'); sidebarRegisterBtn = document.getElementById('sidebar-register-btn'); sidebarDepositBtn = document.getElementById('sidebar-deposit-btn'); sidebarLogoutBtn = document.getElementById('sidebar-logout-btn'); sidebarUsernameSpan = document.getElementById('sidebar-username'); sidebarBalanceSpan = document.getElementById('sidebar-balance');
    // Shopping Page Element
    dynamicProductArea = document.getElementById('dynamic-product-area');
    // Purchase Modal Elements
    purchaseModal = document.getElementById('purchase-modal'); purchaseForm = document.getElementById('purchase-form'); purchaseItemId = document.getElementById('purchase-item-id'); purchaseItemName = document.getElementById('purchase-item-name'); purchaseTotalPrice = document.getElementById('purchase-total-price'); purchaseMessage = document.getElementById('purchase-message');
    if (purchaseModal) { purchaseCloseBtn = purchaseModal.querySelector('.modal-close-btn'); purchaseCancelBtn = purchaseModal.querySelector('.modal-cancel-btn'); }
    // --- ADDED: Auth Modal Wrappers Init ---
    authContainer = document.getElementById('auth-container');
    loginFormWrapper = document.getElementById('login-form-wrapper');
    registerFormWrapper = document.getElementById('register-form-wrapper');
    forgotFormWrapper = document.getElementById('forgot-form-wrapper');
    resetFormWrapper = document.getElementById('reset-form-wrapper');
}

// --- fetchData Utility Function --- (No changes)
async function fetchData(endpoint, options = {}) { const headers = { 'Content-Type': 'application/json', ...options.headers, }; const tempUserId = localStorage.getItem('userId'); if (tempUserId) { headers['x-temp-userid'] = tempUserId; } const config = { method: options.method || 'GET', headers: headers, }; if (options.body) { config.body = options.body; } try { const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config); const contentType = response.headers.get("content-type"); let data; if (contentType && contentType.indexOf("application/json") !== -1) { data = await response.json(); } else { data = { message: await response.text() }; if (!response.ok) { throw new Error(data.message || `Request failed with status ${response.status}`); } } if (!response.ok) { throw new Error(data.message || response.statusText || `Request failed with status ${response.status}`); } return data; } catch (error) { console.error(`Fetch error for ${endpoint}:`, error); throw error; } }

// --- Global UI Update Functions --- (No changes)
function updateUserStatus(isLoggedIn, username = 'Khách', isAdmin = false) { if (!userNameSpan || !adminDropdownSection || !logoutLink) { return; } const authLinks = [authActionLink, registerActionLink, forgotActionLink].filter(Boolean); if (isLoggedIn) { userNameSpan.textContent = username; authLinks.forEach(link => { if (link) link.style.display = 'none'; }); logoutLink.style.display = 'flex'; adminDropdownSection.style.display = isAdmin ? 'block' : 'none'; localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false'); } else { userNameSpan.textContent = 'Khách'; authLinks.forEach(link => { if (link) link.style.display = 'flex'; }); logoutLink.style.display = 'none'; adminDropdownSection.style.display = 'none'; localStorage.removeItem('isAdmin'); } }
function updateSidebarUserArea(isLoggedIn, username = 'Khách', balance = 0) { if (!sidebarUserInfoDiv || !sidebarLoginBtn || !sidebarRegisterBtn || !sidebarDepositBtn || !sidebarLogoutBtn || !sidebarUsernameSpan || !sidebarBalanceSpan) { return; } if (isLoggedIn) { sidebarUsernameSpan.textContent = username; sidebarBalanceSpan.textContent = formatPrice(balance); sidebarLoginBtn.style.display = 'none'; sidebarRegisterBtn.style.display = 'none'; sidebarDepositBtn.style.display = 'block'; sidebarLogoutBtn.style.display = 'block'; } else { sidebarUsernameSpan.textContent = 'Khách'; sidebarBalanceSpan.textContent = '0đ'; sidebarLoginBtn.style.display = 'block'; sidebarRegisterBtn.style.display = 'block'; sidebarDepositBtn.style.display = 'none'; sidebarLogoutBtn.style.display = 'none'; } }
function formatPrice(price) { if (price === null || price === undefined || isNaN(price)) { return 'N/A'; } if (typeof price === 'string') { const numPrice = parseFloat(price); if (isNaN(numPrice)) return price; price = numPrice; } return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- MOVED: Auth Form Display Functions (Global Scope) ---
function showForm(formToShow) {
    // Use globally defined authContainer and wrapper elements
    if (!authContainer || !loginFormWrapper || !registerFormWrapper || !forgotFormWrapper || !resetFormWrapper) {
        console.error("Auth modal wrappers not initialized!");
        return;
    }
    authContainer.style.display = 'flex';
    authContainer.classList.add('visible');
    [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => {
        if(form) form.style.display = form === formToShow ? 'block' : 'none';
    });
    // Clear previous messages in all forms when showing a new one
    const messageElements = [
        document.getElementById('login-message'),
        document.getElementById('register-message'),
        document.getElementById('forgot-message'),
        document.getElementById('reset-message')
    ];
    messageElements.forEach(msg => { if(msg) { msg.textContent = ''; msg.className = 'auth-message'; } });
}
// Make functions globally available for inline onclick handlers
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
// --- END MOVED ---


// --- Shopping Page Dynamic Loading --- (No changes)
async function loadAndDisplayShoppingData() { if (!dynamicProductArea) { return; } dynamicProductArea.innerHTML = '<p style="text-align: center; padding: 2rem;">Đang tải sản phẩm...</p>'; try { const [categories, products] = await Promise.all([ fetchData('/categories'), fetchData('/products') ]); dynamicProductArea.innerHTML = ''; if (!categories || categories.length === 0) { dynamicProductArea.innerHTML = '<p style="text-align: center; padding: 2rem;">Không tìm thấy danh mục sản phẩm nào.</p>'; return; } categories.forEach(category => { const categorySection = createCategorySectionElement(category); const productGrid = categorySection.querySelector('.product-grid'); const categoryProducts = products.filter(product => product.category?._id === category._id); if (categoryProducts.length > 0) { categoryProducts.forEach(product => productGrid.appendChild(createProductCardElement(product))); } else { productGrid.innerHTML = '<p style="font-size: 0.9em; color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Chưa có sản phẩm trong danh mục này.</p>'; } dynamicProductArea.appendChild(categorySection); }); setTimeout(() => { setupProfessionalAnimations(); setupShoppingPageBuyListeners(); }, 100); } catch (error) { console.error("Error loading shopping page data:", error); dynamicProductArea.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--danger-color);">Lỗi tải sản phẩm: ${error.message}. Vui lòng thử lại sau.</p>`; } }
function createCategorySectionElement(category) { const section = document.createElement('section'); section.classList.add('product-category-section'); section.dataset.animate = "fade-up"; const title = document.createElement('h2'); title.classList.add('category-title'); title.innerHTML = `<i class="${category.iconClass || 'fas fa-tag'} icon-left"></i>${category.name}`; const grid = document.createElement('div'); grid.classList.add('product-grid'); section.appendChild(title); section.appendChild(grid); return section; }
function createProductCardElement(product) { const card = document.createElement('div'); card.classList.add('product-card'); const originalPriceHTML = product.originalPrice && product.originalPrice > product.price ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''; const salePriceHTML = `<span class="sale-price">${formatPrice(product.price)}</span>`; let tagHTML = ''; if (product.tags?.includes('hot')) { tagHTML = '<span class="product-tag hot-tag">Hot</span>'; } else if (product.tags?.includes('sale') || (product.originalPrice && product.originalPrice > product.price)) { tagHTML = '<span class="product-tag sale-tag">Sale</span>'; } let buttonText = 'Mua ngay'; let buttonDisabled = false; let priceDisplay = `${originalPriceHTML} ${salePriceHTML}`; switch (product.stockStatus) { case 'out_of_stock': buttonText = 'Hết hàng'; buttonDisabled = true; break; case 'contact': buttonText = 'Liên hệ'; priceDisplay = `<span class="sale-price">Liên hệ</span>`; break; case 'check_price': buttonText = 'Xem bảng giá'; priceDisplay = `<span class="sale-price">Giá tốt</span>`; break; } card.innerHTML = `<div class="product-image-placeholder"><img src="${product.imageUrl || 'images/product-placeholder.png'}" alt="${product.name}" loading="lazy">${tagHTML}</div><div class="product-info"><h3 class="product-title">${product.name}</h3><p class="product-meta">Đã bán: ${product.purchaseCount || 0}</p><p class="product-price">${priceDisplay}</p><button class="cta-button product-buy-btn" data-product-id="${product._id}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button></div>`; return card; }
function handleBuyButtonClick(event) { if (!event.target.classList.contains('product-buy-btn')) return; event.preventDefault(); const button = event.target; const productCard = button.closest('.product-card'); if (!productCard) return; const productTitleElement = productCard.querySelector('.product-title'); const productPriceElement = productCard.querySelector('.sale-price'); const productTitle = productTitleElement?.textContent || 'Sản phẩm'; const productId = button.dataset.productId; let productPrice = NaN; const priceText = productPriceElement?.textContent || ''; const priceMatch = priceText.match(/[\d,.]+/); if (priceMatch) { productPrice = parseFloat(priceMatch[0].replace(/[^0-9]/g, '')); } if (button.disabled) { alert(`Sản phẩm "${productTitle}" hiện đang hết hàng hoặc cần liên hệ.`); return; } if (!localStorage.getItem('userId')) { alert('Vui lòng đăng nhập để mua hàng!'); if (typeof showLoginForm === 'function') showLoginForm(); } else { openPurchaseModal(productId, productTitle, productPrice); } }
function openPurchaseModal(id, name, price) { if (!purchaseModal || !purchaseItemId || !purchaseItemName || !purchaseTotalPrice || !purchaseForm) { console.error("Purchase modal elements not found!"); alert("Lỗi: Không thể mở form mua hàng."); return; } purchaseForm.reset(); if(purchaseMessage) purchaseMessage.textContent = ''; if(purchaseMessage) purchaseMessage.className = 'auth-message'; purchaseItemId.value = id || ''; purchaseItemName.textContent = name || 'Sản phẩm không xác định'; const priceHiddenInput = document.getElementById('purchase-item-price'); if (priceHiddenInput) priceHiddenInput.value = !isNaN(price) ? price : ''; purchaseTotalPrice.textContent = formatPrice(price); showModal('purchase-modal'); }
function setupShoppingPageBuyListeners() { if (!document.body.classList.contains('shopping-page')) return; const productArea = document.getElementById('dynamic-product-area'); if (!productArea) return; productArea.removeEventListener('click', handleBuyButtonClick); productArea.addEventListener('click', handleBuyButtonClick); }

// --- Header Scroll Effect --- (No changes needed)
function setupHeaderScrollEffect() { /* ... */ }

// --- Mobile Menu Toggle --- (No changes needed)
function setupMobileMenuToggle() { /* ... */ }

// --- User Dropdown Toggle --- (No changes needed)
function setupUserDropdown() { /* ... */ }

// --- Theme Toggle --- (No changes needed)
function setupThemeToggle() { /* ... */ }

// --- Language Toggle --- (No changes needed)
function setupLanguageToggle() { /* ... */ }

// --- GSAP Animations --- (No changes needed)
function setupProfessionalAnimations() { /* ... */ }
function handleButtonMouseDown(event) { /* ... */ }
function handleButtonMouseUp(event) { /* ... */ }
function handleButtonMouseLeave(event) { /* ... */ }

// --- Click-based Dropdowns --- (No changes needed)
function setupClickDropdowns() { /* ... */ }

// --- Authentication Logic Setup ---
function setupActionButtons() {
    // Get references to forms and specific message elements inside them
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const resetForm = document.getElementById('reset-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const forgotMessage = document.getElementById('forgot-message');
    const resetMessage = document.getElementById('reset-message');
    // Note: Modal wrappers (authContainer etc.) are now global

    // Helper to show messages ONLY within auth forms
    function showAuthMessage(element, message, isSuccess = false) {
        if (!element) return;
        element.textContent = message;
        element.className = 'auth-message ' + (isSuccess ? 'success' : 'error');
    }

    // Setup trigger links (use global functions)
    if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    if (forgotActionLink) forgotActionLink.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); });

    // Setup close buttons (use global function)
    const closeAuthButtons = document.querySelectorAll('#auth-container .close-auth-btn');
    closeAuthButtons.forEach(btn => btn.addEventListener('click', closeAuthForms));

    // LOGIN Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showAuthMessage(loginMessage, 'Đang đăng nhập...'); // Use scoped message element
            const username = e.target.username.value;
            const password = e.target.password.value;
            try {
                const data = await fetchData('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
                showAuthMessage(loginMessage, 'Đang cập nhật thông tin...', true); // Update message
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username);
                await fetchAndUpdateUserInfo(); // Fetch full details
                setTimeout(closeAuthForms, 1200); // Close modal after update attempt
            } catch (error) {
                console.error("Login failed:", error);
                showAuthMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        });
    }

    // REGISTER Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = e.target.password.value;
            const confirmPassword = e.target.confirmPassword.value;
            if (password !== confirmPassword) { showAuthMessage(registerMessage, 'Mật khẩu nhập lại không khớp.'); return; }
            showAuthMessage(registerMessage, 'Đang đăng ký...');
            const username = e.target.username.value; const email = e.target.email.value;
            try {
                await fetchData('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
                showAuthMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true);
                setTimeout(() => { showLoginForm(); }, 1500);
            } catch (error) {
                console.error("Registration failed:", error);
                showAuthMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        });
    }

    // FORGOT PASSWORD Handler
     if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showAuthMessage(forgotMessage, 'Đang xử lý yêu cầu...');
            const email = e.target.email.value;
            try {
                const data = await fetchData('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
                showAuthMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true);
            } catch (error) {
                console.error("Forgot password failed:", error);
                showAuthMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        });
    }

     // RESET PASSWORD Handler
      if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; const token = e.target.token.value;
            if (password !== confirmPassword) { showAuthMessage(resetMessage, 'Mật khẩu mới không khớp.'); return; }
            if (!token) { showAuthMessage(resetMessage, 'Thiếu mã token đặt lại.'); return; }
            showAuthMessage(resetMessage, 'Đang đặt lại mật khẩu...');
            try {
                await fetchData('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
                showAuthMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true);
                setTimeout(() => { showLoginForm(); }, 2000);
            } catch (error) {
                console.error("Reset password failed:", error);
                showAuthMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.');
            }
        });
    }

    // LOGOUT Handler (Uses global logoutLink and global UI update functions)
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userId'); localStorage.removeItem('username'); localStorage.removeItem('isAdmin'); localStorage.removeItem('balance');
            updateUserStatus(false);
            updateSidebarUserArea(false);
            console.log("User logged out.");
        });
    }

     // Check Initial Login Status on Load
     const checkLoginAndToken = () => {
         const userId = localStorage.getItem('userId');
         if (userId) { fetchAndUpdateUserInfo(); } else { updateUserStatus(false); updateSidebarUserArea(false); }
         const urlParams = new URLSearchParams(window.location.search); const resetToken = urlParams.get('token');
         if (resetToken) { showResetForm(); const tokenInput = document.getElementById('reset-token'); if (tokenInput) tokenInput.value = resetToken; window.history.replaceState({}, document.title, window.location.pathname); }
     };
     checkLoginAndToken(); // Run check on setup
}

// --- Fetch and Update User Info --- (No changes needed)
async function fetchAndUpdateUserInfo() { const userId = localStorage.getItem('userId'); if (!userId) { updateUserStatus(false); updateSidebarUserArea(false); return; } try { const userData = await fetchData('/users/me'); if (!userData || !userData.username) { throw new Error("Received invalid user data"); } localStorage.setItem('username', userData.username); localStorage.setItem('balance', userData.balance ?? 0); localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false'); updateUserStatus(true, userData.username, !!userData.isAdmin); updateSidebarUserArea(true, userData.username, userData.balance ?? 0); } catch (error) { console.error("Error fetching or processing user info:", error); localStorage.removeItem('userId'); localStorage.removeItem('username'); localStorage.removeItem('balance'); localStorage.removeItem('isAdmin'); updateUserStatus(false); updateSidebarUserArea(false); } }

// --- Basic Dropdown Actions --- (No changes needed)
function setupDropdownActions() { const depositLink = document.getElementById('deposit-link'); const historyLink = document.getElementById('history-link'); const depositLinkMobile = document.getElementById('deposit-link-mobile'); const historyLinkMobile = document.getElementById('history-link-mobile'); const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); }; const handleHistoryClick = (e) => { e.preventDefault(); window.location.href = 'history.html'; }; if(depositLink) depositLink.addEventListener('click', handleDepositClick); if(historyLink) historyLink.addEventListener('click', handleHistoryClick); if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick); if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick); }

// --- Back to Top Button --- (No changes needed)
function setupBackToTopButton() { const backToTopButton = document.getElementById("back-to-top-btn"); if (!backToTopButton) { return; } const scrollThreshold = 200; const checkScroll = () => { if (!backToTopButton) return; if (window.scrollY > scrollThreshold) { backToTopButton.classList.add("visible"); } else { backToTopButton.classList.remove("visible"); } }; window.addEventListener("scroll", checkScroll, { passive: true }); checkScroll(); backToTopButton.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }); }

// --- Modal Handling (Generic) --- (No changes needed)
function showModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.style.display = modal.classList.contains('modal-overlay') ? 'flex' : 'block'; setTimeout(() => { modal.classList.add('visible'); }, 10); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function hideModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.classList.remove('visible'); setTimeout(() => { modal.style.display = 'none'; }, 300); } else { console.error(`Modal with ID ${modalId} not found.`); } }

// --- Setup Listeners for Purchase Modal --- (No changes needed)
function setupPurchaseModalListeners() { if (!purchaseModal || !purchaseForm || !purchaseCloseBtn || !purchaseCancelBtn) { return; } purchaseCloseBtn.addEventListener('click', () => hideModal('purchase-modal')); purchaseCancelBtn.addEventListener('click', () => hideModal('purchase-modal')); purchaseForm.addEventListener('submit', async (e) => { e.preventDefault(); if(purchaseMessage) purchaseMessage.textContent = 'Đang xử lý...'; if(purchaseMessage) purchaseMessage.className = 'auth-message'; const formData = new FormData(purchaseForm); const purchaseData = Object.fromEntries(formData.entries()); purchaseData.userId = localStorage.getItem('userId'); const submitButton = purchaseForm.querySelector('button[type="submit"]'); if(submitButton) submitButton.disabled = true; try { await new Promise(resolve => setTimeout(resolve, 1500)); if(purchaseMessage) { purchaseMessage.textContent = 'Mua hàng thành công! Kiểm tra lịch sử mua hàng.'; purchaseMessage.className = 'auth-message success'; } console.log("Simulated purchase successful for item ID:", purchaseData.itemId); setTimeout(() => { hideModal('purchase-modal'); }, 2000); } catch (error) { console.error("Simulated purchase failed:", error); if(purchaseMessage) { purchaseMessage.textContent = `Lỗi: ${error.message || 'Mua hàng thất bại.'}`; purchaseMessage.className = 'auth-message error'; } } finally { if(submitButton) submitButton.disabled = false; } }); }

// ----- Initialization Function -----
function initializePage() {
    console.log(`Initializing page (v1.9.6)...`);
    initializeDOMElements(); updateYear(); setupHeaderScrollEffect(); setupMobileMenuToggle(); setupUserDropdown(); setupThemeToggle(); setupLanguageToggle(); setupProfessionalAnimations(); setupActionButtons(); setupDropdownActions(); setupClickDropdowns(); setupBackToTopButton(); setupPurchaseModalListeners();
    if (document.body.classList.contains('shopping-page')) { loadAndDisplayShoppingData(); }
    else if (document.body.classList.contains('history-page')) { console.log("History page detected."); }
    const donateButtonHeader = document.getElementById('donate-button-header'); if (donateButtonHeader) { donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); }); }
    const ageSpan = document.getElementById('age'); if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    console.log("Page initialization complete.");
}

// --- Run Initialization on DOM Ready ---
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializePage); }
else { initializePage(); } // Already loaded