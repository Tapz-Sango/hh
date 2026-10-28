//validates all bookings made via middlware authentication
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateBooking, validateId } = require('../middleware/validationMiddleware');
const { bookingLimiter } = require('../middleware/securityMiddleware');
const Booking = require('../models/Booking');
const {
  createBooking,
  getMyBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/', protect, bookingLimiter, validateBooking, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/status', protect, validateId, updateBookingStatus);

module.exports = router;
