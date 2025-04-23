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
    const headers = { 'Content-Type': 'application/json', ...options.headers, };
    const tempUserId = localStorage.getItem('userId');
    if (tempUserId) { headers['x-temp-userid'] = tempUserId; } // Insecure header for demo admin auth
    const config = { method: options.method || 'GET', headers: headers, };
    if (options.body) { config.body = options.body; }
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
    if (!dynamicProductArea) {
        return;
    }
    console.log("Attempting to load shopping page data (product grid layout)...");
    dynamicProductArea.innerHTML = `
        <p style="text-align: center; padding: 2rem; background-color: var(--bg-tertiary); border-radius: var(--border-radius-md);">
            <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>
            Đang tải sản phẩm...
        </p>`; // Loading message

    try {
        console.log("Fetching categories and all products...");
        const [categories, allProductsData] = await Promise.all([
            fetchData('/categories'),
            fetchData('/products') // Fetch all products
        ]);

        console.log("Fetched Categories:", categories);
        console.log("Fetched All Products Data:", allProductsData);

        dynamicProductArea.innerHTML = ''; // Clear loading message
        dynamicProductArea.classList.remove('category-summary-grid'); // Remove summary grid class

        if (!categories || !Array.isArray(categories)) {
             console.error("Received invalid data for categories:", categories);
             throw new Error("Invalid category data received from server.");
        }

        // --- Process all products data --- (Handle array or object)
        let productArray = [];
         if (Array.isArray(allProductsData)) {
            productArray = allProductsData;
        } else if (typeof allProductsData === 'object' && allProductsData !== null && allProductsData.hasOwnProperty('products') && Array.isArray(allProductsData.products)) {
            productArray = allProductsData.products;
        } else {
            console.error("Invalid product data structure received (expected array or object with products):");
             // Attempt to log structure without crashing on circular refs
            try { console.log(JSON.stringify(allProductsData, null, 2).substring(0, 500) + '...'); } catch { console.log(allProductsData); }
            throw new Error("Invalid product data structure received from server.");
        }
        console.log(`Processed ${productArray.length} products total.`);
        // --- End Product Processing ---

        if (categories.length === 0) {
            console.log("No categories found.");
            dynamicProductArea.innerHTML = '<p style="text-align: center; padding: 2rem;">Không tìm thấy danh mục sản phẩm nào.</p>';
            return;
        }

        console.log("Rendering category sections with product grids...");
        categories.forEach((category, index) => {
            console.log(`Rendering category ${index}: ${category.name}`);

            // 1. Create the category section element (using existing function)
            const categorySection = createCategorySectionElement(category);
            const productGrid = categorySection.querySelector('.product-grid');
            if (!productGrid) { 
                console.error(`Product grid container not found for category: ${category.name}`); 
                return; // Skip this category if structure is wrong
            }

            // 2. Filter products for this category
            const categoryProducts = productArray.filter(product => product.category?._id === category._id);
            console.log(`Found ${categoryProducts.length} products for category ${category.name}`);

            // 3. Render product cards into the grid
            if (categoryProducts.length > 0) {
                categoryProducts.forEach(product => {
                    try {
                        // Pass TRUE to include buy button for previews
                        const productCard = createProductCardElement(product, true); 
                        productGrid.appendChild(productCard);
                    } catch (cardError) {
                        console.error(`Error creating product card for ${product.name}:`, cardError);
                    }
                });
            } else {
                 productGrid.innerHTML = '<p style="font-size: 0.9em; color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Chưa có sản phẩm trong danh mục này.</p>';
            }

            // 4. Append the whole section to the main area
            dynamicProductArea.appendChild(categorySection);
        });
        console.log("Finished rendering categories and products.");

        // --- Setup Buy Button Listeners for the newly added cards --- 
        setupShoppingPageBuyListeners();
        
        // --- Re-apply animations --- 
        console.log("Re-applying animations...");
        setTimeout(() => {
            // Target section containers and product cards within them
            gsap.utils.toArray('.product-category-section[data-animate].gsap-initiated').forEach(el => el.classList.remove('gsap-initiated'));
            setupProfessionalAnimations(); // Should re-animate sections and cards
            console.log("Animations re-applied.");
        }, 150);

    } catch (error) {
        console.error("Error loading or rendering shopping page data:", error);
        dynamicProductArea.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--danger-color);">Lỗi tải sản phẩm: ${error.message}. Vui lòng kiểm tra Console (F12) và thử lại sau.</p>`;
    }
}

// --- MODIFIED: Create Category Section Element ---
function createCategorySectionElement(category) {
    const section = document.createElement('section');
    section.classList.add('product-category-section');
    section.dataset.animate = "fade-up";

    // --- Create Link (<a>) element ---
    const titleLink = document.createElement('a');
    // Modified to use category.html instead of category-page.html
    titleLink.href = `category.html?slug=${category.slug || 'unknown'}`;
    titleLink.classList.add('category-title-link');

    // --- Create Heading (<h2>) inside the link ---
    const titleHeading = document.createElement('h2');
    titleHeading.classList.add('category-title');
    titleHeading.innerHTML = `<i class="${category.iconClass || 'fas fa-tag'} icon-left"></i>${category.name}`;

    // Append heading to link, and link to section
    titleLink.appendChild(titleHeading);
    section.appendChild(titleLink);

    const grid = document.createElement('div');
    grid.classList.add('product-grid');
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
    if (minPrice !== null && maxPrice !== null) {
        if (minPrice === maxPrice) {
            // If min and max are the same, just show that price
            priceRangeHTML = `<p class="category-price-range">Giá: ${formatPrice(minPrice)}</p>`;
        } else {
            priceRangeHTML = `<p class="category-price-range">Từ: ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}</p>`;
        }
    } else {
        // Handle cases with no numeric prices or only special prices
        priceRangeHTML = `<p class="category-price-range">Xem sản phẩm</p>`; // Or "Liên hệ giá", etc.
    }

    // Basic structure - adjust classes and content as needed for styling
    cardLink.innerHTML = `
        <div class="category-summary-info">
            <h3 class="category-summary-title">
                <i class="${category.iconClass || 'fas fa-tag'} icon-left"></i>
                ${category.name}
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
function createProductCardElement(product, includeBuyButton = false) {
    // Determine the wrapper element: <a> if linking, <div> otherwise
    const categorySlug = product.category?.slug;
    const canLink = !includeBuyButton && categorySlug;
    const wrapperElement = canLink ? document.createElement('a') : document.createElement('div');

    // Add base class to the wrapper
    wrapperElement.classList.add('product-card');

    // Set link properties if applicable
    if (canLink) {
        wrapperElement.href = `category.html?slug=${categorySlug}`;
        wrapperElement.classList.add('product-card-link'); // Optional class for linked cards
    }

    const originalPriceHTML = product.originalPrice && product.originalPrice > product.price
        ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>`
        : '';
    const salePriceFormatted = formatPrice(product.price);
    const salePriceHTML = `<span class="sale-price">${salePriceFormatted}</span>`;

    let tagHTML = '';
    if (product.tags?.includes('hot')) {
        tagHTML = '<span class="product-tag hot-tag">Hot</span>';
    } else if (product.tags?.includes('sale') || (product.originalPrice && product.originalPrice > product.price)) {
        tagHTML = '<span class="product-tag sale-tag">Sale</span>';
    }

    // --- ADDED: Brand/Category Tag ---
    let brandTagHTML = '';
    const categoryName = product.category?.name;
    const brandName = product.brand; // ASSUMING product.brand exists
    if (categoryName && brandName) {
        brandTagHTML = `<span class="product-tag brand-tag">${categoryName} - ${brandName}</span>`;
    } else if (categoryName) {
        // Fallback if brand is missing
        brandTagHTML = `<span class="product-tag brand-tag">${categoryName}</span>`;
    }
    // --- END ADDED ---

    let buttonText = 'Mua ngay';
    let buttonDisabled = false;
    let priceDisplay = `${originalPriceHTML} ${salePriceHTML}`;
    let buyButtonHTML = '';

    if (includeBuyButton) {
        switch (product.stockStatus) {
            case 'out_of_stock':
                buttonText = 'Hết hàng';
                buttonDisabled = true;
                break;
            case 'contact':
                buttonText = 'Liên hệ';
                priceDisplay = `<span class="sale-price">Liên hệ</span>`;
                break;
            case 'check_price':
                buttonText = 'Xem bảng giá';
                priceDisplay = `<span class="sale-price">Giá tốt</span>`;
                break;
            // default: 'in_stock'
        }
        buyButtonHTML = `<button class="cta-button product-buy-btn" data-product-id="${product._id}" ${buttonDisabled ? 'disabled' : ''}>
            ${buttonText}
        </button>`;
    } else {
        // If not including buy button, ensure price still shows correctly for special statuses
        switch (product.stockStatus) {
            case 'contact':
                priceDisplay = `<span class="sale-price">Liên hệ</span>`;
                break;
            case 'check_price':
                priceDisplay = `<span class="sale-price">Giá tốt</span>`;
                break;
        }
    }

    // Set the inner HTML of the wrapper element (<a> or <div>)
    wrapperElement.innerHTML = `
        <div class="product-image-placeholder">
            <img src="${product.imageUrl || 'images/product-placeholder.png'}" alt="${product.name || 'Product Image'}" loading="lazy">
            ${tagHTML}
            ${brandTagHTML}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name || 'Unnamed Product'}</h3>
            <p class="product-meta">Đã bán: ${product.purchaseCount || 0}</p>
            <p class="product-price">
                ${priceDisplay}
            </p>
            ${buyButtonHTML} // Buy button HTML will be empty if includeBuyButton is false
        </div>`;

    // Return the wrapper element
    return wrapperElement;
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

// Function to render products in the category grid
function renderCategoryProducts(productsToRender) {
    if (!categoryProductGrid) return;
    categoryProductGrid.innerHTML = ''; // Clear existing products

    if (productsToRender.length === 0) {
        categoryProductGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Không tìm thấy sản phẩm nào phù hợp.</p>';
        return;
    }

    productsToRender.forEach(product => {
        try {
            categoryProductGrid.appendChild(createProductCardElement(product, true)); // includeBuyButton is true
        } catch (cardError) {
            console.error(`Error creating product card on category page for ${product.name}:`, cardError);
        }
    });

    // Re-apply animations to the newly rendered cards (optional, can be adjusted)
    setTimeout(() => {
        const productCards = categoryProductGrid.querySelectorAll('.product-card.gsap-initiated');
        productCards.forEach(card => card.classList.remove('gsap-initiated')); // Reset animation state

        const newCards = categoryProductGrid.querySelectorAll('.product-card:not(.gsap-initiated)');
        if (newCards.length > 0) {
            newCards.forEach(card => card.classList.add('gsap-initiated')); // Mark as initiated
            gsap.from(newCards, { opacity: 0, y: 15, duration: 0.4, ease: "power1.out", stagger: 0.05 });
        }
    }, 50); // Short delay to allow DOM update
}

// Function to apply filters and sorting
function applyCategoryFilters() {
    const sortValue = document.getElementById('sort-select')?.value || 'default';
    const searchValue = document.getElementById('search-input')?.value.toLowerCase().trim() || '';

    let filteredProducts = [...originalCategoryProducts]; // Start with the original list

    // 1. Apply Search Filter
    if (searchValue) {
        filteredProducts = filteredProducts.filter(product =>
            (product.name?.toLowerCase().includes(searchValue)) ||
            (product.brand?.toLowerCase().includes(searchValue)) // Also search brand if it exists
            // Add more fields to search if needed (e.g., description)
        );
    }

    // 2. Apply Sorting
    switch (sortValue) {
        case 'price-asc':
            // Sort by price, handling non-numeric prices (placing them potentially last)
            filteredProducts.sort((a, b) => {
                const priceA = typeof a.price === 'number' ? a.price : Infinity;
                const priceB = typeof b.price === 'number' ? b.price : Infinity;
                return priceA - priceB;
            });
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => {
                const priceA = typeof a.price === 'number' ? a.price : -Infinity;
                const priceB = typeof b.price === 'number' ? b.price : -Infinity;
                return priceB - priceA;
            });
            break;
        case 'best-seller':
            // Assuming purchaseCount exists
            filteredProducts.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
            break;
        case 'newest':
            // Assuming createdAt exists (or updatedAt)
            filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
        case 'oldest':
            filteredProducts.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            break;
        // 'default' case requires no sorting, keeps original fetched order (or search filtered order)
    }

    console.log(`Applied filters: sort=${sortValue}, search=${searchValue}. Rendering ${filteredProducts.length} products.`);
    renderCategoryProducts(filteredProducts);
}

// --- MODIFIED loadCategoryPageData --- 
async function loadCategoryPageData() {
    if (!document.body.classList.contains('category-detail-page') || !categoryProductGrid || !categoryPageTitle) {
        return;
    }
    console.log("Loading data for category detail page...");

    // --- Reset state for potential reloads --- 
    originalCategoryProducts = [];
    const controls = document.querySelector('.category-controls');
    if (controls) controls.style.display = 'none'; // Hide controls initially
    // ----------------------------------------

    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('slug');

    if (!categorySlug) {
        categoryPageTitle.textContent = "Lỗi";
        categoryProductGrid.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Không tìm thấy mã danh mục (slug) trong URL.</p>';
        return;
    }

    categoryPageTitle.textContent = `Đang tải danh mục '${categorySlug}'...`;
    categoryProductGrid.innerHTML = `<p style="text-align: center; padding: 3rem 1rem; background-color: var(--bg-secondary); border-radius: var(--border-radius-md); grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Đang tải sản phẩm...</p>`;

    try {
        console.log(`Fetching products for slug: ${categorySlug}`);
        const response = await fetchData(`/products?categorySlug=${categorySlug}`);
        // --- ADDED: Log the raw response --- 
        console.log("Raw response for category:", response);
        // --- END LOGGING --- 

        // --- MODIFIED: Handle array OR object response --- 
        let productsArray = [];
        let categoryNameFromResponse = null;

        if (Array.isArray(response)) {
            // If the response itself is the array
            console.log("Received direct array of products.");
            productsArray = response;
        } else if (typeof response === 'object' && response !== null && response.hasOwnProperty('products') && Array.isArray(response.products)) {
            // If the response is an object containing the products array
            console.log("Received object containing products array.");
            productsArray = response.products;
            categoryNameFromResponse = response.categoryName; 
        } else {
            // If it's neither a direct array nor the expected object structure
             console.error("Invalid product data received for category. Expected array or object with 'products' array property:", response);
             throw new Error("Invalid product data structure received for category.");
        }
        
        originalCategoryProducts = productsArray; // Store the correctly identified products array
        
        console.log(`Fetched and stored ${originalCategoryProducts.length} original products for this category.`);
        // --- END MODIFICATION ---

        // Initial render
        renderCategoryProducts(originalCategoryProducts);

        // Set page title (only if products exist)
        if (originalCategoryProducts.length > 0) {
            // Use category name from response if available, otherwise fallback
            const titleToSet = categoryNameFromResponse || (originalCategoryProducts[0]?.category?.name);
            if (titleToSet) {
                categoryPageTitle.textContent = titleToSet;
                document.title = `${titleToSet} - KiritoMainBro`;
            } else {
                categoryPageTitle.textContent = `Danh mục: ${categorySlug}`;
            }
            // Show controls only if products exist
            if (controls) controls.style.display = 'block';
        } else {
            categoryPageTitle.textContent = `Danh mục: ${categorySlug} (Trống)`;
        }

        // --- Setup Listeners (only once) ---
        if (!categoryControlListenersAdded) {
            const sortSelect = document.getElementById('sort-select');
            const searchInput = document.getElementById('search-input');
            const resetButton = document.getElementById('filter-reset-btn');

            if (sortSelect) {
                sortSelect.addEventListener('change', applyCategoryFilters);
            }
            if (searchInput) {
                // Basic immediate filtering on input
                searchInput.addEventListener('input', applyCategoryFilters); 
                // TODO: Add debouncing for better performance on rapid typing
            }
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    if(sortSelect) sortSelect.value = 'default';
                    if(searchInput) searchInput.value = '';
                    console.log("Resetting filters.");
                    renderCategoryProducts(originalCategoryProducts); // Render the original list
                });
            }
            categoryControlListenersAdded = true;
            console.log("Category control listeners added.");
        }
        // ---------------------------------

        // --- Setup Buy Button Listeners for the grid ---
        setupCategoryPageBuyListeners();

        // --- Initial Animations (apply AFTER controls are potentially shown) ---
        console.log("Applying initial animations for category page...");
        setTimeout(() => {
             gsap.utils.toArray('.category-detail-layout [data-animate].gsap-initiated').forEach(el => el.classList.remove('gsap-initiated'));
             gsap.utils.toArray('.category-detail-layout [data-animate]:not(.gsap-initiated)').forEach(element => {
                 element.classList.add('gsap-initiated');
                 const delay = parseFloat(element.dataset.delay) || (element.classList.contains('category-controls') ? 0.1 : 0.2); // Delay controls slightly less
                 gsap.from(element, { opacity: 0, y: 20, duration: 0.6, ease: "power2.out", delay: delay, scrollTrigger: { trigger: element, start: "top 90%", toggleActions: "play none none none", once: true } });
             });
            // Note: Card animation is now handled within renderCategoryProducts
             console.log("Category page initial animations applied.");
        }, 100); // Slight delay

    } catch (error) {
        console.error(`Error loading category page data for slug ${categorySlug}:`, error);
        categoryPageTitle.textContent = "Lỗi tải danh mục";
        categoryProductGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--danger-color);">Không thể tải sản phẩm: ${error.message}</p>`;
    }
}

// --- NEW: Setup listeners specific to category page grid ---
function setupCategoryPageBuyListeners() {
    if (!document.body.classList.contains('category-detail-page')) return;
    const productGrid = document.getElementById('category-product-grid');
    if (!productGrid) return;
    console.log("Setting up buy listeners for category page grid...");
    productGrid.removeEventListener('click', handleBuyButtonClick); // Prevent duplicates if called multiple times
    productGrid.addEventListener('click', handleBuyButtonClick); // Use event delegation
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