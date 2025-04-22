// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Header Scroll Effect ---
function setupHeaderScrollEffect() {
    const header = document.querySelector('.content-header');
    if (!header) return;
    const scrollThreshold = 10; // Pixels scrolled to trigger effect
    const checkScroll = () => {
        // Only apply effect if header is fixed (desktop)
        if (window.getComputedStyle(header).position === 'fixed') {
             header.classList.toggle('header-scrolled', window.scrollY > scrollThreshold);
        } else {
            // Ensure class is removed if header becomes static (mobile)
            header.classList.remove('header-scrolled');
        }
    };
    // Check immediately on load
    checkScroll();
    // Check on scroll and resize
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
}

// --- Mobile Menu Toggle ---
function setupMobileMenuToggle() {
    const toggleButton = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (!toggleButton || !mobileNav) { console.warn("Mobile menu elements not found."); return; }
    toggleButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from bubbling up
        const isVisible = mobileNav.classList.toggle('visible');
        toggleButton.setAttribute('aria-expanded', isVisible);
    });
    // Close menu when a link inside is clicked
    mobileNav.addEventListener('click', (event) => {
        if (event.target.closest('.mobile-nav-link')) {
            mobileNav.classList.remove('visible');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!mobileNav.contains(event.target) && !toggleButton.contains(event.target) && mobileNav.classList.contains('visible')) {
            mobileNav.classList.remove('visible');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });
    // Close menu with Escape key
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
    const userArea = document.querySelector('.user-area'); // The container div

    if (!trigger || !dropdown || !userArea) { console.warn("User dropdown elements not found."); return; }

    trigger.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent body click listener from firing immediately
        dropdown.classList.toggle('visible');
        userArea.classList.toggle('open'); // Toggle class on the container
    });

    // Close when clicking outside
    document.addEventListener('click', (event) => {
        if (!userArea.contains(event.target) && dropdown.classList.contains('visible')) {
            dropdown.classList.remove('visible');
            userArea.classList.remove('open');
        }
    });

    // Close when clicking a link inside the dropdown
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
    if (!themeButton) { console.warn("Theme toggle button not found."); return; } // Added check for button itself
    const themeIcon = themeButton.querySelector('i');
    if (!themeIcon) { console.warn("Theme toggle icon not found."); return; }

    // Function to apply theme based on preference
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else { // Default to dark
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    };

    // Get stored theme or system preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

    // Apply the initial theme
    applyTheme(initialTheme);

    // Add click listener
    themeButton.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        console.log("Theme toggled to:", newTheme);
    });
}

// --- Language Toggle (Placeholder) ---
function setupLanguageToggle() {
     const langButton = document.getElementById('language-toggle');
     if(langButton) { langButton.addEventListener('click', () => { alert('Language switching coming soon!'); }); }
}

// --- GSAP Animations (Using window scroller) ---
function setupProfessionalAnimations() {
    const defaultOnLoadAnimation = { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" };

    // Hero animations (only run if elements exist)
    const heroTitle = document.querySelector(".hero-title[data-animate='reveal-text']");
    const heroSubtitle = document.querySelector(".hero-subtitle[data-animate='fade-up']");
    const heroCta = document.querySelector(".hero-cta[data-animate='fade-up']");

    if (heroTitle) { gsap.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: "expo.out", delay: 0.3 }); }
    if (heroSubtitle) { gsap.from(heroSubtitle, { ...defaultOnLoadAnimation, delay: parseFloat(heroSubtitle.dataset.delay) || 0.5 }); }
    if (heroCta) { gsap.from(heroCta, { ...defaultOnLoadAnimation, delay: parseFloat(heroCta.dataset.delay) || 0.7 }); }

    // Scroll-triggered animations for other elements
    gsap.utils.toArray(document.querySelectorAll('[data-animate]:not(.hero-title):not(.hero-subtitle):not(.hero-cta)')).forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0;
        let staggerAmount = parseFloat(element.dataset.stagger) || 0;
        const animType = element.dataset.animate;

        // Base animation properties
        let animProps = {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            delay: delay,
            // clearProps: "opacity,transform" // Be careful with clearProps if other transforms exist
        };

        // Add direction-specific transform
        if (animType === 'fade-left') { animProps.x = -30; }
        else if (animType === 'fade-right') { animProps.x = 30; }
        else { animProps.y = 20; } // Default to fade-up

        let target = element;
        // Check if the element is a container needing staggered children animation
        if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline') || element.classList.contains('product-grid')) {
             if (element.children.length > 0) {
                target = element.children;
                if (staggerAmount === 0) staggerAmount = 0.05; // Default stagger for child elements
                if (staggerAmount > 0) animProps.stagger = staggerAmount;
            }
        }

        // Remove stagger if target is the element itself
        if (target === element && animProps.stagger) delete animProps.stagger;

        // Apply the animation with ScrollTrigger
        gsap.from(target, {
            ...animProps,
            scrollTrigger: {
                trigger: element,
                start: "top 88%", // When element top hits 88% from top of viewport
                toggleActions: "play none none none", // Play once when entering
                once: true, // Ensure it runs only once
                // markers: true, // Uncomment for debugging scroll trigger positions
            }
        });
    });

    // Parallax effect for images in content rows
    gsap.utils.toArray(document.querySelectorAll('.content-row .image-card')).forEach(card => {
        gsap.to(card, {
            yPercent: -5, // Move up slightly
            ease: "none",
            scrollTrigger: {
                trigger: card.closest('.content-row'), // Trigger based on the row container
                start: "top bottom", // Start when row top enters viewport bottom
                end: "bottom top", // End when row bottom leaves viewport top
                scrub: 1.9 // Smooth scrubbing effect
            }
        });
    });

    // Microinteractions for buttons/links
     document.querySelectorAll('.cta-button, .header-nav-link, .mobile-nav-link, .social-button, .icon-button, .user-dropdown-content a, .auth-link, #donate-button-header, .dropdown-link, .category-button, .product-buy-btn')
        .forEach(button => {
            button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.97, duration: 0.1 }));
            button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 }));
            // Prevent sticky hover scale state except for specific elements
            if (!button.matches('#donate-button-header') && !button.matches('.header-nav-link')) {
                 button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 }));
            }
    });
}


// --- Function to handle click-based dropdowns ---
function setupClickDropdowns() {
    const wrappers = document.querySelectorAll('.nav-item-wrapper'); // Find all wrappers

    wrappers.forEach(wrapper => {
        const trigger = wrapper.querySelector('.nav-dropdown-trigger');
        const menu = wrapper.querySelector('.dropdown-menu');

        if (!trigger || !menu) return; // Skip if elements aren't found

        trigger.addEventListener('click', (event) => {
            event.preventDefault(); // Stop '#' link navigation
            event.stopPropagation(); // Prevent click from closing menu immediately

            // Close other open dropdowns first (important if you have multiple)
            wrappers.forEach(otherWrapper => {
                if (otherWrapper !== wrapper) {
                    otherWrapper.classList.remove('open');
                }
            });

            // Toggle the current dropdown
            wrapper.classList.toggle('open');
        });
    });

    // Close dropdown if clicking outside any wrapper
    document.addEventListener('click', (event) => {
        wrappers.forEach(wrapper => {
            if (!wrapper.contains(event.target) && wrapper.classList.contains('open')) {
                wrapper.classList.remove('open');
            }
        });
    });

     // Optional: Close dropdown with Escape key
    document.addEventListener('keydown', (event) => {
         if (event.key === "Escape") {
             wrappers.forEach(wrapper => {
                 if (wrapper.classList.contains('open')) {
                     wrapper.classList.remove('open');
                 }
             });
         }
     });
}


// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing code or implement if needed) ... */ }

// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // Make sure this is correct
// ... keep existing auth variables (loginForm, registerForm, etc.) ...

// --- Example: Update Sidebar on Login/Logout ---
// Make sure updateSidebarUserArea function exists (defined in shopping.html inline script or here)
function updateSidebarUserArea(isLoggedIn, username = 'Khách') {
    // Check if we are on the shopping page where the sidebar exists
    const sidebarUserInfoDiv = document.getElementById('sidebar-user-info');
    if (!sidebarUserInfoDiv) return; // Exit if sidebar isn't on the current page

    const loginBtn = document.getElementById('sidebar-login-btn');
    const registerBtn = document.getElementById('sidebar-register-btn');
    const depositBtn = document.getElementById('sidebar-deposit-btn');
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    const usernameSpan = document.getElementById('sidebar-username');
    const balanceSpan = document.getElementById('sidebar-balance'); // Add logic to fetch/show balance later

    if (!loginBtn || !registerBtn || !depositBtn || !logoutBtn || !usernameSpan || !balanceSpan) {
        console.warn("Sidebar elements missing for update.");
        return;
    }

    if (isLoggedIn) {
        usernameSpan.textContent = username;
        // TODO: Fetch and display actual balance
        balanceSpan.textContent = 'N/A'; // Placeholder
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        depositBtn.style.display = 'block'; // Use block for full width buttons
        logoutBtn.style.display = 'block';
    } else {
        usernameSpan.textContent = 'Khách';
        balanceSpan.textContent = '0đ';
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        depositBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
 }


// --- Setup Action Buttons (Login, Register, Forgot, Reset, Logout) ---
function setupActionButtons() {
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

    const authActionLink = document.getElementById('auth-action-link'); // Trigger from user dropdown
    const registerActionLink = document.getElementById('register-action-link');
    const forgotActionLink = document.getElementById('forgot-action-link');
    const logoutLink = document.getElementById('logout-link');

    const userNameSpan = document.getElementById('user-name');
    const userStatusSpan = document.getElementById('user-status'); // Span containing name and chevron

    // Function to display messages
    function showMessage(element, message, isSuccess = false) {
        if (!element) return;
        element.textContent = message;
        element.className = 'auth-message ' + (isSuccess ? 'success' : 'error'); // Use classes for styling
    }

    // Function to show specific form
    function showForm(formToShow) {
        authContainer.style.display = 'flex';
        [loginFormWrapper, registerFormWrapper, forgotFormWrapper, resetFormWrapper].forEach(form => {
            form.style.display = form === formToShow ? 'block' : 'none';
        });
         // Clear messages when switching forms
        [loginMessage, registerMessage, forgotMessage, resetMessage].forEach(msg => showMessage(msg, ''));
    }

    // Global functions for onclick attributes (or attach listeners)
    window.showLoginForm = () => showForm(loginFormWrapper);
    window.showRegisterForm = () => showForm(registerFormWrapper);
    window.showForgotForm = () => showForm(forgotFormWrapper);
    window.showResetForm = () => showForm(resetFormWrapper); // Called potentially after email link click
    window.closeAuthForms = () => authContainer.style.display = 'none';

    // Attach listeners to triggers
    if (authActionLink) authActionLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    if (registerActionLink) registerActionLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    if (forgotActionLink) forgotActionLink.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); });


    // --- Form Submissions ---

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(loginMessage, 'Đang đăng nhập...');
            const username = e.target.username.value;
            const password = e.target.password.value;
            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);

                showMessage(loginMessage, 'Đăng nhập thành công!', true);
                localStorage.setItem('userId', data.userId); // Store user ID
                localStorage.setItem('username', data.username); // Store username
                updateUserStatus(true, data.username); // Update UI
                updateSidebarUserArea(true, data.username); // <<< UPDATE SIDEBAR
                setTimeout(closeAuthForms, 1000); // Close modal after delay
            } catch (error) {
                console.error("Login failed:", error);
                showMessage(loginMessage, error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        });
    }

    // Register
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
                const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }) // Send email
                });
                const data = await response.json();
                 if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);

                showMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', true);
                setTimeout(() => { showLoginForm(); }, 1500); // Switch to login after delay
            } catch (error) {
                console.error("Registration failed:", error);
                showMessage(registerMessage, error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        });
    }

     // Forgot Password
     if (forgotForm) {
         forgotForm.addEventListener('submit', async (e) => {
             e.preventDefault();
             showMessage(forgotMessage, 'Đang xử lý yêu cầu...');
             const email = e.target.email.value;
             try {
                 const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ email })
                 });
                 const data = await response.json(); // Expecting a standard message
                 if (!response.ok && response.status !== 200) { // Allow 200 status even if user not found
                    throw new Error(data.message || `Error: ${response.status}`);
                 }
                 // Show the generic success message regardless of whether the email exists
                 showMessage(forgotMessage, data.message || 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.', true);
             } catch (error) {
                 console.error("Forgot password failed:", error);
                 // Show generic message on error too, to avoid confirming email existence
                 showMessage(forgotMessage, 'Đã xảy ra lỗi. Vui lòng thử lại.');
             }
         });
     }

     // Reset Password
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
                 const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ token, password })
                 });
                 const data = await response.json();
                 if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);

                 showMessage(resetMessage, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true);
                 setTimeout(() => { showLoginForm(); }, 2000); // Switch to login
             } catch (error) {
                 console.error("Reset password failed:", error);
                 showMessage(resetMessage, error.message || 'Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn.');
             }
         });
     }

    // Logout
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            updateUserStatus(false); // Update UI
            updateSidebarUserArea(false); // <<< UPDATE SIDEBAR
            console.log("User logged out.");
             // Optionally redirect or just update UI
        });
    }

    // --- Helper to Update Header UI ---
    function updateUserStatus(isLoggedIn, username = 'Khách') {
        if (!userNameSpan || !userStatusSpan || !authActionLink || !registerActionLink || !forgotActionLink || !logoutLink) {
            console.warn("Header user area elements not found for UI update.");
            return;
        }
        if (isLoggedIn) {
            userNameSpan.textContent = username;
            authActionLink.style.display = 'none';
            registerActionLink.style.display = 'none';
            forgotActionLink.style.display = 'none';
            logoutLink.style.display = 'flex'; // Use flex as it's an anchor with icon
        } else {
            userNameSpan.textContent = 'Khách';
            authActionLink.style.display = 'flex';
            registerActionLink.style.display = 'flex';
            forgotActionLink.style.display = 'flex';
            logoutLink.style.display = 'none';
        }
    }

     // --- Check Login Status on Load and Handle Reset Token---
     const checkLoginAndToken = () => {
         const userId = localStorage.getItem('userId');
         const username = localStorage.getItem('username');
         if (userId && username) {
             console.log("User logged in:", username);
             updateUserStatus(true, username);
             updateSidebarUserArea(true, username); // <<< UPDATE SIDEBAR
         } else {
             updateUserStatus(false);
             updateSidebarUserArea(false); // <<< UPDATE SIDEBAR
         }

         // Check for reset token in URL
         const urlParams = new URLSearchParams(window.location.search);
         const resetToken = urlParams.get('token');
         if (resetToken) {
             console.log("Password reset token found in URL.");
             showResetForm(); // Show the reset form
             const tokenInput = document.getElementById('reset-token');
             if (tokenInput) {
                 tokenInput.value = resetToken; // Pre-fill token input
             }
             // Clean the token from the URL visually
             window.history.replaceState({}, document.title, window.location.pathname);
         }
     };

     checkLoginAndToken(); // Call on initial load
}


// --- Setup Dropdown Link Actions (Deposit, History - Placeholders) ---
function setupDropdownActions() {
    // Shopping links now use href="shopping.html" directly in HTML

    const depositLink = document.getElementById('deposit-link');
    const historyLink = document.getElementById('history-link');
    const depositLinkMobile = document.getElementById('deposit-link-mobile');
    const historyLinkMobile = document.getElementById('history-link-mobile');

    const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); };
    const handleHistoryClick = (e) => { e.preventDefault(); alert('Lịch sử mua hàng function coming soon!'); };

    if(depositLink) depositLink.addEventListener('click', handleDepositClick);
    if(historyLink) historyLink.addEventListener('click', handleHistoryClick);
    if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick);
    if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick);

    // Add listeners for elements specific to shopping.html (category buttons removed, product buttons kept)
    if (document.querySelector('.shopping-layout')) { // Check if on shopping page layout
        console.log("Setting up shopping page specific listeners...");
        // Category buttons were removed, so commenting out/removing this block:
        /*
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                alert(`Category filter for "${e.currentTarget.textContent}" coming soon!`);
            });
        });
        */
         document.querySelectorAll('.product-buy-btn').forEach(button => {
             button.addEventListener('click', (e) => {
                 e.preventDefault();
                 const productTitle = e.target.closest('.product-card')?.querySelector('.product-title')?.textContent || 'Sản phẩm';
                 // Check login status before allowing purchase?
                 if (!localStorage.getItem('userId')) {
                    alert('Vui lòng đăng nhập để mua hàng!');
                    showLoginForm(); // Show login modal
                 } else {
                    alert(`Chức năng mua "${productTitle}" coming soon!`);
                 }
             });
         });
    }
}

// ----- Initialization -----
function initializePage() {
    console.log("Initializing page...");
    updateYear();
    setupHeaderScrollEffect();
    setupMobileMenuToggle();
    setupUserDropdown();
    setupThemeToggle();
    setupLanguageToggle();
    setupProfessionalAnimations();
    setupAdminPanel(); // Keep for potential future use
    setupActionButtons(); // Handles login/register/logout/token check
    setupDropdownActions(); // Handles deposit/history placeholders + product buttons
    setupClickDropdowns(); // Handles the new click-based 'Dịch vụ' dropdown

    // Donate Button Listener
    const donateButtonHeader = document.getElementById('donate-button-header');
    if (donateButtonHeader) {
        donateButtonHeader.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Donate function coming soon!');
        });
    } else {
        console.warn("Header donate button (#donate-button-header) not found");
    }

    // Age calculation (only on index.html presumably)
    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        try {
            ageSpan.textContent = calculateAge('2006-08-08');
        } catch (e) {
            console.error("Error calculating age:", e);
            ageSpan.textContent = "??";
        }
    }
    // else { console.log("Age span element not found (may be expected)."); } // Less alarming log

    console.log("Page initialization complete.");
}

// --- Run Initialization ---
// Use DOMContentLoaded to ensure HTML is parsed
document.addEventListener('DOMContentLoaded', initializePage);