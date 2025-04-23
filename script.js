console.log("Script version 1.9.5 - Purchase Modal Flow"); // No change needed here yet

// --- Global Constants & Variables ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';

// --- Global DOM Element References ---
let userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection;
let sidebarUserInfoDiv, sidebarLoginBtn, sidebarRegisterBtn, sidebarDepositBtn, sidebarLogoutBtn, sidebarUsernameSpan, sidebarBalanceSpan;
let dynamicProductArea;
let purchaseModal, purchaseForm, purchaseItemId, purchaseItemName, purchaseTotalPrice, purchaseMessage, purchaseCloseBtn, purchaseCancelBtn;


function initializeDOMElements() {
    // Header Elements
    userNameSpan = document.getElementById('user-name'); userStatusSpan = document.getElementById('user-status'); authActionLink = document.getElementById('auth-action-link'); registerActionLink = document.getElementById('register-action-link'); forgotActionLink = document.getElementById('forgot-action-link'); logoutLink = document.getElementById('logout-link'); adminDropdownSection = document.getElementById('admin-dropdown-section');
    // Sidebar Elements
    sidebarUserInfoDiv = document.getElementById('sidebar-user-info'); sidebarLoginBtn = document.getElementById('sidebar-login-btn'); sidebarRegisterBtn = document.getElementById('sidebar-register-btn'); sidebarDepositBtn = document.getElementById('sidebar-deposit-btn'); sidebarLogoutBtn = document.getElementById('sidebar-logout-btn'); sidebarUsernameSpan = document.getElementById('sidebar-username'); sidebarBalanceSpan = document.getElementById('sidebar-balance');
    // Shopping Page Element
    dynamicProductArea = document.getElementById('dynamic-product-area');
    // Purchase Modal Elements
    purchaseModal = document.getElementById('purchase-modal');
    purchaseForm = document.getElementById('purchase-form');
    purchaseItemId = document.getElementById('purchase-item-id');
    purchaseItemName = document.getElementById('purchase-item-name');
    purchaseTotalPrice = document.getElementById('purchase-total-price');
    purchaseMessage = document.getElementById('purchase-message');
    if (purchaseModal) {
        purchaseCloseBtn = purchaseModal.querySelector('.modal-close-btn');
        purchaseCancelBtn = purchaseModal.querySelector('.modal-cancel-btn');
    }
}

// --- fetchData Utility Function --- (No changes)
async function fetchData(endpoint, options = {}) { const headers = { 'Content-Type': 'application/json', ...options.headers, }; const tempUserId = localStorage.getItem('userId'); if (tempUserId) { headers['x-temp-userid'] = tempUserId; } const config = { method: options.method || 'GET', headers: headers, }; if (options.body) { config.body = options.body; } try { const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config); const contentType = response.headers.get("content-type"); let data; if (contentType && contentType.indexOf("application/json") !== -1) { data = await response.json(); } else { data = { message: await response.text() }; if (!response.ok) { throw new Error(data.message || `Request failed with status ${response.status}`); } } if (!response.ok) { throw new Error(data.message || response.statusText || `Request failed with status ${response.status}`); } return data; } catch (error) { console.error(`Fetch error for ${endpoint}:`, error); throw error; } }

// --- Global UI Update Functions --- (No changes)
function updateUserStatus(isLoggedIn, username = 'Khách', isAdmin = false) { if (!userNameSpan || !adminDropdownSection || !logoutLink) { return; } const authLinks = [authActionLink, registerActionLink, forgotActionLink].filter(Boolean); if (isLoggedIn) { userNameSpan.textContent = username; authLinks.forEach(link => { if (link) link.style.display = 'none'; }); logoutLink.style.display = 'flex'; adminDropdownSection.style.display = isAdmin ? 'block' : 'none'; localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false'); } else { userNameSpan.textContent = 'Khách'; authLinks.forEach(link => { if (link) link.style.display = 'flex'; }); logoutLink.style.display = 'none'; adminDropdownSection.style.display = 'none'; localStorage.removeItem('isAdmin'); } }
function updateSidebarUserArea(isLoggedIn, username = 'Khách', balance = 0) { if (!sidebarUserInfoDiv || !sidebarLoginBtn || !sidebarRegisterBtn || !sidebarDepositBtn || !sidebarLogoutBtn || !sidebarUsernameSpan || !sidebarBalanceSpan) { return; } if (isLoggedIn) { sidebarUsernameSpan.textContent = username; sidebarBalanceSpan.textContent = formatPrice(balance); sidebarLoginBtn.style.display = 'none'; sidebarRegisterBtn.style.display = 'none'; sidebarDepositBtn.style.display = 'block'; sidebarLogoutBtn.style.display = 'block'; } else { sidebarUsernameSpan.textContent = 'Khách'; sidebarBalanceSpan.textContent = '0đ'; sidebarLoginBtn.style.display = 'block'; sidebarRegisterBtn.style.display = 'block'; sidebarDepositBtn.style.display = 'none'; sidebarLogoutBtn.style.display = 'none'; } }
function formatPrice(price) { if (price === null || price === undefined || isNaN(price)) { return 'N/A'; } if (typeof price === 'string') { const numPrice = parseFloat(price); if (isNaN(numPrice)) return price; price = numPrice; } return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Shopping Page Dynamic Loading --- (No changes needed)
async function loadAndDisplayShoppingData() { if (!dynamicProductArea) { return; } dynamicProductArea.innerHTML = '<p style="text-align: center; padding: 2rem;">Đang tải sản phẩm...</p>'; try { const [categories, products] = await Promise.all([ fetchData('/categories'), fetchData('/products') ]); dynamicProductArea.innerHTML = ''; if (!categories || categories.length === 0) { dynamicProductArea.innerHTML = '<p style="text-align: center; padding: 2rem;">Không tìm thấy danh mục sản phẩm nào.</p>'; return; } categories.forEach(category => { const categorySection = createCategorySectionElement(category); const productGrid = categorySection.querySelector('.product-grid'); const categoryProducts = products.filter(product => product.category?._id === category._id); if (categoryProducts.length > 0) { categoryProducts.forEach(product => productGrid.appendChild(createProductCardElement(product))); } else { productGrid.innerHTML = '<p style="font-size: 0.9em; color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Chưa có sản phẩm trong danh mục này.</p>'; } dynamicProductArea.appendChild(categorySection); }); setTimeout(() => { setupProfessionalAnimations(); setupShoppingPageBuyListeners(); }, 100); } catch (error) { console.error("Error loading shopping page data:", error); dynamicProductArea.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--danger-color);">Lỗi tải sản phẩm: ${error.message}. Vui lòng thử lại sau.</p>`; } }
function createCategorySectionElement(category) { const section = document.createElement('section'); section.classList.add('product-category-section'); section.dataset.animate = "fade-up"; const title = document.createElement('h2'); title.classList.add('category-title'); title.innerHTML = `<i class="${category.iconClass || 'fas fa-tag'} icon-left"></i>${category.name}`; const grid = document.createElement('div'); grid.classList.add('product-grid'); section.appendChild(title); section.appendChild(grid); return section; }
function createProductCardElement(product) { const card = document.createElement('div'); card.classList.add('product-card'); const originalPriceHTML = product.originalPrice && product.originalPrice > product.price ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''; const salePriceHTML = `<span class="sale-price">${formatPrice(product.price)}</span>`; let tagHTML = ''; if (product.tags?.includes('hot')) { tagHTML = '<span class="product-tag hot-tag">Hot</span>'; } else if (product.tags?.includes('sale') || (product.originalPrice && product.originalPrice > product.price)) { tagHTML = '<span class="product-tag sale-tag">Sale</span>'; } let buttonText = 'Mua ngay'; let buttonDisabled = false; let priceDisplay = `${originalPriceHTML} ${salePriceHTML}`; switch (product.stockStatus) { case 'out_of_stock': buttonText = 'Hết hàng'; buttonDisabled = true; break; case 'contact': buttonText = 'Liên hệ'; priceDisplay = `<span class="sale-price">Liên hệ</span>`; break; case 'check_price': buttonText = 'Xem bảng giá'; priceDisplay = `<span class="sale-price">Giá tốt</span>`; break; } card.innerHTML = `<div class="product-image-placeholder"><img src="${product.imageUrl || 'images/product-placeholder.png'}" alt="${product.name}" loading="lazy">${tagHTML}</div><div class="product-info"><h3 class="product-title">${product.name}</h3><p class="product-meta">Đã bán: ${product.purchaseCount || 0}</p><p class="product-price">${priceDisplay}</p><button class="cta-button product-buy-btn" data-product-id="${product._id}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button></div>`; return card; }

// --- handleBuyButtonClick --- (No changes needed)
function handleBuyButtonClick(event) { if (!event.target.classList.contains('product-buy-btn')) return; event.preventDefault(); const button = event.target; const productCard = button.closest('.product-card'); if (!productCard) return; const productTitleElement = productCard.querySelector('.product-title'); const productPriceElement = productCard.querySelector('.sale-price'); const productTitle = productTitleElement?.textContent || 'Sản phẩm'; const productId = button.dataset.productId; let productPrice = NaN; const priceText = productPriceElement?.textContent || ''; const priceMatch = priceText.match(/[\d,.]+/); if (priceMatch) { productPrice = parseFloat(priceMatch[0].replace(/[^0-9]/g, '')); } if (button.disabled) { alert(`Sản phẩm "${productTitle}" hiện đang hết hàng hoặc cần liên hệ.`); return; } if (!localStorage.getItem('userId')) { alert('Vui lòng đăng nhập để mua hàng!'); if (typeof showLoginForm === 'function') { showLoginForm(); } else { console.error("showLoginForm function not found"); } } else { openPurchaseModal(productId, productTitle, productPrice); } }

// --- openPurchaseModal --- (No changes needed)
function openPurchaseModal(id, name, price) { if (!purchaseModal || !purchaseItemId || !purchaseItemName || !purchaseTotalPrice || !purchaseForm) { console.error("Purchase modal elements not found!"); alert("Lỗi: Không thể mở form mua hàng."); return; } purchaseForm.reset(); if(purchaseMessage) purchaseMessage.textContent = ''; if(purchaseMessage) purchaseMessage.className = 'auth-message'; purchaseItemId.value = id || ''; purchaseItemName.textContent = name || 'Sản phẩm không xác định'; const priceHiddenInput = document.getElementById('purchase-item-price'); if (priceHiddenInput) priceHiddenInput.value = !isNaN(price) ? price : ''; purchaseTotalPrice.textContent = formatPrice(price); showModal('purchase-modal'); }

// --- setupShoppingPageBuyListeners --- (No changes needed)
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

// --- Authentication Logic Setup --- (No changes needed)
function setupActionButtons() { /* ... */ }

// --- Fetch and Update User Info --- (No changes needed)
async function fetchAndUpdateUserInfo() { /* ... */ }

// --- Basic Dropdown Actions --- (No changes needed)
function setupDropdownActions() { /* ... */ }

// --- Back to Top Button --- (No changes needed)
function setupBackToTopButton() { /* ... */ }

// --- Modal Handling (Generic) --- (No changes needed)
function showModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.style.display = modal.classList.contains('modal-overlay') ? 'flex' : 'block'; setTimeout(() => { modal.classList.add('visible'); }, 10); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function hideModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.classList.remove('visible'); setTimeout(() => { modal.style.display = 'none'; }, 300); } else { console.error(`Modal with ID ${modalId} not found.`); } }

// --- Setup Listeners for Purchase Modal --- (No changes needed in core logic)
function setupPurchaseModalListeners() {
    if (!purchaseModal || !purchaseForm || !purchaseCloseBtn || !purchaseCancelBtn) { return; }
    purchaseCloseBtn.addEventListener('click', () => hideModal('purchase-modal'));
    purchaseCancelBtn.addEventListener('click', () => hideModal('purchase-modal'));
    purchaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(purchaseMessage) purchaseMessage.textContent = 'Đang xử lý...';
        if(purchaseMessage) purchaseMessage.className = 'auth-message';
        const formData = new FormData(purchaseForm); const purchaseData = Object.fromEntries(formData.entries()); purchaseData.userId = localStorage.getItem('userId');
        const submitButton = purchaseForm.querySelector('button[type="submit"]'); if(submitButton) submitButton.disabled = true;
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate backend call
            // ** Replace above line with actual backend call later **
            // const result = await fetchData('/purchase', { method: 'POST', body: JSON.stringify(purchaseData) });
            if(purchaseMessage) { purchaseMessage.textContent = 'Mua hàng thành công! Kiểm tra lịch sử mua hàng.'; purchaseMessage.className = 'auth-message success'; }
            console.log("Simulated purchase successful for item ID:", purchaseData.itemId);
            // await fetchAndUpdateUserInfo(); // Uncomment after backend purchase deducts balance
            setTimeout(() => { hideModal('purchase-modal'); }, 2000);
        } catch (error) { console.error("Simulated purchase failed:", error); if(purchaseMessage) { purchaseMessage.textContent = `Lỗi: ${error.message || 'Mua hàng thất bại.'}`; purchaseMessage.className = 'auth-message error'; } }
        finally { if(submitButton) submitButton.disabled = false; }
    });
}

// ----- Initialization Function -----
function initializePage() {
    console.log(`Initializing page (v1.9.5)...`);
    initializeDOMElements(); updateYear(); setupHeaderScrollEffect(); setupMobileMenuToggle(); setupUserDropdown(); setupThemeToggle(); setupLanguageToggle(); setupProfessionalAnimations(); setupActionButtons(); setupDropdownActions(); setupClickDropdowns(); setupBackToTopButton();
    setupPurchaseModalListeners(); // Ensure this runs
    if (document.body.classList.contains('shopping-page')) { loadAndDisplayShoppingData(); }
    else if (document.body.classList.contains('history-page')) { console.log("History page detected."); }
    const donateButtonHeader = document.getElementById('donate-button-header'); if (donateButtonHeader) { donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); }); }
    const ageSpan = document.getElementById('age'); if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    console.log("Page initialization complete.");
}

// --- Run Initialization on DOM Ready ---
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializePage); }
else { initializePage(); }