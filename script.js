// Hàm tính tuổi tự động
function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString); // Format YYYY-MM-DD
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Hàm cập nhật năm tự động
function updateYear() {
    const currentYear = new Date().getFullYear();
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = currentYear;
    }
}

// Hàm thực thi chính khi trang tải xong
function initializePage() {
    // Cập nhật tuổi
    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        // !! Nhớ dùng đúng định dạng YYYY-MM-DD !!
        try {
            ageSpan.textContent = calculateAge('2006-08-08');
        } catch (e) {
            console.error("Lỗi tính tuổi:", e);
            ageSpan.textContent = "[lỗi]"; // Hiển thị lỗi nếu ngày sinh sai
        }
    }

    // Cập nhật năm
    updateYear();

    // ----- Chức năng Admin Panel Placeholder -----
    setupAdminPanel();

    // ----- Xử lý nút Donate/Login Placeholder -----
    setupActionButtons();
}

// Thiết lập Admin Panel (Placeholder)
function setupAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    const editables = document.querySelectorAll('[data-editable]');
    const saveButton = document.getElementById('save-edits-btn');

    // !! Đây chỉ là ví dụ, không bảo mật !!
    // Trong thực tế, cần cơ chế đăng nhập thực sự
    let isAdmin = false; // Đặt thành true để test thử giao diện admin

    if (isAdmin && adminPanel) {
        adminPanel.style.display = 'block'; // Hiển thị panel

        // Load nội dung từ localStorage hoặc từ HTML vào textarea
        editables.forEach(el => {
            const key = el.dataset.editable;
            const textarea = document.getElementById(`edit-${key}`);
            if (textarea) {
                // Ưu tiên lấy từ localStorage, nếu không có thì lấy từ HTML
                textarea.value = localStorage.getItem(`content-${key}`) || el.innerHTML.trim();
            }
        });

        // Xử lý nút lưu
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                editables.forEach(el => {
                    const key = el.dataset.editable;
                    const textarea = document.getElementById(`edit-${key}`);
                    if (textarea) {
                        const newContent = textarea.value;
                        // Cập nhật trực tiếp HTML trên trang
                        el.innerHTML = newContent;
                        // Lưu vào localStorage (chỉ cho trình duyệt hiện tại)
                        localStorage.setItem(`content-${key}`, newContent);
                        console.log(`Đã lưu nội dung cho [${key}] vào localStorage.`);
                    }
                });
                 alert('Nội dung đã được lưu tạm thời trên trình duyệt này!');
            });
        }
    } else if (adminPanel) {
         adminPanel.style.display = 'none'; // Đảm bảo panel ẩn nếu không phải admin
    }
}

// Thiết lập các nút hành động (Placeholder)
function setupActionButtons() {
    const donateBtn = document.getElementById('donate-btn');
    const authBtn = document.getElementById('auth-btn');

    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            alert('Chức năng Donate đang được phát triển!');
            // Ví dụ chuyển hướng: window.location.href = 'link-donate-cua-ban';
        });
    }

    if (authBtn) {
        authBtn.addEventListener('click', () => {
            alert('Chức năng Login/Register đang được phát triển!');
            // Ví dụ: Hiển thị form đăng nhập/đăng ký
        });
    }
}

// Chạy hàm khởi tạo khi trang tải xong
// Dùng DOMContentLoaded để chạy sớm hơn onload một chút, không cần chờ ảnh tải xong
document.addEventListener('DOMContentLoaded', initializePage);

// Lưu ý: Thư viện AOS đã được khởi tạo riêng trong thẻ script ở cuối HTML.