document.addEventListener('DOMContentLoaded', function() {
    // Backend URL configuration
    const BACKEND_URL = 'https://webinfo-zbkq.onrender.com';
    
    // Initialize state variables
    let isLoggedIn = localStorage.getItem('userId') ? true : false;
    let isLoading = true;
    let purchaseHistory = [];
    let startDate = null;
    let endDate = null;
    let productType = 'all';

    // DOM Elements
    const loginRequiredNotice = document.querySelector('.login-required-notice');
    const purchaseHistorySection = document.querySelector('.purchase-history-section');
    const historyContainer = document.querySelector('.purchase-history-container');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const startDateFilter = document.getElementById('start-date');
    const endDateFilter = document.getElementById('end-date');
    const productTypeFilter = document.getElementById('product-type');
    const filterBtn = document.getElementById('filter-btn');
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    const loginButton = document.getElementById('loginBtn');
    const registerButton = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const copyButtons = document.querySelectorAll('.btn-copy');
    const filterForm = document.getElementById('filterForm');
    const clearFilterButton = document.getElementById('clearFilterBtn');
    const purchaseHistoryBody = document.getElementById('purchaseHistoryBody');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const emptyHistory = document.getElementById('emptyHistory');
    
    // Initialize the page
    initializePage();
    
    // Login and Register buttons functionality
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            openModal(loginModal);
        });
    }
    
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            openModal(registerModal);
        });
    }
    
    // Close modal functionality
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            closeModal(modal);
        });
    });
    
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modalOverlays.forEach(overlay => {
                if (overlay.classList.contains('show')) {
                    closeModal(overlay);
                }
            });
        }
    });
    
    // Modal form switching
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginModal);
            setTimeout(() => {
                openModal(registerModal);
            }, 300);
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(registerModal);
            setTimeout(() => {
                openModal(loginModal);
            }, 300);
        });
    }
    
    // Copy credentials functionality
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-copy');
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    showNotification('Thành công', 'Đã sao chép vào bộ nhớ tạm', 'success');
                })
                .catch(err => {
                    showNotification('Lỗi', 'Không thể sao chép vào bộ nhớ tạm', 'error');
                    console.error('Copy failed: ', err);
                });
        });
    });
    
    // Filter functionality
    if (filterBtn) {
        filterBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFilters);
    }
    
    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (filterForm) {
                filterForm.reset();
                // Submit form after resetting to refresh results
                filterForm.submit();
            }
        });
    }
    
    // Date filter helpers
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (dateFrom && dateTo) {
        // Set max date to today
        const today = new Date().toISOString().split('T')[0];
        dateFrom.max = today;
        dateTo.max = today;
        
        // When from date changes, update min date of 'to' input
        dateFrom.addEventListener('change', function() {
            dateTo.min = this.value;
            if (dateTo.value && dateTo.value < this.value) {
                dateTo.value = this.value;
            }
        });
        
        // When to date changes, update max date of 'from' input
        dateTo.addEventListener('change', function() {
            dateFrom.max = this.value;
            if (dateFrom.value && dateFrom.value > this.value) {
                dateFrom.value = this.value;
            }
        });
    }
    
    // Login form submission (for demo purposes)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.querySelector('input[name="username"]').value;
            const password = this.querySelector('input[name="password"]').value;
            
            if (!username || !password) {
                showNotification('Lỗi đăng nhập', 'Vui lòng điền tất cả các trường', 'error');
                return;
            }
            
            // Here would be the actual login logic with fetch/ajax
            // For demonstration purposes, just show success
            showNotification('Đăng nhập thành công', 'Đang chuyển hướng...', 'success');
            
            setTimeout(() => {
                // Redirect or refresh page after successful login
                window.location.reload();
            }, 2000);
        });
    }
    
    // Register form submission (for demo purposes)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.querySelector('input[name="reg-username"]').value;
            const email = this.querySelector('input[name="reg-email"]').value;
            const password = this.querySelector('input[name="reg-password"]').value;
            const passwordConfirm = this.querySelector('input[name="reg-password-confirm"]').value;
            const terms = this.querySelector('input[name="terms"]').checked;
            
            if (!username || !email || !password || !passwordConfirm) {
                showNotification('Lỗi đăng ký', 'Vui lòng điền tất cả các trường', 'error');
                return;
            }
            
            if (password !== passwordConfirm) {
                showNotification('Lỗi đăng ký', 'Mật khẩu không khớp', 'error');
                return;
            }
            
            if (!terms) {
                showNotification('Lỗi đăng ký', 'Vui lòng đồng ý với điều khoản sử dụng', 'error');
                return;
            }
            
            // Here would be the actual registration logic with fetch/ajax
            // For demonstration purposes, just show success
            showNotification('Đăng ký thành công', 'Vui lòng kiểm tra email để xác nhận tài khoản', 'success');
            
            setTimeout(() => {
                closeModal(registerModal);
                setTimeout(() => {
                    openModal(loginModal);
                }, 300);
            }, 2000);
        });
    }
    
    // Initialize the page based on login status
    function initializePage() {
        if (isLoggedIn) {
            if (loginRequiredNotice) loginRequiredNotice.style.display = 'none';
            if (purchaseHistorySection) purchaseHistorySection.style.display = 'block';
            fetchPurchaseHistory();
        } else {
            if (loginRequiredNotice) loginRequiredNotice.style.display = 'block';
            if (purchaseHistorySection) purchaseHistorySection.style.display = 'none';
        }
    }
    
    // Fetch purchase history from the API
    async function fetchPurchaseHistory() {
        if (!isLoggedIn) return [];
        
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) throw new Error('No user ID found');
            
            showLoadingSpinner(true);
            
            const response = await fetch(`${BACKEND_URL}/api/purchases/user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userId}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch purchase history: ${response.status}`);
            }
            
            const data = await response.json();
            return data.purchases || [];
        } catch (error) {
            console.error('Error fetching purchase history:', error);
            showNotification('Error', 'Failed to load purchase history. Please try again later.', 'error');
            return [];
        } finally {
            showLoadingSpinner(false);
        }
    }
    
    // Show or hide loading spinner
    function showLoadingSpinner(show) {
        if (loadingSpinner) {
            loadingSpinner.style.display = show ? 'block' : 'none';
        }
    }
    
    // Apply filters to purchase history
    function applyFilters() {
        startDate = startDateFilter?.value ? new Date(startDateFilter.value) : null;
        endDate = endDateFilter?.value ? new Date(endDateFilter.value) : null;
        productType = productTypeFilter?.value || 'all';
        
        let filteredHistory = [...purchaseHistory];
        
        // Apply date filters
        if (startDate) {
            filteredHistory = filteredHistory.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate;
            });
        }
        
        if (endDate) {
            filteredHistory = filteredHistory.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate <= endDate;
            });
        }
        
        // Apply product type filter
        if (productType !== 'all') {
            filteredHistory = filteredHistory.filter(item => item.productType === productType);
        }
        
        renderPurchaseHistory(filteredHistory);
    }
    
    // Reset all filters
    function resetFilters() {
        if (startDateFilter) startDateFilter.value = '';
        if (endDateFilter) endDateFilter.value = '';
        if (productTypeFilter) productTypeFilter.value = 'all';
        
        startDate = null;
        endDate = null;
        productType = 'all';
        
        renderPurchaseHistory(purchaseHistory);
    }
    
    // Update UI based on state
    function updateUI() {
        if (isLoading && loadingSpinner) {
            loadingSpinner.style.display = 'flex';
            if (historyContainer) historyContainer.style.display = 'none';
        } else {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (historyContainer) historyContainer.style.display = 'block';
        }
    }
    
    // Render purchase history items
    function renderPurchaseHistory(history) {
        if (!historyContainer) return;
        
        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No purchase history found</h3>
                    <p>You haven't made any purchases yet or no purchases match your current filters.</p>
                    <button class="btn btn-primary" id="browse-products-btn">Browse Products</button>
                </div>
            `;
            
            // Add event listener to browse products button
            const browseBtn = document.getElementById('browse-products-btn');
            if (browseBtn) {
                browseBtn.addEventListener('click', function() {
                    window.location.href = 'shop.html';
                });
            }
            
            return;
        }
        
        let historyHTML = '';
        
        history.forEach(item => {
            historyHTML += `
                <div class="purchase-history-item" data-id="${item.id}">
                    <div class="purchase-header">
                        <div>
                            <div class="purchase-title">${item.title}</div>
                            <div class="purchase-id">${item.id}</div>
                        </div>
                        <div class="purchase-date">
                            <i class="far fa-calendar-alt"></i> ${formatDate(item.date)}
                        </div>
                    </div>
                    
                    <div class="purchase-details">
                        <div class="purchase-detail-item">
                            <div class="detail-label">Quantity</div>
                            <div class="detail-value">${item.quantity}</div>
                        </div>
                        <div class="purchase-detail-item">
                            <div class="detail-label">Price</div>
                            <div class="detail-value purchase-price">${item.price}</div>
                        </div>
                        <div class="purchase-detail-item">
                            <div class="detail-label">Status</div>
                            <div class="detail-value">
                                <span class="purchase-status status-${item.status}">
                                    ${capitalizeFirstLetter(item.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="purchase-account-details">
                        <div class="account-detail-header">
                            <div class="account-detail-title">Account Details</div>
                            <button class="account-detail-toggle" data-id="${item.id}">
                                <i class="fas fa-chevron-down"></i> Show Details
                            </button>
                        </div>
                        <div class="account-credentials-container" id="credentials-${item.id}" style="display: none;">
                            ${renderAccountCredentials(item.accountDetails)}
                        </div>
                    </div>
                    
                    <div class="purchase-footer">
                        <div class="support-action">
                            Having problems? <a href="support.html">Contact Support</a>
                        </div>
                        <div class="purchase-actions">
                            <button class="btn btn-outline-primary">Download Invoice</button>
                            <button class="btn btn-primary">Renew</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
        
        // Add event listeners to toggle buttons
        document.querySelectorAll('.account-detail-toggle').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const credentialsContainer = document.getElementById(`credentials-${id}`);
                
                if (credentialsContainer.style.display === 'none') {
                    credentialsContainer.style.display = 'block';
                    this.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Details';
                } else {
                    credentialsContainer.style.display = 'none';
                    this.innerHTML = '<i class="fas fa-chevron-down"></i> Show Details';
                }
            });
        });
        
        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i>';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                });
            });
        });
    }
    
    // Format date to a more readable format
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Capitalize first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Render account credentials based on account type
    function renderAccountCredentials(accountDetails) {
        if (!accountDetails) return '';
        
        let credentialsHTML = '';
        
        Object.keys(accountDetails).forEach(key => {
            const value = accountDetails[key];
            const label = formatCredentialLabel(key);
            
            credentialsHTML += `
                <div class="account-credential">
                    <div class="credential-label">${label}</div>
                    <div class="credential-value">
                        ${value}
                        <button class="copy-btn" data-copy="${value}">
                            <i class="far fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        return credentialsHTML;
    }
    
    // Format credential label (convert camelCase to Title Case with spaces)
    function formatCredentialLabel(key) {
        // Convert camelCase to spaces
        const withSpaces = key.replace(/([A-Z])/g, ' $1');
        // Capitalize first letter and lowercase the rest
        return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
    }
    
    // Theme toggler functionality
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const isDarkTheme = document.body.classList.contains('dark-theme');
            localStorage.setItem('darkTheme', isDarkTheme);
            
            // Update toggle icon
            this.innerHTML = isDarkTheme ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        });
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('darkTheme') === 'true';
        if (savedTheme) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Language switcher functionality
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            localStorage.setItem('language', selectedLanguage);
            
            // In a real app, this would reload the page with translations
            // For now, just log the selection
            console.log('Language changed to:', selectedLanguage);
        });
        
        // Check for saved language preference
        const savedLanguage = localStorage.getItem('language') || 'vi';
        languageSelect.value = savedLanguage;
    }

    // Filter purchase history by date range
    function filterPurchaseHistory(startDate, endDate) {
        if (!startDate && !endDate) {
            return purchaseHistory;
        }

        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        
        return purchaseHistory.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            return purchaseDate >= start && purchaseDate <= end;
        });
    }

    // Format currency
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    }

    // Render purchase history table
    function renderPurchaseHistoryTable(purchases) {
        purchaseHistoryBody.innerHTML = '';
        
        if (purchases.length === 0) {
            emptyHistory.style.display = 'block';
            return;
        }
        
        emptyHistory.style.display = 'none';
        
        purchases.forEach(purchase => {
            const row = document.createElement('tr');
            
            // Calculate total items
            const totalItems = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
            
            row.innerHTML = `
                <td>
                    <span class="order-id">${purchase.id}</span>
                    <button class="copy-btn" data-order-id="${purchase.id}">
                        <i class="far fa-copy"></i>
                    </button>
                </td>
                <td>${formatDate(purchase.date)}</td>
                <td>${totalItems} item${totalItems !== 1 ? 's' : ''}</td>
                <td>${formatCurrency(purchase.price)}</td>
                <td><span class="status-badge status-${purchase.status.toLowerCase()}">${capitalize(purchase.status)}</span></td>
                <td>
                    <button class="view-details-btn" data-order-id="${purchase.id}">View Details</button>
                </td>
            `;
            
            purchaseHistoryBody.appendChild(row);
        });
        
        // Add event listeners to the newly created buttons
        attachButtonEventListeners();
    }

    // Attach event listeners to copy and view details buttons
    function attachButtonEventListeners() {
        // Copy order ID
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const orderId = this.getAttribute('data-order-id');
                navigator.clipboard.writeText(orderId)
                    .then(() => showNotification('Order ID copied to clipboard!', 'success'))
                    .catch(err => showNotification('Failed to copy order ID', 'error'));
            });
        });

        // View order details
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                showOrderDetails(orderId);
            });
        });
    }

    // Show order details in modal
    function showOrderDetails(orderId) {
        const order = purchaseHistory.find(p => p.id === orderId);
        
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }
        
        // Populate order details
        document.getElementById('detailOrderId').textContent = order.id;
        document.getElementById('detailDate').textContent = formatDate(order.date);
        document.getElementById('detailStatus').textContent = capitalize(order.status);
        document.getElementById('detailTotal').textContent = formatCurrency(order.price);
        
        // Populate items
        const detailItems = document.getElementById('detailItems');
        detailItems.innerHTML = '';
        
        order.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'detail-item';
            
            itemElement.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.title}</div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">${formatCurrency(item.price * item.quantity)}</div>
            `;
            
            detailItems.appendChild(itemElement);
        });
        
        // Show modal
        orderDetailsModal.style.display = 'flex';
    }

    // Show notification
    function showNotification(message, type = 'info') {
        notificationMessage.textContent = message;
        notification.className = `notification notification-${type}`;
        notification.style.display = 'flex';
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Event Listeners
    applyFilterBtn.addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        const filteredHistory = filterPurchaseHistory(startDate, endDate);
        renderPurchaseHistoryTable(filteredHistory);
        
        if (filteredHistory.length === 0) {
            showNotification('No purchases found for the selected date range', 'info');
        }
    });

    // Close modal
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            orderDetailsModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === orderDetailsModal) {
            orderDetailsModal.style.display = 'none';
        }
    });

    // Initialize page with all purchase history
    renderPurchaseHistoryTable(purchaseHistory);
});

// Modal handling
function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Notification functionality
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle notification-icon"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle notification-icon"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle notification-icon"></i>';
    }
    
    notification.innerHTML = `
        ${icon}
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    const autoRemoveTimeout = setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        clearTimeout(autoRemoveTimeout);
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Make notification visible with animation
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
}

function createCategorySummaryCardElement(category, minPrice, maxPrice) {
    // Create an anchor element for proper navigation
    const cardLink = document.createElement('a');
    cardLink.className = 'category-summary-card'; 
    cardLink.dataset.animate = "fade-up";
    cardLink.dataset.slug = category.slug || 'unknown';
    
    // Set the href directly for better navigation behavior
    cardLink.href = `category.html?slug=${category.slug || 'unknown'}`;
    
    // ... rest of the function
} 