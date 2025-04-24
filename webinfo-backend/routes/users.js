const express = require('express');
const User = require('../models/User');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

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

// Get user's transaction history
router.get('/transactions', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const type = req.query.type; // Optional filter by type

        const query = { userId: req.user._id };
        if (type) query.type = type;

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's monthly transaction summary
router.get('/transactions/monthly-summary', auth, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const summary = await Transaction.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update deposit route to include transaction recording
router.post('/deposit', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.user._id);
        const balanceBefore = user.balance;
        user.balance += parsedAmount;
        await user.save();

        // Record the transaction
        await Transaction.create({
            userId: user._id,
            type: 'deposit',
            amount: parsedAmount,
            description: 'User deposit',
            balanceBefore,
            balanceAfter: user.balance
        });

        res.json({ message: 'Deposit successful', balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;