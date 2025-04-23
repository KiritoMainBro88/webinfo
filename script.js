console.log("Script version 1.9.3 - Dynamic Shopping Page & Scope Fix"); // Increment version

// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }
function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return 'N/A'; // Return N/A for invalid prices
    }
    // Handle specific strings if needed
    if (typeof price === 'string') {
        // Example: if backend sends 'Contact' or 'Check Price'
        if (price.toLowerCase() === 'contact' || price.toLowerCase() === 'check_price') {
            return price; // Keep the string as is
        }
        // Attempt to parse if it might be a numeric string, otherwise return N/A
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return 'N/A';
        price = numPrice;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// --- Global Constants & Variables ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';

// --- Global DOM Element References ---
let userNameSpan, userStatusSpan, authActionLink, registerActionLink, forgotActionLink, logoutLink, adminDropdownSection;
let sidebarUserInfoDiv, sidebarLoginBtn, sidebarRegisterBtn, sidebarDepositBtn, sidebarLogoutBtn, sidebarUsernameSpan, sidebarBalanceSpan;
let dynamicProductArea; // For shopping page

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

    // Shopping Page Element
    dynamicProductArea = document.getElementById('dynamic-product-area');
}

// --- fetchData Utility Function ---
async function fetchData(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers, };
    const tempUserId = localStorage.getItem('userId');
    if (tempUserId) { headers['x-temp-userid'] = tempUserId; }
    const config = { method: options.method || 'GET', headers: headers, };
    if (options.body) { config.body = options.body; }
    try {
        const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config);
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            // Handle non-JSON responses if necessary, or assume error for now
            data = { message: await response.text() }; // Get text content as message
            if (!response.ok) {
                 console.error(`HTTP error! Status: ${response.status} for ${endpoint}. Response not JSON.`, data.message);
                 throw new Error(data.message || `Request failed with status ${response.status}`);
            }
            // If response is OK but not JSON, return the text content
            console.log(`Received non-JSON OK response from ${endpoint}`);
            return data;
        }

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status} for ${endpoint}`, data);
            throw new Error(data.message || response.statusText || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        throw error;
    }
}

// --- Global UI Update Functions ---
function updateUserStatus(isLoggedIn, username = 'Khách', isAdmin = false) {
    console.log(`Updating header status: loggedIn=${isLoggedIn}, username=${username}, isAdmin=${isAdmin}`);
    if (!userNameSpan || !adminDropdownSection || !logoutLink) { console.warn("Header user elements not ready for update status."); return; }
    const authLinks = [authActionLink, registerActionLink, forgotActionLink].filter(Boolean);
    if (isLoggedIn) {
       userNameSpan.textContent = username; authLinks.forEach(link => { if (link) link.style.display = 'none'; }); logoutLink.style.display = 'flex'; adminDropdownSection.style.display = isAdmin ? 'block' : 'none'; localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    } else {
       userNameSpan.textContent = 'Khách'; authLinks.forEach(link => { if (link) link.style.display = 'flex'; }); logoutLink.style.display = 'none'; adminDropdownSection.style.display = 'none'; localStorage.removeItem('isAdmin');
    }
}
function updateSidebarUserArea(isLoggedIn, username = 'Khách', balance = 0) {
    // console.log(`Updating sidebar: loggedIn=${isLoggedIn}, username=${username}, balance=${balance}`); // Optional debug
    if (!sidebarUserInfoDiv || !sidebarLoginBtn || !sidebarRegisterBtn || !sidebarDepositBtn || !sidebarLogoutBtn || !sidebarUsernameSpan || !sidebarBalanceSpan) { /* console.warn("Sidebar elements not ready for update."); */ return; }
    if (isLoggedIn) {
        sidebarUsernameSpan.textContent = username; sidebarBalanceSpan.textContent = formatPrice(balance); sidebarLoginBtn.style.display = 'none'; sidebarRegisterBtn.style.display = 'none'; sidebarDepositBtn.style.display = 'block'; sidebarLogoutBtn.style.display = 'block';
    } else {
        sidebarUsernameSpan.textContent = 'Khách'; sidebarBalanceSpan.textContent = '0đ'; sidebarLoginBtn.style.display = 'block'; sidebarRegisterBtn.style.display = 'block'; sidebarDepositBtn.style.display = 'none'; sidebarLogoutBtn.style.display = 'none';
    }
}

// --- Shopping Page Dynamic Loading ---
async function loadAndDisplayShoppingData() {
    if (!dynamicProductArea) {
        console.log("Not on shopping page or dynamic area not found.");
        return;
    }
    dynamicProductArea.innerHTML = '<p style="text-align: center; padding: 2rem;">Đang tải sản phẩm...</p>'; // Loading message

    try {
        // Fetch both categories and products in parallel
        const [categories, products] = await Promise.all([
            fetchData('/categories'),
            fetchData('/products')
        ]);

        console.log("Fetched Categories:", categories);
        console.log("Fetched Products:", products);

        dynamicProductArea.innerHTML = ''; // Clear loading message

        if (!categories || categories.length === 0) {
            dynamicProductArea.innerHTML = '<p style="text-align: center; padding: 2rem;">Không tìm thấy danh mục sản phẩm nào.</p>';
            return;
        }

        // Render categories and their products
        categories.forEach(category => {
            const categorySection = createCategorySectionElement(category);
            const productGrid = categorySection.querySelector('.product-grid');

            // Filter products for the current category
            const categoryProducts = products.filter(product => product.category && product.category._id === category._id);

            if (categoryProducts.length > 0) {
                categoryProducts.forEach(product => {
                    const productCard = createProductCardElement(product);
                    productGrid.appendChild(productCard);
                });
            } else {
                // Optional: Message if category has no products
                 productGrid.innerHTML = '<p style="font-size: 0.9em; color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Chưa có sản phẩm trong danh mục này.</p>';
            }

            dynamicProductArea.appendChild(categorySection);
        });

        // Re-apply GSAP animations to the newly added elements
        // Use a slight delay to ensure elements are fully in the DOM
        setTimeout(() => {
            setupProfessionalAnimations(); // This might need adjustment if called multiple times
            setupShoppingPageBuyListeners(); // Re-attach listeners for dynamic buttons
        }, 100);


    } catch (error) {
        console.error("Error loading shopping page data:", error);
        dynamicProductArea.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--danger-color);">Lỗi tải sản phẩm: ${error.message}. Vui lòng thử lại sau.</p>`;
    }
}

function createCategorySectionElement(category) {
    const section = document.createElement('section');
    section.classList.add('product-category-section');
    section.dataset.animate = "fade-up"; // Add animation attribute

    const title = document.createElement('h2');
    title.classList.add('category-title');
    title.innerHTML = `<i class="${category.iconClass || 'fas fa-tag'} icon-left"></i>${category.name}`;

    const grid = document.createElement('div');
    grid.classList.add('product-grid');
    // Note: Stagger animation will be applied by setupProfessionalAnimations later

    section.appendChild(title);
    section.appendChild(grid);
    return section;
}

function createProductCardElement(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    // Don't add data-animate here, the grid container handles it

    const originalPriceHTML = product.originalPrice && product.originalPrice > product.price
        ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>`
        : '';
    const salePriceHTML = `<span class="sale-price">${formatPrice(product.price)}</span>`; // Always show current price

    // Basic tag handling example (customize as needed)
    let tagHTML = '';
    if (product.tags && product.tags.includes('hot')) {
        tagHTML = '<span class="product-tag hot-tag">Hot</span>';
    } else if (product.tags && product.tags.includes('sale')) {
         tagHTML = '<span class="product-tag sale-tag">Sale</span>';
    } else if (product.originalPrice && product.originalPrice > product.price) {
        tagHTML = '<span class="product-tag sale-tag">Sale</span>'; // Default sale tag if price reduced
    }

     // Handle stock status for button text/state
     let buttonText = 'Mua ngay';
     let buttonDisabled = false;
     let priceDisplay = `${originalPriceHTML} ${salePriceHTML}`;

     switch (product.stockStatus) {
         case 'out_of_stock':
             buttonText = 'Hết hàng';
             buttonDisabled = true;
             break;
         case 'contact':
             buttonText = 'Liên hệ';
             priceDisplay = `<span class="sale-price">Liên hệ</span>`; // Show text instead of price
             // buttonDisabled = true; // Optional: Disable button or link elsewhere
             break;
         case 'check_price':
              buttonText = 'Xem bảng giá';
              priceDisplay = `<span class="sale-price">Giá tốt</span>`; // Show custom text
              // buttonDisabled = true; // Optional: Disable button or link elsewhere
              break;
         // default: 'in_stock' handled by initial values
     }


    card.innerHTML = `
        <div class="product-image-placeholder">
            <img src="${product.imageUrl || 'images/product-placeholder.png'}" alt="${product.name}" loading="lazy">
            ${tagHTML}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-meta">Đã bán: ${product.purchaseCount || 0}</p> <!-- Add purchase count if available -->
            <p class="product-price">
                ${priceDisplay}
            </p>
            <button class="cta-button product-buy-btn" data-product-id="${product._id}" ${buttonDisabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        </div>
    `;
    return card;
}

// Function to specifically set up buy button listeners on shopping page
function setupShoppingPageBuyListeners() {
    if (!document.body.classList.contains('shopping-page')) return;

    console.log("Setting up dynamic shopping page 'buy' listeners...");
    const productArea = document.getElementById('dynamic-product-area');
    if (!productArea) return;

    // Use event delegation on the container
    productArea.removeEventListener('click', handleBuyButtonClick); // Remove previous listener if any
    productArea.addEventListener('click', handleBuyButtonClick);
}

function handleBuyButtonClick(event) {
     if (!event.target.classList.contains('product-buy-btn')) return; // Only act on buy buttons

     event.preventDefault();
     const button = event.target;
     const productCard = button.closest('.product-card');
     const productTitle = productCard?.querySelector('.product-title')?.textContent || 'Sản phẩm';
     const productId = button.dataset.productId;

     console.log(`Buy button clicked for: ${productTitle} (ID: ${productId})`);

     if (button.disabled) {
         alert(`Sản phẩm "${productTitle}" hiện đang hết hàng hoặc cần liên hệ.`);
         return;
     }

     if (!localStorage.getItem('userId')) {
        alert('Vui lòng đăng nhập để mua hàng!');
        if (typeof showLoginForm === 'function') { showLoginForm(); }
        else { console.error("showLoginForm function not found"); }
     } else {
        // TODO: Implement actual purchase flow here (e.g., show purchase modal)
        // For now, keep the alert
        alert(`Chức năng mua "${productTitle}" (ID: ${productId}) coming soon!`);
        // Example: showPurchaseModal(productId, productTitle, productPrice);
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

    // Animate elements with data-animate attribute that haven't been initiated yet
    gsap.utils.toArray('[data-animate]:not(.gsap-initiated)').forEach(element => {
        element.classList.add('gsap-initiated'); // Mark as initiated
        const delay = parseFloat(element.dataset.delay) || 0;
        let staggerAmount = parseFloat(element.dataset.stagger); // Don't default stagger here
        const animType = element.dataset.animate;

        let animProps = {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            delay: delay,
            scrollTrigger: {
                trigger: element,
                start: "top 88%", // Adjust trigger point as needed
                toggleActions: "play none none none",
                once: true, // Only animate once
                // markers: true, // Uncomment for debugging trigger points
            }
        };

        // Set direction based on animType
        if (animType === 'fade-left') { animProps.x = -30; }
        else if (animType === 'fade-right') { animProps.x = 30; }
        else { animProps.y = 20; } // Default to fade-up

        let target = element;

        // Apply stagger to direct children if element is a designated container type
        // and stagger is explicitly set or if it's a product grid/category section
        const isStaggerContainer = element.classList.contains('skills-grid') ||
                                  element.classList.contains('interests-carousel') ||
                                  element.classList.contains('social-buttons-inline') ||
                                  element.classList.contains('product-grid') ||
                                  element.classList.contains('product-category-section'); // Add section

        if (isStaggerContainer && element.children.length > 0) {
             target = Array.from(element.children).filter(child => !child.matches('h2.category-title') && !child.matches('h2.page-title')); // Exclude titles

             if (target.length > 0) {
                 // Only apply stagger if explicitly requested OR if it's a grid/section with multiple items
                 if (!isNaN(staggerAmount) || (target.length > 1 && (element.classList.contains('product-grid') || element.classList.contains('product-category-section')))) {
                    staggerAmount = isNaN(staggerAmount) ? 0.05 : staggerAmount; // Default stagger if needed
                    animProps.scrollTrigger.stagger = staggerAmount;
                 }
             } else {
                 target = element; // Fallback if no suitable children
             }
        } else if (!isNaN(staggerAmount) && element.children.length > 0) {
             // Apply explicit stagger to children even if not a predefined container
             target = element.children;
             animProps.scrollTrigger.stagger = staggerAmount;
        }

        // Apply the animation
        gsap.from(target, animProps);
    });


    // Parallax for image cards (keep if desired)
    gsap.utils.toArray('.content-row .image-card').forEach(card => { gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 } }); });

    // Button scale effect listeners (keep)
    document.querySelectorAll('.cta-button, .header-nav-link, .mobile-nav-link, .social-button, .icon-button, .user-dropdown-content a, #donate-button-header, .dropdown-link, .category-button, .product-buy-btn, .footer-link-button, #back-to-top-btn, .modal-close-btn, .summary-card, .view-toggle button') .forEach(button => { button.removeEventListener('mousedown', handleButtonMouseDown); button.removeEventListener('mouseup', handleButtonMouseUp); button.removeEventListener('mouseleave', handleButtonMouseLeave); button.addEventListener('mousedown', handleButtonMouseDown); button.addEventListener('mouseup', handleButtonMouseUp); if (!button.matches('#donate-button-header') && !button.matches('.header-nav-link')) { button.addEventListener('mouseleave', handleButtonMouseLeave); } });
}
function handleButtonMouseDown(event) { gsap.to(event.currentTarget, { scale: 0.97, duration: 0.1 }); }
function handleButtonMouseUp(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }
function handleButtonMouseLeave(event) { gsap.to(event.currentTarget, { scale: 1, duration: 0.1 }); }

// --- Click-based Dropdowns ---
function setupClickDropdowns() { const wrappers = document.querySelectorAll('.nav-item-wrapper'); wrappers.forEach(wrapper => { const trigger = wrapper.querySelector('.nav-dropdown-trigger'); const menu = wrapper.querySelector('.dropdown-menu'); if (!trigger || !menu) return; trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); wrappers.forEach(otherWrapper => { if (otherWrapper !== wrapper) otherWrapper.classList.remove('open'); }); wrapper.classList.toggle('open'); }); }); document.addEventListener('click', (event) => { wrappers.forEach(wrapper => { if (!wrapper.contains(event.target) && wrapper.classList.contains('open')) wrapper.classList.remove('open'); }); }); document.addEventListener('keydown', (event) => { if (event.key === "Escape") wrappers.forEach(wrapper => wrapper.classList.remove('open')); }); }

// --- Authentication Logic Setup ---
function setupActionButtons() {
    const authContainer = document.getElementById('auth-container'); const loginForm = document.getElementById('login-form'); const registerForm = document.getElementById('register-form'); const forgotForm = document.getElementById('forgot-form'); const resetForm = document.getElementById('reset-form'); const loginFormWrapper = document.getElementById('login-form-wrapper'); const registerFormWrapper = document.getElementById('register-form-wrapper'); const forgotFormWrapper = document.getElementById('forgot-form-wrapper'); const resetFormWrapper = document.getElementById('reset-form-wrapper'); const loginMessage = document.getElementById('login-message'); const registerMessage = document.getElementById('register-message'); const forgotMessage = document.getElementById('forgot-message'); const resetMessage = document.getElementById('reset-message');
    function showMessage(element, message, isSuccess = false) { if (!element) return; element.textContent = message; element.className = 'auth-message ' + (isSuccess ? 'success' : 'error'); }
    function showForm(formToShow) { if (!authContainer) return; authContainer.style.display = 'flex'; authContainer.classList.add('visible'); [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => { if(form) form.style.display = form === formToShow ? 'block' : 'none'; }); [loginMessage, registerMessage, forgotMessage, resetMessage].forEach(msg => { if(msg) showMessage(msg, ''); }); }
    window.showLoginForm = () => showForm(loginFormWrapper); window.showRegisterForm = () => showForm(registerFormWrapper); window.showForgotForm = () => showForm(forgotFormWrapper); window.showResetForm = () => showForm(resetFormWrapper); window.closeAuthForms = () => { if(authContainer) { authContainer.classList.remove('visible'); setTimeout(() => { authContainer.style.display = 'none'; }, 300); } };
    if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); }); if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); }); if (forgotActionLink) forgotActionLink.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); });
    const closeAuthButtons = document.querySelectorAll('#auth-container .close-auth-btn'); closeAuthButtons.forEach(btn => btn.addEventListener('click', closeAuthForms));
    if (loginForm) { loginForm.addEventListener('submit', async (e) => { e.preventDefault(); showMessage(loginMessage, 'Đang đăng nhập...'); const username = e.target.username.value; const password = e.target.password.value; try { const data = await fetchData('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); showMessage(loginMessage, 'Đăng nhập thành công! Đang cập nhật thông tin...', true); localStorage.setItem('userId', data.userId); localStorage.setItem('username', data.username); await fetchAndUpdateUserInfo(); setTimeout(closeAuthForms, 1200); } catch (error) { console.error("Login failed:", error); showMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'); } }); }
    if (registerForm) { registerForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; if (password !== confirmPassword) { showMessage(registerMessage, 'Mật khẩu nhập lại không khớp.'); return; } showMessage(registerMessage, 'Đang đăng ký...'); const username = e.target.username.value; const email = e.target.email.value; try { await fetchData('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }); showMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 1500); } catch (error) { console.error("Registration failed:", error); showMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.'); } }); }
    if (forgotForm) { forgotForm.addEventListener('submit', async (e) => { e.preventDefault(); showMessage(forgotMessage, 'Đang xử lý yêu cầu...'); const email = e.target.email.value; try { const data = await fetchData('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); showMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true); } catch (error) { console.error("Forgot password failed:", error); showMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.'); } }); }
    if (resetForm) { resetForm.addEventListener('submit', async (e) => { e.preventDefault(); const password = e.target.password.value; const confirmPassword = e.target.confirmPassword.value; const token = e.target.token.value; if (password !== confirmPassword) { showMessage(resetMessage, 'Mật khẩu mới không khớp.'); return; } if (!token) { showMessage(resetMessage, 'Thiếu mã token đặt lại.'); return; } showMessage(resetMessage, 'Đang đặt lại mật khẩu...'); try { await fetchData('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }); showMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true); setTimeout(() => { showLoginForm(); }, 2000); } catch (error) { console.error("Reset password failed:", error); showMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.'); } }); }
    if (logoutLink) { logoutLink.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('userId'); localStorage.removeItem('username'); localStorage.removeItem('isAdmin'); localStorage.removeItem('balance'); updateUserStatus(false); updateSidebarUserArea(false); console.log("User logged out."); }); }
    const checkLoginAndToken = () => { const userId = localStorage.getItem('userId'); if (userId) { fetchAndUpdateUserInfo(); } else { updateUserStatus(false); updateSidebarUserArea(false); } const urlParams = new URLSearchParams(window.location.search); const resetToken = urlParams.get('token'); if (resetToken) { showResetForm(); const tokenInput = document.getElementById('reset-token'); if (tokenInput) tokenInput.value = resetToken; window.history.replaceState({}, document.title, window.location.pathname); } };
    checkLoginAndToken();
}

// --- Fetch and Update User Info ---
async function fetchAndUpdateUserInfo() {
    const userId = localStorage.getItem('userId');
    if (!userId) { /* console.log("No userId found..."); */ updateUserStatus(false); updateSidebarUserArea(false); return; }
    // console.log("Fetching user info for userId:", userId); // Optional debug
    try {
        const userData = await fetchData('/users/me');
        // console.log("User data received:", userData); // Optional debug
        if (!userData || !userData.username) { throw new Error("Received invalid user data"); }
        localStorage.setItem('username', userData.username); localStorage.setItem('balance', userData.balance ?? 0); localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false');
        updateUserStatus(true, userData.username, !!userData.isAdmin); updateSidebarUserArea(true, userData.username, userData.balance ?? 0);
    } catch (error) { console.error("Error fetching or processing user info:", error); localStorage.removeItem('userId'); localStorage.removeItem('username'); localStorage.removeItem('balance'); localStorage.removeItem('isAdmin'); updateUserStatus(false); updateSidebarUserArea(false); }
}

// --- Basic Dropdown Actions ---
function setupDropdownActions() { const depositLink = document.getElementById('deposit-link'); const historyLink = document.getElementById('history-link'); const depositLinkMobile = document.getElementById('deposit-link-mobile'); const historyLinkMobile = document.getElementById('history-link-mobile'); const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); }; const handleHistoryClick = (e) => { e.preventDefault(); window.location.href = 'history.html'; }; if(depositLink) depositLink.addEventListener('click', handleDepositClick); if(historyLink) historyLink.addEventListener('click', handleHistoryClick); if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick); if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick); }

// --- Back to Top Button ---
function setupBackToTopButton() { const backToTopButton = document.getElementById("back-to-top-btn"); if (!backToTopButton) { return; } const scrollThreshold = 200; const checkScroll = () => { if (!backToTopButton) return; if (window.scrollY > scrollThreshold) { backToTopButton.classList.add("visible"); } else { backToTopButton.classList.remove("visible"); } }; window.addEventListener("scroll", checkScroll, { passive: true }); checkScroll(); backToTopButton.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }); }

// --- Modal Handling ---
function showModal(modalId) { const modal = document.getElementById(modalId); if (modal && modalId === 'auth-container') { modal.style.display = 'flex'; setTimeout(() => { modal.classList.add('visible'); }, 10); } else if (modal) { console.warn("ShowModal called for non-auth modal:", modalId); } else { console.error(`Modal with ID ${modalId} not found.`); } }
function hideModal(modalId) { const modal = document.getElementById(modalId); if (modal && modalId === 'auth-container') { modal.classList.remove('visible'); setTimeout(() => { modal.style.display = 'none'; }, 300); } else if (modal) { console.warn("HideModal called for non-auth modal:", modalId); } else { console.error(`Modal with ID ${modalId} not found.`); } }

// ----- Initialization Function -----
function initializePage() {
    console.log(`Initializing page (v1.9.3)...`);
    initializeDOMElements(); // Grab DOM elements first
    updateYear();
    setupHeaderScrollEffect();
    setupMobileMenuToggle();
    setupUserDropdown();
    setupThemeToggle();
    setupLanguageToggle();
    setupProfessionalAnimations(); // Initial animations for static content
    setupActionButtons(); // Sets up auth forms/buttons AND checks initial login state
    setupDropdownActions();
    setupClickDropdowns();
    setupBackToTopButton();

    // --- Page Specific Initialization ---
    if (document.body.classList.contains('shopping-page')) {
        console.log("Shopping page detected. Loading dynamic data...");
        loadAndDisplayShoppingData(); // Load dynamic products/categories
    } else if (document.body.classList.contains('history-page')) {
        console.log("History page detected.");
        // Add history page specific logic here if needed in the future
    } else {
         // Logic for index page or other pages if necessary
    }

    const donateButtonHeader = document.getElementById('donate-button-header');
    if (donateButtonHeader) { donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); }); }
    else { console.warn("Header donate button not found"); }

    const ageSpan = document.getElementById('age');
    if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }

    console.log("Page initialization complete.");
}

// --- Run Initialization on DOM Ready ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage(); // Already loaded
}