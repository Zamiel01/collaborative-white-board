const express = require('express');
const { createBoard } = require('../controllers/boardController');

const router = express.Router();

// Create board route
router.post('/create', createBoard);

module.exports = router;
