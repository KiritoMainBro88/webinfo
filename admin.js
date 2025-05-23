console.log("Admin script version 1.2.3 running!"); // Update log

// No need to define BACKEND_URL here, rely on the global one from script.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize admin panel functionality AFTER the main DOM is ready
    // This ensures script.js (defining fetchData, formatPrice etc.) has loaded and parsed.
    initializeAdminPanel();
});

function initializeAdminPanel() {
    console.log("Initializing Admin Panel Content...");
    const adminContent = document.getElementById('admin-content');
    const authCheckDiv = document.getElementById('admin-auth-check');

    // Simplified Auth Check (Still Insecure Demo)
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

    // Dependency Check
    if (typeof fetchData !== 'function' || typeof formatPrice !== 'function') {
         console.error("FATAL: Essential functions (fetchData/formatPrice) from script.js not found. Ensure script.js is loaded correctly before admin.js.");
         if(adminContent) { adminContent.innerHTML = '<p class="error" style="padding: 2rem; text-align: center;">Critical Error: Admin functions cannot load. Please check the browser console.</p>'; adminContent.style.display = 'block'; }
         if(authCheckDiv) authCheckDiv.style.display = 'none';
         return;
    }

    // Load data and setup forms based on which admin page we are on
    if (document.getElementById('category-management')) {
        loadCategories().then(() => {
            if (document.getElementById('product-management')) { loadProducts(); }
        }).catch(error => {
            console.error("Error loading categories, subsequent loads might be affected:", error);
            if (document.getElementById('product-management')) { loadProducts(); }
        });
    } else if (document.getElementById('product-management')) {
        loadCategories().then(() => loadProducts()).catch(e => console.error("Error loading initial product data:", e));
    } else if (document.getElementById('balance-management')) {
        // No initial data load needed for balance page specifically
    }

    setupAdminForms(); // Setup form listeners regardless of initial data load success
}


function displayMessage(elementId, message, isSuccess) {
    const el = document.getElementById(elementId);
    if (!el) { console.warn(`Display message element not found: ${elementId}`); return; }
    el.textContent = message;
    el.className = 'admin-message ' + (isSuccess ? 'success' : 'error');
    el.style.display = 'block';
    setTimeout(() => { if (el.textContent === message) { el.textContent = ''; el.style.display = 'none'; } }, 5000);
}

// --- Category Functions ---
async function loadCategories() {
    const categoryListDiv = document.getElementById('category-list');
    const categorySelect = document.querySelector('#product-category'); // For product form

    if (categoryListDiv) categoryListDiv.innerHTML = '<p>Loading categories...</p>';
    if (categorySelect) categorySelect.innerHTML = '<option value="">-- Loading --</option>';

    try {
        const categories = await fetchData('/categories'); // Use global fetchData

        if (categoryListDiv) {
            categoryListDiv.innerHTML = '';
            if (!categories || categories.length === 0) { categoryListDiv.innerHTML = '<p>No categories found.</p>'; }
            else {
                const ul = document.createElement('ul');
                categories.forEach(cat => {
                    const li = document.createElement('li'); li.dataset.categoryId = cat._id;
                    // Include slug in display for admin reference
                    li.innerHTML = `<span><i class="${cat.iconClass || 'fas fa-tag'}"></i> ${cat.name} (Slug: ${cat.slug || 'N/A'}, Order: ${cat.displayOrder ?? 0})</span>
                        <span class="actions">
                            <button class="edit-cat-btn cta-button secondary" data-id="${cat._id}" data-name="${cat.name}" data-slug="${cat.slug || ''}" data-icon="${cat.iconClass || ''}" data-order="${cat.displayOrder ?? 0}">Edit</button>
                            <button class="delete-cat-btn cta-button danger" data-id="${cat._id}">Delete</button>
                        </span>`;
                    ul.appendChild(li);
                });
                categoryListDiv.appendChild(ul);
            }
        }

        if (categorySelect) {
             categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
             if (categories && categories.length > 0) {
                 categories.forEach(cat => { const option = document.createElement('option'); option.value = cat._id; option.textContent = cat.name; categorySelect.appendChild(option); });
             }
        }
        return categories;
    } catch (error) { console.error("Error in loadCategories:", error); const errorMsg = `<p class="error" style="color: var(--danger-color);">Error loading categories: ${error.message}</p>`; if (categoryListDiv) categoryListDiv.innerHTML = errorMsg; if (categorySelect) categorySelect.innerHTML = '<option value="">-- Error Loading --</option>'; throw error; }
}

// --- Product Functions ---
async function loadProducts() {
     const productListDiv = document.getElementById('product-list'); if (!productListDiv) return; productListDiv.innerHTML = '<p>Loading products...</p>';
     try {
         const apiResponse = await fetchData('/products'); // Fetch structure might have changed
         const products = apiResponse.products || apiResponse; // Adapt if response wraps products

         productListDiv.innerHTML = '';
         if (!products || !Array.isArray(products) || products.length === 0) { // Add type check
             productListDiv.innerHTML = '<p>No products found.</p>';
         } else {
             const table = createProductTable(products); productListDiv.appendChild(table);
         }
         return products;
     } catch (error) { console.error("Error in loadProducts:", error); productListDiv.innerHTML = `<p class="error" style="color: var(--danger-color);">Error loading products: ${error.message}</p>`; throw error; }
}

function createProductTable(products) {
    const table = document.createElement('table');
    // Add Brand column
    table.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Order</th><th>Actions</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    products.forEach(prod => {
        const tr = document.createElement('tr'); tr.dataset.productId = prod._id;
        const formatPriceFunc = typeof formatPrice === 'function' ? formatPrice : (p) => `${p ?? 'N/A'} VND`;
        const formattedPrice = prod.price !== null ? formatPriceFunc(prod.price) : 'N/A';
        const formattedOriginalPrice = prod.originalPrice ? `<del style="font-size:0.8em; color:grey;">${formatPriceFunc(prod.originalPrice)}</del>` : '';
        tr.innerHTML = `
            <td><img src="${prod.imageUrl || 'images/product-placeholder.png'}" alt="${prod.name}" class="product-thumb"></td>
            <td>${prod.name}</td>
            <td>${prod.brand || '-'}</td> <!-- Display Brand -->
            <td>${prod.category?.name || 'N/A'}</td>
            <td>${formattedPrice} ${formattedOriginalPrice}</td>
            <td>${prod.stockStatus}</td>
            <td>${prod.displayOrder ?? 0}</td>
            <td class="actions">
                <button class="edit-btn cta-button secondary" data-id="${prod._id}">Edit</button>
                <button class="delete-btn cta-button danger" data-id="${prod._id}">Delete</button>
            </td>`;
        tbody.appendChild(tr);
     });
     return table;
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
    if (addCategoryForm && editCategoryIdField && cancelEditCategoryBtn) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();

            // Append regular fields
            formData.append('name', document.getElementById('new-cat-name').value);
            formData.append('iconClass', document.getElementById('new-cat-icon').value);
            formData.append('displayOrder', parseInt(document.getElementById('new-cat-order').value || '0', 10));

            // Append the file if selected
            const iconFile = document.getElementById('category-icon-upload').files[0];
            if (iconFile) {
                // Validate file size (1MB limit)
                if (iconFile.size > 1024 * 1024) {
                    displayMessage('cat-message', 'Icon image must be less than 1MB', false);
                    return;
                }
                // Validate file type
                if (!['image/png', 'image/jpeg', 'image/webp'].includes(iconFile.type)) {
                    displayMessage('cat-message', 'Icon must be PNG, JPG, or WEBP format', false);
                    return;
                }
                console.log("Appending category icon file:", iconFile.name);
                formData.append('categoryIconImage', iconFile);
            }

            const isEditing = !!editCategoryIdField.value;
            const categoryId = editCategoryIdField.value;
            const url = isEditing ? `/categories/${categoryId}` : '/categories';
            const method = isEditing ? 'PUT' : 'POST';
            const button = addCategoryForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.textContent = 'Saving...';

            try {
                await fetchData(url, { 
                    method, 
                    body: formData,
                    // Don't set Content-Type header - browser will set it with boundary for FormData
                    headers: {} 
                });
                displayMessage('cat-message', `Category ${isEditing ? 'updated' : 'added'}!`, true);
                addCategoryForm.reset();
                editCategoryIdField.value = '';
                cancelEditCategoryBtn.style.display = 'none';
                addCategoryForm.querySelector('h3').textContent = 'Add / Edit Category';
                await loadCategories();
                if (document.getElementById('product-management')) {
                    await loadProducts();
                }
            } catch (error) {
                displayMessage('cat-message', `Error: ${error.message}`, false);
            } finally {
                button.disabled = false;
                button.textContent = 'Save Category';
            }
        });
        cancelEditCategoryBtn.addEventListener('click', () => {
            addCategoryForm.reset(); editCategoryIdField.value = ''; cancelEditCategoryBtn.style.display = 'none'; addCategoryForm.querySelector('h3').textContent = 'Add / Edit Category';
        });
    } else if (document.getElementById('category-management')) { console.warn("Category form elements not fully found."); }

    // Add/Edit Product Handler
    if (addProductForm && editProductIdField && cancelEditProductBtn) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();

            // Append all text fields
            formData.append('name', document.getElementById('product-name').value);
            formData.append('category', document.getElementById('product-category').value);
            formData.append('price', document.getElementById('product-price').value || '0');
            formData.append('originalPrice', document.getElementById('product-original-price').value || '');
            formData.append('brand', document.getElementById('product-brand').value || '');
            formData.append('imageUrl', document.getElementById('product-image').value || '');
            formData.append('tags', document.getElementById('product-tags').value || '');
            formData.append('stockStatus', document.getElementById('product-stock').value);
            formData.append('displayOrder', document.getElementById('product-order').value || '0');
            formData.append('description', document.getElementById('product-description').value || '');

            // Handle file upload
            const imageFile = document.getElementById('product-image-upload').files[0];
            if (imageFile) {
                // Validate file size (2MB limit)
                if (imageFile.size > 2 * 1024 * 1024) {
                    displayMessage('product-message', 'Product image must be less than 2MB', false);
                    return;
                }
                // Validate file type
                if (!['image/png', 'image/jpeg', 'image/webp'].includes(imageFile.type)) {
                    displayMessage('product-message', 'Image must be PNG, JPG, or WEBP format', false);
                    return;
                }
                console.log("Appending product image file:", imageFile.name);
                formData.append('productImage', imageFile);
            }

            const isEditing = !!editProductIdField.value;
            const productId = editProductIdField.value;
            const url = isEditing ? `/products/${productId}` : '/products';
            const method = isEditing ? 'PUT' : 'POST';
            const button = addProductForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.textContent = 'Saving...';

            try {
                await fetchData(url, { 
                    method, 
                    body: formData,
                    // Don't set Content-Type header - browser will set it with boundary for FormData
                    headers: {} 
                });
                displayMessage('product-message', `Product ${isEditing ? 'updated' : 'added'}!`, true);
                addProductForm.reset();
                editProductIdField.value = '';
                cancelEditProductBtn.style.display = 'none';
                addProductForm.querySelector('h3').textContent = 'Add/Edit Product';
                await loadProducts();
            } catch (error) {
                displayMessage('product-message', `Error: ${error.message}`, false);
            } finally {
                button.disabled = false;
                button.textContent = 'Save Product';
            }
        });
        cancelEditProductBtn.addEventListener('click', () => { addProductForm.reset(); editProductIdField.value = ''; cancelEditProductBtn.style.display = 'none'; addProductForm.querySelector('h3').textContent = 'Add/Edit Product'; });
    } else if (document.getElementById('product-management')) { console.warn("Product form elements not fully found."); }

     // Add Balance Form Handler (No change needed)
     if (addBalanceForm) { addBalanceForm.addEventListener('submit', async (e) => { e.preventDefault(); const userIdInput = document.getElementById('balance-user-id').value.trim(); const amount = document.getElementById('balance-amount').value; const button = addBalanceForm.querySelector('button[type="submit"]'); if (!userIdInput || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { displayMessage('balance-message', 'Valid User ID/Username & positive Amount required.', false); return; } button.disabled = true; button.textContent = 'Processing...'; try { const result = await fetchData('/admin/add-balance', { method: 'POST', body: JSON.stringify({ userId: userIdInput, amount: parseFloat(amount) }) }); displayMessage('balance-message', result.message || 'Balance updated!', true); addBalanceForm.reset(); } catch (error) { displayMessage('balance-message', `Error: ${error.message || 'Could not update balance'}`, false); } finally { button.disabled = false; button.textContent = 'Add Balance'; } }); } else if (document.getElementById('balance-management')) { console.warn("Balance form not found."); }

    // Event Delegation for Edit/Delete Buttons
    if (categoryListDiv) categoryListDiv.addEventListener('click', handleCategoryActions);
    if (productListDiv) productListDiv.addEventListener('click', handleProductActions);
}

// --- Action Handlers ---
function handleCategoryActions(e) {
    const target = e.target; const catId = target.dataset.id; const addCategoryForm = document.getElementById('add-category-form'); const editCategoryIdField = document.getElementById('edit-category-id'); const cancelEditCategoryBtn = document.getElementById('cancel-edit-category');
    if (!addCategoryForm || !editCategoryIdField || !cancelEditCategoryBtn) { console.warn("Cannot handle category action, form elements missing."); return; }

    if (target.classList.contains('delete-cat-btn') && catId) {
        const listItem = target.closest('li'); const catName = listItem ? listItem.querySelector('span:first-child')?.textContent.split(' (Slug:')[0].trim() : catId;
        if (confirm(`DELETE Category "${catName}"? Check products first!`)) { fetchData(`/categories/${catId}`, { method: 'DELETE' }).then(async () => { displayMessage('cat-message', 'Category deleted.', true); await loadCategories(); if (document.getElementById('product-management')) { await loadProducts(); } }).catch(error => displayMessage('cat-message', `Error deleting: ${error.message}`, false)); }
    }
    else if (target.classList.contains('edit-cat-btn') && catId) {
        editCategoryIdField.value = catId;
        document.getElementById('new-cat-name').value = target.dataset.name || '';
        document.getElementById('new-cat-slug').value = target.dataset.slug || ''; // Populate slug field
        document.getElementById('new-cat-icon').value = target.dataset.icon || '';
        document.getElementById('new-cat-order').value = target.dataset.order || '0';
        addCategoryForm.querySelector('h3').textContent = 'Edit Category'; cancelEditCategoryBtn.style.display = 'inline-block'; addCategoryForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
async function handleProductActions(e) {
     const target = e.target; 
     const prodId = target.dataset.id; 
     const addProductForm = document.getElementById('add-product-form'); 
     const editProductIdField = document.getElementById('edit-product-id'); 
     const cancelEditProductBtn = document.getElementById('cancel-edit-product');
     
     if (!addProductForm || !editProductIdField || !cancelEditProductBtn) { 
         console.warn("Cannot handle product action, form elements missing."); 
         return; 
     }

     if (target.classList.contains('delete-btn') && prodId) {
         const tableRow = target.closest('tr'); 
         const prodName = tableRow ? tableRow.querySelector('td:nth-child(2)')?.textContent.trim() : prodId;
         
         if (confirm(`DELETE Product "${prodName}"?`)) { 
             try {
                 const response = await fetchData(`/products/${prodId}`, { 
                     method: 'DELETE',
                     headers: {
                         'Content-Type': 'application/json'
                     }
                 });
                 displayMessage('product-message', 'Product deleted successfully.', true);
                 await loadProducts(); // Reload the product list
             } catch (error) {
                 console.error("Error deleting product:", error);
                 displayMessage('product-message', `Error deleting: ${error.message}`, false);
             }
         }
     }
     else if (target.classList.contains('edit-btn') && prodId) {
        console.log(`Attempting to edit product ID: ${prodId}`);
        try {
            const product = await fetchData(`/products/${prodId}`); 
            console.log("Fetched product data for edit:", product);
            if (!product) throw new Error('Product data not found or invalid structure');
            
            editProductIdField.value = product._id;
            document.getElementById('product-name').value = product.name || '';
            document.getElementById('product-brand').value = product.brand || '';
            document.getElementById('product-category').value = product.category?._id || '';
            document.getElementById('product-price').value = product.price ?? '';
            document.getElementById('product-original-price').value = product.originalPrice ?? '';
            document.getElementById('product-image').value = product.imageUrl || '';
            document.getElementById('product-tags').value = product.tags?.join(', ') || '';
            document.getElementById('product-stock').value = product.stockStatus || 'in_stock';
            document.getElementById('product-order').value = product.displayOrder ?? 0;
            document.getElementById('product-description').value = product.description || '';
            addProductForm.querySelector('h3').textContent = 'Edit Product';
            cancelEditProductBtn.style.display = 'inline-block';
            addProductForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            displayMessage('product-message', `Error loading product for edit: ${error.message}`, false);
        }
     }
}