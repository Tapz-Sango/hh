const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

/**
 * GET /api/earnings/summary
 * Returns total income, pending income, and counts for the logged-in freelancer.
 */
const getEarningsSummary = async (req, res, next) => {
  try {
    const freelancerId = new mongoose.Types.ObjectId(req.userId);

    const result = await Transaction.aggregate([
      { $match: { freelancerId } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      totalEarned: 0,      // completed transactions
      pendingIncome: 0,    // pending transactions
      refunded: 0,         // refunded transactions
      completedCount: 0,
      pendingCount: 0,
      refundedCount: 0
    };

    result.forEach((row) => {
      if (row._id === 'completed') {
        summary.totalEarned = row.total;
        summary.completedCount = row.count;
      } else if (row._id === 'pending') {
        summary.pendingIncome = row.total;
        summary.pendingCount = row.count;
      } else if (row._id === 'refunded') {
        summary.refunded = row.total;
        summary.refundedCount = row.count;
      }
    });

    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/earnings/transactions
 * Full list of transactions for the logged-in freelancer (income history).
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ freelancerId: req.userId })
      .populate('serviceId', 'title category price')
      .populate('clientId', 'name email')
      .populate('bookingId', 'date time status')
      .sort({ createdAt: -1 });

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/earnings/bookings
 * Bookings received by the freelancer, including transaction status.
 */
const getReceivedBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ freelancerId: req.userId })
      .populate('serviceId', 'title category price')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

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

module.exports = {
  getEarningsSummary,
  getMyTransactions,
  getReceivedBookings
};