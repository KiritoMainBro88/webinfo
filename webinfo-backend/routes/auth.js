const express = require('express');
const User = require('../models/User'); // Adjust path if needed

const router = express.Router();

// --- Registration Route ---
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }
  if (password.length < 6) {
     return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }


  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user (password hashing happens via pre-save hook in model)
    const newUser = new User({
      username: username,
      password: password, // Pass plain password, model will hash it
    });

    // Save user to database
    await newUser.save();

    // Send success response (don't send back password)
    res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });

  } catch (error) {
    console.error("Registration Error:", error);
    // Handle potential validation errors from Mongoose
    if (error.name === 'ValidationError') {
        let messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      // User not found - send generic message for security
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare submitted password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Password doesn't match - send generic message
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- Login Successful ---
    // **IMPORTANT:** In a real app, you would generate a JWT here
    // and send it back to the client.
    // For now, just send success message.
    res.status(200).json({
        message: 'Login successful!',
        userId: user._id, // You might send back some user info (NOT password)
        username: user.username
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;