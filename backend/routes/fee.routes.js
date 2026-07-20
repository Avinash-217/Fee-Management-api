const express = require('express');
const router = express.Router();
const {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  addPayment,
  deleteFee
} = require('../controllers/fee.controller');

// Main routes for fee management
router.route('/')
  .post(createFee)
  .get(getAllFees);

// Individual fee record by ID
router.route('/:id')
  .get(getFeeById)
  .put(updateFee)
  .delete(deleteFee);

// Add payment to a fee record
router.route('/:id/payments')
  .post(addPayment);

module.exports = router;
