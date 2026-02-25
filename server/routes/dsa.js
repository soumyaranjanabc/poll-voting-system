const express = require('express');
const router = express.Router();
const {
  getTrendingPolls,
  searchPollsHandler,
  getActivityFeed,
  getExpiryQueue,
  getSortedResults,
  getDSAInfo,
} = require('../controllers/dsaController');
const { authenticate } = require('../middleware/auth');

router.get('/info',         getDSAInfo);                    // public
router.get('/trending',     authenticate, getTrendingPolls); // MinHeap
router.get('/search',       authenticate, searchPollsHandler); // BinarySearch
router.get('/activity',     authenticate, getActivityFeed);  // LinkedList
router.get('/expiry-queue', authenticate, getExpiryQueue);   // Queue
router.get('/results/:id',  authenticate, getSortedResults); // QuickSort

module.exports = router;
