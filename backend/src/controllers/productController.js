const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Get all products with filtering, search, and pagination
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, condition, status, search, minPrice, maxPrice, sort } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { pricePerDay: 1 };
    if (sort === 'price_desc') sortOption = { pricePerDay: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };

    const products = await Product.find(query).sort(sortOption);

    return successResponse(res, 200, 'Products retrieved successfully', {
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return successResponse(res, 200, 'Product details retrieved', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product (Admin / Inventory Manager)
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      brand,
      model,
      description,
      condition,
      pricePerDay,
      securityDeposit,
      stock,
      image,
      status
    } = req.body;

    const initialStock = Number(stock) || 1;
    const product = await Product.create({
      name,
      category,
      brand,
      model: model || '',
      description: description || '',
      condition: condition || 'Excellent',
      pricePerDay: Number(pricePerDay),
      securityDeposit: Number(securityDeposit) || 0,
      stock: initialStock,
      availableStock: initialStock,
      image: image || undefined,
      status: status || 'Available'
    });

    logger.info(`Product created: ${product.name} (ID: ${product._id})`);
    return successResponse(res, 201, 'Product created successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product (Admin / Inventory Manager)
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const updates = { ...req.body };

    // If stock is updated, adjust availableStock proportionally
    if (updates.stock !== undefined) {
      const stockDiff = Number(updates.stock) - product.stock;
      updates.availableStock = Math.max(0, product.availableStock + stockDiff);
      if (updates.availableStock === 0) {
        updates.status = 'Unavailable';
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    logger.info(`Product updated: ${product.name} (ID: ${product._id})`);
    return successResponse(res, 200, 'Product updated successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product (Admin only)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    await Product.findByIdAndDelete(req.params.id);
    logger.info(`Product deleted: ${product.name} (ID: ${product._id})`);

    return successResponse(res, 200, 'Product deleted successfully', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
