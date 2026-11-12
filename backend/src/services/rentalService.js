const Rental = require('../models/Rental');
const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Calculate rental charge and total days
 */
const calculateRentalCost = (product, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new ApiError(400, 'End date cannot be earlier than start date');
  }

  // Calculate difference in days (inclusive of partial/1-day rental)
  const diffTime = Math.abs(end.getTime() - start.getTime());
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) diffDays = 1; // Minimum 1 day rental

  const pricePerDay = Number(product.pricePerDay);
  const securityDeposit = Number(product.securityDeposit || 0);
  const rentalCharge = diffDays * pricePerDay;
  const lateFee = 0;
  const totalAmount = rentalCharge + securityDeposit + lateFee;

  return {
    totalDays: diffDays,
    pricePerDay,
    rentalCharge,
    securityDeposit,
    lateFee,
    totalAmount,
    dueDate: end
  };
};

/**
 * Create a new rental and decrement product available stock
 */
const createRental = async ({ userId, productId, startDate, endDate, notes }) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.status !== 'Available') {
    throw new ApiError(400, `Product is currently ${product.status.toLowerCase()} and cannot be rented`);
  }

  if (product.availableStock <= 0) {
    throw new ApiError(400, 'Product is currently out of stock for rentals');
  }

  const calc = calculateRentalCost(product, startDate, endDate);

  const rental = new Rental({
    user: userId,
    product: product._id,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    dueDate: calc.dueDate,
    totalDays: calc.totalDays,
    pricePerDay: calc.pricePerDay,
    rentalCharge: calc.rentalCharge,
    securityDeposit: calc.securityDeposit,
    lateDays: 0,
    lateFee: 0,
    totalAmount: calc.totalAmount,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    returnStatus: 'Not Returned',
    productConditionBefore: product.condition || 'Excellent',
    productConditionAfter: 'Pending',
    notes: notes || ''
  });

  // Decrement available stock
  product.availableStock -= 1;
  if (product.availableStock === 0) {
    product.status = 'Unavailable';
  }

  await product.save();
  await rental.save();

  logger.info(`Rental created: ID ${rental._id} for Product ${product.name} by User ${userId}`);
  return rental;
};

/**
 * Automatic overdue checker
 */
const checkAndUpdateOverdueRentals = async () => {
  const now = new Date();
  const multiplier = Number(process.env.LATE_FEE_MULTIPLIER) || 1.5;

  // Find rentals past due date that have not been returned
  const pendingRentals = await Rental.find({
    dueDate: { $lt: now },
    bookingStatus: { $in: ['Confirmed', 'Dispatched', 'Active', 'Return Requested', 'Overdue'] }
  });

  let updatedCount = 0;

  for (const rental of pendingRentals) {
    const diffTime = now.getTime() - new Date(rental.dueDate).getTime();
    const lateDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const lateFee = Math.round(lateDays * rental.pricePerDay * multiplier);

    rental.bookingStatus = 'Overdue';
    rental.lateDays = lateDays;
    rental.lateFee = lateFee;
    rental.totalAmount = rental.rentalCharge + rental.securityDeposit + lateFee;

    await rental.save();
    updatedCount++;
  }

  if (updatedCount > 0) {
    logger.info(`Overdue scan complete. Flagged ${updatedCount} overdue rental(s).`);
  }

  return updatedCount;
};

/**
 * Dispatch rental
 */
const dispatchRental = async (rentalId) => {
  const rental = await Rental.findById(rentalId).populate('product user');
  if (!rental) {
    throw new ApiError(404, 'Rental not found');
  }

  if (rental.bookingStatus === 'Cancelled' || rental.bookingStatus === 'Returned') {
    throw new ApiError(400, `Cannot dispatch rental with status ${rental.bookingStatus}`);
  }

  rental.bookingStatus = 'Dispatched';
  rental.dispatchDate = new Date();
  await rental.save();

  logger.info(`Rental dispatched: ${rental._id}`);
  return rental;
};

/**
 * Request Return (Customer or Admin)
 */
const requestReturn = async (rentalId, user) => {
  const rental = await Rental.findById(rentalId);
  if (!rental) {
    throw new ApiError(404, 'Rental not found');
  }

  // If customer, ensure they own the rental
  if (user.role === 'customer' && rental.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only request return for your own rentals');
  }

  if (rental.bookingStatus === 'Returned' || rental.bookingStatus === 'Cancelled') {
    throw new ApiError(400, `Rental is already ${rental.bookingStatus.toLowerCase()}`);
  }

  rental.bookingStatus = 'Return Requested';
  rental.returnStatus = 'Pending Inspection';
  await rental.save();

  logger.info(`Rental return requested: ${rental._id}`);
  return rental;
};

/**
 * Inventory Manager Inspects returned product and updates stock and condition
 */
const inspectAndProcessReturn = async (rentalId, inspectorId, { conditionAfter, inspectionNotes, returnStatus }) => {
  const rental = await Rental.findById(rentalId).populate('product');
  if (!rental) {
    throw new ApiError(404, 'Rental not found');
  }

  if (rental.bookingStatus === 'Returned' && rental.returnStatus === 'Accepted') {
    throw new ApiError(400, 'This rental return has already been accepted and processed');
  }

  const validConditions = ['New', 'Excellent', 'Good', 'Fair', 'Damaged', 'Under Maintenance'];
  if (conditionAfter && !validConditions.includes(conditionAfter)) {
    throw new ApiError(400, `Invalid condition. Must be one of: ${validConditions.join(', ')}`);
  }

  const accepted = returnStatus === 'Accepted';

  rental.returnDate = new Date();
  rental.returnStatus = accepted ? 'Accepted' : 'Rejected';
  rental.bookingStatus = accepted ? 'Returned' : rental.bookingStatus;
  rental.productConditionAfter = conditionAfter || rental.productConditionBefore;
  rental.inspectionNotes = inspectionNotes || '';
  rental.inspectedBy = inspectorId;

  // If return accepted, update product stock and condition
  const product = await Product.findById(rental.product._id);
  if (product) {
    if (conditionAfter) {
      product.condition = conditionAfter;
    }

    if (accepted) {
      product.availableStock += 1;
      // If product was Damaged or Under Maintenance, status is set to Maintenance
      if (conditionAfter === 'Damaged' || conditionAfter === 'Under Maintenance') {
        product.status = 'Maintenance';
      } else {
        product.status = 'Available';
      }
    }
    await product.save();
  }

  await rental.save();
  logger.info(`Rental inspected: ${rental._id}, Result: ${rental.returnStatus}, Stock updated: ${accepted}`);
  return rental;
};

module.exports = {
  calculateRentalCost,
  createRental,
  checkAndUpdateOverdueRentals,
  dispatchRental,
  requestReturn,
  inspectAndProcessReturn
};
