// --- GSAP and Helpers ---
gsap.registerPlugin(ScrollTrigger);
function calculateAge(birthDateString) { const birthDate = new Date(birthDateString); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
function updateYear() { const yearSpan = document.getElementById('year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } }

// --- Header Scroll Effect ---
function setupHeaderScrollEffect() {
    const header = document.querySelector('.content-header');
    if (!header) return;
    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
    if (!supportsBackdropFilter) { console.log("Backdrop-filter not supported."); }
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
function setupThemeToggle() { /* ... (Keep existing code) ... */ }

// --- Language Toggle (Placeholder) ---
function setupLanguageToggle() { /* ... (Keep existing code) ... */ }

// --- GSAP Animations (Using window scroller) ---
function setupProfessionalAnimations() { /* ... (Keep existing code) ... */ }

// --- Admin Panel Logic ---
function setupAdminPanel() { /* ... (Keep existing code) ... */ }

// --- Authentication Logic ---
const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';
// ... keep auth variables and functions ...
function setupActionButtons() { /* ... (Keep existing auth setup logic) ... */ }

// --- Setup Dropdown Link Actions ---
function setupDropdownActions() {
    // const shoppingLink = document.getElementById('shopping-link'); // Not needed if href is set
    const depositLink = document.getElementById('deposit-link');
    const historyLink = document.getElementById('history-link');
    // const shoppingLinkMobile = document.getElementById('shopping-link-mobile'); // Not needed
    const depositLinkMobile = document.getElementById('deposit-link-mobile');
    const historyLinkMobile = document.getElementById('history-link-mobile');

    // Shopping link now uses href="shopping.html", no JS needed unless for SPA routing

    // Placeholder Links
    const handleDepositClick = (e) => { e.preventDefault(); alert('Nạp tiền function coming soon!'); };
    const handleHistoryClick = (e) => { e.preventDefault(); alert('Lịch sử mua hàng function coming soon!'); };

    if(depositLink) depositLink.addEventListener('click', handleDepositClick);
    if(historyLink) historyLink.addEventListener('click', handleHistoryClick);
    if(depositLinkMobile) depositLinkMobile.addEventListener('click', handleDepositClick);
    if(historyLinkMobile) historyLinkMobile.addEventListener('click', handleHistoryClick);
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
    setupDropdownActions(); // Setup dropdown links

    // Header Donate Button Listener
    const donateButtonHeader = document.getElementById('donate-button-header');
    if (donateButtonHeader) { /* ... keep listener ... */ }
    else { console.warn("Header donate button (#donate-button-header) not found"); }

    const ageSpan = document.getElementById('age');
    if (ageSpan) { /* ... calculate age ... */ }
    else { console.warn("Age span element not found."); }
    console.log("Page initialization complete.");
}

document.addEventListener('DOMContentLoaded', initializePage);