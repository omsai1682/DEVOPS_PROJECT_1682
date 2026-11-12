const reportService = require('../services/reportService');
const User = require('../models/User');
const Product = require('../models/Product');
const Rental = require('../models/Rental');
const { successResponse } = require('../utils/apiResponse');

/**
 * REPORT 1: Rental Booking Report
 * GET /api/reports/rentals
 */
const getRentalReport = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      customer: req.query.customer,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const report = await reportService.getRentalBookingReport(filters);
    return successResponse(res, 200, 'Rental booking report generated', {
      count: report.length,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REPORT 2: Product Availability Report
 * GET /api/reports/availability
 */
const getAvailabilityReport = async (req, res, next) => {
  try {
    const report = await reportService.getProductAvailabilityReport();
    return successResponse(res, 200, 'Product availability report generated', {
      count: report.length,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REPORT 3: Revenue Report
 * GET /api/reports/revenue
 */
const getRevenueReport = async (req, res, next) => {
  try {
    const { range, startDate, endDate } = req.query;
    const report = await reportService.getRevenueReport(range || '30d', startDate, endDate);
    return successResponse(res, 200, 'Revenue report generated', {
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REPORT 4: Overdue Rental Report
 * GET /api/reports/overdue
 */
const getOverdueReport = async (req, res, next) => {
  try {
    const report = await reportService.getOverdueRentalReport();
    return successResponse(res, 200, 'Overdue rental report generated', {
      count: report.length,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DASHBOARD METRICS SUMMARY
 * GET /api/reports/dashboard-summary
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      availableProducts,
      maintenanceProducts,
      damagedProducts,
      activeRentals,
      overdueRentals,
      returnedRentals,
      pendingInspections
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'Available' }),
      Product.countDocuments({ condition: 'Under Maintenance' }),
      Product.countDocuments({ condition: 'Damaged' }),
      Rental.countDocuments({ bookingStatus: { $in: ['Confirmed', 'Dispatched', 'Active'] } }),
      Rental.countDocuments({ bookingStatus: 'Overdue' }),
      Rental.countDocuments({ bookingStatus: 'Returned' }),
      Rental.countDocuments({ bookingStatus: 'Return Requested' })
    ]);

    // Aggregate total revenue
    const revenueAgg = await Rental.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          rentalRevenue: { $sum: '$rentalCharge' },
          depositRevenue: { $sum: '$securityDeposit' },
          lateFeeRevenue: { $sum: '$lateFee' }
        }
      }
    ]);

    const revenue = revenueAgg[0] || {
      totalRevenue: 0,
      rentalRevenue: 0,
      depositRevenue: 0,
      lateFeeRevenue: 0
    };

    return successResponse(res, 200, 'Dashboard summary retrieved', {
      summary: {
        totalUsers,
        totalProducts,
        availableProducts,
        maintenanceProducts,
        damagedProducts,
        activeRentals,
        overdueRentals,
        returnedRentals,
        pendingInspections,
        totalRevenue: revenue.totalRevenue,
        rentalRevenue: revenue.rentalRevenue,
        depositRevenue: revenue.depositRevenue,
        lateFeeRevenue: revenue.lateFeeRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRentalReport,
  getAvailabilityReport,
  getRevenueReport,
  getOverdueReport,
  getDashboardSummary
};
