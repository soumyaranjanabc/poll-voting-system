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

router.get('/info',         getDSAInfo);                    
router.get('/trending',     authenticate, getTrendingPolls); 
router.get('/search',       authenticate, searchPollsHandler); 
router.get('/activity',     authenticate, getActivityFeed);  
router.get('/expiry-queue', authenticate, getExpiryQueue);   
router.get('/results/:id',  authenticate, getSortedResults); 

module.exports = router;
