const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { Resend } = require('resend');

const router = express.Router();

// === ADD JSON PARSER FOR THIS ROUTER ===
router.use(express.json()); 
// ======================================

// --- Instantiate Resend ---
let resend;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('WARNING: RESEND_API_KEY environment variable not set. Email sending will fail.');
    resend = { emails: { send: () => Promise.reject("Resend API Key not configured") } };
}

// --- Password Validation Regex ---
const uppercaseRegex = /[A-Z]/;
const numberRegex = /[0-9]/;
const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

// --- Registration Route (Handles Email & Stricter Password) ---
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) { return res.status(400).json({ message: 'Please provide username, email, and password' }); }
    let passwordErrors = [];
    if (password.length < 6) { passwordErrors.push('Password must be at least 6 characters long'); }
    if (!uppercaseRegex.test(password)) { passwordErrors.push('Password must contain at least one uppercase letter'); }
    if (!numberRegex.test(password)) { passwordErrors.push('Password must contain at least one number'); }
    if (!specialCharRegex.test(password)) { passwordErrors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'); }
    if (passwordErrors.length > 0) { return res.status(400).json({ message: passwordErrors.join('. ') }); }
    try {
        const existingUser = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
        if (existingUser) { let message = existingUser.username === username.toLowerCase() ? 'Username already exists' : 'Email already registered'; return res.status(400).json({ message: message }); }
        const newUser = new User({ username, email, password }); await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
    } catch (error) {
        console.error("Registration Error:", error); if (error.name === 'ValidationError') { let messages = Object.values(error.errors).map(val => val.message); return res.status(400).json({ message: messages.join('. ') }); }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
     const { username, password } = req.body; if (!username || !password) return res.status(400).json({ message: 'Please provide username and password' });
     try {
        const user = await User.findOne({ username: username.toLowerCase() }); if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await user.comparePassword(password); if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        res.status(200).json({ message: 'Login successful!', userId: user._id, username: user.username });
     } catch (error) { console.error("Login Error:", error); res.status(500).json({ message: 'Server error during login' }); }
});

// --- Forgot Password Route (Uses Real Email & Corrected URL) ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body; if (!email) { return res.status(400).json({ message: 'Please provide your registered email address' }); }
    const configuredFrom = process.env.EMAIL_FROM; const configuredFrontendUrl = process.env.FRONTEND_URL;
    if (!process.env.RESEND_API_KEY || !configuredFrom || !configuredFrontendUrl) { console.error('Forgot Password Error: Resend API Key, From Email, or Frontend URL not configured.'); return res.status(200).json({ message: 'If an account with that email exists, and email sending is configured, a reset link will be sent.' }); }
    let user;
    try {
        user = await User.findOne({ email: email.toLowerCase() });
        if (!user) { console.log(`Password reset requested for non-existent email: ${email}`); return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' }); }
        const recipientEmail = user.email; if(!recipientEmail) { console.error(`Forgot Password Error: User ${user.username} found but has no email address.`); return res.status(200).json({ message: 'If an account with that username exists and has a configured email, a password reset link has been sent.' }); }
        const resetToken = user.generatePasswordResetToken(); await user.save({ validateBeforeSave: false });

        // --- THIS IS THE CHANGED LINE ---
        // Point to the root URL (index.html is default) with the token parameter
        const resetUrl = `${configuredFrontendUrl}/?token=${resetToken}`;
        // --- END CHANGE ---

        const { data, error } = await resend.emails.send({ from: configuredFrom, to: [recipientEmail], subject: 'Your Portfolio Password Reset Request', text: `You requested a password reset. Click this link within one hour:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.` });
        if (error) { console.error('Resend Error:', error); throw new Error('Failed to send password reset email.'); }
        console.log(`Password reset email sent via Resend to: ${recipientEmail}, ID: ${data.id}`); res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot Password Process Error:', error); if (user) { user.resetPasswordToken = undefined; user.resetPasswordExpires = undefined; try { await user.save({ validateBeforeSave: false }); } catch (saveError) { console.error("Error clearing reset token after failure:", saveError); } }
        res.status(200).json({ message: 'If an account with that email exists, and email sending is configured, a reset link will be sent.' });
    }
});


// --- Reset Password Route (Uses Stricter Password Validation) ---
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body; if (!token || !password) { return res.status(400).json({ message: 'Please provide token and new password' }); }
    let passwordErrors = []; if (password.length < 6) { passwordErrors.push('Password must be at least 6 characters long'); } if (!uppercaseRegex.test(password)) { passwordErrors.push('Password must contain at least one uppercase letter'); } if (!numberRegex.test(password)) { passwordErrors.push('Password must contain at least one number'); } if (!specialCharRegex.test(password)) { passwordErrors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'); } if (passwordErrors.length > 0) { return res.status(400).json({ message: passwordErrors.join('. ') }); }
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) { return res.status(400).json({ message: 'Password reset token is invalid or has expired.' }); }
        user.password = password; user.resetPasswordToken = undefined; user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset Password Error:', error); if (error.name === 'ValidationError') { let messages = Object.values(error.errors).map(val => val.message); return res.status(400).json({ message: messages.join('. ') }); }
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

module.exports = router;