const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rental must belong to a user']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Rental must have an associated product']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days is required'],
      min: [1, 'Total days must be at least 1']
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: 0
    },
    rentalCharge: {
      type: Number,
      required: [true, 'Rental charge is required'],
      min: 0
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: 0,
      default: 0
    },
    lateDays: {
      type: Number,
      default: 0,
      min: 0
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0
    },
    bookingStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Dispatched',
        'Active',
        'Return Requested',
        'Returned',
        'Overdue',
        'Cancelled'
      ],
      default: 'Confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Paid'
    },
    dispatchDate: {
      type: Date
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    returnDate: {
      type: Date
    },
    returnStatus: {
      type: String,
      enum: ['Not Returned', 'Pending Inspection', 'Accepted', 'Rejected'],
      default: 'Not Returned'
    },
    productConditionBefore: {
      type: String,
      enum: ['New', 'Excellent', 'Good', 'Fair', 'Damaged', 'Under Maintenance'],
      default: 'Excellent'
    },
    productConditionAfter: {
      type: String,
      enum: ['New', 'Excellent', 'Good', 'Fair', 'Damaged', 'Under Maintenance', 'Pending'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: ''
    },
    inspectionNotes: {
      type: String,
      default: ''
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rental', rentalSchema);
