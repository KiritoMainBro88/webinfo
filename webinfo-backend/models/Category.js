const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    iconClass: { // Font Awesome class like 'fas fa-ghost'
        type: String,
        required: false,
        trim: true,
        default: 'fas fa-tag' // Default icon
    },
    displayOrder: { // Optional field to control category order on shopping page
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

categorySchema.index({ displayOrder: 1, name: 1 }); // Index for sorting

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;