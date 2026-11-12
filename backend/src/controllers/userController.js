const User = require('../models/User');
const { ApiError } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Get all users (Admin only)
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status !== undefined && status !== 'All') {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users retrieved successfully', {
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (Admin only)
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return successResponse(res, 200, 'User details retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user details or active status/role (Admin only)
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, address, role, isActive } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    logger.info(`User updated: ${user.email} by Admin ${req.user.email}`);
    return successResponse(res, 200, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      throw new ApiError(400, 'You cannot delete your own admin account');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    logger.info(`User deleted: ${user.email} by Admin ${req.user.email}`);
    return successResponse(res, 200, 'User deleted successfully', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
