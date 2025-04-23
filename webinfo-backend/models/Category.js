// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    slug: { // <-- ADD THIS FIELD
        type: String,
        required: [true, 'Category slug is required'],
        trim: true,
        unique: true,
        lowercase: true,
        // Example generator (can be refined) - creates slug from name on creation
        // You might want to generate this manually or in the route handler instead
        // default: function() { return this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''); }
    },
    iconClass: {
        type: String,
        required: false,
        trim: true,
        default: 'fas fa-tag'
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

// Add index for slug lookup
categorySchema.index({ slug: 1 });
categorySchema.index({ displayOrder: 1, name: 1 });

// Simple slug generation middleware (run BEFORE validation)
// IMPORTANT: This basic slugify might need improvement for complex names/languages
categorySchema.pre('validate', function(next) {
  if (this.isModified('name') && !this.isModified('slug')) { // Only generate if name changes and slug isn't manually set
    this.slug = this.name
      .toString()
      .toLowerCase()
      .normalize('NFD') // Handle diacritics (Vietnamese characters)
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/đ/g, 'd')          // Replace đ with d
      .replace(/[^\w-]+/g, '')     // Remove all non-word chars except hyphen
      .replace(/--+/g, '-')        // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
     console.log(`Generated slug: ${this.slug} from name: ${this.name}`);
  }
  next();
});


const Category = mongoose.model('Category', categorySchema);
module.exports = Category;