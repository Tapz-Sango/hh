const crypto = require('crypto');

/**
 * Simulates a payment gateway response.
 */
const simulatePayment = ({ amount, clientId, freelancerId, serviceId }) => {
  // Simple validation to mimic a gateway rejecting bad amounts
  if (!amount || amount <= 0) {
    return {
      success: false,
      error: 'Invalid payment amount'
    };
  }

  const paymentReference = `SIM-${crypto
    .randomBytes(6)
    .toString('hex')
    .toUpperCase()}`;

  return {
    success: true,
    paymentReference,
    amount,
    currency: 'USD',
    processedAt: new Date(),
    // In real life: gateway status, auth code, etc.
    gateway: 'SIMULATED'
  };
};

module.exports = { simulatePayment };