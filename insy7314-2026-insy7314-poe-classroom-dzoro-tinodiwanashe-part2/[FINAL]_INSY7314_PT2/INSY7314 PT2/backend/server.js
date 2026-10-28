require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const https = require('https');
// Import DB connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const earningsRoutes = require('./routes/earningsRoutes'); // <-- NEW: earnings/income routes

// Import error handler
const errorHandler = require('./middleware/errorMiddleware');

const { sanitizeInput } = require('./middleware/securityMiddleware');

// Fail fast if JWT secret is missing
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Add it to INSY7314/.env');
}

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Security headers and Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://localhost:5000'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    }
  })
);

// Explicit security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  next();
});

// Global middleware
app.use(cors());
app.use(express.json());

// Sanitise incoming request data
app.use(sanitizeInput);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'INSY7314 API is running' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/earnings', earningsRoutes); // <-- NEW: enables /api/earnings/*

// 404 Not Found handler (must come after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// SSL certificates for HTTPS
const certOptions = {
  key: fs.readFileSync('./private-key.pem'),
  cert: fs.readFileSync('./ssl-certificate.pem')
};

// Start HTTPS server
https.createServer(certOptions, app).listen(PORT, () => {
  console.log(`Server running securely on https://localhost:${PORT}`);
});