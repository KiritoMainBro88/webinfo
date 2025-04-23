// middleware/authUser.js - **PLACEHOLDER - REPLACE WITH REAL AUTH**
const User = require('../models/User');
const mongoose = require('mongoose');

// !!! IMPORTANT: This is INSECURE and for DEMO only. !!!
// Replace this entirely with JWT verification or session checking.
const authUser = async (req, res, next) => {
    console.warn("SECURITY WARNING: Using insecure temporary header for user auth. REPLACE IMMEDIATELY.");

    const tempUserId = req.headers['x-temp-userid']; // Get ID from insecure header

    if (!tempUserId || !mongoose.Types.ObjectId.isValid(tempUserId)) {
        console.log('Auth Middleware: Missing or invalid temp user ID header.');
        return res.status(401).json({ success: false, message: 'Xác thực thất bại (Thiếu thông tin User).' }); // Changed message
    }

    try {
        const user = await User.findById(tempUserId).select('-password'); // Exclude password hash

        if (!user) {
             console.log(`Auth Middleware: User not found for ID: ${tempUserId}`);
            return res.status(401).json({ success: false, message: 'Xác thực thất bại (User không tồn tại).' }); // Changed message
        }

        // Attach user object to the request
        req.user = user;
        console.log(`Auth Middleware: User ${user.username} authenticated (via insecure header).`);
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(501).json({ success: false, message: 'Lỗi máy chủ trong quá trình xác thực.' }); // Changed message
    }
};

module.exports = authUser;