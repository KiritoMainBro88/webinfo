const express = require('express');
const User = require('../models/User');
const router = express.Router();
const mongoose = require('mongoose');

// Middleware to simulate fetching user based on ID from header (INSECURE DEMO)
// REPLACE THIS with proper JWT/Session middleware later
const getUserFromHeader = async (req, res, next) => {
    const userId = req.headers['x-temp-userid']; // Using the insecure header for demo
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.warn('Get User Middleware: Invalid or missing user ID header');
        // Allow route to proceed, handler should check req.user existence
        // Or return 401 immediately: return res.status(401).json({ message: 'Authentication required (Invalid User ID)' });
        return next();
    }
    try {
        req.user = await User.findById(userId).select('-password'); // Exclude password
        if (!req.user) {
             console.warn(`Get User Middleware: User not found for ID: ${userId}`);
        }
    } catch (error) {
        console.error('Get User Middleware Error:', error);
        // Don't block, let route handler potentially deal with it or return 500
    }
    next();
};


// GET Current User's Information (including balance)
// PROTECTED ROUTE - Needs real authentication middleware eventually
router.get('/me', getUserFromHeader, async (req, res) => {
    if (!req.user) {
        // This means getUserFromHeader didn't find a user or ID was missing/invalid
        return res.status(401).json({ message: 'Authentication required or user not found.' });
    }
    try {
        // User object (excluding password) is already attached by getUserFromHeader
        console.log(`Sending user data for ${req.user.username}`);
        res.json({
            userId: req.user._id,
            username: req.user.username,
            email: req.user.email,
            balance: req.user.balance, // Send the real balance
            isAdmin: req.user.isAdmin,
            createdAt: req.user.createdAt
        });
    } catch (error) {
        console.error(`Error fetching user /me data for ${req.user?.username}:`, error);
        res.status(500).json({ message: 'Error retrieving user information.' });
    }
});


module.exports = router;