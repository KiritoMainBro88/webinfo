const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { Resend } = require('resend'); // Use Resend

const router = express.Router();

// --- Instantiate Resend ---
let resend;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('WARNING: RESEND_API_KEY environment variable not set. Email sending will fail.');
    resend = { emails: { send: () => Promise.reject("Resend API Key not configured") } };
}

// --- Registration Route (Handles Email) ---
router.post('/register', async (req, res) => {
    // Get email along with username/password
    const { username, password, email } = req.body;

    // Add validation for email
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Please provide username, email, and password' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    // Optional: Add more robust email format validation here if needed

    try {
        // Check if username OR email already exists
        const existingUser = await User.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
        });
        if (existingUser) {
            let message = existingUser.username === username.toLowerCase() ? 'Username already exists' : 'Email already registered';
            return res.status(400).json({ message: message });
        }

        // Include email when creating user
        const newUser = new User({
            username: username,
            email: email, // Save email
            password: password,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });

    } catch (error) {
        console.error("Registration Error:", error);
        if (error.name === 'ValidationError') {
            // Extract validation messages
            let messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// --- Login Route (no changes needed) ---
router.post('/login', async (req, res) => {
     const { username, password } = req.body;
     if (!username || !password) return res.status(400).json({ message: 'Please provide username and password' });
     try {
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        res.status(200).json({ message: 'Login successful!', userId: user._id, username: user.username });
     } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
     }
});

// --- Forgot Password Route (Uses Real Email) ---
router.post('/forgot-password', async (req, res) => {
    // Use email for lookup now
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Please provide your registered email address' });
    }

    const configuredFrom = process.env.EMAIL_FROM;
    const configuredFrontendUrl = process.env.FRONTEND_URL;

    if (!process.env.RESEND_API_KEY || !configuredFrom || !configuredFrontendUrl) {
        console.error('Forgot Password Error: Resend API Key, From Email, or Frontend URL not configured.');
        return res.status(200).json({ message: 'If an account with that email exists, and email sending is configured, a reset link will be sent.' });
    }

    let user;
    try {
        // Find user by EMAIL
        user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const recipientEmail = user.email; // Use the actual user email
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${configuredFrontendUrl}/reset-password.html?token=${resetToken}`; // Adjust path if needed

        // Use Resend to send email
        const { data, error } = await resend.emails.send({
            from: configuredFrom,
            to: [recipientEmail], // Use the real email
            subject: 'Your Portfolio Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
            // html: `... HTML version ...`
        });

        if (error) {
          console.error('Resend Error:', error);
          throw new Error('Failed to send password reset email.');
        }

        console.log(`Password reset email sent via Resend to: ${recipientEmail}, ID: ${data.id}`);
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error('Forgot Password Process Error:', error);
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            try { await user.save({ validateBeforeSave: false }); } catch (saveError) { console.error("Error clearing reset token after failure:", saveError); }
        }
        res.status(200).json({ message: 'If an account with that email exists, and email sending is configured, a reset link will be sent.' });
    }
});


// --- Reset Password Route (no changes needed here) ---
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Please provide token and new password' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long' });

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        if (error.name === 'ValidationError') {
            let messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error during password reset' });
    }
});


module.exports = router;