const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Laptops',
        'Cameras',
        'Projectors',
        'Speakers',
        'TVs',
        'Gaming Consoles',
        'Tablets',
        'Smart Watches',
        'Headphones',
        'Other Electronics'
      ],
      default: 'Other Electronics'
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    model: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    condition: {
      type: String,
      enum: ['New', 'Excellent', 'Good', 'Fair', 'Damaged', 'Under Maintenance'],
      default: 'Excellent'
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price per day cannot be negative']
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Security deposit cannot be negative'],
      default: 0
    },
    stock: {
      type: Number,
      required: [true, 'Total stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 1
    },
    availableStock: {
      type: Number,
      required: [true, 'Available stock is required'],
      min: [0, 'Available stock cannot be negative'],
      default: 1
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
    },
    status: {
      type: String,
      enum: ['Available', 'Unavailable', 'Maintenance'],
      default: 'Available'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for rented count
productSchema.virtual('rentedStock').get(function () {
  return Math.max(0, this.stock - this.availableStock);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
