const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected endpoints (Admin and Inventory Manager)
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'inventory_manager'),
  productController.createProduct
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'inventory_manager'),
  productController.updateProduct
);

// Admin-only delete
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  productController.deleteProduct
);

module.exports = router;
