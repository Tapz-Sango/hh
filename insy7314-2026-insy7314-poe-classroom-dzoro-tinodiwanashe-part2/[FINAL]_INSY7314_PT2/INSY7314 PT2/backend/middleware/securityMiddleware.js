const sanitizeHtml = require('sanitize-html');
const { rateLimit } = require('express-rate-limit');

/*
 * Removes HTML/JavaScript from user input and removes
 * MongoDB operator keys such as $gt and keys containing dots.
 */
const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const cleanObject = {};

    for (const [key, childValue] of Object.entries(value)) {
      // Prevent MongoDB operator injection
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }

      cleanObject[key] = sanitizeValue(childValue);
    }

    return cleanObject;
  }

  if (typeof value === 'string') {
    // Remove HTML tags and scripting content
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }

  return value;
};

/*
 * Sanitise incoming JSON request bodies.
 */
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  next();
};

/*
 * Rate limiter for authentication endpoints.
 * Protects login and registration from excessive requests.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication requests. Please try again later.'
  }
});

/*
 * Rate limiter for booking endpoints.
 */
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking requests. Please try again later.'
  }
});

module.exports = {
  sanitizeInput,
  authLimiter,
  bookingLimiter
};