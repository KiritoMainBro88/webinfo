console.log("Admin script version 1.2 running!"); // Update log

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on a page that actually needs admin functionality
    // Avoid running everything on every potential admin page
    if (document.getElementById('admin-content')) {
        initializeAdminPanel();
    } else {
        console.log("Not on an admin content page.");
    }
});

function initializeAdminPanel() {
    console.log("Initializing Admin Panel Content...");
    const adminContent = document.getElementById('admin-content');
    const authCheckDiv = document.getElementById('admin-auth-check');

    // Auth Check (Still Insecure Demo)
    const userId = localStorage.getItem('userId');
    if (!userId) {
        authCheckDiv.innerHTML = '<p class="error">Access Denied. Please log in via the main site first.</p>';
        authCheckDiv.style.display = 'block';
        if(adminContent) adminContent.style.display = 'none'; // Hide content if check fails later
        return; // Stop initialization
    } else {
        console.warn("SECURITY RISK: Displaying admin panel based only on login status. Implement backend admin verification!");
        authCheckDiv.style.display = 'none';
        if(adminContent) adminContent.style.display = 'block';
    }

    // Check if functions from script.js are loaded
    if (typeof fetchData !== 'function' || typeof formatPrice !== 'function') {
         console.error("FATAL: Essential functions (fetchData/formatPrice) not found. Ensure script.js is loaded before admin.js");
         alert("A critical error occurred loading the admin panel. Check console.");
         return;
    }

    // Load data and setup forms based on which admin page we are on
    if (document.getElementById('category-management')) {
        loadCategories();
    }
    if (document.getElementById('product-management')) {
        loadProducts(); // Assumes loadCategories was called if needed for dropdown
    }
    // Setup forms regardless, they might exist on different pages
    setupAdminForms();
}


function displayMessage(elementId, message, isSuccess) {
    const el = document.getElementById(elementId); if (!el) return; el.textContent = message; el.className = 'admin-message ' + (isSuccess ? 'success' : 'error'); el.style.display = 'block'; setTimeout(() => { el.textContent = ''; el.style.display = 'none'; }, 5000);
}

// --- Category Functions ---
async function loadCategories() {
    const categoryListDiv = document.getElementById('category-list'); const categorySelect = document.querySelector('#product-category'); if (!categoryListDiv) { console.log("Category list div not found on this page."); return; } categoryListDiv.innerHTML = '<p>Loading categories...</p>'; if (categorySelect) categorySelect.innerHTML = '<option value="">-- Loading --</option>';
    try {
        const categories = await fetchData('/categories'); categoryListDiv.innerHTML = ''; if (categorySelect) categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        if (categories.length === 0) { categoryListDiv.innerHTML = '<p>No categories found.</p>'; }
        else {
            const ul = document.createElement('ul'); categories.forEach(cat => { const li = document.createElement('li'); li.innerHTML = `<span><i class="${cat.iconClass || 'fas fa-tag'}"></i> ${cat.name} (Order: ${cat.displayOrder ?? 0})</span> <span class="actions"> <button class="edit-cat-btn cta-button secondary" data-id="${cat._id}" data-name="${cat.name}" data-icon="${cat.iconClass || ''}" data-order="${cat.displayOrder ?? 0}">Edit</button> <button class="delete-cat-btn cta-button danger" data-id="${cat._id}">Delete</button> </span>`; ul.appendChild(li); if (categorySelect) { const option = document.createElement('option'); option.value = cat._id; option.textContent = cat.name; categorySelect.appendChild(option); } }); categoryListDiv.appendChild(ul);
        }
    } catch (error) { categoryListDiv.innerHTML = `<p class="error">Error loading categories: ${error.message}</p>`; if (categorySelect) categorySelect.innerHTML = '<option value="">-- Error Loading --</option>'; }
}

// --- Product Functions ---
async function loadProducts() {
     const productListDiv = document.getElementById('product-list'); if (!productListDiv) { console.log("Product list div not found on this page."); return; } productListDiv.innerHTML = '<p>Loading products...</p>';
     try {
         const products = await fetchData('/products'); productListDiv.innerHTML = '';
          if (products.length === 0) { productListDiv.innerHTML = '<p>No products found.</p>'; }
          else { const table = createProductTable(products); productListDiv.appendChild(table); }
     } catch (error) { productListDiv.innerHTML = `<p class="error">Error loading products: ${error.message}</p>`; }
 }

function createProductTable(products) {
    const table = document.createElement('table'); table.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Order</th><th>Actions</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody');
    products.forEach(prod => { const tr = document.createElement('tr'); const formattedPrice = prod.price !== null ? formatPrice(prod.price) : 'N/A'; const formattedOriginalPrice = prod.originalPrice ? `<del style="font-size:0.8em; color:grey;">${formatPrice(prod.originalPrice)}</del>` : ''; tr.innerHTML = `<td><img src="${prod.imageUrl || 'images/product-placeholder.png'}" alt="${prod.name}" class="product-thumb"></td> <td>${prod.name}</td> <td>${prod.category?.name || 'N/A'}</td> <td>${formattedPrice} ${formattedOriginalPrice}</td> <td>${prod.stockStatus}</td> <td>${prod.displayOrder ?? 0}</td> <td class="actions"> <button class="edit-btn" data-id="${prod._id}">Edit</button> <button class="delete-btn" data-id="${prod._id}">Delete</button> </td>`; tbody.appendChild(tr); }); return table;
}

// --- Form and Action Setup ---
function setupAdminForms() {
    const addCategoryForm = document.getElementById('add-category-form');
    const categoryListDiv = document.getElementById('category-list');
    const editCategoryIdField = document.getElementById('edit-category-id');
    const cancelEditCategoryBtn = document.getElementById('cancel-edit-category');

    const addProductForm = document.getElementById('add-product-form');
    const productListDiv = document.getElementById('product-list');
    const cancelEditProductBtn = document.getElementById('cancel-edit-product');
    const editProductIdField = document.getElementById('edit-product-id');

    const addBalanceForm = document.getElementById('add-balance-form');

    // Add/Edit Category Handler
    if (addCategoryForm && editCategoryIdField && cancelEditCategoryBtn) { // Check elements exist
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-cat-name').value; const iconClass = document.getElementById('new-cat-icon').value; const displayOrder = document.getElementById('new-cat-order').value; const isEditing = !!editCategoryIdField.value; const categoryId = editCategoryIdField.value; const url = isEditing ? `/categories/${categoryId}` : '/categories'; const method = isEditing ? 'PUT' : 'POST'; const button = addCategoryForm.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Saving...';
            try {
                await fetchData(url, { method, body: JSON.stringify({ name, iconClass, displayOrder: parseInt(displayOrder || '0', 10) }) });
                displayMessage('cat-message', `Category ${isEditing ? 'updated' : 'added'}!`, true); addCategoryForm.reset(); editCategoryIdField.value = ''; cancelEditCategoryBtn.style.display = 'none'; addCategoryForm.querySelector('h3').textContent = 'Add / Edit Category'; loadCategories();
            } catch (error) { displayMessage('cat-message', `Error: ${error.message}`, false); } finally { button.disabled = false; button.textContent = 'Save Category'; }
        });
        cancelEditCategoryBtn.addEventListener('click', () => { addCategoryForm.reset(); editCategoryIdField.value = ''; cancelEditCategoryBtn.style.display = 'none'; addCategoryForm.querySelector('h3').textContent = 'Add / Edit Category'; });
    }

    // Add/Update Product Handler
    if (addProductForm && editProductIdField && cancelEditProductBtn) { // Check elements exist
         addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault(); const formData = new FormData(addProductForm); const productData = Object.fromEntries(formData.entries()); const isEditing = !!editProductIdField.value; const productId = editProductIdField.value; productData.price = parseFloat(productData.price); productData.originalPrice = productData.originalPrice ? parseFloat(productData.originalPrice) : null; productData.tags = productData.tags ? productData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : []; productData.displayOrder = parseInt(productData.displayOrder || '0', 10); const url = isEditing ? `/products/${productId}` : '/products'; const method = isEditing ? 'PUT' : 'POST'; const button = addProductForm.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Saving...';
            try {
                 await fetchData(url, { method, body: JSON.stringify(productData) });
                 displayMessage('product-message', `Product ${isEditing ? 'updated' : 'added'}!`, true); addProductForm.reset(); editProductIdField.value = ''; cancelEditProductBtn.style.display = 'none'; addProductForm.querySelector('h3').textContent = 'Add/Edit Product'; loadProducts();
            } catch (error) { displayMessage('product-message', `Error: ${error.message}`, false); } finally { button.disabled = false; button.textContent = 'Save Product'; }
         });
         cancelEditProductBtn.addEventListener('click', () => { addProductForm.reset(); editProductIdField.value = ''; cancelEditProductBtn.style.display = 'none'; addProductForm.querySelector('h3').textContent = 'Add/Edit Product'; });
    }

     // Add Balance Form Handler
     if (addBalanceForm) {
        addBalanceForm.addEventListener('submit', async (e) => {
            e.preventDefault(); const userIdInput = document.getElementById('balance-user-id').value.trim(); const amount = document.getElementById('balance-amount').value; const button = addBalanceForm.querySelector('button[type="submit"]'); if (!userIdInput || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { displayMessage('balance-message', 'Valid User ID/Username & positive Amount required.', false); return; } button.disabled = true; button.textContent = 'Processing...';
            try {
                const result = await fetchData('/admin/add-balance', { method: 'POST', body: JSON.stringify({ userId: userIdInput, amount: parseFloat(amount) }) }); displayMessage('balance-message', result.message || 'Balance updated!', true); addBalanceForm.reset();
            } catch (error) { displayMessage('balance-message', `Error: ${error.message || 'Could not update balance'}`, false); } finally { button.disabled = false; button.textContent = 'Add Balance'; }
        });
    }

    // Event Delegation for Edit/Delete Buttons
    if (categoryListDiv) { categoryListDiv.addEventListener('click', handleCategoryActions); }
     if (productListDiv) { productListDiv.addEventListener('click', handleProductActions); }
}

// --- Action Handlers ---
function handleCategoryActions(e) {
    const target = e.target; const catId = target.dataset.id; const addCategoryForm = document.getElementById('add-category-form'); const editCategoryIdField = document.getElementById('edit-category-id'); const cancelEditCategoryBtn = document.getElementById('cancel-edit-category'); if (!addCategoryForm || !editCategoryIdField || !cancelEditCategoryBtn) return;
    if (target.classList.contains('delete-cat-btn')) { if (confirm(`DELETE Category ${catId}? Check products first!`)) { fetchData(`/categories/${catId}`, { method: 'DELETE' }).then(() => { displayMessage('cat-message', 'Category deleted.', true); loadCategories(); loadProducts(); }).catch(error => displayMessage('cat-message', `Error deleting: ${error.message}`, false)); } }
    else if (target.classList.contains('edit-cat-btn')) { editCategoryIdField.value = catId; document.getElementById('new-cat-name').value = target.dataset.name || ''; document.getElementById('new-cat-icon').value = target.dataset.icon || ''; document.getElementById('new-cat-order').value = target.dataset.order || '0'; addCategoryForm.querySelector('h3').textContent = 'Edit Category'; cancelEditCategoryBtn.style.display = 'inline-block'; addCategoryForm.scrollIntoView({ behavior: 'smooth' }); }
}
async function handleProductActions(e) {
     const target = e.target; const prodId = target.dataset.id; const addProductForm = document.getElementById('add-product-form'); const editProductIdField = document.getElementById('edit-product-id'); const cancelEditProductBtn = document.getElementById('cancel-edit-product'); if (!addProductForm || !editProductIdField || !cancelEditProductBtn) return;
     if (target.classList.contains('delete-btn')) { if (confirm(`DELETE Product ${prodId}?`)) { try { await fetchData(`/products/${prodId}`, { method: 'DELETE' }); displayMessage('product-message', 'Product deleted.', true); loadProducts(); } catch (error) { displayMessage('product-message', `Error deleting: ${error.message}`, false); } } }
     else if (target.classList.contains('edit-btn')) { try { const product = await fetchData(`/products/${prodId}`); if (!product) throw new Error('Product data not found'); editProductIdField.value = product._id; document.getElementById('product-name').value = product.name || ''; document.getElementById('product-category').value = product.category?._id || ''; document.getElementById('product-price').value = product.price ?? ''; document.getElementById('product-original-price').value = product.originalPrice ?? ''; document.getElementById('product-image').value = product.imageUrl || ''; document.getElementById('product-tags').value = product.tags?.join(', ') || ''; document.getElementById('product-stock').value = product.stockStatus || 'in_stock'; document.getElementById('product-order').value = product.displayOrder ?? 0; document.getElementById('product-description').value = product.description || ''; addProductForm.querySelector('h3').textContent = 'Edit Product'; cancelEditProductBtn.style.display = 'inline-block'; addProductForm.scrollIntoView({ behavior: 'smooth' }); } catch (error) { displayMessage('product-message', `Error loading product for edit: ${error.message}`, false); } }
}

// Helper function (if not global in script.js)
// function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }