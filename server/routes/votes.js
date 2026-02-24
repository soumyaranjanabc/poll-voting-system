const express = require('express');
const router = express.Router();
const { castVote, getMyVotes } = require('../controllers/voteController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, castVote);
router.get('/my', authenticate, getMyVotes);

module.exports = router;
