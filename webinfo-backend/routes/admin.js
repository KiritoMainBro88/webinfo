const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const User = require('../models/User');
const authAdmin = require('../middleware/authAdmin');
const Transaction = require('../models/Transaction');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// === ADD JSON PARSER FOR THIS ROUTER ===
router.use(express.json()); 
// ======================================

// Helper function
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// POST add balance to a user (Admin Only)
router.post('/add-balance', authAdmin, async (req, res) => {
    const { userId, amount } = req.body; // userId here can be username OR ObjectId string
    const parsedAmount = parseFloat(amount);

    console.log(`Admin request to add balance: Identifier: ${userId}, Amount: ${amount}`);

    if (!userId || isNaN(parsedAmount) || parsedAmount <= 0) {
        console.warn("Invalid request to add balance:", { userId, amount });
        return res.status(400).json({ message: 'Valid User ID/Username and positive Amount are required.' });
    }

    try {
        let userToUpdate = null;

        // Check if the input looks like a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(userId)) {
            console.log(`Attempting to find user by ID: ${userId}`);
            userToUpdate = await User.findById(userId);
        }

        // If not found by ID, or if the input wasn't an ID, try finding by username (case-insensitive)
        if (!userToUpdate) {
            console.log(`Attempting to find user by username (case-insensitive): ${userId}`);
            userToUpdate = await User.findOne({ username: new RegExp(`^${userId}$`, 'i') }); // Case-insensitive match
        }

        // If still not found after checking both ID and username
        if (!userToUpdate) {
            console.warn(`User not found for balance update using identifier: ${userId}`);
            return res.status(404).json({ message: 'User not found with the provided ID or Username.' });
        }

        console.log(`Found user: ${userToUpdate.username} (${userToUpdate._id}). Attempting balance update.`);

        // Found the user, now update their balance
        const updatedUser = await User.findByIdAndUpdate(
            userToUpdate._id, // Use the actual _id found
            { $inc: { balance: parsedAmount } },
            { new: true, runValidators: true }
        );

         if (!updatedUser) {
             // This case should be rare if findByIdAndUpdate follows a successful find
             console.error(`Failed to update balance for user ${userToUpdate._id} even after finding them.`);
             return res.status(500).json({ message: 'Could not update user balance after finding user.' });
         }

        console.log(`Balance updated for ${updatedUser.username}. New balance: ${updatedUser.balance}`);
        res.json({
            message: `Successfully added ${formatPrice(parsedAmount)} to ${updatedUser.username}. New balance: ${formatPrice(updatedUser.balance)}`,
            newBalance: updatedUser.balance
        });

    } catch (error) {
        console.error(`Error adding balance to user ${userId}:`, error);
         if (error.name === 'ValidationError') {
              return res.status(400).json({ message: `Validation error: ${error.message}` });
         }
        res.status(500).json({ message: 'Server error updating balance. Check logs.' });
    }
});

// Get user info by username or ID
router.get('/user-info/:identifier', isAdmin, async (req, res) => {
    try {
        const { identifier } = req.params;
        let user;

        // Check if identifier is ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(identifier);
        } else {
            user = await User.findOne({ username: identifier });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transactions = await Transaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                balance: user.balance,
                email: user.email,
                createdAt: user.createdAt
            },
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add balance to user (updated version)
router.post('/add-balance', isAdmin, async (req, res) => {
    try {
        const { userId, amount, description } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const balanceBefore = user.balance;
        user.balance += parseFloat(amount);
        await user.save();

        // Record the transaction
        await Transaction.create({
            userId: user._id,
            type: 'admin_adjustment',
            amount: parseFloat(amount),
            description,
            balanceBefore,
            balanceAfter: user.balance,
            adminId: req.user._id
        });

        res.json({ message: 'Balance updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get top depositors for current month
router.get('/top-depositors', isAdmin, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const topDepositors = await Transaction.aggregate([
            {
                $match: {
                    type: 'deposit',
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    totalDeposit: { $sum: '$amount' }
                }
            },
            {
                $sort: { totalDeposit: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    username: '$user.username',
                    totalDeposit: 1
                }
            }
        ]);

        res.json(topDepositors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all transactions with pagination
router.get('/transactions', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const type = req.query.type; // Optional filter by type
        const userId = req.query.userId; // Optional filter by user

        const query = {};
        if (type) query.type = type;
        if (userId) query.userId = userId;

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username')
            .populate('adminId', 'username');

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

module.exports = router;