const express = require("express");

const {
    register,
    login,
    getMe
} = require("../controllers/authController");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    validateRegister,
    validateLogin
} = require("../middleware/validationMiddleware");

const {
    authLimiter
} = require("../middleware/securityMiddleware");

const router = express.Router();

// Public routes with validation
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);

// Protected route
router.get("/me", protect, getMe);

module.exports = router;