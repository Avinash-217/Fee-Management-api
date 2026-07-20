const Fee = require('../models/fee.model');

// @desc    Create a new fee record
// @route   POST /api/fees
// @access  Public (or Protected depending on auth)
exports.createFee = async (req, res, next) => {
  try {
    const { studentId, studentName, rollNumber, department, academicYear, totalAmount } = req.body;

    // Check if record already exists for the roll number
    const existingFee = await Fee.findOne({ rollNumber });
    if (existingFee) {
      return res.status(400).json({
        success: false,
        message: `Fee record already exists for student with roll number ${rollNumber}`
      });
    }

    const fee = await Fee.create({
      studentId,
      studentName,
      rollNumber,
      department,
      academicYear,
      totalAmount
    });

    res.status(201).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fee records with optional filtering
// @route   GET /api/fees
// @access  Public
exports.getAllFees = async (req, res, next) => {
  try {
    const { rollNumber, paymentStatus, department } = req.query;
    let query = {};

    if (rollNumber) {
      query.rollNumber = { $regex: rollNumber, $options: 'i' };
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    const fees = await Fee.find(query);

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single fee record by ID
// @route   GET /api/fees/:id
// @access  Public
exports.getFeeById = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a fee record (excluding direct paymentHistory modifications)
// @route   PUT /api/fees/:id
// @access  Public
exports.updateFee = async (req, res, next) => {
  try {
    const { studentId, studentName, rollNumber, department, academicYear, totalAmount } = req.body;

    let fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Update fields if provided
    if (studentId) fee.studentId = studentId;
    if (studentName) fee.studentName = studentName;
    if (rollNumber) fee.rollNumber = rollNumber;
    if (department) fee.department = department;
    if (academicYear) fee.academicYear = academicYear;
    if (totalAmount !== undefined) fee.totalAmount = totalAmount;

    // Save triggers the pre-save hook to recalculate balance and status
    await fee.save();

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new payment towards the fee
// @route   POST /api/fees/:id/payments
// @access  Public
exports.addPayment = async (req, res, next) => {
  try {
    const { amount, paymentMode, referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment amount greater than zero'
      });
    }

    if (!paymentMode) {
      return res.status(400).json({
        success: false,
        message: 'Please specify payment mode (Cash, Card, UPI, Net Banking, Cheque)'
      });
    }

    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Add payment transaction to the history
    fee.paymentHistory.push({
      amount,
      paymentMode,
      referenceId
    });

    // Save will trigger the pre-save middleware to recalculate
    await fee.save();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Public
exports.deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
