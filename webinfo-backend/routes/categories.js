const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product'); // <-- Import Product model for check
const authAdmin = require('../middleware/authAdmin');
const router = express.Router();

// GET all categories (Public) - Sorted
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: `Error fetching categories: ${err.message}` });
    }
});

// POST create new category (Admin Only)
router.post('/', authAdmin, async (req, res) => {
    console.log("Received category data:", req.body);
    const { name, iconClass, displayOrder } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });

    try {
        const newCategory = new Category({
            name,
            iconClass: iconClass || 'fas fa-tag',
            displayOrder: displayOrder || 0
        });
        await newCategory.save();
         console.log("Category saved:", newCategory._id);
        res.status(201).json(newCategory);
    } catch (err) {
         if (err.code === 11000) {
            console.error("Duplicate category name:", name);
            return res.status(400).json({ message: 'Category name already exists'});
         }
         console.error("Error creating category:", err);
        res.status(500).json({ message: 'Server error creating category. Check logs.' });
    }
});

// PUT update category (Admin Only) - Implemented
router.put('/:id', authAdmin, async (req, res) => {
    console.log(`Updating category ${req.params.id} with data:`, req.body);
    const { name, iconClass, displayOrder } = req.body;
    const updateData = {};
    // Only add fields to updateData if they are provided in the request body
    if (name !== undefined) updateData.name = name;
    if (iconClass !== undefined) updateData.iconClass = iconClass; // Allow setting empty icon
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder || '0', 10); // Ensure number or default

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true } // Return the updated doc, run schema validation
        );
        if (!updatedCategory) {
             console.warn(`Category not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Category not found' });
        }
         console.log(`Category ${req.params.id} updated successfully.`);
        res.json(updatedCategory);
    } catch (err) {
        console.error(`Error updating category ${req.params.id}:`, err);
         if (err.code === 11000) { return res.status(400).json({ message: 'Category name already exists'}); }
         if (err.name === 'ValidationError') { return res.status(400).json({ message: err.message }); }
        res.status(500).json({ message: 'Server error updating category. Check logs.' });
    }
});

// DELETE category (Admin Only) - Added check for products
router.delete('/:id', authAdmin, async (req, res) => {
     console.log(`Attempting to delete category ${req.params.id}`);
     try {
        // Check if any products use this category BEFORE deleting
         const productCount = await Product.countDocuments({ category: req.params.id });
         if (productCount > 0) {
            console.warn(`Attempt to delete category ${req.params.id} failed: ${productCount} products found.`);
            return res.status(400).json({ message: `Cannot delete category: ${productCount} product(s) are still using it. Please reassign products first.` });
         }

        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
             console.warn(`Category not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Category not found' });
        }
        console.log(`Category ${req.params.id} deleted successfully.`);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(`Error deleting category ${req.params.id}:`, err);
        res.status(500).json({ message: 'Server error deleting category. Check logs.' });
    }
});

module.exports = router;