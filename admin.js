console.log("Admin script loading...");

document.addEventListener('DOMContentLoaded', () => {
    const adminContent = document.getElementById('admin-content');
    const authCheckDiv = document.getElementById('admin-auth-check');
    const API_BASE = 'https://webinfo-zbkq.onrender.com/api'; // Your backend URL

    // --- VERY BASIC Auth Check (Replace with real token verification) ---
    const userId = localStorage.getItem('userId');
    // In a real app, you'd send a token to a /api/auth/verifyAdmin endpoint
    // For now, we just check if logged in. THIS IS NOT SECURE.
    if (!userId) {
        authCheckDiv.innerHTML = '<p class="error">Access Denied. Please log in as admin via the main site.</p>';
        // Optionally redirect: setTimeout(() => window.location.href = 'index.html', 3000);
        return;
    } else {
        // Assume logged-in user might be admin for demo structure
        // A backend check is essential in reality.
        console.warn("Performing only frontend check for login status. Backend admin verification is required for security.");
        authCheckDiv.style.display = 'none';
        adminContent.style.display = 'block';
        initializeAdminPanel();
    }
});

function initializeAdminPanel() {
    console.log("Initializing Admin Panel...");
    loadCategories();
    loadProducts();
    setupAdminForms();
}


async function fetchData(endpoint, options = {}) {
    const API_BASE = 'https://webinfo-zbkq.onrender.com/api';
    const url = `${API_BASE}${endpoint}`;

    // --- Add Authorization Header (CONCEPTUAL - Needs real token) ---
    // This is where you would get your secure token (e.g., JWT)
    // const token = localStorage.getItem('authToken'); // Assuming you store a token
     const tempUserId = localStorage.getItem('userId'); // INSECURE temporary way
    options.headers = {
        'Content-Type': 'application/json', // Assume JSON for POST/PUT
        ...options.headers,
        // Add Authorization header if you have a token strategy
        // 'Authorization': `Bearer ${token}`,
        'X-Temp-UserId': tempUserId || '' // INSECURE temporary header for demo middleware
    };
    // --- End Auth Header ---

    try {
        const response = await fetch(url, options);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            console.error(`API Error (${response.status}) on ${endpoint}:`, error);
            throw new Error(error);
        }
        return data;
    } catch (error) {
        console.error(`Network or Fetch Error on ${endpoint}:`, error);
        throw error; // Re-throw for caller handling
    }
}

function displayMessage(elementId, message, isSuccess) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = 'admin-message ' + (isSuccess ? 'success' : 'error');
    el.style.display = 'block'; // Make sure it's visible
    setTimeout(() => {
        el.textContent = '';
        el.style.display = 'none'; // Hide it again
     }, 5000); // Clear after 5s
}

// --- Category Functions ---
async function loadCategories() {
    const categoryListDiv = document.getElementById('category-list');
    const categorySelect = document.querySelector('#product-category'); // For product form
    if (!categoryListDiv || !categorySelect) return;

    categoryListDiv.innerHTML = '<p>Loading categories...</p>';
    categorySelect.innerHTML = '<option value="">-- Loading --</option>';
    try {
        const categories = await fetchData('/categories');
        categoryListDiv.innerHTML = ''; // Clear loading
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';

        if (categories.length === 0) {
            categoryListDiv.innerHTML = '<p>No categories found.</p>';
        } else {
            const ul = document.createElement('ul');
            categories.forEach(cat => {
                // Populate list for display/editing
                const li = document.createElement('li');
                li.innerHTML = `
                    <span><i class="${cat.iconClass || 'fas fa-tag'}"></i> ${cat.name} (Order: ${cat.displayOrder})</span>
                    <span class="actions">
                        <button class="edit-cat-btn cta-button secondary" data-id="${cat._id}" data-name="${cat.name}" data-icon="${cat.iconClass || ''}" data-order="${cat.displayOrder}">Edit</button>
                        <button class="delete-cat-btn cta-button danger" data-id="${cat._id}">Delete</button>
                    </span>
                `;
                ul.appendChild(li);

                // Populate select dropdown
                const option = document.createElement('option');
                option.value = cat._id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
            categoryListDiv.appendChild(ul);
        }
    } catch (error) {
         categoryListDiv.innerHTML = `<p class="error">Error loading categories: ${error.message}</p>`;
         categorySelect.innerHTML = '<option value="">-- Error Loading --</option>';
    }
}

// --- Product Functions ---
async function loadProducts() {
     const productListDiv = document.getElementById('product-list');
     if (!productListDiv) return;
     productListDiv.innerHTML = '<p>Loading products...</p>';
     try {
         const products = await fetchData('/products'); // Fetches all products with category populated
         productListDiv.innerHTML = '';
          if (products.length === 0) {
            productListDiv.innerHTML = '<p>No products found.</p>';
         } else {
             const table = createProductTable(products);
             productListDiv.appendChild(table);
         }

     } catch (error) {
         productListDiv.innerHTML = `<p class="error">Error loading products: ${error.message}</p>`;
     }
 }

function createProductTable(products) {
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Order</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    products.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${prod.imageUrl || 'images/product-placeholder.png'}" alt="${prod.name}" class="product-thumb"></td>
            <td>${prod.name}</td>
            <td>${prod.category?.name || 'N/A'}</td>
            <td>${formatPrice(prod.price)} ${prod.originalPrice ? `<del style="font-size:0.8em; color:grey;">${formatPrice(prod.originalPrice)}</del>` : ''}</td>
            <td>${prod.stockStatus}</td>
            <td>${prod.displayOrder}</td>
            <td class="actions">
                <button class="edit-btn" data-id="${prod._id}">Edit</button>
                <button class="delete-btn" data-id="${prod._id}">Delete</button>
            </td>
        `;
         tbody.appendChild(tr);
    });
    return table;
}

// --- Form and Action Setup ---
function setupAdminForms() {
    const addCategoryForm = document.getElementById('add-category-form');
    const addProductForm = document.getElementById('add-product-form');
    const productListDiv = document.getElementById('product-list');
    const categoryListDiv = document.getElementById('category-list');
    const cancelEditBtn = document.getElementById('cancel-edit-product');
    const editProductIdField = document.getElementById('edit-product-id');

    // Add Category
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-cat-name').value;
            const iconClass = document.getElementById('new-cat-icon').value;
            const displayOrder = document.getElementById('new-cat-order').value;
            const button = addCategoryForm.querySelector('button[type="submit"]');
            button.disabled = true; button.textContent = 'Saving...';

            try {
                await fetchData('/categories', {
                    method: 'POST',
                    body: JSON.stringify({ name, iconClass, displayOrder: parseInt(displayOrder, 10) })
                });
                displayMessage('cat-message', 'Category added successfully!', true);
                addCategoryForm.reset();
                loadCategories(); // Refresh lists
            } catch (error) {
                displayMessage('cat-message', `Error: ${error.message}`, false);
            } finally {
                 button.disabled = false; button.textContent = 'Add Category';
            }
        });
    }

    // Add/Update Product
    if (addProductForm) {
         addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addProductForm);
            const productData = Object.fromEntries(formData.entries());
            const isEditing = !!editProductIdField.value;
            const productId = editProductIdField.value;

            // Prepare data
            productData.price = parseFloat(productData.price);
            productData.originalPrice = productData.originalPrice ? parseFloat(productData.originalPrice) : null; // Use null if empty
            productData.tags = productData.tags ? productData.tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
             productData.displayOrder = parseInt(productData.displayOrder || '0', 10);


            const url = isEditing ? `/products/${productId}` : '/products';
            const method = isEditing ? 'PUT' : 'POST';
            const button = addProductForm.querySelector('button[type="submit"]');
            button.disabled = true; button.textContent = 'Saving...';

            try {
                 await fetchData(url, { method, body: JSON.stringify(productData) });
                 displayMessage('product-message', `Product ${isEditing ? 'updated' : 'added'} successfully!`, true);
                 addProductForm.reset();
                 editProductIdField.value = ''; // Clear edit ID
                 cancelEditBtn.style.display = 'none';
                 loadProducts(); // Refresh list
                 loadCategories(); // Refresh category list in dropdown in case of edits
            } catch (error) {
                 displayMessage('product-message', `Error: ${error.message}`, false);
            } finally {
                 button.disabled = false; button.textContent = 'Save Product';
            }
         });
    }

    // Cancel Edit Product
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            addProductForm.reset();
            editProductIdField.value = '';
            cancelEditBtn.style.display = 'none';
             addProductForm.querySelector('h3').textContent = 'Add New Product';
        });
    }

    // Event Delegation for Edit/Delete Buttons
    if (categoryListDiv) {
        categoryListDiv.addEventListener('click', handleCategoryActions);
    }
     if (productListDiv) {
        productListDiv.addEventListener('click', handleProductActions);
    }
}

async function handleCategoryActions(e) {
    const target = e.target;
    const catId = target.dataset.id;

    if (target.classList.contains('delete-cat-btn')) {
        if (confirm(`Are you sure you want to delete category ${catId}? Products in this category will need reassignment.`)) {
            try {
                await fetchData(`/categories/${catId}`, { method: 'DELETE' });
                displayMessage('cat-message', 'Category deleted.', true);
                loadCategories();
                loadProducts(); // Refresh products as category is gone
            } catch (error) {
                displayMessage('cat-message', `Error deleting: ${error.message}`, false);
            }
        }
    } else if (target.classList.contains('edit-cat-btn')) {
        // Populate the add form for editing
        document.getElementById('new-cat-name').value = target.dataset.name || '';
        document.getElementById('new-cat-icon').value = target.dataset.icon || '';
        document.getElementById('new-cat-order').value = target.dataset.order || '0';
        // TODO: Change form submit handler to PUT if an ID exists, or add separate edit form
        alert(`Editing category ${catId} - feature needs PUT endpoint connection.`);
         // Scroll to form
        document.getElementById('add-category-form').scrollIntoView({ behavior: 'smooth' });
    }
}

async function handleProductActions(e) {
     const target = e.target;
     const prodId = target.dataset.id;

     if (target.classList.contains('delete-btn')) {
        if (confirm(`Are you sure you want to delete product ${prodId}?`)) {
            try {
                await fetchData(`/products/${prodId}`, { method: 'DELETE' });
                displayMessage('product-message', 'Product deleted.', true);
                loadProducts(); // Refresh list
            } catch (error) {
                displayMessage('product-message', `Error deleting: ${error.message}`, false);
            }
        }
    } else if (target.classList.contains('edit-btn')) {
         // Fetch full product data and populate the form for editing
         try {
            const product = await fetchData(`/products/${prodId}`);
            if (!product) throw new Error('Product data not found');

            document.getElementById('edit-product-id').value = product._id;
            document.getElementById('product-name').value = product.name || '';
            document.getElementById('product-category').value = product.category?._id || '';
            document.getElementById('product-price').value = product.price || 0;
            document.getElementById('product-original-price').value = product.originalPrice || '';
            document.getElementById('product-image').value = product.imageUrl || '';
            document.getElementById('product-tags').value = product.tags?.join(', ') || '';
            document.getElementById('product-stock').value = product.stockStatus || 'in_stock';
            document.getElementById('product-order').value = product.displayOrder || 0;
            document.getElementById('product-description').value = product.description || '';

            document.getElementById('add-product-form').querySelector('h3').textContent = 'Edit Product';
            document.getElementById('cancel-edit-product').style.display = 'inline-block';
            // Scroll to form
            document.getElementById('add-product-form').scrollIntoView({ behavior: 'smooth' });

         } catch (error) {
             displayMessage('product-message', `Error loading product for edit: ${error.message}`, false);
         }
    }
}


// Helper function to format price
function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }