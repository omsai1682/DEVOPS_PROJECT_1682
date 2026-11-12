const { ApiError } = require('./errorMiddleware');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim() === '') errors.push('Name is required');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('A valid email address is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors));
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors));
  }
  next();
};

const validateRentalDates = (req, res, next) => {
  const { productId, startDate, endDate } = req.body;
  const errors = [];

  if (!productId) errors.push('Product ID is required');
  if (!startDate) errors.push('Start date is required');
  if (!endDate) errors.push('End date is required');

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) errors.push('Invalid start date');
  if (isNaN(end.getTime())) errors.push('Invalid end date');

  if (end < start) {
    errors.push('End date cannot be earlier than start date');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Invalid rental parameters', errors));
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateRentalDates
};
