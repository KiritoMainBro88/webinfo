const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { Resend } = require('resend'); // Import Resend

const router = express.Router();

// --- Instantiate Resend ---
let resend;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('WARNING: RESEND_API_KEY environment variable not set. Email sending will fail.');
    // Create a dummy object to prevent errors when calling .emails.send in dev without a key
    resend = { emails: { send: () => Promise.reject("Resend API Key not configured") } };
}

// --- Registration Route (no changes) ---
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Please provide username and password' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    try {
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
    } catch (error) {
        console.error("Registration Error:", error);
        if (error.name === 'ValidationError') {
            let messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// --- Login Route (no changes) ---
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


// --- Forgot Password Route (Uses Resend) ---
router.post('/forgot-password', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Please provide username' });
    }

    const configuredFrom = process.env.EMAIL_FROM;
    const configuredFrontendUrl = process.env.FRONTEND_URL;

    if (!process.env.RESEND_API_KEY || !configuredFrom || !configuredFrontendUrl) {
        console.error('Forgot Password Error: Resend API Key, From Email, or Frontend URL not configured.');
        return res.status(200).json({ message: 'If an account with that username exists, and email is configured, a reset link will be sent.' });
    }

    let user; // Define user outside try block to use in catch
    try {
        user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            console.log(`Password reset requested for non-existent user: ${username}`);
            // Still send generic success message
            return res.status(200).json({ message: 'If an account with that username exists, a password reset link has been sent.' });
        }

        // ** IMPORTANT: We need an actual email address field on the user model **
        // This is a placeholder - replace with user.email when you add it!
        const recipientEmail = user.username + "@example.com"; // <<< Replace this logic
        if(!recipientEmail || !recipientEmail.includes('@')) { // Basic check
             console.error(`Forgot Password Error: Cannot send email, user ${username} has no valid email address.`);
             return res.status(200).json({ message: 'If an account with that username exists and has a valid email, a password reset link has been sent.' });
        }
        // ** End Placeholder **


        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${configuredFrontendUrl}/reset-password.html?token=${resetToken}`; // Or your SPA route

        // --- Use Resend to send email ---
        const { data, error } = await resend.emails.send({
            from: configuredFrom, // e.g., 'Your App <onboarding@resend.dev>' or 'Your Name <your@verified-domain.com>'
            to: [recipientEmail], // Must be an array
            subject: 'Your Portfolio Password Reset Request',
            text: `You requested a password reset. Click this link within one hour:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
            // Optionally add html: `...` for a better looking email
        });

        if (error) {
          console.error('Resend Error:', error);
          // Throw error to be caught by the catch block below
          throw new Error('Failed to send password reset email.');
        }
        // --- End Resend ---

        console.log(`Password reset email sent successfully via Resend to user: ${username}, ID: ${data.id}`);
        res.status(200).json({ message: 'If an account with that username exists, a password reset link has been sent.' });

    } catch (error) {
        console.error('Forgot Password Process Error:', error);
        if (user) { // Attempt to clear token fields if user was found before error
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            try {
                 await user.save({ validateBeforeSave: false });
            } catch (saveError) {
                 console.error("Error clearing reset token after failure:", saveError);
            }
        }
        // Still send generic message
        res.status(200).json({ message: 'If an account with that username exists, and email is configured, a reset link will be sent.' });
    }
});


// --- Reset Password Route (no changes needed here, logic is independent of email provider) ---
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Please provide token and new password' });
    }
     if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        user.password = password; // Pre-save hook hashes
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