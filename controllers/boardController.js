const Board = require('../models/board');
const connectToDatabase = require('../lib/dbConnect');

exports.createBoard = async (req, res, next) => {
    try {
        await connectToDatabase(); // Connect to DB

        const { boardName, teamId: bodyTeamId, modifiedBy: bodyModifiedBy } = req.body;
        const { teamId: sessionTeamId, userEmail: sessionModifiedBy } = req.session;

        console.log('Session data:', req.session); // Log session data for debugging

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
