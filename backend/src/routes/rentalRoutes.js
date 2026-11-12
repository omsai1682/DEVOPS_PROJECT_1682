const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRentalDates } = require('../middleware/validateMiddleware');

// Calculate estimate preview (Authenticated user)
router.post('/estimate', verifyToken, validateRentalDates, rentalController.calculateEstimate);

// Create rental booking (Authenticated customer/admin)
router.post('/', verifyToken, validateRentalDates, rentalController.createBooking);

// Get my rentals (Customer)
router.get('/my-rentals', verifyToken, rentalController.getMyRentals);

// Trigger overdue check scan (Admin or Inventory Manager)
router.post(
  '/check-overdue',
  verifyToken,
  authorizeRoles('admin', 'inventory_manager'),
  rentalController.triggerOverdueCheck
);

// Get all rentals (Admin and Inventory Manager)
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'inventory_manager'),
  rentalController.getAllRentals
);

// Get single rental details (Owner customer or Admin/Inventory Manager)
router.get('/:id', verifyToken, rentalController.getRentalById);

// Dispatch rental (Admin and Inventory Manager)
router.put(
  '/:id/dispatch',
  verifyToken,
  authorizeRoles('admin', 'inventory_manager'),
  rentalController.dispatchRental
);

// Request return (Customer or Admin)
router.put('/:id/return', verifyToken, rentalController.requestReturn);

// Inspect and accept/reject return (Inventory Manager and Admin)
router.put(
  '/:id/inspect',
  verifyToken,
  authorizeRoles('inventory_manager', 'admin'),
  rentalController.inspectReturn
);

module.exports = router;
