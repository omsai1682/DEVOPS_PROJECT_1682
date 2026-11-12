const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Reports are accessible to Admin and Inventory Manager
router.use(verifyToken, authorizeRoles('admin', 'inventory_manager'));

router.get('/dashboard-summary', reportController.getDashboardSummary);
router.get('/rentals', reportController.getRentalReport);
router.get('/availability', reportController.getAvailabilityReport);
router.get('/revenue', reportController.getRevenueReport);
router.get('/overdue', reportController.getOverdueReport);

module.exports = router;
