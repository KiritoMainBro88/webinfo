const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: { // Added email field
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
      type: String,
      required: false
  },
  resetPasswordExpires: {
      type: Date,
      required: false
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try { const salt = await bcrypt.genSalt(10); this.password = await bcrypt.hash(this.password, salt); next(); }
  catch (error) { next(error); }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try { return await bcrypt.compare(candidatePassword, this.password); }
  catch (error) { throw error; }
};

// Generate Password Reset Token Method
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;