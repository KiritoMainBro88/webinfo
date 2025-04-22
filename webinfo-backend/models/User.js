const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'] // Example validation
  },
  // You could add email, creation date, etc. here later
  // email: {
  //   type: String,
  //   required: false, // Make required if needed
  //   unique: true,
  //   trim: true,
  //   lowercase: true,
  //   match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic format validation
  // },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hashing middleware - runs BEFORE saving a user
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10); // 10 rounds is generally recommended
    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Pass error to the next middleware/save operation
  }
});

// Method to compare candidate password with the user's hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error; // Re-throw error to be caught by calling function
  }
};


const User = mongoose.model('User', userSchema);

module.exports = User;