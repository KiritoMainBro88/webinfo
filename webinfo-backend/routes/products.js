const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category'); // Needed for population
const authAdmin = require('../middleware/authAdmin');
const router = express.Router();

// GET all products (Public) - optionally filter by category, sorted
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.category) {
        filter.category = req.query.category;
    }
    try {
        const products = await Product.find(filter)
            .populate('category', 'name') // Populate category name
            .sort({ displayOrder: 1, name: 1 }); // Sort order
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// GET single product by ID (Public)
router.get('/:id', async (req, res) => {
     try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: 'Error fetching product' });
    }
});


// POST create new product (Admin Only)
router.post('/', authAdmin, async (req, res) => {
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder } = req.body;

    // Basic validation
    if (!name || price === undefined || !category) {
        return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    try {
        const newProduct = new Product({
            name,
            price,
            category,
            originalPrice,
            imageUrl,
            tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
            stockStatus: stockStatus || 'in_stock',
            description,
            displayOrder: displayOrder || 0
        });
        await newProduct.save();
        // Populate category before sending back
        const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name');
        res.status(201).json(populatedProduct);
    } catch (err) {
        console.error("Error creating product:", err);
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Error creating product' });
    }
});

// PUT update product (Admin Only) - IMPLEMENTATION NEEDED
router.put('/:id', authAdmin, async (req, res) => {
     const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder } = req.body;
     const updateData = {};
     // Add fields to updateData only if they exist in the request body
     if (name !== undefined) updateData.name = name;
     if (price !== undefined) updateData.price = price;
     if (category !== undefined) updateData.category = category;
     if (originalPrice !== undefined) updateData.originalPrice = originalPrice === '' ? null : originalPrice; // Allow clearing original price
     if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
     if (tags !== undefined) updateData.tags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
     if (stockStatus !== undefined) updateData.stockStatus = stockStatus;
     if (description !== undefined) updateData.description = description;
     if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

     updateData.updatedAt = Date.now(); // Manually set update timestamp

     try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('category', 'name');
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
     } catch (err) {
         console.error("Error updating product:", err);
         if (err.name === 'ValidationError') {
              return res.status(400).json({ message: err.message });
         }
         res.status(500).json({ message: 'Error updating product' });
     }
});

// DELETE product (Admin Only) - IMPLEMENTATION NEEDED
router.delete('/:id', authAdmin, async (req, res) => {
      try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;