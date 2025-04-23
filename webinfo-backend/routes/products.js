const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const authAdmin = require('../middleware/authAdmin'); // Assuming this middleware path is correct
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
        console.error("Error fetching products:", err); // Log full error
        res.status(500).json({ message: `Error fetching products: ${err.message}` }); // Send error message
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
        console.error(`Error fetching product ${req.params.id}:`, err); // Log full error
        res.status(500).json({ message: `Error fetching product: ${err.message}` }); // Send error message
    }
});


// POST create new product (Admin Only)
router.post('/', authAdmin, async (req, res) => {
    console.log("Received product data:", req.body); // Log received data
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder } = req.body;

    if (!name || price === undefined || !category) {
        console.error("Product validation failed: Missing required fields", { name, price, category });
        return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    if (isNaN(parseFloat(price))) {
         console.error("Product validation failed: Price is not a number", { price });
         return res.status(400).json({ message: 'Price must be a valid number.' });
    }

    try {
        const newProduct = new Product({
            name,
            price: parseFloat(price), // Ensure price is a number
            category,
            originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : undefined, // Ensure number or undefined
            imageUrl: imageUrl || undefined, // Allow default if empty
            tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [], // Ensure array, filter empty
            stockStatus: stockStatus || 'in_stock',
            description,
            displayOrder: (displayOrder && !isNaN(parseInt(displayOrder, 10))) ? parseInt(displayOrder, 10) : 0 // Ensure number or default
        });
        console.log("Attempting to save product:", newProduct); // Log before save
        await newProduct.save();
        console.log("Product saved successfully:", newProduct._id); // Log after save
        // Populate category before sending back
        const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name');
        res.status(201).json(populatedProduct);
    } catch (err) {
        console.error("Error creating product in DB:", err); // Log the full error object
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: err.message }); // Send specific validation errors
        }
        // Send a more generic server error message but log the specific one
        res.status(500).json({ message: 'Server error creating product. Check logs.' });
    }
});

// PUT update product (Admin Only) - Ensure implementation is complete
router.put('/:id', authAdmin, async (req, res) => {
    console.log(`Updating product ${req.params.id} with data:`, req.body); // Log update data
    const { name, price, category, originalPrice, imageUrl, tags, stockStatus, description, displayOrder } = req.body;
    const updateData = {};

     if (name !== undefined) updateData.name = name;
     if (price !== undefined) updateData.price = parseFloat(price); // Ensure number
     if (category !== undefined) updateData.category = category;
     // Allow clearing original price by sending empty string or null
     if (originalPrice !== undefined) updateData.originalPrice = (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null;
     if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
     if (tags !== undefined) updateData.tags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
     if (stockStatus !== undefined) updateData.stockStatus = stockStatus;
     if (description !== undefined) updateData.description = description;
     if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder || '0', 10); // Ensure number

     updateData.updatedAt = Date.now(); // Manually set update timestamp

     try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('category', 'name');
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

// DELETE product (Admin Only) - Ensure implementation is complete
router.delete('/:id', authAdmin, async (req, res) => {
      console.log(`Attempting to delete product ${req.params.id}`);
      try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            console.warn(`Product not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Product not found' });
        }
         console.log(`Product ${req.params.id} deleted successfully.`);
        res.status(200).json({ message: 'Product deleted successfully' }); // Send success status
    } catch (err) {
        console.error(`Error deleting product ${req.params.id}:`, err);
        res.status(500).json({ message: 'Server error deleting product. Check logs.' });
    }
});

module.exports = router;