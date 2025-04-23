const express = require('express');
const Category = require('../models/Category');
const authAdmin = require('../middleware/authAdmin');
const router = express.Router();

// GET all categories (Public) - Sorted by displayOrder, then name
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// POST create new category (Admin Only)
router.post('/', authAdmin, async (req, res) => {
    const { name, iconClass, displayOrder } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });

    try {
        const newCategory = new Category({
            name,
            iconClass: iconClass || 'fas fa-tag', // Default icon if not provided
            displayOrder: displayOrder || 0
        });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
         if (err.code === 11000) { // Duplicate key
            return res.status(400).json({ message: 'Category name already exists'});
         }
         console.error("Error creating category:", err);
        res.status(500).json({ message: 'Error creating category' });
    }
});

// PUT update category (Admin Only) - IMPLEMENTATION NEEDED
router.put('/:id', authAdmin, async (req, res) => {
    const { name, iconClass, displayOrder } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (iconClass) updateData.iconClass = iconClass;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(updatedCategory);
    } catch (err) {
        console.error("Error updating category:", err);
         if (err.code === 11000) { return res.status(400).json({ message: 'Category name already exists'}); }
        res.status(500).json({ message: 'Error updating category' });
    }
});

// DELETE category (Admin Only) - IMPLEMENTATION NEEDED
router.delete('/:id', authAdmin, async (req, res) => {
     try {
         // IMPORTANT: Add check here to prevent deleting if products use this category
         // const productCount = await Product.countDocuments({ category: req.params.id });
         // if (productCount > 0) {
         //    return res.status(400).json({ message: 'Cannot delete category with existing products.' });
         // }

        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: 'Error deleting category' });
    }
});

module.exports = router;