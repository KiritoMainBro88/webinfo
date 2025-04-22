// Đăng ký plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// Hàm tiện ích (giữ nguyên)
function calculateAge(birthDateString) { /*...*/ }
function updateYear() { /*...*/ }

// --- Header Scroll Effect ---
function setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    ScrollTrigger.create({
        start: "top top", end: 99999,
        onUpdate: (self) => {
            const threshold = 20; // Trigger sớm hơn
            if (self.scroll() > threshold) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });
    if (window.scrollY > 20) header.classList.add('scrolled');
}

// --- GSAP Animations (Phong cách GitHub/Netflix) ---
function setupProfessionalAnimations() {

    // Default animation settings
    const defaultAnimation = {
        opacity: 0,
        y: 20, // Khoảng cách trượt lên ít hơn
        duration: 0.6, // Nhanh hơn chút
        ease: "power2.out", // Ease nhẹ nhàng hơn
        stagger: 0.08 // Stagger nhanh hơn
    };

    // 1. Hero Text Reveal Animation
    // Dùng data-animate="reveal-text" làm trigger
    const heroTitle = document.querySelector("[data-animate='reveal-text']");
    if(heroTitle){
        gsap.from(heroTitle, {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "expo.out",
            delay: 0.3
        });
        // Optional: Hiệu ứng mask reveal phức tạp hơn (nếu muốn)
    }


    // 2. General Fade Up/In Animations using data-animate
    gsap.utils.toArray('[data-animate]').forEach(element => {
        const delay = parseFloat(element.dataset.delay) || 0;
        const staggerAmount = parseFloat(element.dataset.stagger) || defaultAnimation.stagger;
        const animType = element.dataset.animate;

        let animProps = { ...defaultAnimation, delay: delay, stagger: staggerAmount };

        // Customize based on type
        if (animType === 'fade-left') { animProps.x = -30; delete animProps.y; }
        if (animType === 'fade-right') { animProps.x = 30; delete animProps.y; }
        if (animType === 'reveal-text') return; // Đã xử lý riêng

        gsap.from(element.tagName === 'UL' || element.classList.contains('skills-grid') || element.classList.contains('interests-carousel') ? element.children : element, { // Target children nếu là list/grid
            ...animProps,
            scrollTrigger: {
                trigger: element,
                start: "top 88%", // Trigger sớm hơn
                toggleActions: "play none none none",
                once: true
            }
        });
    });

    // 3. Parallax for Images (Subtle)
     gsap.utils.toArray('.content-row .image-card').forEach(card => {
         gsap.to(card, {
             yPercent: -5, // Parallax rất nhẹ
             ease: "none",
             scrollTrigger: {
                 trigger: card.closest('.content-row'),
                 start: "top bottom", end: "bottom top",
                 scrub: 1.9, // Mượt
             }
         });
     });

     // 4. Animate Section Title Underline (if we bring it back)
     // Hiện tại đang dùng ::after tĩnh, có thể làm động nếu muốn

     // 5. Button Hover Microinteraction (CSS handles most, JS for more complex)
     // Có thể thêm hiệu ứng nhỏ khi click button bằng GSAP nếu cần
     document.querySelectorAll('.cta-button, .nav-button').forEach(button => {
         button.addEventListener('mousedown', () => gsap.to(button, { scale: 0.95, duration: 0.1 }));
         button.addEventListener('mouseup', () => gsap.to(button, { scale: 1, duration: 0.1 }));
         button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.1 })); // Reset nếu kéo chuột ra ngoài
     });

}


// Admin Panel & Action Buttons Logic (Giữ nguyên)
function setupAdminPanel() { /*...*/ }
function setupActionButtons() {
     // Đổi sang dùng link style
     const donateLink = document.querySelector('.nav-link[href="#donate"]');
     const authLink = document.querySelector('.nav-link.auth-link');

     if(donateLink) {
        donateLink.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn nhảy link
            alert('Chức năng Donate đang được phát triển!');
        });
     }
      if(authLink) {
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Chức năng Login/Register đang được phát triển!');
        });
     }
     // Xử lý nút admin nếu có
      const adminSaveBtn = document.querySelector('#admin-panel .cta-button');
      if (adminSaveBtn && document.getElementById('admin-panel').style.display !== 'none') {
          // Thêm logic lưu ở đây nếu cần tách biệt
      }
}

// ----- Initialization -----
function initializePage() {
    const ageSpan = document.getElementById('age');
    if (ageSpan) { ageSpan.textContent = calculateAge('2006-08-08'); }
    updateYear();
    setupHeaderScroll();
    setupProfessionalAnimations(); // Gọi hàm animation mới
    setupAdminPanel();
    setupActionButtons();
}

document.addEventListener('DOMContentLoaded', initializePage);