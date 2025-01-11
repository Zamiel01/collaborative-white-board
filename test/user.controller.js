const User = require('../lib/models/user.model');
const bcrypt = require('bcrypt');
const connectToDatabase = require('../lib/dbConnect');
const { body, validationResult } = require('express-validator');

// Validator array for signup
const validateSignup = [
  body('email', 'Email must not be empty').notEmpty(),
  body('email', 'Invalid email format').isEmail(),
  body('password', 'Password must not be empty').notEmpty(),
  body('password', 'Password must be 6+ characters long').isLength({ min: 6 }),
  body('repeatPassword', 'Repeat Password must not be empty').notEmpty(),
  body('repeatPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
];

// User signup function
const signup = async (req, res) => {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array();
      req.flash('errors', errors); // Add errors to flash
      req.flash('data', req.body);  // Store the user data for form re-population
      return res.redirect('/signup'); // Redirect back to signup form
    }

    // Connect to DB and check if user exists, then hash the password
    await connectToDatabase();

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      req.flash('data', req.body);
      req.flash('info', [{ message: 'Email is already registered. Try logging in.', type: 'error' }]); // Error toast
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword };

    const result = await User.create(newUser);
    req.session.userId = result._id;

    req.flash('info', [{ message: 'Signup Successful! You can now log in.', type: 'success' }]); // Success toast
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during signup');
  }
};

module.exports = {
  signup,
  validateSignup,
};
