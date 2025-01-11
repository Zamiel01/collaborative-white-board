const mongoose = require('mongoose');

const connectToDatabase = async () => {
    const mongoURI = process.env.MONGODB_URI;
    console.log('MongoDB URI:', mongoURI); // Debugging line to check the URI

    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
};

module.exports = connectToDatabase;
