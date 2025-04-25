// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: [true, 'Category slug is required'],
        trim: true,
        unique: true,
        lowercase: true
    },
    iconClass: {
        type: String,
        required: false,
        trim: true,
        default: 'fas fa-tag'
    },
    iconImageUrl: {
        type: String,
        required: false,
        trim: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Remove duplicate slug index since it's already defined with unique: true in the schema
// categorySchema.index({ slug: 1 }); -- Removed this line
categorySchema.index({ displayOrder: 1, name: 1 });

// Improved slug generation middleware
categorySchema.pre('validate', function(next) {
    // Only generate slug if name is modified and slug isn't manually set
    if (this.isModified('name') && !this.isModified('slug')) {
        this.slug = this.name
            .toString()
            .toLowerCase()
            .normalize('NFD') // Handle diacritics (Vietnamese characters)
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/đ/g, 'd')          // Replace đ with d
            .replace(/[^\w\s-]/g, '')    // Remove all non-word chars except spaces and hyphens
            .replace(/\s+/g, '-')        // Replace spaces with hyphens
            .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
            .replace(/^-+/, '')          // Trim hyphens from start
            .replace(/-+$/, '');         // Trim hyphens from end
        
        console.log(`Generated slug: ${this.slug} from name: ${this.name}`);
    }
    
    // If no slug exists at this point (neither generated nor provided), error will be caught by required: true
    next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;