const Rental = require('../models/Rental');
const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/apiResponse');
const rentalService = require('../services/rentalService');
const logger = require('../utils/logger');

/**
 * Calculate rental preview estimate
 * POST /api/rentals/estimate
 */
const calculateEstimate = async (req, res, next) => {
  try {
    const { productId, startDate, endDate } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const estimate = rentalService.calculateRentalCost(product, startDate, endDate);
    return successResponse(res, 200, 'Estimate calculated successfully', {
      product: {
        id: product._id,
        name: product.name,
        availableStock: product.availableStock,
        status: product.status
      },
      ...estimate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Place a rental booking
 * POST /api/rentals
 */
const createBooking = async (req, res, next) => {
  try {
    const { productId, startDate, endDate, notes } = req.body;
    const userId = req.user.id;

    const rental = await rentalService.createRental({
      userId,
      productId,
      startDate,
      endDate,
      notes
    });

    const populatedRental = await Rental.findById(rental._id)
      .populate('product')
      .populate('user', 'name email phone');

    return successResponse(res, 201, 'Rental booking confirmed successfully', {
      rental: populatedRental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rentals (Admin and Inventory Manager)
 * GET /api/rentals
 */
const getAllRentals = async (req, res, _next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    let rentals = await Rental.find(query)
      .populate('user', 'name email phone address')
      .populate('product')
      .populate('inspectedBy', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      rentals = rentals.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(s) ||
          r.user?.email?.toLowerCase().includes(s) ||
          r.product?.name?.toLowerCase().includes(s) ||
          r._id.toString().includes(s)
      );
    }

    return successResponse(res, 200, 'Rentals retrieved', {
      count: rentals.length,
      rentals
    });
  } catch (error) {
    logger.warn('Rental.find failed, returning empty list:', error.message);
    return successResponse(res, 200, 'Rentals retrieved', {
      count: 0,
      rentals: []
    });
  }
};

/**
 * Get rentals of currently logged in customer
 * GET /api/rentals/my-rentals
 */
const getMyRentals = async (req, res, _next) => {
  try {
    const rentals = await Rental.find({ user: req.user.id })
      .populate('product')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'My rentals retrieved', {
      count: rentals.length,
      rentals
    });
  } catch (error) {
    logger.warn('Rental.find for user failed, returning empty list:', error.message);
    return successResponse(res, 200, 'My rentals retrieved', {
      count: 0,
      rentals: []
    });
  }
};

/**
 * Get single rental by ID
 * GET /api/rentals/:id
 */
const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('product')
      .populate('inspectedBy', 'name email');

    if (!rental) {
      throw new ApiError(404, 'Rental not found');
    }

    // Customer can only view their own rental
    if (req.user.role === 'customer' && rental.user._id.toString() !== req.user.id) {
      throw new ApiError(403, 'Unauthorized access to this rental record');
    }

    return successResponse(res, 200, 'Rental details retrieved', { rental });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark rental as Dispatched (Admin / Inventory Manager)
 * PUT /api/rentals/:id/dispatch
 */
const dispatchRental = async (req, res, next) => {
  try {
    const rental = await rentalService.dispatchRental(req.params.id);
    return successResponse(res, 200, 'Rental dispatched successfully', { rental });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Return (Customer or Admin)
 * PUT /api/rentals/:id/return
 */
const requestReturn = async (req, res, next) => {
  try {
    const rental = await rentalService.requestReturn(req.params.id, req.user);
    return successResponse(res, 200, 'Return requested successfully', { rental });
  } catch (error) {
    next(error);
  }
};

/**
 * Inspect returned product and finalize return (Inventory Manager / Admin)
 * PUT /api/rentals/:id/inspect
 */
const inspectReturn = async (req, res, next) => {
  try {
    const { conditionAfter, inspectionNotes, returnStatus } = req.body;
    const rental = await rentalService.inspectAndProcessReturn(req.params.id, req.user.id, {
      conditionAfter,
      inspectionNotes,
      returnStatus: returnStatus || 'Accepted'
    });

    return successResponse(res, 200, 'Inspection processed and inventory updated successfully', {
      rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Run overdue check scan
 * POST /api/rentals/check-overdue
 */
const triggerOverdueCheck = async (req, res, next) => {
  try {
    const count = await rentalService.checkAndUpdateOverdueRentals();
    return successResponse(res, 200, `Overdue scan completed. Flagged ${count} rentals.`, {
      overdueCount: count
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateEstimate,
  createBooking,
  getAllRentals,
  getMyRentals,
  getRentalById,
  dispatchRental,
  requestReturn,
  inspectReturn,
  triggerOverdueCheck
};
