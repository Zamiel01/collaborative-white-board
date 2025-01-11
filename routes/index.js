const express = require('express');
const router = express.Router();
const Board = require('../models/board');

// ...existing code...

router.post('/api/boards/create', async (req, res) => {
    const { name } = req.body;
    const { userId, userEmail, teamId } = req.session;

    try {
        const board = new Board({
            name,
            teamId,
            modifiedBy: userEmail,
            modifiedAt: new Date()
        });
        await board.save();
        console.log('Board created successfully:', name);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).send('Error creating board');
    }
});

router.get('/dashboard', async (req, res) => {
    const boards = await Board.find({});
    res.render('pages/dashboard', { boards });
});

// ...existing code...

router.get('/board/:id', async (req, res) => {
    const board = await Board.findById(req.params.id);
    res.render('pages/board', { board });
});

router.post('/join-board', async (req, res) => {
    const boardLink = req.body.boardLink;
    const boardId = boardLink.split('/').pop();
    const board = await Board.findById(boardId);
    if (board) {
        res.redirect(`/board/${boardId}`);
    } else {
        res.status(404).send('Board not found');
    }
});

// ...existing code...
module.exports = router;
