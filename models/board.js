const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    name: String,
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    modifiedBy: String,
    modifiedAt: {
        type: Date,
        default: Date.now
    }
    // Add other fields as necessary
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
