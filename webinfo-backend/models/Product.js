// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, required: false, index: true }, // <-- ADDED BRAND FIELD + INDEX
    price: { type: Number, required: [true, 'Price is required'], min: 0, index: true }, // <-- ADDED INDEX
    originalPrice: { type: Number, min: 0, required: false },
    imageUrl: { type: String, trim: true, default: 'images/product-placeholder.png' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'], index: true }, // <-- ADDED INDEX
    tags: [{ type: String, trim: true, lowercase: true }],
    stockStatus: { type: String, default: 'in_stock', enum: ['in_stock', 'out_of_stock', 'contact', 'check_price'] },
    purchaseCount: { type: Number, default: 0, index: true }, // <-- ADDED INDEX
    displayOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true }, // <-- ENSURE INDEX
    updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) { if (this.isModified()) { this.updatedAt = Date.now(); } next(); });
// Compound index might be useful depending on common queries
productSchema.index({ category: 1, displayOrder: 1, name: 1 });
productSchema.index({ category: 1, price: 1 }); // Index for category + price sorting
productSchema.index({ category: 1, createdAt: -1 }); // Index for category + newest sorting
productSchema.index({ category: 1, purchaseCount: -1 }); // Index for category + best seller sorting

const Product = mongoose.model('Product', productSchema);
module.exports = Product;