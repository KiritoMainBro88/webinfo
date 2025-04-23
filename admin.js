console.log("Admin script version 1.2.2 running!");

// --- REMOVE LOCAL BACKEND_URL DEFINITION ---
// const BACKEND_URL = 'https://webinfo-zbkq.onrender.com'; // REMOVED - Rely on global one in script.js

document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    console.log("Initializing Admin Panel Content...");
    const adminContent = document.getElementById('admin-content');
    const authCheckDiv = document.getElementById('admin-auth-check');

    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!userId || !isAdmin) {
        authCheckDiv.innerHTML = '<p class="error">Access Denied. Admin privileges required. Please log in via the main site first.</p>';
        authCheckDiv.style.display = 'block';
        if(adminContent) adminContent.style.display = 'none';
        console.warn("Admin access denied.");
        return;
    } else {
        console.log("Admin access potentially granted (insecure check).");
        authCheckDiv.style.display = 'none';
        if(adminContent) adminContent.style.display = 'block';
    }

    if (typeof fetchData !== 'function' || typeof formatPrice !== 'function') {
         console.error("FATAL: Essential functions (fetchData/formatPrice) from script.js not found. Ensure script.js is loaded correctly before admin.js.");
         if(adminContent) { adminContent.innerHTML = '<p class="error" style="padding: 2rem; text-align: center;">Critical Error: Admin functions cannot load. Please check the browser console.</p>'; adminContent.style.display = 'block'; }
         if(authCheckDiv) authCheckDiv.style.display = 'none';
         return;
    }

    if (document.getElementById('category-management')) {
        loadCategories().then(() => { if (document.getElementById('product-management')) { loadProducts(); } }) .catch(error => { console.error("Error loading categories, subsequent loads might be affected:", error); if (document.getElementById('product-management')) { loadProducts(); } });
    } else if (document.getElementById('product-management')) {
        loadCategories().then(() => loadProducts()).catch(e => console.error("Error loading initial product data:", e));
    }

    setupAdminForms();
}


function displayMessage(elementId, message, isSuccess) {
    const el = document.getElementById(elementId); if (!el) { console.warn(`Display message element not found: ${elementId}`); return; }
    el.textContent = message; el.className = 'admin-message ' + (isSuccess ? 'success' : 'error'); el.style.display = 'block';
    setTimeout(() => { if (el.textContent === message) { el.textContent = ''; el.style.display = 'none'; } }, 5000);
}

// --- Category Functions --- (Use global fetchData)
async function loadCategories() {
    const categoryListDiv = document.getElementById('category-list'); const categorySelect = document.querySelector('#product-category');
    if (categoryListDiv) categoryListDiv.innerHTML = '<p>Loading categories...</p>'; if (categorySelect) categorySelect.innerHTML = '<option value="">-- Loading --</option>';
    try {
        const categories = await fetchData('/categories'); // Uses global fetchData
        if (categoryListDiv) { categoryListDiv.innerHTML = ''; if (!categories || categories.length === 0) { categoryListDiv.innerHTML = '<p>No categories found.</p>'; } else { const ul = document.createElement('ul'); categories.forEach(cat => { const li = document.createElement('li'); li.dataset.categoryId = cat._id; li.innerHTML = `<span><i class="${cat.iconClass || 'fas fa-tag'}"></i> ${cat.name} (Order: ${cat.displayOrder ?? 0})</span><span class="actions"><button class="edit-cat-btn cta-button secondary" data-id="${cat._id}" data-name="${cat.name}" data-icon="${cat.iconClass || ''}" data-order="${cat.displayOrder ?? 0}">Edit</button> <button class="delete-cat-btn cta-button danger" data-id="${cat._id}">Delete</button></span>`; ul.appendChild(li); }); categoryListDiv.appendChild(ul); } }
        if (categorySelect) { categorySelect.innerHTML = '<option value="">-- Select Category --</option>'; if (categories && categories.length > 0) { categories.forEach(cat => { const option = document.createElement('option'); option.value = cat._id; option.textContent = cat.name; categorySelect.appendChild(option); }); } }
        return categories;
    } catch (error) { console.error("Error in loadCategories:", error); const errorMsg = `<p class="error" style="color: var(--danger-color);">Error loading categories: ${error.message}</p>`; if (categoryListDiv) categoryListDiv.innerHTML = errorMsg; if (categorySelect) categorySelect.innerHTML = '<option value="">-- Error Loading --</option>'; throw error; }
}

// --- Product Functions --- (Use global fetchData)
async function loadProducts() {
     const productListDiv = document.getElementById('product-list'); if (!productListDiv) return; productListDiv.innerHTML = '<p>Loading products...</p>';
     try {
         const products = await fetchData('/products'); // Uses global fetchData
         productListDiv.innerHTML = ''; if (!products || products.length === 0) { productListDiv.innerHTML = '<p>No products found.</p>'; } else { const table = createProductTable(products); productListDiv.appendChild(table); }
         return products;
     } catch (error) { console.error("Error in loadProducts:", error); productListDiv.innerHTML = `<p class="error" style="color: var(--danger-color);">Error loading products: ${error.message}</p>`; throw error; }
}
function createProductTable(products) { // Uses global formatPrice if available
    const table = document.createElement('table'); table.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Order</th><th>Actions</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody');
    products.forEach(prod => { const tr = document.createElement('tr'); tr.dataset.productId = prod._id; const formatPriceFunc = typeof formatPrice === 'function' ? formatPrice : (p) => `${p ?? 'N/A'} VND`; const formattedPrice = prod.price !== null ? formatPriceFunc(prod.price) : 'N/A'; const formattedOriginalPrice = prod.originalPrice ? `<del style="font-size:0.8em; color:grey;">${formatPriceFunc(prod.originalPrice)}</del>` : ''; tr.innerHTML = `<td><img src="${prod.imageUrl || 'images/product-placeholder.png'}" alt="${prod.name}" class="product-thumb"></td><td>${prod.name}</td><td>${prod.category?.name || 'N/A'}</td><td>${formattedPrice} ${formattedOriginalPrice}</td><td>${prod.stockStatus}</td><td>${prod.displayOrder ?? 0}</td><td class="actions"><button class="edit-btn cta-button secondary" data-id="${prod._id}">Edit</button> <button class="delete-btn cta-button danger" data-id="${prod._id}">Delete</button></td>`; tbody.appendChild(tr); }); return table;
}

// --- Form and Action Setup --- (Uses global fetchData in handlers)
function setupAdminForms() {
    const addCategoryForm = document.getElementById('add-category-form'); const categoryListDiv = document.getElementById('category-list'); const editCategoryIdField = document.getElementById('edit-category-id'); const cancelEditCategoryBtn = document.getElementById('cancel-edit-category'); const addProductForm = document.getElementById('add-product-form'); const productListDiv = document.getElementById('product-list'); const cancelEditProductBtn = document.getElementById('cancel-edit-product'); const editProductIdField = document.getElementById('edit-product-id'); const addBalanceForm = document.getElementById('add-balance-form');
    if (addCategoryForm && editCategoryIdField && cancelEditCategoryBtn) { addCategoryForm.addEventListener('submit', async (e) => { e.preventDefault(); const name = document.getElementById('new-cat-name').value; const iconClass = document.getElementById('new-cat-icon').value; const displayOrder = document.getElementById('new-cat-order').value; const isEditing = !!editCategoryIdField.value; const categoryId = editCategoryIdField.value; const url = isEditing ? `/categories/${categoryId}` : '/categories'; const method = isEditing ? 'PUT' : 'POST'; const button = addCategoryForm.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Saving...'; try { await fetchData(url, { method, body: JSON.stringify({ name, iconClass, displayOrder: parseInt(displayOrder || '0', 10) }) }); displayMessage('cat-message', `Category ${isEditing ? 'updated' : 'added'}!`, true); addCategoryForm.reset(); editCategoryIdField.value = ''; cancelEditCategoryBtn.style.display = 'none'; addCategoryForm.querySelector('h3').textContent = 'Add / Edit Category'; await loadCategories(); if (document.getElementById('product-management')) { await loadProducts(); } } catch (error) { displayMessage('cat-message', `Error: ${error.message}`, false); } finally { button.disabled = false; button.textContent = 'Save Category'; } }); cancelEditCategoryBtn.addEventListener('click', () => { addCategoryForm.reset(); editCategoryIdField.value = ''; cancelEditCategoryBtn.style.display = 'none'; addCategoryForm.querySelector('h3').textContent = 'Add / Edit Category'; }); } else if (document.getElementById('category-management')) { console.warn("Category form elements not fully found."); }
    if (addProductForm && editProductIdField && cancelEditProductBtn) { addProductForm.addEventListener('submit', async (e) => { e.preventDefault(); const formData = new FormData(addProductForm); const productData = Object.fromEntries(formData.entries()); const isEditing = !!editProductIdField.value; const productId = editProductIdField.value; productData.price = productData.price ? parseFloat(productData.price) : 0; productData.originalPrice = productData.originalPrice ? parseFloat(productData.originalPrice) : null; productData.tags = productData.tags ? productData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : []; productData.displayOrder = parseInt(productData.displayOrder || '0', 10); const url = isEditing ? `/products/${productId}` : '/products'; const method = isEditing ? 'PUT' : 'POST'; const button = addProductForm.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Saving...'; try { await fetchData(url, { method, body: JSON.stringify(productData) }); displayMessage('product-message', `Product ${isEditing ? 'updated' : 'added'}!`, true); addProductForm.reset(); editProductIdField.value = ''; cancelEditProductBtn.style.display = 'none'; addProductForm.querySelector('h3').textContent = 'Add/Edit Product'; await loadProducts(); } catch (error) { displayMessage('product-message', `Error: ${error.message}`, false); } finally { button.disabled = false; button.textContent = 'Save Product'; } }); cancelEditProductBtn.addEventListener('click', () => { addProductForm.reset(); editProductIdField.value = ''; cancelEditProductBtn.style.display = 'none'; addProductForm.querySelector('h3').textContent = 'Add/Edit Product'; }); } else if (document.getElementById('product-management')) { console.warn("Product form elements not fully found."); }
    if (addBalanceForm) { addBalanceForm.addEventListener('submit', async (e) => { e.preventDefault(); const userIdInput = document.getElementById('balance-user-id').value.trim(); const amount = document.getElementById('balance-amount').value; const button = addBalanceForm.querySelector('button[type="submit"]'); if (!userIdInput || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { displayMessage('balance-message', 'Valid User ID/Username & positive Amount required.', false); return; } button.disabled = true; button.textContent = 'Processing...'; try { const result = await fetchData('/admin/add-balance', { method: 'POST', body: JSON.stringify({ userId: userIdInput, amount: parseFloat(amount) }) }); displayMessage('balance-message', result.message || 'Balance updated!', true); addBalanceForm.reset(); } catch (error) { displayMessage('balance-message', `Error: ${error.message || 'Could not update balance'}`, false); } finally { button.disabled = false; button.textContent = 'Add Balance'; } }); } else if (document.getElementById('balance-management')) { console.warn("Balance form not found."); }
    if (categoryListDiv) categoryListDiv.addEventListener('click', handleCategoryActions); if (productListDiv) productListDiv.addEventListener('click', handleProductActions);
}

// --- Action Handlers --- (Use global fetchData)
function handleCategoryActions(e) { const target = e.target; const catId = target.dataset.id; const addCategoryForm = document.getElementById('add-category-form'); const editCategoryIdField = document.getElementById('edit-category-id'); const cancelEditCategoryBtn = document.getElementById('cancel-edit-category'); if (!addCategoryForm || !editCategoryIdField || !cancelEditCategoryBtn) { console.warn("Cannot handle category action, form elements missing."); return; } if (target.classList.contains('delete-cat-btn') && catId) { const listItem = target.closest('li'); const catName = listItem ? listItem.querySelector('span:first-child')?.textContent.split(' (Order:')[0].trim() : catId; if (confirm(`DELETE Category "${catName}"? Check products first!`)) { fetchData(`/categories/${catId}`, { method: 'DELETE' }).then(() => { displayMessage('cat-message', 'Category deleted.', true); loadCategories(); if (document.getElementById('product-management')) { loadProducts(); } }).catch(error => displayMessage('cat-message', `Error deleting: ${error.message}`, false)); } } else if (target.classList.contains('edit-cat-btn') && catId) { editCategoryIdField.value = catId; document.getElementById('new-cat-name').value = target.dataset.name || ''; document.getElementById('new-cat-icon').value = target.dataset.icon || ''; document.getElementById('new-cat-order').value = target.dataset.order || '0'; addCategoryForm.querySelector('h3').textContent = 'Edit Category'; cancelEditCategoryBtn.style.display = 'inline-block'; addCategoryForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
async function handleProductActions(e) { const target = e.target; const prodId = target.dataset.id; const addProductForm = document.getElementById('add-product-form'); const editProductIdField = document.getElementById('edit-product-id'); const cancelEditProductBtn = document.getElementById('cancel-edit-product'); if (!addProductForm || !editProductIdField || !cancelEditProductBtn) { console.warn("Cannot handle product action, form elements missing."); return; } if (target.classList.contains('delete-btn') && prodId) { const tableRow = target.closest('tr'); const prodName = tableRow ? tableRow.querySelector('td:nth-child(2)')?.textContent.trim() : prodId; if (confirm(`DELETE Product "${prodName}"?`)) { try { await fetchData(`/products/${prodId}`, { method: 'DELETE' }); displayMessage('product-message', 'Product deleted.', true); loadProducts(); } catch (error) { displayMessage('product-message', `Error deleting: ${error.message}`, false); } } } else if (target.classList.contains('edit-btn') && prodId) { try { const product = await fetchData(`/products/${prodId}`); if (!product) throw new Error('Product data not found'); editProductIdField.value = product._id; document.getElementById('product-name').value = product.name || ''; document.getElementById('product-category').value = product.category?._id || ''; document.getElementById('product-price').value = product.price ?? ''; document.getElementById('product-original-price').value = product.originalPrice ?? ''; document.getElementById('product-image').value = product.imageUrl || ''; document.getElementById('product-tags').value = product.tags?.join(', ') || ''; document.getElementById('product-stock').value = product.stockStatus || 'in_stock'; document.getElementById('product-order').value = product.displayOrder ?? 0; document.getElementById('product-description').value = product.description || ''; addProductForm.querySelector('h3').textContent = 'Edit Product'; cancelEditProductBtn.style.display = 'inline-block'; addProductForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (error) { displayMessage('product-message', `Error loading product for edit: ${error.message}`, false); } } }