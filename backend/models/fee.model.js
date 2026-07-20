const mongoose = require('mongoose');

const paymentItemSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque'],
    required: true
  },
  referenceId: {
    type: String,
    trim: true
  }
});

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true
    },
    studentName: {
      type: String,
      required: [true, 'Student Name is required'],
      trim: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll Number is required'],
      unique: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    academicYear: {
      type: String,
      required: [true, 'Academic Year is required'],
      trim: true
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total fee amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative']
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid'],
      default: 'Pending'
    },
    paymentHistory: [paymentItemSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to calculate balance and update status
feeSchema.pre('save', function (next) {
  // If payment history has items, sum them up to amountPaid
  if (this.paymentHistory && this.paymentHistory.length > 0) {
    this.amountPaid = this.paymentHistory.reduce((sum, item) => sum + item.amount, 0);
  }

  // Ensure amountPaid does not exceed totalAmount
  if (this.amountPaid > this.totalAmount) {
    return next(new Error('Amount paid cannot be greater than total amount'));
  }

  this.balanceAmount = this.totalAmount - this.amountPaid;

  if (this.balanceAmount === 0) {
    this.paymentStatus = 'Paid';
  } else if (this.amountPaid > 0 && this.balanceAmount > 0) {
    this.paymentStatus = 'Partially Paid';
  } else {
    this.paymentStatus = 'Pending';
  }

  next();
});

module.exports = mongoose.model('Fee', feeSchema);
