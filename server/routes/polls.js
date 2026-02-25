const express = require('express');
const router = express.Router();
const {
  getPolls,
  getPollById,
  createPoll,
  deletePoll,
  getPollResults,
  uploadPoll,
} = require('../controllers/pollController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.get('/', authenticate, getPolls);
router.get('/:id', authenticate, getPollById);
router.get('/:id/results', getPollResults);
router.post('/', authenticate, requireAdmin, createPoll);
router.delete('/:id', authenticate, requireAdmin, deletePoll);
router.post('/upload', authenticate, requireAdmin, upload.single('file'), uploadPoll);

module.exports = router;
