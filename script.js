console.log("Script version 1.9.10 - Category Page Logic"); // Increment version

// --- Global Constants & Variables ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';

// --- Global DOM Element References ---
let userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection;
let sidebarUserInfoDiv, sidebarLoginBtn, sidebarRegisterBtn, sidebarDepositBtn, sidebarLogoutBtn, sidebarUsernameSpan, sidebarBalanceSpan;
let dynamicProductArea, categoryProductGrid, categoryPageTitle, categoryPageDescription; // Added elements for category page
let purchaseModal, purchaseForm, purchaseItemId, purchaseItemName, purchaseTotalPrice, purchaseMessage, purchaseCloseBtn, purchaseCancelBtn, purchaseItemPriceInput;
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
    purchaseItemPriceInput = document.getElementById('purchase-item-price'); // Get the hidden price input
    if (purchaseModal) { purchaseCloseBtn = purchaseModal.querySelector('.modal-close-btn'); purchaseCancelBtn = purchaseModal.querySelector('.modal-cancel-btn'); }
    // Auth Modal Wrappers
    authContainer = document.getElementById('auth-container'); loginFormWrapper = document.getElementById('login-form-wrapper'); registerFormWrapper = document.getElementById('register-form-wrapper'); forgotFormWrapper = document.getElementById('forgot-form-wrapper'); resetFormWrapper = document.getElementById('reset-form-wrapper');
    // --- ADDED: Category Page Elements ---
    categoryProductGrid = document.getElementById('category-product-grid');
    categoryPageTitle = document.getElementById('category-page-title');
    categoryPageDescription = document.getElementById('category-page-description'); // Optional description element
}

// --- fetchData Utility Function ---
async function fetchData(endpoint, options = {}) {
    const headers = { ...options.headers }; // Start with optional headers

    // Add the insecure temp user ID header if available
    const tempUserId = localStorage.getItem('userId');
    if (tempUserId) {
        headers['x-temp-userid'] = tempUserId;
    }

    // *** CHANGE: Conditionally set Content-Type ***
    // Only set Content-Type if the body is NOT FormData
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    // If body IS FormData, do NOT set Content-Type header; browser will do it.
    // ******************************************

    const config = {
        method: options.method || 'GET',
        headers: headers,
    };

    if (options.body) {
        config.body = options.body;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config);
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            // Handle non-JSON responses
            data = { message: await response.text() };
            if (!response.ok) {
                 console.error(`HTTP error! Status: ${response.status} for ${endpoint}. Response not JSON.`, data.message);
                 throw new Error(data.message || `Request failed with status ${response.status}`);
            }
            // If response is OK but not JSON, return the text content or handle as needed
            console.log(`Received non-JSON OK response from ${endpoint}`);
            // You might want to return data here or throw an error depending on expectations
            // For now, let's return it, assuming it might be a simple text message
            // return data;
        }

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status} for ${endpoint}`, data);
            throw new Error(data.message || response.statusText || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        throw error; // Re-throw to be caught by calling function
    }
}

// --- Global UI Update Functions ---
function updateUserStatus(isLoggedIn, username = 'Khách', isAdmin = false) {
    if (!userNameSpan || !adminDropdownSection || !logoutLink) {
        // console.warn("Header elements missing for status update."); // Less verbose
        return;
    }
    const authLinks = [authActionLink, registerActionLink, forgotActionLink].filter(Boolean);
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
    if (!sidebarUserInfoDiv || !sidebarLoginBtn || !sidebarRegisterBtn || !sidebarDepositBtn || !sidebarLogoutBtn || !sidebarUsernameSpan || !sidebarBalanceSpan) {
        // console.warn("Sidebar elements missing for update."); // Less verbose
        return;
    }
    if (isLoggedIn) {
        sidebarUsernameSpan.textContent = username;
        sidebarBalanceSpan.textContent = formatPrice(balance); // Use helper function
        sidebarLoginBtn.style.display = 'none';
        sidebarRegisterBtn.style.display = 'none';
        sidebarDepositBtn.style.display = 'block';
        sidebarLogoutBtn.style.display = 'block';
    } else {
        sidebarUsernameSpan.textContent = 'Khách';
        sidebarBalanceSpan.textContent = '0đ'; // Default display
        sidebarLoginBtn.style.display = 'block';
        sidebarRegisterBtn.style.display = 'block';
        sidebarDepositBtn.style.display = 'none';
        sidebarLogoutBtn.style.display = 'none';
    }
}

// --- Helper Functions ---
function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return 'N/A';
    }
    if (typeof price === 'string') {
        // Keep specific strings like 'Contact', 'Check Price' etc.
        if (isNaN(parseFloat(price.replace(/[^0-9.-]+/g,"")))) { // Check if it's *not* parseable as a number
            return price; // Return the original string
        }
        // Attempt to parse if it looks numeric
        const numPrice = parseFloat(price.replace(/[^0-9.-]+/g,""));
        if (isNaN(numPrice)) return 'N/A';
        price = numPrice;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function updateYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Format currency (different from formatPrice - this is used in product cards)
function formatCurrency(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return 'N/A';
    }
    // Use thousand separators (dots for VND) and add đ symbol
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(price);
}

// Generate star rating HTML
function generateStarRating(rating) {
    if (typeof rating !== 'number' || isNaN(rating)) {
        rating = 0;
    }
    
    // Clamp rating between 0 and 5
    rating = Math.max(0, Math.min(5, rating));
    
    // Round to nearest half star
    const roundedRating = Math.round(rating * 2) / 2;
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 1; i <= Math.floor(roundedRating); i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (roundedRating % 1 !== 0) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(roundedRating);
    for (let i = 1; i <= emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// --- Auth Form Display Functions (Global Scope) ---
function showForm(formToShow) {
    if (!authContainer || !loginFormWrapper || !registerFormWrapper || !forgotFormWrapper || !resetFormWrapper) {
        console.error("Auth modal wrappers not initialized!");
        return;
    }
    authContainer.style.display = 'flex';
    authContainer.classList.add('visible');
    [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => {
        if(form) form.style.display = form === formToShow ? 'block' : 'none';
    });
    // Clear previous messages
    const messageElements = [ document.getElementById('login-message'), document.getElementById('register-message'), document.getElementById('forgot-message'), document.getElementById('reset-message') ];
    messageElements.forEach(msg => { if(msg) { msg.textContent = ''; msg.className = 'auth-message'; } });
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


// --- Shopping Page Dynamic Loading --- (Reverted to Product Grid Layout)
async function loadAndDisplayShoppingData() {
    const dynamicArea = document.getElementById('dynamic-product-area');
    if (!dynamicArea) {
        console.error('Product display area not found');
        return;
    }

    // Show loading state
    dynamicArea.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>Đang tải danh mục sản phẩm...</p>
        </div>
    `;

    try {
        // Fetch categories with their products and price ranges
        const categories = await fetchData('/categories');
        console.log('Fetched categories:', categories);

        if (!categories || !Array.isArray(categories)) {
            throw new Error('Invalid categories data received');
        }

        // Clear loading state
        dynamicArea.innerHTML = '';

        // Process each category
        for (const category of categories) {
            try {
                // Fetch category details including products and price range
                const categoryData = await fetchData(`/categories/${category.slug}`);
                console.log(`Fetched data for category ${category.name}:`, categoryData);

                if (categoryData) {
                    const sectionElement = createCategorySectionElement({
                        ...categoryData,
                        categoryName: category.name,
                        slug: category.slug,
                        iconClass: category.iconClass
                    });
                    
                    if (sectionElement) {
                        dynamicArea.appendChild(sectionElement);
                    }
                }
            } catch (categoryError) {
                console.error(`Error loading category ${category.name}:`, categoryError);
                // Continue with other categories even if one fails
            }
        }

        // If no categories were loaded
        if (dynamicArea.children.length === 0) {
            dynamicArea.innerHTML = `
                <div style="text-align: center; padding: 3rem; background-color: var(--bg-secondary); border-radius: var(--border-radius-md);">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>Chưa có danh mục sản phẩm nào.</p>
                </div>
            `;
        }

        // Setup any necessary event listeners
        setupShoppingPageBuyListeners();

    } catch (error) {
        console.error('Error loading shopping data:', error);
        dynamicArea.innerHTML = `
            <div style="text-align: center; padding: 3rem; background-color: var(--bg-secondary); border-radius: var(--border-radius-md);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p>Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.</p>
                <button onclick="location.reload()" class="cta-button primary" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt icon-left"></i>Tải lại trang
                </button>
            </div>
        `;
    }
}

// --- MODIFIED: Create Category Section Element ---
function createCategorySectionElement(categoryData) {
    const { products, categoryName, slug, iconClass, minPrice, maxPrice } = categoryData;
    
    // Create section container
    const section = document.createElement('section');
    section.className = 'product-category-section';
    
    // Create category title - check if it's Uncategorized to make it non-clickable
    if (categoryName === 'Uncategorized' || slug === 'uncategorized') {
        // For Uncategorized, create a non-clickable title
        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'category-title-wrapper';
        
        // Format the price range
        const formattedMinPrice = formatPrice(minPrice || 0);
        const formattedMaxPrice = formatPrice(maxPrice || 0);
        const priceRangeText = minPrice === maxPrice ? 
            `${formattedMinPrice}` : 
            `${formattedMinPrice} - ${formattedMaxPrice}`;
            
        titleWrapper.innerHTML = `
            <h2 class="category-title">
                <i class="${iconClass || 'fas fa-folder'} icon-left"></i>
                ${categoryName}
                <span style="font-size: 0.8em; color: var(--text-secondary); margin-left: 1rem;">
                    ${priceRangeText}
                </span>
            </h2>
        `;
        
        section.appendChild(titleWrapper);
    } else {
        // For other categories, keep the clickable link
        const titleLink = document.createElement('a');
        titleLink.href = `category.html?slug=${slug}`;
        titleLink.className = 'category-title-link';
        
        // Format the price range
        const formattedMinPrice = formatPrice(minPrice || 0);
        const formattedMaxPrice = formatPrice(maxPrice || 0);
        const priceRangeText = minPrice === maxPrice ? 
            `${formattedMinPrice}` : 
            `${formattedMinPrice} - ${formattedMaxPrice}`;
        
        titleLink.innerHTML = `
            <h2 class="category-title">
                <i class="${iconClass || 'fas fa-tag'} icon-left"></i>
                ${categoryName}
                <span style="font-size: 0.8em; color: var(--text-secondary); margin-left: 1rem;">
                    ${priceRangeText}
                </span>
            </h2>
        `;
        
        section.appendChild(titleLink);
    }
    
    // Create product grid
    const grid = document.createElement('div');
    grid.className = 'product-grid';
    
    // Add products
    if (products && products.length > 0) {
        products.forEach(product => {
            try {
                const productCard = createProductCardElement(product, true, slug);
                if (productCard) {
                    grid.appendChild(productCard);
                }
            } catch (error) {
                console.error('Error creating product card:', error);
            }
        });
    } else {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-box-open" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <p>Chưa có sản phẩm nào trong danh mục này.</p>
            </div>
        `;
    }
    
    section.appendChild(grid);
    return section;
}

// --- NEW: Create Category Summary Card Element (for main shopping page) ---
function createCategorySummaryCardElement(category, minPrice, maxPrice) {
    const cardLink = document.createElement('a');
    cardLink.href = `category.html?slug=${category.slug || 'unknown'}`;
    cardLink.classList.add('category-summary-card'); // Add a class for styling
    cardLink.dataset.animate = "fade-up"; // Optional animation

    let priceRangeHTML = '';
    // Check if minPrice and maxPrice are valid numbers
    const isMinPriceNumeric = typeof minPrice === 'number' && !isNaN(minPrice);
    const isMaxPriceNumeric = typeof maxPrice === 'number' && !isNaN(maxPrice);

    if (isMinPriceNumeric && isMaxPriceNumeric) {
        if (minPrice === maxPrice) {
            // If min and max are the same, just show that price
            priceRangeHTML = `<p class="category-price-range">Giá: ${formatPrice(minPrice)}</p>`;
        } else {
            // Use the requested format "Start from: ..."
            priceRangeHTML = `<p class="category-price-range">Start from: ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}</p>`;
        }
    } else if (isMinPriceNumeric) {
         // Only min price is available
         priceRangeHTML = `<p class="category-price-range">Start from: ${formatPrice(minPrice)}</p>`;
    } else {
        // Handle cases with no numeric prices or only special prices
        priceRangeHTML = `<p class="category-price-range">Xem sản phẩm</p>`; // Or "Liên hệ giá", etc.
    }

    // Basic structure - adjust classes and content as needed for styling
    cardLink.innerHTML = `
        <div class="category-summary-info">
            <h3 class="category-summary-title">
                <i class="${category.iconClass || 'fas fa-tag'} icon-left"></i>
                ${escapeHtml(category.name)}
            </h3>
            ${priceRangeHTML}
        </div>
        <div class="category-summary-arrow">
             <i class="fas fa-chevron-right"></i>
        </div>
    `;

    return cardLink;
}

// --- MODIFIED: Create Product Card Element ---
// *** MODIFIED: Added categorySlug parameter ***
function createProductCardElement(product, includeBuyButton = false, categorySlug = null) { 
    if (!product || (!product.id && !product._id)) {
        console.error('Invalid product data:', product);
        return document.createElement('div'); // Return empty div to prevent errors
    }

    const productId = product._id || product.id;
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = productId;

    // Format the price with commas for thousands
    const formattedPrice = formatCurrency(product.price);
    
    // Get min and max price if available
    const minPrice = product.minPrice || product.price;
    const maxPrice = product.maxPrice || product.price;
    
    // Format price range string
    let priceRangeText = '';
    if (minPrice === maxPrice) {
        priceRangeText = `Start From: ${formatCurrency(minPrice)}`;
    } else {
        priceRangeText = `Start From: ${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    }

    // Generate stars HTML based on rating
    const rating = product.rating || 0; // Assuming rating exists, default to 0
    const starsHtml = generateStarRating(rating);

    // Discount and stock badges (assuming these properties might exist)
    const discountBadge = product.discounted ?
        `<span class="discount-badge">-${product.discountPercent || 10}%</span>` : '';
    const oldPrice = product.discounted ?
        `<span class="old-price">${formatCurrency(product.originalPrice)}</span>` : ''; // Assuming originalPrice exists
    const isOutOfStock = product.stockStatus === 'out_of_stock'; // Check stock status
    const stockBadge = isOutOfStock ?
        '<span class="stock-badge out-of-stock">Hết hàng</span>' :
        (product.stock && product.stock < 5 ? `<span class="stock-badge low-stock">Còn ${product.stock}</span>` : ''); 

    // Create the card content
    card.innerHTML = `
        <div class="product-card-inner">
            <div class="product-image-placeholder">
                <img src="${product.imageUrl || 'https://placehold.co/400x225/e9ecef/495057?text=No+Image'}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="product-details">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <div class="product-meta">
                    <div class="product-rating">
                        ${starsHtml}
                        <span class="rating-count">(${product.reviewCount || 0})</span> <!-- Assuming reviewCount exists -->
                    </div>
                    <!-- Add price range -->
                    <div class="product-price-range">${priceRangeText}</div>
                    <!-- Add brand if available -->
                    ${product.brand ? `<span class="product-brand">${escapeHtml(product.brand)}</span>` : ''}
                </div>
                <div class="product-price">
                    ${oldPrice}
                    <span class="current-price">${formattedPrice}</span>
                </div>
                <!-- Buy button removed -->
            </div>
        </div>
    `;

    return card;
}

function handleBuyButtonClick(event) {
    if (!event.target.classList.contains('product-buy-btn')) return;
    event.preventDefault();
    const button = event.target;
    const productCard = button.closest('.product-card');
    if (!productCard) return;

    const productTitleElement = productCard.querySelector('.product-title');
    const productPriceElement = productCard.querySelector('.sale-price'); // Target the sale price span
    const productTitle = productTitleElement?.textContent || 'Sản phẩm';
    const productId = button.dataset.productId;

    let productPrice = NaN;
    // Extract price ONLY if it's not a text status like "Liên hệ" or "Giá tốt"
    const priceText = productPriceElement?.textContent || '';
     if (!['Liên hệ', 'Giá tốt', 'N/A'].includes(priceText)) {
        const priceMatch = priceText.match(/[\d,.]+/);
        if (priceMatch) {
            productPrice = parseFloat(priceMatch[0].replace(/[^0-9]/g, ''));
        }
     }


    if (button.disabled) {
        alert(`Sản phẩm "${productTitle}" hiện đang hết hàng.`);
        return;
    }
    if (['Liên hệ', 'Xem bảng giá'].includes(button.textContent)) {
         alert(`Vui lòng liên hệ hoặc xem bảng giá cho sản phẩm "${productTitle}".`);
         // Optionally redirect or show contact info
         return;
    }


    if (!localStorage.getItem('userId')) {
        alert('Vui lòng đăng nhập để mua hàng!');
        if (typeof showLoginForm === 'function') showLoginForm();
    } else {
        // Only open modal if price is valid for purchase
        if (!isNaN(productPrice)) {
            openPurchaseModal(productId, productTitle, productPrice);
        } else {
             alert(`Không thể mua sản phẩm "${productTitle}" trực tiếp. Vui lòng liên hệ.`);
        }
    }
}

function openPurchaseModal(id, name, price) {
    if (!purchaseModal || !purchaseItemId || !purchaseItemName || !purchaseTotalPrice || !purchaseForm || !purchaseItemPriceInput) {
        console.error("Purchase modal elements not found!");
        alert("Lỗi: Không thể mở form mua hàng.");
        return;
    }
    purchaseForm.reset();
    if(purchaseMessage) { purchaseMessage.textContent = ''; purchaseMessage.className = 'auth-message'; }
    purchaseItemId.value = id || '';
    purchaseItemName.textContent = name || 'Sản phẩm không xác định';
    purchaseItemPriceInput.value = !isNaN(price) ? price : ''; // Store raw price
    purchaseTotalPrice.textContent = formatPrice(price); // Display formatted price
    showModal('purchase-modal');
}

function setupShoppingPageBuyListeners() {
    if (!document.body.classList.contains('shopping-page')) return;
    const productArea = document.getElementById('dynamic-product-area');
    if (!productArea) return;
    // Use event delegation
    productArea.removeEventListener('click', handleBuyButtonClick); // Prevent duplicates
    productArea.addEventListener('click', handleBuyButtonClick);
}


// --- Header Scroll Effect ---
function setupHeaderScrollEffect() { const header = document.querySelector('.content-header'); if (!header) return; const scrollThreshold = 10; const checkScroll = () => { if (window.getComputedStyle(header).position === 'fixed') { header.classList.toggle('header-scrolled', window.scrollY > scrollThreshold); } else { header.classList.remove('header-scrolled'); } }; checkScroll(); window.addEventListener('scroll', checkScroll, { passive: true }); window.addEventListener('resize', checkScroll); }

// --- Mobile Menu Toggle ---
function setupMobileMenuToggle() { const toggleButton = document.getElementById('mobile-menu-toggle'); const mobileNav = document.getElementById('mobile-nav'); if (!toggleButton || !mobileNav) { return; } toggleButton.addEventListener('click', (event) => { event.stopPropagation(); const isVisible = mobileNav.classList.toggle('visible'); toggleButton.setAttribute('aria-expanded', isVisible); }); mobileNav.addEventListener('click', (event) => { if (event.target.closest('.mobile-nav-link')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } }); document.addEventListener('click', (event) => { if (!mobileNav.contains(event.target) && !toggleButton.contains(event.target) && mobileNav.classList.contains('visible')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } }); document.addEventListener('keydown', (e) => { if (e.key === "Escape" && mobileNav.classList.contains('visible')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } }); }

// --- User Dropdown Toggle ---
function setupUserDropdown() { const trigger = document.getElementById('user-area-trigger'); const dropdown = document.getElementById('user-dropdown'); const userArea = document.querySelector('.user-area'); if (!trigger || !dropdown || !userArea) { return; } trigger.addEventListener('click', (event) => { event.stopPropagation(); dropdown.classList.toggle('visible'); userArea.classList.toggle('open'); }); document.addEventListener('click', (event) => { if (!userArea.contains(event.target) && dropdown.classList.contains('visible')) { dropdown.classList.remove('visible'); userArea.classList.remove('open'); } }); dropdown.addEventListener('click', (event) => { if (event.target.closest('a') && !event.target.closest('#admin-dropdown-section')) { dropdown.classList.remove('visible'); userArea.classList.remove('open'); } }); }

// --- Theme Toggle ---
function setupThemeToggle() { const themeButton = document.getElementById('theme-toggle'); if (!themeButton) { return; } const themeIcon = themeButton.querySelector('i'); if (!themeIcon) { return; } const applyTheme = (theme) => { if (theme === 'light') { document.body.classList.add('light-theme'); document.body.classList.remove('dark-theme'); themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); } else { document.body.classList.add('dark-theme'); document.body.classList.remove('light-theme'); themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); } }; const storedTheme = localStorage.getItem('theme'); const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light'); applyTheme(initialTheme); themeButton.addEventListener('click', () => { const isDark = document.body.classList.contains('dark-theme'); const newTheme = isDark ? 'light' : 'dark'; applyTheme(newTheme); localStorage.setItem('theme', newTheme); }); }

// --- Language Toggle ---
function setupLanguageToggle() { const langButton = document.getElementById('language-toggle'); if(langButton) { langButton.addEventListener('click', () => { alert('Language switching coming soon!'); }); } }

// --- GSAP Animations ---
function setupProfessionalAnimations() { const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }; const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']"); const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']"); const heroCta = document.querySelector(".hero-cta[data-animate='fade-up']"); if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); } if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); } if (heroCta) { gsap.from(heroCta, { ...defaultOnLoadAnimation, delay: parseFloat(heroCta.dataset.delay) || 0.7 }); } gsap.utils.toArray('[data-animate]:not(.gsap-initiated)').forEach(element => { element.classList.add('gsap-initiated'); const delay = parseFloat(element.dataset.delay) || 0; let staggerAmount = parseFloat(element.dataset.stagger); const animType = element.dataset.animate; let animProps = { opacity: 0, duration: 0.6, ease: "power2.out", delay: delay, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true, } }; if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; } let target = element; const isStaggerContainer = element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline') || element.classList.contains('product-grid') || element.classList.contains('product-category-section'); if (isStaggerContainer && element.children.length > 0) { target = Array.from(element.children).filter(child => !child.matches('h2.category-title') && !child.matches('h2.page-title')); if (target.length > 0) { if (!isNaN(staggerAmount) || (target.length > 1 && (element.classList.contains('product-grid') || element.classList.contains('product-category-section')))) { staggerAmount = isNaN(staggerAmount) ? 0.05 : staggerAmount; animProps.scrollTrigger.stagger = staggerAmount; } } else { target = element; } } else if (!isNaN(staggerAmount) && element.children.length > 0) { target = element.children; animProps.scrollTrigger.stagger = staggerAmount; } gsap.from(target, animProps); }); gsap.utils.toArray('.content-row .image-card').forEach(card => { gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 } }); }); document.querySelectorAll('.cta-button, .header-nav-link, .mobile-nav-link, .social-button, .icon-button, .user-dropdown-content a, #donate-button-header, .dropdown-link, .category-button, .product-buy-btn, .footer-link-button, #back-to-top-btn, .modal-close-btn, .summary-card, .view-toggle button') .forEach(button => { button.removeEventListener('mousedown', handleButtonMouseDown); button.removeEventListener('mouseup', handleButtonMouseUp); button.removeEventListener('mouseleave', handleButtonMouseLeave); button.addEventListener('mousedown', handleButtonMouseDown); button.addEventListener('mouseup', handleButtonMouseUp); if (!button.matches('#donate-button-header') && !button.matches('.header-nav-link')) { button.addEventListener('mouseleave', handleButtonMouseLeave); } }); }
function handleButtonMouseDown(event) { gsap.to(event.currentTarget, { scale: 0.97, duration: 0.1 }); }
function handleButtonMouseUp(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }
function handleButtonMouseLeave(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }

// --- Click-based Dropdowns ---
function setupClickDropdowns() { const wrappers = document.querySelectorAll('.nav-item-wrapper'); wrappers.forEach(wrapper => { const trigger = wrapper.querySelector('.nav-dropdown-trigger'); const menu = wrapper.querySelector('.dropdown-menu'); if (!trigger || !menu) return; trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); wrappers.forEach(otherWrapper => { if (otherWrapper !== wrapper) otherWrapper.classList.remove('open'); }); wrapper.classList.toggle('open'); }); }); document.addEventListener('click', (event) => { wrappers.forEach(wrapper => { if (!wrapper.contains(event.target) && wrapper.classList.contains('open')) wrapper.classList.remove('open'); }); }); document.addEventListener('keydown', (event) => { if (event.key === "Escape") wrappers.forEach(wrapper => wrapper.classList.remove('open')); }); }

// --- Authentication Logic Setup ---
function setupActionButtons() { const loginForm = document.getElementById('login-form'); const registerForm = document.getElementById('register-form'); const forgotForm = document.getElementById('forgot-form'); const resetForm = document.getElementById('reset-form'); const loginMessage = document.getElementById('login-message'); const registerMessage = document.getElementById('register-message'); const forgotMessage = document.getElementById('forgot-message'); const resetMessage = document.getElementById('reset-message'); function showAuthMessage(element, message, isSuccess = false) { if (!element) return; element.textContent = message; element.className = 'auth-message ' + (isSuccess ? 'success' : 'error'); } if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); }); if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); }); if (forgotActionLink) forgotActionLink.addEventListener('click', (e => { e.preventDefault(); showForgotForm(); })); const closeAuthButtons = document.querySelectorAll('#auth-container .close-auth-btn'); closeAuthButtons.forEach(btn => btn.addEventListener('click', closeAuthForms)); if (loginForm) { loginForm.addEventListener('submit', async (e) => { e.preventDefault(); showAuthMessage(loginMessage, 'Đang đăng nhập...'); const username = e.target.username.value; const password = e.target.password.value; try { const data = await fetchData('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); showAuthMessage(loginMessage, 'Đang cập nhật thông tin...', true); localStorage.setItem('userId', data.userId); localStorage.setItem('username', data.username); await fetchAndUpdateUserInfo(); setTimeout(closeAuthForms, 1200); } catch (error) { console.error("Login failed:", error); showAuthMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'); } }); } if (registerForm) { registerForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; if (password !== confirmPassword) { showAuthMessage(registerMessage, 'Mật khẩu nhập lại không khớp.'); return; } showAuthMessage(registerMessage, 'Đang đăng ký...'); const username = e.target.username.value; const email = e.target.email.value; try { await fetchData('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }); showAuthMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 1500); } catch (error) { console.error("Registration failed:", error); showAuthMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.'); } }); } if (forgotForm) { forgotForm.addEventListener('submit', async (e) => { e.preventDefault(); showAuthMessage(forgotMessage, 'Đang xử lý yêu cầu...'); const email = e.target.email.value; try { const data = await fetchData('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); showAuthMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true); } catch (error) { console.error("Forgot password failed:", error); showAuthMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.'); } }); } if (resetForm) { resetForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; const token = e.target.token.value; if (password !== confirmPassword) { showAuthMessage(resetMessage, 'Mật khẩu mới không khớp.'); return; } if (!token) { showAuthMessage(resetMessage, 'Thiếu mã token đặt lại.'); return; } showAuthMessage(resetMessage, 'Đang đặt lại mật khẩu...'); try { await fetchData('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }); showAuthMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 2000); } catch (error) { console.error("Reset password failed:", error); showAuthMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.'); } }); } if (logoutLink) { logoutLink.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('userId'); localStorage.removeItem('username'); localStorage.removeItem('isAdmin'); localStorage.removeItem('balance'); updateUserStatus(false); updateSidebarUserArea(false); console.log("User logged out."); }); } const checkLoginAndToken = () => { const userId = localStorage.getItem('userId'); if (userId) { fetchAndUpdateUserInfo(); } else { updateUserStatus(false); updateSidebarUserArea(false); } const urlParams = new URLSearchParams(window.location.search); const resetToken = urlParams.get('token'); if (resetToken) { showResetForm(); const tokenInput = document.getElementById('reset-token'); if (tokenInput) tokenInput.value = resetToken; window.history.replaceState({}, document.title, window.location.pathname); } }; checkLoginAndToken(); }

// --- Fetch and Update User Info ---
async function fetchAndUpdateUserInfo() { const userId = localStorage.getItem('userId'); if (!userId) { updateUserStatus(false); updateSidebarUserArea(false); return; } try { const userData = await fetchData('/users/me'); if (!userData || !userData.username) { throw new Error("Received invalid user data"); } localStorage.setItem('username', userData.username); localStorage.setItem('balance', userData.balance ?? 0); localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false'); updateUserStatus(true, userData.username, !!userData.isAdmin); updateSidebarUserArea(true, userData.username, userData.balance ?? 0); } catch (error) { console.error("Error fetching or processing user info:", error); localStorage.removeItem('userId'); localStorage.removeItem('username'); localStorage.removeItem('balance'); localStorage.removeItem('isAdmin'); updateUserStatus(false); updateSidebarUserArea(false); } }

// --- Basic Dropdown Actions ---
function setupDropdownActions() { const depositLink = document.getElementById('deposit-link'); const historyLink = document.getElementById('history-link'); const depositLinkMobile = document.getElementById('deposit-link-mobile'); const historyLinkMobile = document.getElementById('history-link-mobile'); const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); }; const handleHistoryClick = (e) => { e.preventDefault(); window.location.href = 'history.html'; }; if(depositLink) depositLink.addEventListener('click', handleDepositClick); if(historyLink) historyLink.addEventListener('click', handleHistoryClick); if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick); if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick); }

// --- Back to Top Button ---
function setupBackToTopButton() { const backToTopButton = document.getElementById("back-to-top-btn"); if (!backToTopButton) { return; } const scrollThreshold = 200; const checkScroll = () => { if (!backToTopButton) return; if (window.scrollY > scrollThreshold) { backToTopButton.classList.add("visible"); } else { backToTopButton.classList.remove("visible"); } }; window.addEventListener("scroll", checkScroll, { passive: true }); checkScroll(); backToTopButton.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }); }

// --- Modal Handling (Generic) ---
function showModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.style.display = modal.classList.contains('modal-overlay') ? 'flex' : 'block'; setTimeout(() => { modal.classList.add('visible'); }, 10); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function hideModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.classList.remove('visible'); setTimeout(() => { modal.style.display = 'none'; }, 300); } else { console.error(`Modal with ID ${modalId} not found.`); } }

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
        purchaseMessage.textContent = 'Đang kiểm tra và xử lý...';
        purchaseMessage.className = 'auth-message';

        const formData = new FormData(purchaseForm);
        const purchaseData = Object.fromEntries(formData.entries()); // Contains form fields like robloxUser, contactInfo etc.
        purchaseData.userId = localStorage.getItem('userId'); // Get user ID
        const itemId = purchaseData.itemId; // Get item ID from hidden input
        const submitButton = purchaseForm.querySelector('button[type="submit"]');

        // Frontend balance check remains for immediate feedback (optional but good UX)
        const currentBalance = parseFloat(localStorage.getItem('balance') || '0');
        const itemPrice = parseFloat(purchaseItemPriceInput.value);
        if (isNaN(itemPrice)) { purchaseMessage.textContent = 'Lỗi: Giá sản phẩm không hợp lệ.'; purchaseMessage.className = 'auth-message error'; return; }
        if (currentBalance < itemPrice) { purchaseMessage.textContent = 'Lỗi: Số dư không đủ để thực hiện giao dịch.'; purchaseMessage.className = 'auth-message error'; return; }

        if(submitButton) submitButton.disabled = true;

        try {
            // --- !!! ACTUAL BACKEND CALL !!! ---
            console.log(`Calling backend /purchase/confirm for item: ${itemId}`);
            const result = await fetchData('/purchase/confirm', { // Call the new backend endpoint
                 method: 'POST',
                 body: JSON.stringify({
                     itemId: itemId // Send only the item ID (backend gets price & userId securely)
                     // You might send other relevant data if needed by backend (like robloxUser, contactInfo)
                     // robloxUser: purchaseData.robloxUser,
                     // contactInfo: purchaseData.contactInfo,
                     // notes: purchaseData.notes
                 })
             });
            console.log("Backend Purchase result:", result);

            // Check result based on the structure defined in the backend route
            if (!result || !result.success) {
                 throw new Error(result.message || 'Giao dịch thất bại từ máy chủ.'); // Throw error if backend indicates failure
            }
            // --- END ACTUAL BACKEND CALL ---

            // If backend call was successful:
            purchaseMessage.textContent = result.message || 'Mua hàng thành công! Cập nhật số dư...'; // Use message from backend
            purchaseMessage.className = 'auth-message success';
            console.log("Purchase successful for item ID:", itemId);

            // Refresh user balance AFTER successful purchase confirmation from backend
            // This will fetch the NEW balance returned by the server via /users/me
            await fetchAndUpdateUserInfo();

            setTimeout(() => { hideModal('purchase-modal'); }, 2500); // Close modal after showing success

        } catch (error) {
            console.error("Purchase failed:", error);
            // Display the error message received from backend or fetch
            purchaseMessage.textContent = `Lỗi: ${error.message || 'Mua hàng thất bại.'}`;
            purchaseMessage.className = 'auth-message error';
        } finally {
             if(submitButton) submitButton.disabled = false; // Re-enable button regardless of outcome
        }
    });
}

// --- NEW: Category Detail Page Logic ---
let originalCategoryProducts = []; // Store the initial list of products
let categoryControlListenersAdded = false; // Flag to prevent adding listeners multiple times

// Add helper function for getting category icons
function getCategoryIcon(slug) {
    const iconMap = {
        'chuot': 'fas fa-mouse',
        'ban-phim': 'fas fa-keyboard',
        'tai-nghe': 'fas fa-headphones',
        'man-hinh': 'fas fa-desktop',
        'loa': 'fas fa-volume-up',
        'ghế-gaming': 'fas fa-chair',
        'pc-gaming': 'fas fa-server',
        'laptop': 'fas fa-laptop',
        'phu-kien': 'fas fa-plug',
        'unknown': 'fas fa-question-circle'
    };
    
    return iconMap[slug] || 'fas fa-tag';
}

// Function to render products for a category section
function renderCategoryProducts(products, targetElement, categorySlug) { // Added categorySlug parameter
    // Validate inputs
    if (!products || !targetElement) {
        console.error('Missing required parameters for renderCategoryProducts:', { products, targetElement });
        return;
    }
    
    let productsContainer = targetElement.querySelector('.product-grid'); // Changed selector
    if (!productsContainer) {
        productsContainer = document.createElement('div');
        productsContainer.className = 'product-grid';
        targetElement.appendChild(productsContainer);
    } else {
        productsContainer.innerHTML = '';
    }

    // Show empty state if no products
    if (!products || products.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-products-message';
        emptyState.innerHTML = `
            <i class="fas fa-box-open"></i>
            <p>Không tìm thấy sản phẩm nào phù hợp</p>
        `;
        productsContainer.appendChild(emptyState);
        return;
    }

    // Get category slug from the first product if not provided
    const slugToUse = categorySlug || products[0]?.category?.slug;

    // Create and append product cards - PASS FALSE FOR BUY BUTTON as requested
    products.forEach(product => {
        // --- MODIFIED CALL: Set includeBuyButton to false and pass category slug ---
        const productCard = createProductCardElement(product, false, slugToUse); 
        // --- END MODIFIED CALL ---
        if (productCard) { // Add check if card is valid
            productsContainer.appendChild(productCard);
        } else {
            console.warn(`Failed to create product card for product ID: ${product?._id} in renderCategoryProducts`);
        }
    });
}

// Function to apply filters and sorting
function applyCategoryFilters() {
    const sortValue = document.getElementById('filter-sort')?.value || 'default';
    const priceValue = document.getElementById('filter-price')?.value || 'all';
    const searchValue = document.getElementById('filter-search-input')?.value.toLowerCase().trim() || '';

    console.log(`Applying filters: Sort=${sortValue}, Price=${priceValue}, Search=${searchValue}`);

    let filteredProducts = [...originalCategoryProducts]; // Start with the original list

    // 1. Apply Price Filter (Example - needs better parsing)
    if (priceValue !== 'all') {
        try {
            const [minStr, maxStr] = priceValue.split('-');
            const min = parseInt(minStr, 10);
            const max = parseInt(maxStr, 10);

            filteredProducts = filteredProducts.filter(product => {
                if (typeof product.price !== 'number') return false; // Exclude non-numeric prices
                const price = product.price;
                let match = true;
                if (!isNaN(min)) {
                    match = match && price >= min;
                }
                if (!isNaN(max) && max > 0) { // Max 0 usually means 'and above'
                    match = match && price <= max;
                }
                return match;
            });
        } catch (e) {
            console.error("Error parsing price filter value:", priceValue, e);
        }
    }

    // 2. Apply Search Filter (Search name, brand, and maybe category name)
    if (searchValue) {
        filteredProducts = filteredProducts.filter(product => {
            const nameMatch = product.name?.toLowerCase().includes(searchValue);
            const brandMatch = product.brand?.toLowerCase().includes(searchValue);
            // Optional: Search category name as well
            // const categoryMatch = product.category?.name?.toLowerCase().includes(searchValue);
            return nameMatch || brandMatch; // || categoryMatch;
        });
    }

    // 3. Apply Sorting
    switch (sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
            break;
        case 'best-seller':
            filteredProducts.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
         case 'oldest':
             filteredProducts.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
             break;
        // 'default' case uses the order from previous filters
    }

    renderCategoryProducts(filteredProducts); // Re-render the grid with filtered/sorted products
}

// --- MODIFIED loadCategoryPageData to ensure proper initialization and error handling --- 
async function loadCategoryPageData() {
    // Get required DOM elements
    const contentArea = document.getElementById('category-product-grid');
    const breadcrumb = document.getElementById('category-breadcrumb');
    const nameDisplay = document.getElementById('category-name-display');
    const gridContainer = document.getElementById('category-product-grid-container');
    
    // Validate required elements exist
    if (!contentArea || !breadcrumb || !nameDisplay || !gridContainer) {
        console.error('Required DOM elements not found for category page');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('slug');
    
    if (!categorySlug) {
        console.error('No category slug provided in URL');
        window.location.href = 'shopping.html';
        return;
    }
    
    // Show loading state
    contentArea.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>Đang tải sản phẩm...</p>
        </div>
    `;
    
    try {
        console.log('Loading category data for slug:', categorySlug);
        
        // Fetch category data
        const data = await fetchData(`/categories/${categorySlug}`);
        console.log('Received category data:', data);
        
        if (!data || !data.categoryName) {
            throw new Error('Invalid category data received');
        }
        
        // Update page title and breadcrumb
        document.title = `${data.categoryName} - KiritoMainBro`;
        breadcrumb.textContent = 'Vật Phẩm';
        nameDisplay.textContent = data.categoryName;
        
        // Handle products display
        if (data.products && Array.isArray(data.products)) {
            if (data.products.length > 0) {
                contentArea.innerHTML = ''; // Clear loading state
                data.products.forEach(product => {
                    try {
                        if (!product || !product._id) {
                            console.warn('Invalid product data:', product);
                            return;
                        }
                        const productCard = createProductCardElement(product, true, categorySlug);
                        if (productCard) {
                            contentArea.appendChild(productCard);
                        }
                    } catch (cardError) {
                        console.error('Error creating product card:', cardError);
                    }
                });
            } else {
                // No products found
                contentArea.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                        <i class="fas fa-box-open" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                        <p>Chưa có sản phẩm nào trong danh mục này.</p>
                    </div>
                `;
            }
        } else {
            throw new Error('Invalid products data received');
        }
        
        // Setup buy button listeners
        setupCategoryPageBuyListeners();
        
    } catch (error) {
        console.error('Error loading category data:', error);
        contentArea.innerHTML = `
            <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p>Không thể tải thông tin danh mục. Vui lòng thử lại sau.</p>
            </div>
        `;
        if (nameDisplay) nameDisplay.textContent = 'Lỗi tải dữ liệu';
    }
}

// --- NEW: Setup listeners specific to category page grid ---
function setupCategoryPageBuyListeners() {
    const productGrid = document.getElementById('category-product-grid');
    if (!productGrid) return;

    productGrid.addEventListener('click', (e) => {
        const buyButton = e.target.closest('.product-buy-btn');
        if (!buyButton) return;

        e.preventDefault();
        const productCard = buyButton.closest('.product-card');
        if (!productCard) return;

        const productId = productCard.dataset.productId;
        const productName = productCard.querySelector('.product-title')?.textContent;
        const productPrice = parseFloat(productCard.dataset.price);

        if (productId && productName && !isNaN(productPrice)) {
            openPurchaseModal(productId, productName, productPrice);
        }
    });
}

// Function to load and display categories on the home page
function loadHomePageCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) {
        console.error('Categories container not found');
        return;
    }

    // Clear any existing content
    categoriesContainer.innerHTML = '';
    
    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải danh mục sản phẩm...';
    categoriesContainer.appendChild(loadingElement);

    // Fetch the categories data
    fetch('api/categories-with-products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove loading indicator
            categoriesContainer.innerHTML = '';
            
            // Process each category
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(category => {
                    // Create the category section element
                    const categorySection = createCategorySectionElement(category);
                    categoriesContainer.appendChild(categorySection);
                    
                    // Render products for this category (limit to 6 for home page)
                    renderCategoryProducts(category, categorySection, 6);
                });
            } else {
                throw new Error('No categories data received');
            }
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            categoriesContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.</p>
                </div>
            `;
        });
}

// Function to create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product._id;

    // Format prices
    const formattedPrice = formatCurrency(product.price);
    const formattedOriginalPrice = product.originalPrice ? formatCurrency(product.originalPrice) : '';
    const discountBadge = product.originalPrice ? `<span class="product-tag sale-tag">Giảm ${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` : '';
    const stockBadge = product.stockStatus === 'out_of_stock' ? '<span class="product-tag hot-tag">Hết hàng</span>' : '';

    // Get min and max price if available
    const minPrice = product.minPrice || product.price;
    const maxPrice = product.maxPrice || product.price;
    
    // Format price range string
    let priceRangeText = '';
    if (minPrice === maxPrice) {
        priceRangeText = `Start From: ${formatCurrency(minPrice)}`;
    } else {
        priceRangeText = `Start From: ${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    }

    card.innerHTML = `
        <div class="product-image-placeholder">
            <img src="${product.imageUrl || 'https://placehold.co/400x225/e9ecef/495057?text=No+Image'}" alt="${escapeHtml(product.name)}">
            ${discountBadge}
            ${stockBadge}
        </div>
        <div class="product-info">
            ${product.brand ? `<div class="product-brand">${escapeHtml(product.brand)}</div>` : ''}
            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            <div class="product-meta">
                ${product.category ? `<span class="category">${escapeHtml(product.category.name)}</span>` : ''}
                <div class="product-price-range">${priceRangeText}</div>
            </div>
            <div class="product-price">
                ${formattedOriginalPrice ? `<span class="original-price">${formattedOriginalPrice}</span>` : ''}
                <span class="sale-price">${formattedPrice}</span>
            </div>
            <!-- Buy button removed -->
        </div>
    `;

    return card;
}

// Function to load and display category products
async function loadCategoryProducts(categorySlug, page = 1, filters = {}) {
    const gridContainer = document.getElementById('category-product-grid');
    const noResults = document.getElementById('no-results');
    const paginationControls = document.querySelector('.pagination-controls');
    
    if (!gridContainer) return;

    // Show loading state
    gridContainer.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>Đang tải sản phẩm...</p>
        </div>
    `;
    noResults.style.display = 'none';

    try {
        // Build query parameters
        const params = new URLSearchParams({
            page: page,
            ...filters
        });

        // Fetch products for category
        const data = await fetchData(`/api/categories/${categorySlug}/products?${params}`);
        
        // Update category name
        const categoryNameDisplay = document.getElementById('category-name-display');
        if (categoryNameDisplay) {
            categoryNameDisplay.textContent = data.categoryName || 'Không tìm thấy';
        }

        // Clear grid and show products or no results message
        gridContainer.innerHTML = '';
        
        if (!data.products || data.products.length === 0) {
            noResults.style.display = 'block';
            paginationControls.style.display = 'none';
            return;
        }

        // Create and append product cards
        data.products.forEach(product => {
            const card = createProductCard(product);
            gridContainer.appendChild(card);
        });

        // Update pagination
        if (data.pagination) {
            const { currentPage, totalPages } = data.pagination;
            const pageInfo = document.getElementById('page-info');
            const prevBtn = document.getElementById('prev-page-btn');
            const nextBtn = document.getElementById('next-page-btn');

            if (pageInfo) pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
            if (prevBtn) prevBtn.disabled = currentPage === 1;
            if (nextBtn) nextBtn.disabled = currentPage === totalPages;
            paginationControls.style.display = totalPages > 1 ? 'block' : 'none';
        }

    } catch (error) {
        console.error('Error loading category products:', error);
        gridContainer.innerHTML = `
            <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p>Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

// Setup category page functionality
function setupCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('slug');
    
    if (!categorySlug) {
        window.location.href = 'shopping.html';
        return;
    }

    // Load initial products
    loadCategoryProducts(categorySlug);

    // Setup filter handlers
    const filterForm = document.querySelector('.filter-bar');
    const searchInput = document.getElementById('filter-search-input');
    const searchBtn = document.getElementById('filter-search-btn');
    const resetBtn = document.getElementById('filter-reset-btn');
    const priceSelect = document.getElementById('filter-price');
    const sortSelect = document.getElementById('filter-sort');

    if (filterForm) {
        // Search button click
        searchBtn?.addEventListener('click', () => {
            const filters = {
                search: searchInput?.value || '',
                price: priceSelect?.value || 'all',
                sort: sortSelect?.value || 'default'
            };
            loadCategoryProducts(categorySlug, 1, filters);
        });

        // Reset filters
        resetBtn?.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (priceSelect) priceSelect.value = 'all';
            if (sortSelect) sortSelect.value = 'default';
            loadCategoryProducts(categorySlug);
        });

        // Price and sort change
        priceSelect?.addEventListener('change', () => searchBtn?.click());
        sortSelect?.addEventListener('change', () => searchBtn?.click());
    }

    // Setup pagination
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    let currentPage = 1;

    prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadCategoryProducts(categorySlug, currentPage, {
                search: searchInput?.value || '',
                price: priceSelect?.value || 'all',
                sort: sortSelect?.value || 'default'
            });
        }
    });

    nextBtn?.addEventListener('click', () => {
        currentPage++;
        loadCategoryProducts(categorySlug, currentPage, {
            search: searchInput?.value || '',
            price: priceSelect?.value || 'all',
            sort: sortSelect?.value || 'default'
        });
    });
}

// ----- Initialization Function -----
function initializePage() {
    const scriptTag = document.querySelector('script[src*="script.js"]');
    const version = scriptTag ? scriptTag.src.split('v=')[1] : 'unknown';
    console.log(`Initializing page (v${version})...`);

    initializeDOMElements();
    updateYear();
    setupHeaderScrollEffect();
    setupMobileMenuToggle();
    setupUserDropdown();
    setupThemeToggle();
    setupLanguageToggle();
    setupClickDropdowns();
    setupBackToTopButton();
    setupPurchaseModalListeners();
    setupActionButtons();
    setupDropdownActions();

    // --- Page-Specific Logic ---
    if (document.body.classList.contains('shopping-page')) {
        console.log("Shopping page detected. Loading overview data...");
        loadAndDisplayShoppingData();
    } else if (document.body.classList.contains('category-detail-page')) {
        console.log("Category detail page detected. Loading specific data...");
        loadCategoryPageData(); // New: Load category-specific products WITH buy buttons
    } else if (document.body.classList.contains('history-page')) {
        console.log("History page detected.");
        setupProfessionalAnimations();
    } else {
        setupProfessionalAnimations();
    }

    const donateButtonHeader = document.getElementById('donate-button-header');
    if (donateButtonHeader) {
        donateButtonHeader.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Donate function coming soon!');
        });
    }

    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        try {
            ageSpan.textContent = calculateAge('2006-08-08');
        } catch (e) {
            console.error("Error calculating age:", e);
            ageSpan.textContent = "??";
        }
    }
    console.log("Page initialization complete.");
}

// --- Run Initialization on DOM Ready ---
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializePage); } else { initializePage(); }
