const validateRequest = ({ body } = {}) => (req, res, next) => {
  if (typeof body !== 'function') return next();

  const errors = body(req.body || {});
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = { validateRequest };
