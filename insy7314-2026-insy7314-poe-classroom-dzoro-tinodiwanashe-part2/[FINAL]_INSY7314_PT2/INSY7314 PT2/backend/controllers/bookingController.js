const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const { simulatePayment } = require('../utils/paymentSimulator');

// Create a new booking + associated transaction
const createBooking = async (req, res, next) => {
  try {
    const { serviceId, date, time, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Prevent freelancers from booking their own gigs
    if (service.freelancerId.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own service'
      });
    }

    // 1. Create the booking
    const booking = await Booking.create({
      serviceId: service._id,
      clientId: req.userId,
      freelancerId: service.freelancerId,
      amount: service.price,
      date,
      time,
      notes: notes || ''
    });

    // 2. Simulate the payment/confirmation
    const payment = simulatePayment({
      amount: service.price,
      clientId: req.userId,
      freelancerId: service.freelancerId,
      serviceId: service._id
    });

    if (!payment.success) {
      // Roll back the booking if payment fails
      await Booking.findByIdAndDelete(booking._id);
      return res.status(400).json({
        success: false,
        message: payment.error || 'Payment simulation failed'
      });
    }

    // 3. Create the transaction record linked to booking + users
    const transaction = await Transaction.create({
      bookingId: booking._id,
      clientId: req.userId,
      freelancerId: service.freelancerId,
      serviceId: service._id,
      amount: service.price,
      currency: payment.currency,
      paymentReference: payment.paymentReference,
      status: 'pending' // becomes 'completed' when freelancer marks booking complete
    });

    const populated = await Booking.findById(booking._id)
      .populate('serviceId', 'title price category')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created and payment simulated successfully',
      booking: populated,
      transaction: {
        id: transaction._id,
        paymentReference: transaction.paymentReference,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings where the current user is either client or freelancer
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      $or: [{ clientId: req.userId }, { freelancerId: req.userId }]
    })
      .populate('serviceId', 'title price category')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    // Attach transaction info to each booking
    const bookingIds = bookings.map((b) => b._id);
    const transactions = await Transaction.find({
      bookingId: { $in: bookingIds }
    });

    const txMap = new Map(
      transactions.map((t) => [t.bookingId.toString(), t])
    );

    const enriched = bookings.map((b) => {
      const tx = txMap.get(b._id.toString());
      return {
        ...b.toObject(),
        transaction: tx
          ? {
              id: tx._id,
              paymentReference: tx.paymentReference,
              amount: tx.amount,
              currency: tx.currency,
              status: tx.status,
              completedAt: tx.completedAt
            }
          : null
      };
    });

    res.json({ success: true, bookings: enriched });
  } catch (error) {
    next(error);
  }
};

// Freelancer or client can update status (complete or cancel)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isClient = booking.clientId.toString() === req.userId;
    const isFreelancer = booking.freelancerId.toString() === req.userId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
    }
    await booking.save();

    // Sync the linked transaction status
    let transactionUpdate = {};
    if (status === 'completed') {
      transactionUpdate = { status: 'completed', completedAt: new Date() };
    } else if (status === 'cancelled') {
      transactionUpdate = { status: 'refunded' };
    } else if (status === 'pending') {
      transactionUpdate = { status: 'pending', completedAt: null };
    }

    await Transaction.findOneAndUpdate(
      { bookingId: booking._id },
      transactionUpdate,
      { new: true }
    );

    const populated = await Booking.findById(booking._id)
      .populate('serviceId', 'title price category')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };