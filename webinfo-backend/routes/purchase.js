// routes/purchase.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction'); // Add Transaction model import
const authUser = require('../middleware/authUser'); // USE A REAL USER AUTH MIDDLEWARE HERE

const router = express.Router();

// === ADD JSON PARSER FOR THIS ROUTER ===
router.use(express.json()); 
// ======================================

// POST /api/purchase/confirm - Confirm and process a purchase
// PROTECTED: Requires user authentication
router.post('/confirm', authUser, async (req, res) => { // Use authUser middleware
    const { itemId } = req.body;
    const userId = req.user._id; // Get userId from authenticated user (set by authUser middleware)

    console.log(`Purchase attempt: User ${userId}, Item ${itemId}`);

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, message: 'Invalid Item ID provided.' });
    }

    try {
        // --- Fetch User and Product Concurrently ---
        // We need the product to get the *authoritative* price from the DB
        const [user, product] = await Promise.all([
            User.findById(userId),
            Product.findById(itemId)
        ]);

        // --- Validate User and Product ---
        if (!user) {
            // This shouldn't happen if authUser middleware works correctly
            console.error(`Purchase Error: User not found with ID ${userId} despite auth middleware.`);
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (!product) {
            console.warn(`Purchase Error: Product not found with ID ${itemId}`);
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
        }
        if (product.stockStatus === 'out_of_stock') {
             console.warn(`Purchase Error: Product ${itemId} is out of stock.`);
             return res.status(400).json({ success: false, message: 'Sản phẩm này đã hết hàng.' });
        }
         if (isNaN(product.price) || product.price === null || product.price < 0) {
            console.error(`Purchase Error: Product ${itemId} has an invalid price: ${product.price}`);
            return res.status(500).json({ success: false, message: 'Lỗi giá sản phẩm không hợp lệ.' });
         }


        // --- !!! SERVER-SIDE BALANCE CHECK !!! ---
        const itemPrice = product.price;
        console.log(`Server Check: User Balance=${user.balance}, Item Price=${itemPrice}`);
        if (user.balance < itemPrice) {
            console.warn(`Purchase Error: User ${userId} has insufficient balance (${user.balance}) for item ${itemId} priced at ${itemPrice}.`);
            return res.status(400).json({ success: false, message: 'Số dư không đủ để mua vật phẩm này.' });
        }

        // --- Process Purchase (Atomic update preferred if possible) ---
        // Deduct balance and increment purchase count
        // Using findByIdAndUpdate helps, but for true atomicity across models, transactions might be needed in complex scenarios.
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { balance: -itemPrice } }, // Decrement balance
            { new: true, runValidators: true } // Return updated user, run validation
        );

        // Optionally increment product purchase count (less critical if it fails)
        await Product.findByIdAndUpdate(itemId, { $inc: { purchaseCount: 1 } });

        if (!updatedUser) {
             // This would indicate a serious issue if the user existed moments before
             console.error(`Purchase Error: Failed to update balance for user ${userId} after successful check.`);
             // Consider mechanisms to handle potential inconsistencies here
             return res.status(500).json({ success: false, message: 'Lỗi cập nhật số dư người dùng.' });
        }

        // Create transaction record for the purchase
        await Transaction.create({
            userId: userId,
            type: 'purchase',
            amount: -itemPrice, // Negative amount for purchases (money going out)
            description: `Purchase of ${product.name}`,
            balanceBefore: user.balance,
            balanceAfter: updatedUser.balance,
            productId: itemId
        });

        console.log(`Purchase successful: User ${userId} bought ${itemId}. New balance: ${updatedUser.balance}`);

        // --- Respond with Success ---
        res.json({
            success: true,
            message: 'Mua hàng thành công!',
            newBalance: updatedUser.balance // Send the updated balance back
        });

    } catch (error) {
        console.error(`Critical Purchase Error: User ${userId}, Item ${itemId}`, error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý mua hàng. Vui lòng thử lại sau.' });
    }
});

module.exports = router;