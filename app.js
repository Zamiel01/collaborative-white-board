require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const morgan = require('morgan'); // Add morgan for logging
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board'); // Import board routes
const User = require('./models/user'); // Import User model
const Board = require('./models/board'); // Import Board model

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(morgan('combined')); // Use morgan for logging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes); // Use board routes

// Middleware to get user email from session
app.use((req, res, next) => {
    if (req.session.userEmail) {
        res.locals.userEmail = req.session.userEmail;
    }
    next();
});

// Serve signup page
app.get('/signup', (req, res) => {
    console.log('Serving signup page');
    res.render('pages/signup', { errors: req.flash('errors'), data: req.flash('data') });
});

// Serve login page
app.get('/login', (req, res) => {
    console.log('Serving login page');
    res.render('pages/login', { info: req.flash('info') });
});

// Serve dashboard page
app.get('/dashboard', async (req, res) => {
    console.log('Serving dashboard page');
    try {
        const boards = await Board.find({ teamId: req.session.teamId }); // Fetch boards for the team
        res.render('pages/dashboard', { userEmail: res.locals.userEmail, boards: boards || [] });
    } catch (err) {
        console.error('Error fetching boards:', err);
        res.status(500).send('Error fetching boards');
    }
});

// Serve board page
app.get('/board/:id', async (req, res) => {
    console.log('Serving board page');
    try {
        const board = await Board.findById(req.params.id);
        res.render('pages/board', { board });
    } catch (err) {
        console.error('Error fetching board:', err);
        res.status(500).send('Error fetching board');
    }
});

// MongoDB Atlas connection with retry logic
const mongoURI = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoURI); // Debugging line to check the URI

const connectWithRetry = () => {
    mongoose.connect(mongoURI).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Error connecting to MongoDB:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
