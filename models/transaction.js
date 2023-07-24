const Transaction = require("../models/transaction");
const User = require("../models/userModel"); // Replace with the actual path to your Customer model
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

// Create transaction
exports.createTransaction = asyncHandler(async (req, res, next) => {
  try {
    const { customer, service, amount } = req.body;

    if (!customer || !service || !amount) {
      return next(new ErrorResponse("Fields cannot be null", 400));
    }

    // Create a new transaction (without saving it yet)
    const newTransaction = new Transaction({
      customer,
      service,
      amount,
      user: req.user.id,
    });

    // Call the pre-save middleware to handle the service balance deduction
    await newTransaction.save();

    res.status(201).json({
      success: true,
      transaction: newTransaction,
    });
  } catch (error) {
    next(error);
  }
});
