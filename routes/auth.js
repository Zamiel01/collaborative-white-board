const express = require('express');
const { login, validateSignup } = require('../controllers/authController');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const router = express.Router();

// Example route
router.get('/', (req, res) => {
    res.send('Auth Home Page');
});

// Signup route
router.post('/signup', async (req, res) => {
    const { username, password, repeatPassword, email } = req.body;

    if (!username || !password || !repeatPassword || !email) {
        return res.status(400).send('All fields are required');
    }

    if (password !== repeatPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            email
        });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send('Username or email already exists');
        } else {
            res.status(500).send('Error during signup');
        }
    }
});

// Login route
router.post('/login', login);

module.exports = router;
