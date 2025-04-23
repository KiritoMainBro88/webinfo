const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const User = require('../models/User');
const authAdmin = require('../middleware/authAdmin');
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

module.exports = router;