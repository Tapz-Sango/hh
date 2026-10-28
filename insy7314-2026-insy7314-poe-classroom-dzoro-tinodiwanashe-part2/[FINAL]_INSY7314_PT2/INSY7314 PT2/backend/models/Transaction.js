const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // Link back to the booking that generated this transaction
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true // one transaction per booking
    },
    // Who paid
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Who gets paid
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Which service was purchased
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    // Simulated payment amount
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    // Simulated payment reference (like a fake receipt number)
    paymentReference: {
      type: String,
      required: true
    },
    // Mirrors booking status: pending → completed or cancelled
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    // When the freelancer's income was recognized
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Helpful indexes for income queries
transactionSchema.index({ freelancerId: 1, status: 1 });
transactionSchema.index({ clientId: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);