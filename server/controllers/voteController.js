const pool = require('../config/db');
const { recordVoteActivity } = require('./dsaController');

// POST /api/vote
const castVote = async (req, res) => {
  try {
    const { poll_id, option_id } = req.body;
    const user_id = req.user.id;

    if (!poll_id || !option_id) {
      return res.status(400).json({ message: 'poll_id and option_id are required' });
    }

    const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [poll_id]);
    if (pollResult.rows.length === 0) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const poll = pollResult.rows[0];
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return res.status(400).json({ message: 'This poll has expired' });
    }

    const optionResult = await pool.query(
      'SELECT * FROM poll_options WHERE id = $1 AND poll_id = $2',
      [option_id, poll_id]
    );
    if (optionResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid option for this poll' });
    }

    await pool.query(
      'INSERT INTO votes (user_id, poll_id, option_id) VALUES ($1, $2, $3)',
      [user_id, poll_id, option_id]
    );

    // Record in Doubly Linked List activity feed
    recordVoteActivity(
      user_id,
      poll_id,
      optionResult.rows[0].option_text,
      poll.title
    );

    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'You have already voted on this poll' });
    }
    console.error('Vote error:', err);
    res.status(500).json({ message: 'Failed to cast vote' });
  }
};

// GET /api/votes/my
const getMyVotes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.poll_id, v.option_id, v.created_at,
        p.title as poll_title,
        po.option_text as voted_option
      FROM votes v
      JOIN polls p ON v.poll_id = p.id
      JOIN poll_options po ON v.option_id = po.id
      WHERE v.user_id = $1
      ORDER BY v.created_at DESC
    `, [req.user.id]);

    res.json({ votes: result.rows });
  } catch (err) {
    console.error('Get my votes error:', err);
    res.status(500).json({ message: 'Failed to fetch voting history' });
  }
};

module.exports = { castVote, getMyVotes };
