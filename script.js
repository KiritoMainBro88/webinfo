console.log("Script version 1.9.7 - Frontend Balance Check & Header Fix"); // Keep version or increment if desired

// --- Global Constants & Variables ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';

// --- Global DOM Element References ---
let userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection;
let sidebarUserInfoDiv, sidebarLoginBtn, sidebarRegisterBtn, sidebarDepositBtn, sidebarLogoutBtn, sidebarUsernameSpan, sidebarBalanceSpan;
let dynamicProductArea;
let purchaseModal, purchaseForm, purchaseItemId, purchaseItemName, purchaseTotalPrice, purchaseMessage, purchaseCloseBtn, purchaseCancelBtn, purchaseItemPriceInput;
let authContainer, loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper;

// --- Initialize DOM Elements --- (No changes)
function initializeDOMElements() { userNameSpan = document.getElementById('user-name'); userStatusSpan = document.getElementById('user-status'); authActionLink = document.getElementById('auth-action-link'); registerActionLink = document.getElementById('register-action-link'); forgotActionLink = document.getElementById('forgot-action-link'); logoutLink = document.getElementById('logout-link'); adminDropdownSection = document.getElementById('admin-dropdown-section'); sidebarUserInfoDiv = document.getElementById('sidebar-user-info'); sidebarLoginBtn = document.getElementById('sidebar-login-btn'); sidebarRegisterBtn = document.getElementById('sidebar-register-btn'); sidebarDepositBtn = document.getElementById('sidebar-deposit-btn'); sidebarLogoutBtn = document.getElementById('sidebar-logout-btn'); sidebarUsernameSpan = document.getElementById('sidebar-username'); sidebarBalanceSpan = document.getElementById('sidebar-balance'); dynamicProductArea = document.getElementById('dynamic-product-area'); purchaseModal = document.getElementById('purchase-modal'); purchaseForm = document.getElementById('purchase-form'); purchaseItemId = document.getElementById('purchase-item-id'); purchaseItemName = document.getElementById('purchase-item-name'); purchaseTotalPrice = document.getElementById('purchase-total-price'); purchaseMessage = document.getElementById('purchase-message'); purchaseItemPriceInput = document.getElementById('purchase-item-price'); if (purchaseModal) { purchaseCloseBtn = purchaseModal.querySelector('.modal-close-btn'); purchaseCancelBtn = purchaseModal.querySelector('.modal-cancel-btn'); } authContainer = document.getElementById('auth-container'); loginFormWrapper = document.getElementById('login-form-wrapper'); registerFormWrapper = document.getElementById('register-form-wrapper'); forgotFormWrapper = document.getElementById('forgot-form-wrapper'); resetFormWrapper = document.getElementById('reset-form-wrapper'); }

// --- fetchData Utility Function --- (No changes)
async function fetchData(endpoint, options = {}) { const headers = { 'Content-Type': 'application/json', ...options.headers, }; const tempUserId = localStorage.getItem('userId'); if (tempUserId) { headers['x-temp-userid'] = tempUserId; } const config = { method: options.method || 'GET', headers: headers, }; if (options.body) { config.body = options.body; } try { const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config); const contentType = response.headers.get("content-type"); let data; if (contentType && contentType.indexOf("application/json") !== -1) { data = await response.json(); } else { data = { message: await response.text() }; if (!response.ok) { throw new Error(data.message || `Request failed with status ${response.status}`); } } if (!response.ok) { throw new Error(data.message || response.statusText || `Request failed with status ${response.status}`); } return data; } catch (error) { console.error(`Fetch error for ${endpoint}:`, error); throw error; } }

// --- Global UI Update Functions --- (No changes)
function updateUserStatus(isLoggedIn, username = 'Khách', isAdmin = false) { if (!userNameSpan || !adminDropdownSection || !logoutLink) { return; } const authLinks = [authActionLink, registerActionLink, forgotActionLink].filter(Boolean); if (isLoggedIn) { userNameSpan.textContent = username; authLinks.forEach(link => { if (link) link.style.display = 'none'; }); logoutLink.style.display = 'flex'; adminDropdownSection.style.display = isAdmin ? 'block' : 'none'; localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false'); } else { userNameSpan.textContent = 'Khách'; authLinks.forEach(link => { if (link) link.style.display = 'flex'; }); logoutLink.style.display = 'none'; adminDropdownSection.style.display = 'none'; localStorage.removeItem('isAdmin'); } }
function updateSidebarUserArea(isLoggedIn, username = 'Khách', balance = 0) { if (!sidebarUserInfoDiv || !sidebarLoginBtn || !sidebarRegisterBtn || !sidebarDepositBtn || !sidebarLogoutBtn || !sidebarUsernameSpan || !sidebarBalanceSpan) { return; } if (isLoggedIn) { sidebarUsernameSpan.textContent = username; sidebarBalanceSpan.textContent = formatPrice(balance); sidebarLoginBtn.style.display = 'none'; sidebarRegisterBtn.style.display = 'none'; sidebarDepositBtn.style.display = 'block'; sidebarLogoutBtn.style.display = 'block'; } else { sidebarUsernameSpan.textContent = 'Khách'; sidebarBalanceSpan.textContent = '0đ'; sidebarLoginBtn.style.display = 'block'; sidebarRegisterBtn.style.display = 'block'; sidebarDepositBtn.style.display = 'none'; sidebarLogoutBtn.style.display = 'none'; } }
function formatPrice(price) { if (price === null || price === undefined || isNaN(price)) { return 'N/A'; } if (typeof price === 'string') { const numPrice = parseFloat(price); if (isNaN(numPrice)) return price; price = numPrice; } return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Auth Form Display Functions (Global Scope) --- (No changes)
function showForm(formToShow) { if (!authContainer || !loginFormWrapper || !registerFormWrapper || !forgotFormWrapper || !resetFormWrapper) { console.error("Auth modal wrappers not initialized!"); return; } authContainer.style.display = 'flex'; authContainer.classList.add('visible'); [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => { if(form) form.style.display = form === formToShow ? 'block' : 'none'; }); const messageElements = [ document.getElementById('login-message'), document.getElementById('register-message'), document.getElementById('forgot-message'), document.getElementById('reset-message') ]; messageElements.forEach(msg => { if(msg) { msg.textContent = ''; msg.className = 'auth-message'; } }); }
window.showLoginForm = () => showForm(loginFormWrapper); window.showRegisterForm = () => showForm(registerFormWrapper); window.showForgotForm = () => showForm(forgotFormWrapper); window.showResetForm = () => showForm(resetFormWrapper); window.closeAuthForms = () => { if(authContainer) { authContainer.classList.remove('visible'); setTimeout(() => { authContainer.style.display = 'none'; }, 300); } };

// --- Shopping Page Dynamic Loading --- (No changes)
async function loadAndDisplayShoppingData() { /* ... */ }
function createCategorySectionElement(category) { /* ... */ }
function createProductCardElement(product) { /* ... */ }
function handleBuyButtonClick(event) { /* ... */ }
function openPurchaseModal(id, name, price) { /* ... */ }
function setupShoppingPageBuyListeners() { /* ... */ }

// --- Header Scroll Effect --- (No changes)
function setupHeaderScrollEffect() { /* ... */ }

// --- Mobile Menu Toggle --- (No changes)
function setupMobileMenuToggle() { /* ... */ }

// --- User Dropdown Toggle --- (No changes)
function setupUserDropdown() { /* ... */ }

// --- Theme Toggle --- (No changes)
function setupThemeToggle() { /* ... */ }

// --- Language Toggle --- (No changes)
function setupLanguageToggle() { /* ... */ }

// --- GSAP Animations --- (No changes)
function setupProfessionalAnimations() { /* ... */ }
function handleButtonMouseDown(event) { /* ... */ }
function handleButtonMouseUp(event) { /* ... */ }
function handleButtonMouseLeave(event) { /* ... */ }

// --- Click-based Dropdowns --- (No changes)
function setupClickDropdowns() { /* ... */ }

// --- Authentication Logic Setup --- (No changes)
function setupActionButtons() { /* ... */ }

// --- Fetch and Update User Info --- (No changes)
async function fetchAndUpdateUserInfo() { /* ... */ }

// --- Basic Dropdown Actions --- (No changes)
function setupDropdownActions() { /* ... */ }

// --- Back to Top Button --- (No changes)
function setupBackToTopButton() { /* ... */ }

// --- Modal Handling (Generic) --- (No changes)
function showModal(modalId) { /* ... */ }
function hideModal(modalId) { /* ... */ }

// --- MODIFIED: Setup Listeners for Purchase Modal ---
function setupPurchaseModalListeners() {
    if (!purchaseModal || !purchaseForm || !purchaseCloseBtn || !purchaseCancelBtn || !purchaseMessage || !purchaseItemPriceInput) {
        return; // Exit silently if elements aren't found
    }

    purchaseCloseBtn.addEventListener('click', () => hideModal('purchase-modal'));
    purchaseCancelBtn.addEventListener('click', () => hideModal('purchase-modal'));

    purchaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Purchase form submitted");
        purchaseMessage.textContent = 'Đang kiểm tra và xử lý...'; // Updated message
        purchaseMessage.className = 'auth-message';

        const formData = new FormData(purchaseForm);
        const purchaseData = Object.fromEntries(formData.entries());
        purchaseData.userId = localStorage.getItem('userId');
        const itemPrice = parseFloat(purchaseItemPriceInput.value);
        const currentBalance = parseFloat(localStorage.getItem('balance') || '0');
        const submitButton = purchaseForm.querySelector('button[type="submit"]');

        // --- Frontend Balance Check (Quick Feedback) ---
        if (isNaN(itemPrice)) {
             purchaseMessage.textContent = 'Lỗi: Giá sản phẩm không hợp lệ.';
             purchaseMessage.className = 'auth-message error';
             return;
        }
        if (currentBalance < itemPrice) {
            purchaseMessage.textContent = 'Lỗi: Số dư không đủ để thực hiện giao dịch.';
            purchaseMessage.className = 'auth-message error';
            return;
        }
        // --- End Frontend Balance Check ---

        if(submitButton) submitButton.disabled = true; // Disable button during processing

        try {
            // --- !!! REPLACE THIS SIMULATION WITH ACTUAL BACKEND CALL !!! ---
            console.warn("!!! SIMULATING purchase - Backend endpoint needed at /api/purchase/confirm !!!");
            console.log("Sending to (simulated) backend:", purchaseData);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            // Hypothetical backend call structure:
            /*
            const result = await fetchData('/purchase/confirm', { // Use your actual endpoint
                 method: 'POST',
                 body: JSON.stringify({
                     userId: purchaseData.userId,
                     itemId: purchaseData.itemId
                     // Do NOT send price, other form data (robloxUser etc.) unless backend needs it
                     // Backend should get price from DB based on itemId and verify balance server-side
                 })
             });
            console.log("Actual Backend Purchase result:", result); // Log real result
            // Check result for success message or specific status
            if (!result || !result.success) { // Adjust based on backend response structure
                 throw new Error(result.message || 'Giao dịch thất bại từ máy chủ.');
            }
            */
            // --- END REPLACE SIMULATION ---

            // If backend call was successful (or simulation runs):
            purchaseMessage.textContent = 'Mua hàng thành công! Cập nhật số dư...'; // Updated success message
            purchaseMessage.className = 'auth-message success';
            console.log("Purchase successful (or simulated) for item ID:", purchaseData.itemId);

            // Refresh user balance AFTER successful purchase confirmation from backend
            await fetchAndUpdateUserInfo();

            setTimeout(() => { hideModal('purchase-modal'); }, 2500); // Slightly longer delay

        } catch (error) {
            console.error("Purchase failed:", error);
            purchaseMessage.textContent = `Lỗi: ${error.message || 'Mua hàng thất bại.'}`;
            purchaseMessage.className = 'auth-message error';
        } finally {
             if(submitButton) submitButton.disabled = false; // Re-enable button
        }
    });
}


// ----- Initialization Function -----
function initializePage() {
    console.log(`Initializing page (v1.9.7)...`);
    initializeDOMElements(); updateYear(); setupHeaderScrollEffect(); setupMobileMenuToggle(); setupUserDropdown(); setupThemeToggle(); setupLanguageToggle(); setupProfessionalAnimations(); setupActionButtons(); setupDropdownActions(); setupClickDropdowns(); setupBackToTopButton(); setupPurchaseModalListeners();
    if (document.body.classList.contains('shopping-page')) { loadAndDisplayShoppingData(); }
    else if (document.body.classList.contains('history-page')) { console.log("History page detected."); }
    const donateButtonHeader = document.getElementById('donate-button-header'); if (donateButtonHeader) { donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); }); }
    const ageSpan = document.getElementById('age'); if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    console.log("Page initialization complete.");
}

// --- Run Initialization on DOM Ready ---
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializePage); }
else { initializePage(); }