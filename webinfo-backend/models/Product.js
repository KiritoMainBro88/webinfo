const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: { // Optional detailed description
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    originalPrice: { // For showing sales
        type: Number,
        min: 0,
        required: false
    },
    imageUrl: {
        type: String,
        trim: true,
        default: 'images/product-placeholder.png' // Default image
    },
    category: { // Reference to the Category model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    tags: [{ // For 'Hot', 'Sale', etc.
        type: String,
        trim: true,
        lowercase: true
    }],
    stockStatus: { // e.g., 'in_stock', 'out_of_stock', 'contact', 'check_price'
        type: String,
        default: 'in_stock',
        enum: ['in_stock', 'out_of_stock', 'contact', 'check_price'] // Added check_price
    },
    purchaseCount: { // Simple tracking for "Đã bán"
         type: Number,
         default: 0
    },
    displayOrder: { // Optional field to control product order within category
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update 'updatedAt' timestamp before saving
productSchema.pre('save', function(next) {
    if (this.isModified()) { // Only update if modified
       this.updatedAt = Date.now();
    }
    next();
});
// Add index for faster category lookup and sorting
productSchema.index({ category: 1, displayOrder: 1, name: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;