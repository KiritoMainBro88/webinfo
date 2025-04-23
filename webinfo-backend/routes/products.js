// routes/products.js
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const authAdmin = require('../middleware/authAdmin');
const router = express.Router();

// Helper function to parse tags safely (no change)
const parseTags = (tagsInput) => { /* ... */ };

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

// GET single product by ID (Public) - (No change)
router.get('/:id', async (req, res) => { /* ... */ });

// POST create new product (Admin Only) - ** Needs to handle 'brand' **
router.post('/', authAdmin, async (req, res) => {
    console.log("Received product data for CREATE:", req.body);
    // ADD 'brand' to destructuring
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder, brand } = req.body;

    if (!name || price === undefined || !category) { return res.status(400).json({ message: 'Name, price, and category are required' }); }
    if (isNaN(parseFloat(price))) { return res.status(400).json({ message: 'Price must be a valid number.' }); }
    if (!mongoose.Types.ObjectId.isValid(category)) { return res.status(400).json({ message: 'Invalid Category ID provided.' }); }

    try {
        const newProduct = new Product({
            name,
            price: parseFloat(price),
            category,
            brand: brand || undefined, // Add brand
            originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : undefined,
            imageUrl: imageUrl || undefined,
            tags: parseTags(tags),
            stockStatus: stockStatus || 'in_stock',
            description,
            displayOrder: (displayOrder && !isNaN(parseInt(displayOrder, 10))) ? parseInt(displayOrder, 10) : 0
        });
        console.log("Attempting to save product:", newProduct);
        await newProduct.save();
        console.log("Product saved successfully:", newProduct._id);
        const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name iconClass slug');
        res.status(201).json(populatedProduct);
    } catch (err) { /* ... (error handling no change) ... */ }
});

// PUT update product (Admin Only) - ** Needs to handle 'brand' **
router.put('/:id', authAdmin, async (req, res) => {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) { return res.status(400).json({ message: 'Invalid Product ID format' }); }
    console.log(`Updating product ${req.params.id} with data:`, req.body);
    // ADD 'brand' to destructuring
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder, brand } = req.body;
    const updateData = {};

     if (name !== undefined) updateData.name = name;
     if (price !== undefined) updateData.price = parseFloat(price);
     if (category !== undefined) { if (!mongoose.Types.ObjectId.isValid(category)) { return res.status(400).json({ message: 'Invalid Category ID provided.' }); } updateData.category = category; }
     if (brand !== undefined) updateData.brand = brand; // Add brand update
     if (originalPrice !== undefined) updateData.originalPrice = (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null;
     if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
     if (tags !== undefined) updateData.tags = parseTags(tags);
     if (stockStatus !== undefined) updateData.stockStatus = stockStatus;
     if (description !== undefined) updateData.description = description;
     if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder || '0', 10);
     updateData.updatedAt = Date.now();

     if (Object.keys(updateData).length <= 1 && updateData.updatedAt) { // Check if only updatedAt was added
         return res.status(400).json({ message: 'No fields provided for update.' });
     }

     try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('category', 'name iconClass slug');
        if (!updatedProduct) { console.warn(`Product not found for update: ${req.params.id}`); return res.status(404).json({ message: 'Product not found' }); }
        console.log(`Product ${req.params.id} updated successfully.`); res.json(updatedProduct);
     } catch (err) { /* ... (error handling no change) ... */ }
});


// DELETE product (Admin Only) - (No change needed here)
router.delete('/:id', authAdmin, async (req, res) => { /* ... */ });

module.exports = router;