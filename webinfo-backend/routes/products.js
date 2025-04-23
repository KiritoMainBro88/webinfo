const express = require('express');
const mongoose = require('mongoose'); // Import mongoose to check ObjectId validity
const Product = require('../models/Product');
const Category = require('../models/Category');
const authAdmin = require('../middleware/authAdmin');
const router = express.Router();

// Helper function to parse tags safely
const parseTags = (tagsInput) => {
    if (typeof tagsInput === 'string') {
        return tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    } else if (Array.isArray(tagsInput)) {
        // If it's already an array (e.g., from JSON parsing), just sanitize
        return tagsInput.map(tag => String(tag).trim().toLowerCase()).filter(tag => tag);
    }
    return []; // Return empty array for other types
};


// GET all products (Public) - optionally filter by category, sorted
router.get('/', async (req, res) => {
    const filter = {};
    const { category, categorySlug } = req.query; // Get both potential filters

    try {
        // Prioritize filtering by slug if provided
        if (categorySlug) {
            console.log(`Filtering products by category slug: ${categorySlug}`);
            const categoryObj = await Category.findOne({ slug: categorySlug });
            if (categoryObj) {
                filter.category = categoryObj._id; // Filter by the found category's ID
            } else {
                // If slug doesn't match any category, return empty array
                console.log(`No category found for slug: ${categorySlug}. Returning empty product list.`);
                return res.json([]);
            }
        }
        // Fallback to category ID if slug wasn't provided or didn't match
        else if (category && mongoose.Types.ObjectId.isValid(category)) {
            console.log(`Filtering products by category ID: ${category}`);
            filter.category = category;
        } else {
            console.log("Fetching all products (no valid category filter).");
        }

        const products = await Product.find(filter)
            .populate('category', 'name iconClass slug') // Added slug to populated fields
            .sort({ displayOrder: 1, name: 1 });
        res.json(products);
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
        const product = await Product.findById(req.params.id).populate('category', 'name iconClass');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(`Error fetching product ${req.params.id}:`, err);
        res.status(500).json({ message: `Error fetching product: ${err.message}` });
    }
});


// POST create new product (Admin Only)
router.post('/', authAdmin, async (req, res) => {
    console.log("Received product data for CREATE:", req.body);
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder } = req.body;

    if (!name || price === undefined || !category) {
        console.error("Product validation failed: Missing required fields", { name, price, category });
        return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    if (isNaN(parseFloat(price))) {
         console.error("Product validation failed: Price is not a number", { price });
         return res.status(400).json({ message: 'Price must be a valid number.' });
    }
     if (!mongoose.Types.ObjectId.isValid(category)) {
         console.error("Product validation failed: Invalid category ID", { category });
         return res.status(400).json({ message: 'Invalid Category ID provided.' });
     }


    try {
        const newProduct = new Product({
            name,
            price: parseFloat(price),
            category,
            originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : undefined,
            imageUrl: imageUrl || undefined,
            tags: parseTags(tags), // Use the safe parsing function
            stockStatus: stockStatus || 'in_stock',
            description,
            displayOrder: (displayOrder && !isNaN(parseInt(displayOrder, 10))) ? parseInt(displayOrder, 10) : 0
        });
        console.log("Attempting to save product:", newProduct);
        await newProduct.save();
        console.log("Product saved successfully:", newProduct._id);
        const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name iconClass');
        res.status(201).json(populatedProduct);
    } catch (err) {
        console.error("Error creating product in DB:", err);
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error creating product. Check logs.' });
    }
});

// PUT update product (Admin Only)
router.put('/:id', authAdmin, async (req, res) => {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Product ID format' });
     }
    console.log(`Updating product ${req.params.id} with data:`, req.body);
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder } = req.body;
    const updateData = {};

     if (name !== undefined) updateData.name = name;
     if (price !== undefined) updateData.price = parseFloat(price);
     if (category !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
             return res.status(400).json({ message: 'Invalid Category ID provided.' });
        }
        updateData.category = category;
     }
     if (originalPrice !== undefined) updateData.originalPrice = (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null;
     if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
     if (tags !== undefined) updateData.tags = parseTags(tags); // Use the safe parsing function
     if (stockStatus !== undefined) updateData.stockStatus = stockStatus;
     if (description !== undefined) updateData.description = description;
     if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder || '0', 10);

     updateData.updatedAt = Date.now();

     if (Object.keys(updateData).length === 0) {
         return res.status(400).json({ message: 'No fields provided for update.' });
     }

     try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('category', 'name iconClass');
        if (!updatedProduct) {
            console.warn(`Product not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log(`Product ${req.params.id} updated successfully.`);
        res.json(updatedProduct);
     } catch (err) {
         console.error(`Error updating product ${req.params.id}:`, err);
         if (err.name === 'ValidationError') {
              return res.status(400).json({ message: err.message });
         }
         res.status(500).json({ message: 'Server error updating product. Check logs.' });
     }
});

// DELETE product (Admin Only)
router.delete('/:id', authAdmin, async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Product ID format' });
     }
      console.log(`Attempting to delete product ${req.params.id}`);
      try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            console.warn(`Product not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Product not found' });
        }
         console.log(`Product ${req.params.id} deleted successfully.`);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(`Error deleting product ${req.params.id}:`, err);
        res.status(500).json({ message: 'Server error deleting product. Check logs.' });
    }
});

module.exports = router;