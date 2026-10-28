const errorHandler = (err, req, res, next) => {
  // Log error internally for debugging
  console.error('❌ Error:', err.message);
  
  // Set default values
  let statusCode = err.status || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.code === 11000) {  // MongoDB duplicate key
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  if (err.name === 'ValidationError') {  // Mongoose validation
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Sanitized response - NO stack traces or file paths in production
  const response = {
    success: false,
    message: message,
    status: statusCode
  };

  // Only show stack in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.message;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;