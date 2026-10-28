const express = require('express');
const {
  protect,
  requireRole
} = require('../middleware/authMiddleware');
const {
  getEarningsSummary,
  getMyTransactions,
  getReceivedBookings
} = require('../controllers/earningsController');

const router = express.Router();

// All earnings routes are protected
router.get(
  '/summary',
  protect,
  requireRole('freelancer'),
  getEarningsSummary
);

router.get(
  '/transactions',
  protect,
  requireRole('freelancer'),
  getMyTransactions
);

router.get(
  '/bookings',
  protect,
  requireRole('freelancer'),
  getReceivedBookings
);

module.exports = router;