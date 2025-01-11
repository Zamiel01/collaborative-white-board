const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const mongoose = require('mongoose'); // Import mongoose for ObjectId
const connectToDatabase = require('../lib/dbConnect');

// Validator array for signup
exports.validateSignup = [
    body('email', 'Email must not be empty').notEmpty(),
    body('email', 'Invalid email format').isEmail(),
    body('password', 'Password must not be empty').notEmpty(),
    body('password', 'Password must be 6+ characters long').isLength({ min: 6 }),
    body('repeatPassword', 'Repeat Password must not be empty').notEmpty(),
    body('repeatPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
];

// Signup function
exports.signup = async (req, res, next) => {
    try {
        console.log('Signup request received');
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            const errors = validationErrors.array();
            console.log('Validation errors:', errors);
            req.flash('errors', errors); // Add errors to flash
            req.flash('data', req.body);  // Store the user data for form re-population
            return res.redirect('/signup'); // Redirect back to signup form
        }

        await connectToDatabase(); // Connect to DB

        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('Email already registered:', email);
            req.flash('data', req.body);
            req.flash('info', [{ message: 'Email is already registered. Try logging in.', type: 'error' }]); // Error toast
            return res.redirect('/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, teamId: new mongoose.Types.ObjectId() }); // Set a valid ObjectId for teamId
        const result = await newUser.save();
        req.session.userId = result._id;
        req.session.userEmail = result.email;
        req.session.teamId = result.teamId; // Assuming teamId is part of the user model

        console.log('User created successfully:', email);
        req.flash('info', [{ message: 'Signup Successful! You can now log in.', type: 'success' }]); // Success toast
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Error during signup');
    }
};

// Login function
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        console.log('Login request received');
        await connectToDatabase(); // Connect to DB

        const user = await User.findOne({ email });
        if (!user) {
            console.log('Invalid credentials:', email);
            req.flash('info', [{ message: 'Invalid credentials', type: 'error' }]);
            return res.redirect('/login');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid credentials:', email);
            req.flash('info', [{ message: 'Invalid credentials', type: 'error' }]);
            return res.redirect('/login');
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        req.session.userId = user._id;
        req.session.userEmail = user.email;
        req.session.teamId = user.teamId || new mongoose.Types.ObjectId(); // Set a valid ObjectId for teamId if not present

        console.log('User logged in successfully:', email);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error during login:', err);
        next(err);
    }
};
