const express = require('express');

const router = express.Router();

const { protect, requireRole } = require('../middleware/authMiddleware');
const { validateService, validateId } = require('../middleware/validationMiddleware');

const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// Public / Read routes
router.get('/', getAllServices);

router.get('/:id', validateId, getServiceById);

// Protected / Write routes
router.post(
  '/',
  protect,
  requireRole('freelancer'),
  validateService,
  createService
);

router.put(
  '/:id',
  protect,
  requireRole('freelancer'),
  validateId,
  validateService,
  updateService
);

router.delete(
  '/:id',
  protect,
  requireRole('freelancer'),
  validateId,
  deleteService
);

module.exports = router;