const Board = require('../models/board');
const connectToDatabase = require('../lib/dbConnect');

exports.createBoard = async (req, res, next) => {
    try {
        await connectToDatabase(); // Connect to DB

        const { boardName, teamId: bodyTeamId, modifiedBy: bodyModifiedBy } = req.body;
        const { teamId: sessionTeamId, userEmail: sessionModifiedBy } = req.session;

        const teamId = sessionTeamId || bodyTeamId;
        const modifiedBy = sessionModifiedBy || bodyModifiedBy;

        if (!teamId || !modifiedBy) {
            return res.status(400).json({ error: 'teamId or modifiedBy is required' });
        }

        const newBoard = new Board({
            name: boardName,
            teamId: teamId,
            modifiedBy: modifiedBy
        });
        const result = await newBoard.save();

        console.log('Board created successfully:', boardName);
        res.redirect(`/board/${result._id}`);
    } catch (err) {
        console.error('Error creating board:', err);
        res.status(500).send('Error creating board');
    }
};

// New method to generate an invitation link
exports.generateInvitationLink = async (req, res) => {
    try {
        const { boardId } = req.params; // Get board ID from request parameters
        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        // Generate a unique invitation link (this is a simple example)
        const invitationLink = `http://yourapp.com/board/${boardId}/invite`;

        // Save the invitation link to the board
        board.invitationLink = invitationLink;
        await board.save();

        res.status(200).json({ invitationLink });
    } catch (err) {
        console.error('Error generating invitation link:', err);
        res.status(500).send('Error generating invitation link');
    }
};
