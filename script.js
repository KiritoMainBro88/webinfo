// Hàm tính tuổi tự động
function calculateAge(birthDateString) {
    // Định dạng ngày sinh 'YYYY/MM/DD' hoặc 'MM/DD/YYYY' đều được Date() chấp nhận
    // Tốt nhất là dùng 'YYYY-MM-DD'
    const birthDate = new Date(birthDateString); // Ví dụ: '2006-08-08'
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Nếu tháng hiện tại nhỏ hơn tháng sinh, hoặc cùng tháng nhưng ngày hiện tại nhỏ hơn ngày sinh
    // thì chưa đủ tuổi, giảm đi 1
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

// Hàm thực thi khi trang tải xong
window.onload = function() {
    // Cập nhật tuổi
    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        // Thay '2006-08-08' bằng ngày sinh chính xác của bạn theo định dạng YYYY-MM-DD
        ageSpan.textContent = calculateAge('2006-08-08');
    }

    // Cập nhật năm
    updateYear();

    // ----- Chức năng chỉnh sửa (Admin - Sẽ phát triển sau) -----
    // Đây là ví dụ rất cơ bản, không bảo mật và chỉ lưu trên trình duyệt người dùng
    // Chức năng thực tế cần backend hoặc Headless CMS

    const adminPanel = document.getElementById('admin-panel');
    const editables = document.querySelectorAll('[data-editable]');
    const saveButton = document.getElementById('save-edits-btn');

    // Giả sử có cách nào đó xác định bạn là admin (ví dụ: qua login)
    let isAdmin = false; // Đặt thành true để test thử

    if (isAdmin) {
        adminPanel.style.display = 'block'; // Hiển thị panel admin

        // Load nội dung vào textarea (nếu có lưu trữ trước đó)
        editables.forEach(el => {
            const key = el.dataset.editable;
            const textarea = document.getElementById(`edit-${key}`);
            if (textarea) {
                // Lấy nội dung từ local storage nếu có, hoặc từ chính element
                textarea.value = localStorage.getItem(`content-${key}`) || el.innerHTML.trim();
            }
             // Thêm thuộc tính contenteditable để sửa trực tiếp (tuỳ chọn)
             // el.contentEditable = true;
             // el.style.border = '1px dashed blue'; // Cho biết là có thể sửa
        });

        // Xử lý nút lưu
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                editables.forEach(el => {
                    const key = el.dataset.editable;
                    const textarea = document.getElementById(`edit-${key}`);
                    if (textarea) {
                        const newContent = textarea.value;
                        el.innerHTML = newContent; // Cập nhật nội dung trên trang
                        localStorage.setItem(`content-${key}`, newContent); // Lưu vào local storage (chỉ cho trình duyệt này)
                        console.log(`Đã lưu nội dung cho: ${key}`);
                    }
                });
                 alert('Nội dung đã được lưu (tạm thời trên trình duyệt này)!');
            });
        }
    }
};

// ----- Các xử lý khác (Donate, Login/Register) -----
// Hiện tại chỉ là placeholder, cần logic thực tế sau này

const donateBtn = document.getElementById('donate-btn');
const authBtn = document.getElementById('auth-btn');

if (donateBtn) {
    donateBtn.addEventListener('click', () => {
        alert('Chức năng Donate đang được phát triển!');
        // Sau này có thể chuyển hướng đến trang donate (MoMo, PayPal, ...)
    });
}

if (authBtn) {
    authBtn.addEventListener('click', () => {
        alert('Chức năng Login/Register đang được phát triển!');
        // Sau này sẽ mở form đăng nhập/đăng ký hoặc chuyển trang
    });
}