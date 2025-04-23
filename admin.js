console.log("Admin script version 1.1 running!"); // Update log

document.addEventListener('DOMContentLoaded', () => {
    const adminContent = document.getElementById('admin-content');
    const authCheckDiv = document.getElementById('admin-auth-check');

    // --- INSECURE ADMIN ACCESS CHECK FOR DEMO ---
    const userId = localStorage.getItem('userId');
    if (!userId) {
        authCheckDiv.innerHTML = '<p class="error">Access Denied. Please log in via the main site first.</p>';
        authCheckDiv.style.display = 'block';
        adminContent.style.display = 'none';
        return;
    } else {
        // TODO: Replace this with a real backend call to verify admin status using userId or a token
        console.warn("SECURITY RISK: Displaying admin panel based only on login status. Implement backend admin verification!");
        authCheckDiv.style.display = 'none';
        adminContent.style.display = 'block';
        initializeAdminPanel();
    }
});

function initializeAdminPanel() {
    console.log("Initializing Admin Panel...");
    if (typeof fetchData !== 'function') {
         console.error("FATAL: fetchData function not found in admin.js. Ensure script.js with fetchData is loaded first or copy fetchData here.");
         alert("A critical error occurred loading the admin panel (fetchData missing). Check console.");
         return;
    }
    loadCategories();
    loadProducts();
    setupAdminForms();
}

function displayMessage(elementId, message, isSuccess) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = 'admin-message ' + (isSuccess ? 'success' : 'error');
    el.style.display = 'block';
    setTimeout(() => { el.textContent = ''; el.style.display = 'none'; }, 5000);
}

// --- Category Functions ---
async function loadCategories() {
    const categoryListDiv = document.getElementById('category-list');
    const categorySelect = document.querySelector('#product-category');
    if (!categoryListDiv || !categorySelect) return;
    categoryListDiv.innerHTML = '<p>Loading categories...</p>';
    categorySelect.innerHTML = '<option value="">-- Loading --</option>';
    try {
        const categories = await fetchData('/categories');
        categoryListDiv.innerHTML = '';
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        if (categories.length === 0) { categoryListDiv.innerHTML = '<p>No categories found.</p>'; }
        else {
            const ul = document.createElement('ul');
            categories.forEach(cat => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span><i class="${cat.iconClass || 'fas fa-tag'}"></i> ${cat.name} (Order: ${cat.displayOrder ?? 0})</span>
                    <span class="actions">
                         <button class="edit-cat-btn cta-button secondary" data-id="${cat._id}" data-name="${cat.name}" data-icon="${cat.iconClass || ''}" data-order="${cat.displayOrder ?? 0}">Edit</button>
                         <button class="delete-cat-btn cta-button danger" data-id="${cat._id}">Delete</button>
                    </span>`;
                ul.appendChild(li);
                const option = document.createElement('option'); option.value = cat._id; option.textContent = cat.name; categorySelect.appendChild(option);
            });
            categoryListDiv.appendChild(ul);
        }
    } catch (error) { categoryListDiv.innerHTML = `<p class="error">Error loading categories: ${error.message}</p>`; categorySelect.innerHTML = '<option value="">-- Error Loading --</option>'; }
}

// --- Product Functions ---
async function loadProducts() {
     const productListDiv = document.getElementById('product-list'); if (!productListDiv) return; productListDiv.innerHTML = '<p>Loading products...</p>';
     try {
         const products = await fetchData('/products'); productListDiv.innerHTML = '';
          if (products.length === 0) { productListDiv.innerHTML = '<p>No products found.</p>'; }
          else { const table = createProductTable(products); productListDiv.appendChild(table); }
     } catch (error) { productListDiv.innerHTML = `<p class="error">Error loading products: ${error.message}</p>`; }
 }

function createProductTable(products) {
    const table = document.createElement('table'); table.innerHTML = `<thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Order</th><th>Actions</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody');
    products.forEach(prod => {
        const tr = document.createElement('tr'); const formattedPrice = prod.price !== null ? formatPrice(prod.price) : 'N/A'; const formattedOriginalPrice = prod.originalPrice ? `<del style="font-size:0.8em; color:grey;">${formatPrice(prod.originalPrice)}</del>` : '';
        tr.innerHTML = `
            <td><img src="${prod.imageUrl || 'images/product-placeholder.png'}" alt="${prod.name}" class="product-thumb"></td>
            <td>${prod.name}</td>
            <td>${prod.category?.name || 'N/A'}</td>
            <td>${formattedPrice} ${formattedOriginalPrice}</td>
            <td>${prod.stockStatus}</td>
            <td>${prod.displayOrder ?? 0}</td>
            <td class="actions"> <button class="edit-btn" data-id="${prod._id}">Edit</button> <button class="delete-btn" data-id="${prod._id}">Delete</button> </td>`;
         tbody.appendChild(tr);
    }); return table;
}

// --- Form and Action Setup ---
function setupAdminForms() {
    const addCategoryForm = document.getElementById('add-category-form');
    const categoryListDiv = document.getElementById('category-list');
    const editCategoryIdField = document.getElementById('edit-category-id'); // Hidden field for category edit ID
    const cancelEditCategoryBtn = document.getElementById('cancel-edit-category');

    const addProductForm = document.getElementById('add-product-form');
    const productListDiv = document.getElementById('product-list');
    const cancelEditProductBtn = document.getElementById('cancel-edit-product');
    const editProductIdField = document.getElementById('edit-product-id');

    const addBalanceForm = document.getElementById('add-balance-form');

    // Add/Edit Category Handler
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-cat-name').value;
            const iconClass = document.getElementById('new-cat-icon').value;
            const displayOrder = document.getElementById('new-cat-order').value;
            const isEditing = !!editCategoryIdField.value;
            const categoryId = editCategoryIdField.value;

            const url = isEditing ? `/categories/${categoryId}` : '/categories';
            const method = isEditing ? 'PUT' : 'POST';
            const button = addCategoryForm.querySelector('button[type="submit"]');
            button.disabled = true; button.textContent = 'Saving...';

            try {
                await fetchData(url, {
                    method,
                    body: JSON.stringify({ name, iconClass, displayOrder: parseInt(displayOrder, 10) })
                });
                displayMessage('cat-message', `Category ${isEditing ? 'updated' : 'added'} successfully!`, true);
                addCategoryForm.reset(); // Reset form
                editCategoryIdField.value = ''; // Clear edit ID
                cancelEditCategoryBtn.style.display = 'none'; // Hide cancel button
                addCategoryForm.querySelector('h3').textContent = 'Add New Category'; // Reset title
                loadCategories(); // Refresh list & dropdown
            } catch (error) {
                displayMessage('cat-message', `Error: ${error.message}`, false);
            } finally {
                 button.disabled = false; button.textContent = 'Save Category';
            }
        });
    }

     // Cancel Edit Category
    if (cancelEditCategoryBtn) {
        cancelEditCategoryBtn.addEventListener('click', () => {
            addCategoryForm.reset();
            editCategoryIdField.value = '';
            cancelEditCategoryBtn.style.display = 'none';
            addCategoryForm.querySelector('h3').textContent = 'Add New Category';
        });
    }


    // Add/Update Product Handler (Remains Largely the Same)
    if (addProductForm) {
         addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault(); const formData = new FormData(addProductForm); const productData = Object.fromEntries(formData.entries()); const isEditing = !!editProductIdField.value; const productId = editProductIdField.value; productData.price = parseFloat(productData.price); productData.originalPrice = productData.originalPrice ? parseFloat(productData.originalPrice) : null; productData.tags = productData.tags ? productData.tags.split(',').map(tag => tag.trim().toLowerCase()) : []; productData.displayOrder = parseInt(productData.displayOrder || '0', 10); const url = isEditing ? `/products/${productId}` : '/products'; const method = isEditing ? 'PUT' : 'POST'; const button = addProductForm.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Saving...';
            try {
                 await fetchData(url, { method, body: JSON.stringify(productData) });
                 displayMessage('product-message', `Product ${isEditing ? 'updated' : 'added'}!`, true);
                 addProductForm.reset(); editProductIdField.value = ''; cancelEditProductBtn.style.display = 'none'; addProductForm.querySelector('h3').textContent = 'Add/Edit Product';
                 loadProducts();
            } catch (error) { displayMessage('product-message', `Error: ${error.message}`, false); }
            finally { button.disabled = false; button.textContent = 'Save Product'; }
         });
    }

    // Cancel Edit Product
    if (cancelEditProductBtn) { cancelEditProductBtn.addEventListener('click', () => { addProductForm.reset(); editProductIdField.value = ''; cancelEditProductBtn.style.display = 'none'; addProductForm.querySelector('h3').textContent = 'Add/Edit Product'; }); }

     // Add Balance Form Handler
     if (addBalanceForm) {
        addBalanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userIdInput = document.getElementById('balance-user-id').value.trim(); // Can be username or ID
            const amount = document.getElementById('balance-amount').value;
            const button = addBalanceForm.querySelector('button[type="submit"]');
            if (!userIdInput || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { displayMessage('balance-message', 'Valid User ID/Username & positive Amount required.', false); return; }
            button.disabled = true; button.textContent = 'Processing...';
            try {
                // IMPORTANT: Create POST /api/admin/add-balance on backend
                const result = await fetchData('/admin/add-balance', { method: 'POST', body: JSON.stringify({ userId: userIdInput, amount: parseFloat(amount) }) });
                displayMessage('balance-message', result.message || 'Balance updated!', true);
                addBalanceForm.reset();
            } catch (error) { displayMessage('balance-message', `Error: ${error.message || 'Could not update balance'}`, false); }
            finally { button.disabled = false; button.textContent = 'Add Balance'; }
        });
    }

    // Event Delegation for Edit/Delete Buttons
    if (categoryListDiv) { categoryListDiv.addEventListener('click', handleCategoryActions); }
     if (productListDiv) { productListDiv.addEventListener('click', handleProductActions); }
}

// --- Action Handlers ---

function handleCategoryActions(e) { // Modified to handle edit state
    const target = e.target;
    const catId = target.dataset.id;
    const addCategoryForm = document.getElementById('add-category-form');
    const editCategoryIdField = document.getElementById('edit-category-id');
    const cancelEditCategoryBtn = document.getElementById('cancel-edit-category');

    if (target.classList.contains('delete-cat-btn')) {
        if (confirm(`DELETE Category ${catId}? Check if products use it first!`)) {
            fetchData(`/categories/${catId}`, { method: 'DELETE' })
                .then(() => { displayMessage('cat-message', 'Category deleted.', true); loadCategories(); loadProducts(); }) // Refresh both
                .catch(error => displayMessage('cat-message', `Error deleting: ${error.message}`, false));
        }
    } else if (target.classList.contains('edit-cat-btn')) {
        // Populate the add form for editing
        editCategoryIdField.value = catId; // Set the hidden ID field
        document.getElementById('new-cat-name').value = target.dataset.name || '';
        document.getElementById('new-cat-icon').value = target.dataset.icon || '';
        document.getElementById('new-cat-order').value = target.dataset.order || '0';
        addCategoryForm.querySelector('h3').textContent = 'Edit Category'; // Change form title
        cancelEditCategoryBtn.style.display = 'inline-block'; // Show cancel button
        addCategoryForm.scrollIntoView({ behavior: 'smooth' });
    }
}

async function handleProductActions(e) { // Modified to populate edit form
     const target = e.target;
     const prodId = target.dataset.id;
     const addProductForm = document.getElementById('add-product-form');
     const editProductIdField = document.getElementById('edit-product-id');
     const cancelEditProductBtn = document.getElementById('cancel-edit-product');


     if (target.classList.contains('delete-btn')) {
        if (confirm(`DELETE Product ${prodId}? This cannot be undone.`)) {
            try { await fetchData(`/products/${prodId}`, { method: 'DELETE' }); displayMessage('product-message', 'Product deleted.', true); loadProducts(); } catch (error) { displayMessage('product-message', `Error deleting: ${error.message}`, false); }
        }
    } else if (target.classList.contains('edit-btn')) {
         try {
            const product = await fetchData(`/products/${prodId}`); if (!product) throw new Error('Product data not found');
            editProductIdField.value = product._id;
            document.getElementById('product-name').value = product.name || '';
            document.getElementById('product-category').value = product.category?._id || ''; // Set dropdown value
            document.getElementById('product-price').value = product.price ?? '';
            document.getElementById('product-original-price').value = product.originalPrice ?? '';
            document.getElementById('product-image').value = product.imageUrl || '';
            document.getElementById('product-tags').value = product.tags?.join(', ') || '';
            document.getElementById('product-stock').value = product.stockStatus || 'in_stock';
            document.getElementById('product-order').value = product.displayOrder ?? 0;
            document.getElementById('product-description').value = product.description || '';
            addProductForm.querySelector('h3').textContent = 'Edit Product';
            cancelEditProductBtn.style.display = 'inline-block';
            addProductForm.scrollIntoView({ behavior: 'smooth' });
         } catch (error) { displayMessage('product-message', `Error loading product for edit: ${error.message}`, false); }
    }
}


// Helper function to format price
function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }