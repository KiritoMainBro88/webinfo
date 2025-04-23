const express = require('express');
const User = require('../models/User');
const authAdmin = require('../middleware/authAdmin'); // Your admin check middleware
const router = express.Router();

// POST add balance to a user (Admin Only)
router.post('/add-balance', authAdmin, async (req, res) => {
    const { userId, amount } = req.body;
    const parsedAmount = parseFloat(amount);

    console.log(`Admin request to add balance: User ID: ${userId}, Amount: ${amount}`);

    if (!userId || isNaN(parsedAmount) || parsedAmount <= 0) {
        console.warn("Invalid request to add balance:", { userId, amount });
        return res.status(400).json({ message: 'Valid User ID and positive Amount are required.' });
    }

    try {
        // Find the user and update their balance using $inc for atomic addition
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { balance: parsedAmount } }, // Atomically increment balance
            { new: true, runValidators: true } // Return updated doc, run validators
        );

        if (!updatedUser) {
            console.warn(`User not found for balance update: ${userId}`);
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log(`Balance updated for ${updatedUser.username}. New balance: ${updatedUser.balance}`);
        res.json({
            message: `Successfully added ${formatPrice(parsedAmount)} to ${updatedUser.username}.`,
            newBalance: updatedUser.balance // Optionally return the new balance
        });

    } catch (error) {
        console.error(`Error adding balance to user ${userId}:`, error);
         if (error.name === 'ValidationError') {
              return res.status(400).json({ message: `Validation error: ${error.message}` });
         }
        res.status(500).json({ message: 'Server error updating balance. Check logs.' });
    }
});

// Helper function (could be moved to a utils file)
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}


module.exports = router;