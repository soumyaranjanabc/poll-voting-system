const pool = require('../config/db');
const { MinHeap, calculateTrendingScore } = require('../dsa/MinHeap');
const { searchPolls, sortPollsByTitle } = require('../dsa/BinarySearch');
const { addActivity, getRecentActivity } = require('../dsa/LinkedList');
const { PollExpiryQueue } = require('../dsa/Queue');
const { sortPollResults } = require('../dsa/QuickSort');

const expiryQueue = new PollExpiryQueue();


const getTrendingPolls = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const result = await pool.query(`
      SELECT p.*, u.name as creator_name,
        COUNT(v.id)::INTEGER as total_votes,
        (CASE WHEN p.expires_at IS NULL OR p.expires_at > NOW() THEN true ELSE false END) as is_active
      FROM polls p
      JOIN users u ON p.created_by = u.id
      LEFT JOIN votes v ON v.poll_id = p.id
      GROUP BY p.id, u.name
    `);

    const polls = result.rows;


    const heap = new MinHeap();
    polls.forEach(poll => {
      const score = calculateTrendingScore({
        ...poll,
        total_votes: parseInt(poll.total_votes) || 0,
      });
      heap.insert({ ...poll, score, trendingScore: -score.toFixed(2) });
    });

    const trending = heap.getTopN(limit);

    res.json({
      trending,
      algorithm: 'Min-Heap (Priority Queue)',
      description: 'Polls ranked by votes per hour using a Min-Heap',
      heapSize: heap.size(),
      timeComplexity: 'O(n log n) to build, O(log n) per insert',
    });
  } catch (err) {
    console.error('Trending polls error:', err);
    res.status(500).json({ message: 'Failed to fetch trending polls' });
  }
};


const searchPollsHandler = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter q is required' });

    const result = await pool.query(`
      SELECT p.*, u.name as creator_name,
        COUNT(v.id)::INTEGER as total_votes
      FROM polls p
      JOIN users u ON p.created_by = u.id
      LEFT JOIN votes v ON v.poll_id = p.id
      GROUP BY p.id, u.name
      ORDER BY p.title ASC
    `);

    const polls = result.rows;
    const searchResult = searchPolls(polls, q);

    res.json({
      ...searchResult,
      query: q,
      description: `Binary search on ${polls.length} polls sorted alphabetically`,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed' });
  }
};


const getActivityFeed = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = getRecentActivity(limit);

    res.json({
      activities,
      count: activities.length,
      algorithm: 'Doubly Linked List',
      description: 'Recent vote activity stored in a doubly linked list — O(1) append, O(n) traversal from tail',
      timeComplexity: 'O(1) insert, O(n) retrieval',
    });
  } catch (err) {
    console.error('Activity feed error:', err);
    res.status(500).json({ message: 'Failed to fetch activity' });
  }
};


const getExpiryQueue = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM polls
      WHERE expires_at IS NOT NULL AND expires_at > NOW()
      ORDER BY expires_at ASC
    `);

    const withinMinutes = parseInt(req.query.within) || 1440; // default 24 hours
    const queued = expiryQueue.checkExpiring(result.rows, withinMinutes);

    res.json({
      expiringPolls: expiryQueue.getQueueItems(),
      queueSize: expiryQueue.getQueueSize(),
      checkedWithinMinutes: withinMinutes,
      algorithm: 'Queue (FIFO)',
      description: 'Polls expiring soon processed in order using a Queue — O(1) enqueue/dequeue',
      timeComplexity: 'O(1) enqueue, O(1) dequeue',
    });
  } catch (err) {
    console.error('Expiry queue error:', err);
    res.status(500).json({ message: 'Failed to fetch expiry queue' });
  }
};


const getSortedResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { sortBy = 'vote_count', order = 'desc' } = req.query;

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
    `, [id]);

    const totalVotes = results.rows.reduce((sum, r) => sum + r.vote_count, 0);
    const withPercentage = results.rows.map(r => ({
      ...r,
      percentage: totalVotes > 0
        ? parseFloat(((r.vote_count / totalVotes) * 100).toFixed(1))
        : 0,
    }));

    const sorted = sortPollResults(withPercentage, sortBy, order);

    res.json({
      poll: pollResult.rows[0],
      totalVotes,
      winner: sorted.results[0] || null,
      ...sorted,
    });
  } catch (err) {
    console.error('Sorted results error:', err);
    res.status(500).json({ message: 'Failed to fetch sorted results' });
  }
};


const getDSAInfo = (req, res) => {
  res.json({
    title: 'DSA Implementations in Poll Voting System',
    implementations: [
      {
        name: 'Min-Heap (Priority Queue)',
        file: 'server/dsa/MinHeap.js',
        usedFor: 'Trending polls — ranks polls by votes/hour',
        endpoint: 'GET /api/dsa/trending',
        timeComplexity: { insert: 'O(log n)', extractMin: 'O(log n)', peek: 'O(1)' },
        spaceComplexity: 'O(n)',
      },
      {
        name: 'Binary Search',
        file: 'server/dsa/BinarySearch.js',
        usedFor: 'Poll search by title prefix',
        endpoint: 'GET /api/dsa/search?q=query',
        timeComplexity: { search: 'O(log n)', sort: 'O(n log n)' },
        spaceComplexity: 'O(1)',
      },
      {
        name: 'Doubly Linked List',
        file: 'server/dsa/LinkedList.js',
        usedFor: 'Vote activity feed with bidirectional traversal',
        endpoint: 'GET /api/dsa/activity',
        timeComplexity: { append: 'O(1)', getRecent: 'O(n)', search: 'O(n)' },
        spaceComplexity: 'O(n)',
      },
      {
        name: 'Queue (FIFO)',
        file: 'server/dsa/Queue.js',
        usedFor: 'Processing expiring polls in order',
        endpoint: 'GET /api/dsa/expiry-queue',
        timeComplexity: { enqueue: 'O(1)', dequeue: 'O(1)', peek: 'O(1)' },
        spaceComplexity: 'O(n)',
      },
      {
        name: 'QuickSort',
        file: 'server/dsa/QuickSort.js',
        usedFor: 'Sort poll results by votes, percentage, or name',
        endpoint: 'GET /api/dsa/results/:id?sortBy=vote_count&order=desc',
        timeComplexity: { average: 'O(n log n)', worst: 'O(n²)', best: 'O(n log n)' },
        spaceComplexity: 'O(log n)',
      },
    ],
  });
};

const recordVoteActivity = (userId, pollId, optionText, pollTitle) => {
  addActivity({
    type: 'vote',
    userId,
    poll_id: pollId,
    pollTitle,
    optionText,
  });
};

module.exports = {
  getTrendingPolls,
  searchPollsHandler,
  getActivityFeed,
  getExpiryQueue,
  getSortedResults,
  getDSAInfo,
  recordVoteActivity,
};


