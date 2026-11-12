// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   gstNo: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   verificationToken: { type: String }, // Field to store the verification token
//   isVerified: { type: Boolean, default: false }, // Field to track if the user is verified
//   verificationTokenExpiry: {
//     type: Date,
//     default: null,
//   },
// });

// userSchema.index({ email: 1 }, { unique: true });

// const User = mongoose.model('User', userSchema);

// export default User;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    gstNo: {
        type: String,
        required: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // New fields for 6-digit verification
    verificationCode: {
        type: String,
        default: null
    },
    verificationExpires: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'user'],
        default: 'user'
    },
    pharmacyName: {
        type: String,
        default: 'MediCare Pharmacy',
        trim: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    lastLoginIP: {
        type: String,
        default: null
    },
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ verificationCode: 1 });

const User = mongoose.model('User', userSchema);

// For ES6 modules (if using import/export)
export default User;

// For CommonJS (if using require/module.exports)
// module.exports = User;