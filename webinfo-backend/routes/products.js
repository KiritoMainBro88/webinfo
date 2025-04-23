// routes/products.js
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const authAdmin = require('../middleware/authAdmin');
const upload = require('../config/cloudinary'); // <-- IMPORT UPLOAD CONFIG
const router = express.Router();

// Helper function to parse tags safely (no change)
const parseTags = (tagsInput) => {
    if (!tagsInput || typeof tagsInput !== 'string') return [];
    return tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
};

// --- MODIFIED: GET products - Allow filtering, sorting, searching ---
router.get('/', async (req, res) => {
    const { category, categorySlug, sort, search } = req.query;
    const filter = {};
    let sortOptions = { displayOrder: 1, name: 1 }; // Default sort

    try {
        // --- Category Filtering (by Slug or ID) ---
        let categoryObj = null;
        if (categorySlug) {
            categoryObj = await Category.findOne({ slug: categorySlug });
            if (categoryObj) {
                filter.category = categoryObj._id;
            } else {
                return res.json({ products: [], categoryName: 'Unknown Category', minPrice: 0, maxPrice: 0 }); // Return empty if slug invalid
            }
        } else if (category && mongoose.Types.ObjectId.isValid(category)) {
             filter.category = category;
             // Optionally fetch categoryObj here too if needed for name later
             categoryObj = await Category.findById(category);
        }

        // --- Search Filtering ---
        if (search) {
            const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive regex
            filter.$or = [ // Search in name, description, or brand
                { name: searchRegex },
                { description: searchRegex },
                { brand: searchRegex }
                // Add more fields to search if needed
            ];
             console.log(`Applying search filter: ${search}`);
        }

        // --- Sorting Logic ---
        switch (sort) {
            case 'price-asc':
                sortOptions = { price: 1, name: 1 };
                break;
            case 'price-desc':
                sortOptions = { price: -1, name: 1 };
                break;
            case 'name-asc':
                sortOptions = { name: 1 };
                break;
            case 'best-seller': // Most purchases first
                sortOptions = { purchaseCount: -1, name: 1 };
                break;
            case 'newest':
                 sortOptions = { createdAt: -1 };
                 break;
            case 'oldest':
                  sortOptions = { createdAt: 1 };
                  break;
            // default: use initial sortOptions
        }
        console.log("Applying sort:", sortOptions);


        // --- Fetch Products based on filters and sort ---
        const products = await Product.find(filter)
            .populate('category', 'name iconClass slug') // Keep population
            .sort(sortOptions);

        // --- Optional: Get Min/Max Price for the FILTERED results (for price range) ---
        // This is simpler than getting min/max for the entire category beforehand
        let minPrice = 0;
        let maxPrice = 0;
        if (products.length > 0) {
            // Filter out non-numeric prices before finding min/max
            const numericPrices = products.map(p => p.price).filter(p => typeof p === 'number');
            if (numericPrices.length > 0) {
                minPrice = Math.min(...numericPrices);
                maxPrice = Math.max(...numericPrices);
            }
        }
        console.log(`Min/Max prices for results: ${minPrice}/${maxPrice}`);

        // --- Send Response ---
        res.json({
            products: products,
            categoryName: categoryObj ? categoryObj.name : null, // Send category name if found
            minPrice: minPrice,
            maxPrice: maxPrice
        });

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: `Error fetching products: ${err.message}` });
    }
});

// GET single product by ID (Public)
router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Product ID format' });
    }
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug'); // Populate category name/slug
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(`Error fetching product ${req.params.id}:`, err);
        res.status(500).json({ message: `Server error fetching product: ${err.message}` });
    }
});

// POST create new product (Admin Only) - Handle image upload
router.post('/', authAdmin, upload.single('productImage'), async (req, res) => {
    //                      ^-- Use multer middleware here (matches input name)
    console.log("Received product data for CREATE:", req.body);
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder, brand } = req.body;

    // Basic validation (keep as is)
    if (!name || price === undefined || !category) { return res.status(400).json({ message: 'Name, price, and category are required' }); }
    if (isNaN(parseFloat(price))) { return res.status(400).json({ message: 'Price must be a valid number.' }); }
    if (!mongoose.Types.ObjectId.isValid(category)) { return res.status(400).json({ message: 'Invalid Category ID provided.' }); }

    try {
        const newProductData = {
            name,
            price: parseFloat(price),
            category,
            brand: brand || undefined,
            originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : undefined,
            // Prioritize uploaded image URL over text input URL
            imageUrl: req.file ? req.file.path : (imageUrl || undefined),
            tags: parseTags(tags),
            stockStatus: stockStatus || 'in_stock',
            description: description || '', // Ensure description is at least empty string
            displayOrder: (displayOrder && !isNaN(parseInt(displayOrder, 10))) ? parseInt(displayOrder, 10) : 0
        };

        // Log if using uploaded file path
        if (req.file) {
            console.log('Product Image Uploaded:', req.file.path);
        }

        const newProduct = new Product(newProductData);
        console.log("Attempting to save product:", newProduct);
        await newProduct.save();
        console.log("Product saved successfully:", newProduct._id);
        const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name iconClass slug');
        res.status(201).json(populatedProduct);
    } catch (err) {
        console.error("Error creating product:", err);
        if (err.name === 'ValidationError') {
            let messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error creating product. Check logs.' });
    }
});

// PUT update product (Admin Only) - Handle image upload
router.put('/:id', authAdmin, upload.single('productImage'), async (req, res) => {
    //                      ^-- Use multer middleware here
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) { return res.status(400).json({ message: 'Invalid Product ID format' }); }
    console.log(`Updating product ${req.params.id} with data:`, req.body);
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder, brand } = req.body;
    const updateData = {};

    // Assign text fields if they exist in the request body
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) { if (!mongoose.Types.ObjectId.isValid(category)) { return res.status(400).json({ message: 'Invalid Category ID provided.' }); } updateData.category = category; }
    if (brand !== undefined) updateData.brand = brand;
    if (originalPrice !== undefined) updateData.originalPrice = (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null;
    if (tags !== undefined) updateData.tags = parseTags(tags);
    if (stockStatus !== undefined) updateData.stockStatus = stockStatus;
    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder || '0', 10);
    
    // Handle image URL: Prioritize uploaded file
    if (req.file) {
        console.log('Product Image Uploaded for Update:', req.file.path);
        updateData.imageUrl = req.file.path; // Overwrite imageUrl with uploaded file path
    } else if (imageUrl !== undefined) {
        // Only update from text input if NO file was uploaded
        updateData.imageUrl = imageUrl;
    }
    
    updateData.updatedAt = Date.now();

    // Check if any actual update data exists (other than just updatedAt)
    const updateKeys = Object.keys(updateData);
    if (updateKeys.length <= 1 && updateKeys.includes('updatedAt')) {
         return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('category', 'name iconClass slug');
        if (!updatedProduct) { console.warn(`Product not found for update: ${req.params.id}`); return res.status(404).json({ message: 'Product not found' }); }
        console.log(`Product ${req.params.id} updated successfully.`); res.json(updatedProduct);
     } catch (err) {
        console.error(`Error updating product ${req.params.id}:`, err);
         if (err.name === 'ValidationError') {
             let messages = Object.values(err.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
         }
         res.status(500).json({ message: 'Server error updating product. Check logs.' });
     }
});


// DELETE product (Admin Only) - (No change needed here)
router.delete('/:id', authAdmin, async (req, res) => { /* ... */ });

module.exports = router;