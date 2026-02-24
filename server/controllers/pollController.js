const pool = require('../config/db');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// GET /api/polls
const getPolls = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as creator_name,
        (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) as total_votes,
        (CASE WHEN p.expires_at IS NULL OR p.expires_at > NOW() THEN true ELSE false END) as is_active
      FROM polls p
      JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ polls: result.rows });
  } catch (err) {
    console.error('Get polls error:', err);
    res.status(500).json({ message: 'Failed to fetch polls' });
  }
};

// GET /api/polls/:id
const getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    const pollResult = await pool.query(`
      SELECT p.*, u.name as creator_name,
        (CASE WHEN p.expires_at IS NULL OR p.expires_at > NOW() THEN true ELSE false END) as is_active
      FROM polls p
      JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `, [id]);

    if (pollResult.rows.length === 0) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const optionsResult = await pool.query(
      'SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY id',
      [id]
    );

    // Check if current user has voted (if authenticated)
    let userVote = null;
    if (req.user) {
      const voteResult = await pool.query(
        'SELECT option_id FROM votes WHERE user_id = $1 AND poll_id = $2',
        [req.user.id, id]
      );
      if (voteResult.rows.length > 0) {
        userVote = voteResult.rows[0].option_id;
      }
    }

    res.json({
      poll: pollResult.rows[0],
      options: optionsResult.rows,
      userVote,
    });
  } catch (err) {
    console.error('Get poll error:', err);
    res.status(500).json({ message: 'Failed to fetch poll' });
  }
};

// POST /api/polls  (admin only)
const createPoll = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { title, description, options, expires_at } = req.body;

    if (!title || !options || options.length < 2) {
      return res.status(400).json({ message: 'Title and at least 2 options are required' });
    }

    const pollResult = await client.query(
      'INSERT INTO polls (title, description, created_by, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || null, req.user.id, expires_at || null]
    );

    const poll = pollResult.rows[0];

    // Insert options
    const insertedOptions = [];
    for (const optionText of options) {
      if (optionText.trim()) {
        const optResult = await client.query(
          'INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2) RETURNING *',
          [poll.id, optionText.trim()]
        );
        insertedOptions.push(optResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Poll created successfully',
      poll,
      options: insertedOptions,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create poll error:', err);
    res.status(500).json({ message: 'Failed to create poll' });
  } finally {
    client.release();
  }
};

// DELETE /api/polls/:id  (admin only)
const deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM polls WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json({ message: 'Poll deleted successfully' });
  } catch (err) {
    console.error('Delete poll error:', err);
    res.status(500).json({ message: 'Failed to delete poll' });
  }
};

// GET /api/polls/:id/results
const getPollResults = async (req, res) => {
  try {
    const { id } = req.params;

    const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [id]);
    if (pollResult.rows.length === 0) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const results = await pool.query(`
      SELECT po.id, po.option_text,
        COUNT(v.id)::INTEGER as vote_count
      FROM poll_options po
      LEFT JOIN votes v ON v.option_id = po.id
      WHERE po.poll_id = $1
      GROUP BY po.id, po.option_text
      ORDER BY vote_count DESC
    `, [id]);

    const totalVotes = results.rows.reduce((sum, r) => sum + r.vote_count, 0);

    // Add percentage and determine winner
    const options = results.rows.map((r) => ({
      ...r,
      percentage: totalVotes > 0 ? ((r.vote_count / totalVotes) * 100).toFixed(1) : '0.0',
    }));

    const winner = options.length > 0 ? options[0] : null;

    res.json({
      poll: pollResult.rows[0],
      results: options,
      totalVotes,
      winner,
    });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};

// POST /api/polls/upload  (admin only) - file-based poll creation
const uploadPoll = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let pollData = {}; // { title: '', options: [] }

    if (ext === '.csv') {
      pollData = await parseCSV(filePath);
    } else if (ext === '.json') {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(raw);
      pollData = {
        title: json.title,
        description: json.description || '',
        options: json.options || [],
      };
    } else if (ext === '.txt') {
      pollData = parseTXT(filePath);
    } else {
      return res.status(400).json({ message: 'Unsupported file format' });
    }

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    if (!pollData.title || pollData.options.length < 2) {
      return res.status(400).json({ message: 'File must contain a title and at least 2 options' });
    }

    // Create poll in DB
    await client.query('BEGIN');

    const pollResult = await client.query(
      'INSERT INTO polls (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [pollData.title, pollData.description || null, req.user.id]
    );

    const poll = pollResult.rows[0];
    const insertedOptions = [];

    for (const opt of pollData.options) {
      if (opt.trim()) {
        const optResult = await client.query(
          'INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2) RETURNING *',
          [poll.id, opt.trim()]
        );
        insertedOptions.push(optResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Poll created from file successfully',
      poll,
      options: insertedOptions,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Upload poll error:', err);
    // Cleanup file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to create poll from file' });
  } finally {
    client.release();
  }
};

// CSV Parser helper
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => {
        if (rows.length === 0) return reject(new Error('Empty CSV file'));
        const title = rows[0].title || 'Untitled Poll';
        const options = [...new Set(rows.map((r) => r.option).filter(Boolean))];
        resolve({ title, options });
      })
      .on('error', reject);
  });
};

// TXT Parser helper  (line 1 = title, remaining lines = options)
const parseTXT = (filePath) => {
  const lines = fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const title = lines[0] || 'Untitled Poll';
  const options = lines.slice(1);
  return { title, options };
};

module.exports = { getPolls, getPollById, createPoll, deletePoll, getPollResults, uploadPoll };
