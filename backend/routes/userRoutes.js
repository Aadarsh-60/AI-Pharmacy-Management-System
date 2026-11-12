import express from 'express';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // For generating tokens
import { sendVerificationEmail } from '../utils/emailService.js'; // For sending verification emails
import generateToken from '../utils/generateToken.js';
import { getBatchDetails } from "../controllers/billController.js"; // Assuming the batchDetails function is already implemented

import jwt from 'jsonwebtoken';

import { sendVerificationCodeEmail } from '../utils/emailService.js'; // Updated import
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register Route
// router.post('/register', async (req, res) => {
//     const { name, email, password, confirmPassword, gstNo } = req.body;

//     // Check if the passwords match
//     if (password !== confirmPassword) {
//         return res.status(400).json({ message: 'Passwords do not match' });
//     }

//     try {
//         // Convert email to lowercase for case-insensitive storage
//         const normalizedEmail = email.toLowerCase();

//         // Check if the user already exists
//         const userExists = await User.findOne({ email: normalizedEmail });
//         if (userExists) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Generate a verification token
//         const verificationToken = crypto.randomBytes(32).toString('hex');

//         // Create a new user instance
//         const user = new User({
//             name,
//             email: normalizedEmail, // Save email as lowercase
//             password: hashedPassword,
//             gstNo,
//             verificationToken, // Store the token for email verification
//             isVerified: false, // Initially, the user is not verified
//         });

//         // Save the user to the database
//         await user.save();

//         // Send verification email
//         await sendVerificationEmail(normalizedEmail, verificationToken);

//         // Send a response to the client
//         res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Email Verification Route
// router.get('/verify-email', async (req, res) => {
//     const { token } = req.query;

//     try {
//         // Find the user with the provided verification token
//         const user = await User.findOne({ verificationToken: token });

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired token' });
//         }

//         // Update the user's verification status
//         user.isVerified = true;
//         user.verificationToken = null; // Clear the token after verification
//         await user.save();

//         res.status(200).json({ message: 'Email verified successfully!' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// Registration Route with 6-digit verification code




// User Registration Route with 6-digit verification
router.use((req, res, next) => {
    console.log('\n🔍 USER ROUTE DEBUG:');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Full URL:', req.originalUrl);
    console.log('Headers:', {
        'content-type': req.headers['content-type'],
        'authorization': req.headers.authorization ? 'Present' : 'Missing',
        'origin': req.headers.origin
    });
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('Params:', req.params);
    console.log('=====================================\n');
    next();
});

// Test route to check if user routes are working
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User routes are working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path
    });
});

// User Registration Route with enhanced debugging
router.post('/register', async (req, res) => {
    console.log('🚀 Registration attempt started');
    console.log('Request body received:', req.body);
    
    try {
        const { name, email, password, confirmPassword, gstNo } = req.body;

        // Detailed validation logging
        console.log('Extracted fields:', { 
            name: name ? 'Present' : 'Missing', 
            email: email ? 'Present' : 'Missing', 
            password: password ? 'Present' : 'Missing', 
            confirmPassword: confirmPassword ? 'Present' : 'Missing', 
            gstNo: gstNo ? 'Present' : 'Missing' 
        });

        // Validate required fields
        if (!name || !email || !password || !confirmPassword) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required',
                missingFields: {
                    name: !name,
                    email: !email,
                    password: !password,
                    confirmPassword: !confirmPassword
                }
            });
        }

        // Check if the passwords match
        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match');
            return res.status(400).json({ 
                success: false,
                message: 'Passwords do not match' 
            });
        }

        // Convert email to lowercase for case-insensitive storage
        const normalizedEmail = email.toLowerCase();
        console.log('📧 Normalized email:', normalizedEmail);

        // Check if the user already exists
        console.log('🔍 Checking if user exists...');
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            // If already verified, block registration
            if (userExists.isVerified) {
                console.log('❌ User already exists and is verified');
                return res.status(400).json({ 
                    success: false,
                    message: 'An account with this email already exists. Please login.' 
                });
            }
            // If NOT verified — send email FIRST, then update DB
            console.log('⚠️ User exists but unverified — resending OTP...');
            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

            console.log('📨 Sending verification email first...');
            await sendVerificationCodeEmail(normalizedEmail, verificationCode);
            console.log('✅ Email sent — now updating user in DB...');

            userExists.name = name;
            userExists.password = hashedPassword;
            userExists.gstNo = gstNo;
            userExists.verificationCode = verificationCode;
            userExists.verificationExpires = verificationExpires;
            await userExists.save();
            console.log('✅ Unverified user updated in DB');

            return res.status(200).json({
                success: true,
                message: 'A new verification code has been sent to your email.',
                user: { email: normalizedEmail, name, isVerified: false }
            });
        }

        console.log('🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('🎲 Generating verification code...');
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

        // 📨 Send email FIRST — only save to DB if email succeeds
        console.log('📨 Sending verification email first...');
        await sendVerificationCodeEmail(normalizedEmail, verificationCode);
        console.log('✅ Verification email sent');

        console.log('👤 Creating user object...');
        const user = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            gstNo,
            verificationCode,
            verificationExpires,
            isVerified: false,
        });

        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User saved successfully');

        // Send a response to the client
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully. Please check your email for verification code.',
            user: {
                email: normalizedEmail,
                name: name,
                isVerified: false
            }
        });
        
        console.log('✅ Registration completed successfully');
    } catch (error) {
        console.error('❌ Registration error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Email Verification Route with debugging
router.post('/verify-email', async (req, res) => {
    console.log('🔐 Email verification attempt started');
    console.log('Request body:', req.body);
    
    const { email, verificationCode } = req.body;

    // Validate input
    if (!email || !verificationCode) {
        console.log('❌ Missing email or verification code');
        return res.status(400).json({ 
            success: false,
            message: 'Email and verification code are required',
            received: { email: !!email, verificationCode: !!verificationCode }
        });
    }

    try {
        console.log('🔍 Looking for user with email and code...');
        // Find the user with the provided email and verification code
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            verificationCode: verificationCode
        });

        if (!user) {
            console.log('❌ Invalid verification code or email');
            return res.status(400).json({ 
                success: false,
                message: 'Invalid verification code or email' 
            });
        }

        // Check if the verification code has expired
        if (user.verificationExpires < new Date()) {
            console.log('❌ Verification code has expired');
            return res.status(400).json({ 
                success: false,
                message: 'Verification code has expired. Please request a new one.' 
            });
        }

        console.log('✅ Updating user verification status...');
        // Update the user's verification status
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationExpires = null;
        await user.save();

        res.status(200).json({ 
            success: true,
            message: 'Email verified successfully! You can now log in.' 
        });
        
        console.log('✅ Email verification completed successfully');
    } catch (error) {
        console.error('❌ Email verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during email verification' 
        });
    }
});

// Resend Verification Code Route with debugging
router.post('/resend-verification', async (req, res) => {
    console.log('🔄 Resend verification attempt started');
    const { email } = req.body;

    // Validate input
    if (!email) {
        console.log('❌ Missing email');
        return res.status(400).json({ 
            success: false,
            message: 'Email is required' 
        });
    }

    try {
        console.log('🔍 Finding user...');
        // Find the user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        if (user.isVerified) {
            console.log('❌ Email already verified');
            return res.status(400).json({ 
                success: false,
                message: 'Email is already verified' 
            });
        }

        console.log('🎲 Generating new verification code...');
        // Generate a new 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set new expiration time (10 minutes from now)
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Update user with new code
        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        await user.save();

        console.log('📨 Resending verification email...');
        // Send new verification email
        await sendVerificationCodeEmail(email.toLowerCase(), verificationCode);

        res.status(200).json({ 
            success: true,
            message: 'Verification code resent successfully. Please check your email.' 
        });
        
        console.log('✅ Resend verification completed successfully');
    } catch (error) {
        console.error('❌ Resend verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during resending verification code' 
        });
    }
});

// Login Route with debugging
router.post('/login', async (req, res) => {
    console.log('🔑 Login attempt started');
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ 
            success: false,
            message: 'Email and password are required',
            received: { email: !!email, password: !!password }
        });
    }

    try {
        console.log('🔍 Finding user by email...');
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check if the user has verified their email
        if (!user.isVerified) {
            console.log('❌ Email not verified');
            return res.status(400).json({ 
                success: false,
                message: 'Please verify your email before logging in.',
                needsVerification: true
            });
        }

        console.log('🔐 Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        console.log('🎫 Generating token...');
        // Generate token for the authenticated user with id, email, and role
        const userRole = user.role || 'user';
        const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';

        // Update login security audit stats
        user.lastLogin = new Date();
        user.lastLoginIP = String(clientIp);
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        // Record security activity log
        try {
            await ActivityLog.create({
                userId: user._id,
                userEmail: user.email,
                action: 'User Login',
                resource: 'Authentication',
                details: {
                    role: userRole,
                    pharmacyName: user.pharmacyName || 'MediCare Pharmacy',
                    userAgent: req.headers['user-agent'] || 'Web Browser'
                },
                ipAddress: String(clientIp)
            });
        } catch (logErr) {
            console.warn('⚠️ Could not log login activity:', logErr.message);
        }

        const token = generateToken(user._id, user.email, userRole);

        // Send the token in the response
        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            token: token, 
            email: email.toLowerCase(),
            role: userRole,
            pharmacyName: user.pharmacyName || 'MediCare Pharmacy',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: userRole,
                pharmacyName: user.pharmacyName || 'MediCare Pharmacy',
                gstNo: user.gstNo,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount
            }
        });
        
        console.log('✅ Login completed successfully for role:', userRole);
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login' 
        });
    }
});

// Get user profile (protected route) with debugging
router.get('/profile', isAuthenticated, async (req, res) => {
    console.log('👤 Profile request started');
    console.log('User from token:', req.user);
    
    try {
        const user = await User.findById(req.user.id).select('-password -verificationCode');
        
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                pharmacyName: user.pharmacyName || 'MediCare Pharmacy',
                gstNo: user.gstNo,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
                lastLoginIP: user.lastLoginIP,
                loginCount: user.loginCount || 1,
                createdAt: user.createdAt
            }
        });
        
        console.log('✅ Profile fetched successfully');
    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching profile' 
        });
    }
});

// Change Password (protected route)
router.put('/change-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password. Please try again.'
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        try {
            await ActivityLog.create({
                userId: user._id,
                userEmail: user.email,
                action: 'Password Changed',
                resource: 'Authentication',
                details: { timestamp: new Date() },
                ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1'
            });
        } catch (logErr) {
            console.warn('Could not log password change activity:', logErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Password updated successfully!'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password. Please try again later.'
        });
    }
});

// Update Profile Details (protected route)
router.put('/update-profile', isAuthenticated, async (req, res) => {
    try {
        const { name, pharmacyName, gstNo } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }

        if (name) user.name = name.trim();
        if (pharmacyName) user.pharmacyName = pharmacyName.trim();
        if (gstNo) user.gstNo = gstNo.trim().toUpperCase();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                pharmacyName: user.pharmacyName,
                gstNo: user.gstNo
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile details'
        });
    }
});

// Get recent login history / audit logs (protected route)
router.get('/login-history', isAuthenticated, async (req, res) => {
    try {
        const logs = await ActivityLog.find({
            $or: [
                { userId: req.user.id },
                { userEmail: req.user.email }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        res.status(200).json({
            success: true,
            logs
        });
    } catch (error) {
        console.error('Login history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch login history'
        });
    }
});

// Batch Details Route
router.get('/batch-details', getBatchDetails);

// Forgot Password - Send Reset Code
router.post('/forgot-password', async (req, res) => {
    console.log('🔑 Forgot password attempt started');
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(400).json({ success: false, message: 'No account found with that email' });
        }

        // Generate a 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store reset code in verification fields (reuse existing schema fields)
        user.verificationCode = resetCode;
        user.verificationExpires = resetExpires;
        await user.save();

        // Send reset code email
        await sendVerificationCodeEmail(email.toLowerCase(), resetCode);

        res.status(200).json({
            success: true,
            message: 'Password reset code sent to your email. It will expire in 10 minutes.'
        });

        console.log('✅ Forgot password code sent successfully');
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reset Password - Verify Code & Update Password
router.post('/reset-password', async (req, res) => {
    console.log('🔑 Reset password attempt started');
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, reset code, and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    try {
        const user = await User.findOne({
            email: email.toLowerCase(),
            verificationCode: resetCode
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid reset code or email' });
        }

        if (user.verificationExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.verificationCode = null;
        user.verificationExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully! You can now log in with your new password.'
        });

        console.log('✅ Password reset completed successfully');
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error during password reset' });
    }
});


export default router;
