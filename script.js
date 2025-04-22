// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Header Scroll Effect ---
function setupHeaderScrollEffect() {
    const header = document.querySelector('.content-header');
    if (!header) return;
    const scrollThreshold = 10;
    const checkScroll = () => {
        if (window.getComputedStyle(header).position === 'fixed') {
             header.classList.toggle('header-scrolled', window.scrollY > scrollThreshold);
        } else { header.classList.remove('header-scrolled'); }
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
    toggleButton.addEventListener('click', (event) => { event.stopPropagation(); const isVisible = mobileNav.classList.toggle('visible'); toggleButton.setAttribute('aria-expanded', isVisible); });
    mobileNav.addEventListener('click', (event) => { if (event.target.closest('.mobile-nav-link')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('click', (event) => { if (!mobileNav.contains(event.target) && !toggleButton.contains(event.target) && mobileNav.classList.contains('visible')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && mobileNav.classList.contains('visible')) { mobileNav.classList.remove('visible'); toggleButton.setAttribute('aria-expanded', 'false'); } });
}

// --- User Dropdown Toggle ---
function setupUserDropdown() {
    const trigger = document.getElementById('user-area-trigger');
    const dropdown = document.getElementById('user-dropdown');
    const userArea = document.querySelector('.user-area');
    if (!trigger || !dropdown || !userArea) { console.warn("User dropdown elements not found."); return; }
    trigger.addEventListener('click', (event) => { event.stopPropagation(); dropdown.classList.toggle('visible'); userArea.classList.toggle('open'); });
    document.addEventListener('click', (event) => { if (!userArea.contains(event.target) && dropdown.classList.contains('visible')) { dropdown.classList.remove('visible'); userArea.classList.remove('open'); } });
    dropdown.addEventListener('click', (event) => { if (event.target.closest('a')) { dropdown.classList.remove('visible'); userArea.classList.remove('open'); } });
}

// --- Theme Toggle ---
function setupThemeToggle() {
    const themeButton = document.getElementById('theme-toggle');
    const themeIcon = themeButton?.querySelector('i');
    if (!themeButton || !themeIcon) return; // Add check
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    themeButton.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        }
        console.log("Theme toggled");
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
        let animProps = { opacity: 0, duration: 0.6, ease: "power2.out", delay: delay, clearProps: "opacity,transform" };
        if (animType === 'fade-left') { animProps.x = -30; } else if (animType === 'fade-right') { animProps.x = 30; } else { animProps.y = 20; }
        let target = element;
        if (element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') || element.classList.contains('social-buttons-inline') || element.classList.contains('product-grid')) { // Added product-grid
             if (element.children.length > 0) {
                target = element.children;
                if (staggerAmount === 0 && target !== element) staggerAmount = 0.05; // Adjusted stagger
                if (staggerAmount > 0) animProps.stagger = staggerAmount;
            }
        }
        if (target === element && animProps.stagger) delete animProps.stagger;
        gsap.from(target, { ...animProps, scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none none", once: true } });
    });
    gsap.utils.toArray(document.querySelectorAll('.content-row .image-card')).forEach(card => {
        gsap.to(card, { yPercent: -5, ease: "none", scrollTrigger: { trigger: card.closest('.content-row'), start: "top bottom", end: "bottom top", scrub: 1.9 } });
    });
    // Microinteractions
     document.querySelectorAll('.cta-button, .header-nav-link, .mobile-nav-link, .social-button, .icon-button, .user-dropdown-content a, .auth-link, #donate-button-header, .dropdown-link, .category-button, .product-buy-btn')
        .forEach(button => {
            button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.97, duration: 0.1 }));
            button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 }));
            if (!button.matches('#donate-button-header') && !button.matches('.header-nav-link')) {
                 button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 }));
            }
    });
}

// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing code) ... */ }

// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';
// ... keep auth variables and functions ...
function setupActionButtons() { /* ... (Keep existing auth setup logic) ... */ }

// --- Setup Dropdown Link Actions ---
function setupDropdownActions() {
    // Shopping links now use href="shopping.html"
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
    // Add listeners for elements specific to shopping.html
    if (document.querySelector('.product-grid-section')) {
        console.log("Setting up shopping page specific listeners...");
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                alert(`Category filter for "${e.currentTarget.textContent}" coming soon!`);
            });
        });
         document.querySelectorAll('.product-buy-btn').forEach(button => {
             button.addEventListener('click', (e) => {
                 e.preventDefault();
                 const productTitle = e.target.closest('.product-card')?.querySelector('.product-title')?.textContent || 'Sản phẩm';
                 alert(`Chức năng mua "${productTitle}" coming soon!`);
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
    setupAdminPanel();
    setupActionButtons();
    setupDropdownActions();
    const donateButtonHeader = document.getElementById('donate-button-header');
    if (donateButtonHeader) { donateButtonHeader.addEventListener('click', (e) => { e.preventDefault(); alert('Donate function coming soon!'); }); }
    else { console.warn("Header donate button (#donate-button-header) not found"); }
    const ageSpan = document.getElementById('age');
    if (ageSpan) { try { ageSpan.textContent = calculateAge('2006-08-08'); } catch (e) { console.error("Error calculating age:", e); ageSpan.textContent = "??"; } }
    else { /* console.warn("Age span element not found."); */ } // Hide warning if age isn't on shopping page
    console.log("Page initialization complete.");
}

document.addEventListener('DOMContentLoaded', initializePage);