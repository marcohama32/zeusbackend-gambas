const Plan = require("../models/planModel");
const PlanServices = require("../models/serviceModel");
const Transaction = require("../models/transaction");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const mongoose = require("mongoose");

exports.createTransaction1 = async (req, res) => {
  try {
    const { customerId, planId, serviceId, paymentMethod, amount } = req.body;

    const customer = await User.findById(customerId).populate({
      path: "plan",
      populate: {
        path: "planService",
        model: "PlanServices",
      },
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "Customer not found" });
    }

    const selectedPlan = customer.plan.find(
      (plan) => plan._id.toString() === planId
    );

    if (!selectedPlan || !selectedPlan.planService) {
      return res
        .status(404)
        .json({ success: false, error: "Plan not found for the customer" });
    }

    const selectedService = selectedPlan.planService.find(
      (service) => service._id.toString() === serviceId
    );

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        error: "Service not found in the customer's plan",
      });
    }

    if (selectedService.remainingBalance === undefined) {
      return res.status(400).json({
        success: false,
        error: "Service does not have a remaining balance",
      });
    }

    const transactions = await Transaction.find({
      customerId,
      serviceIds: serviceId,
    }).lean();

    const totalAmountSpent = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    const availableBalance = selectedService.servicePrice - totalAmountSpent;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: "Transaction amount exceeds available balance",
      });
    }

    if (selectedService.preAuthorization === "yes") {
      return res.status(400).json({
        success: false,
        error: "You need authorization to use this service",
      });
    }

    selectedService.remainingBalance = availableBalance - amount;
    await selectedService.save();

    const newTransaction = await Transaction.create({
      customerId,
      planId,
      serviceIds: [serviceId],
      paymentMethod,
      amount,
    });

    res.status(201).json({
      success: true,
      remainingBalance: selectedService.remainingBalance,
      transaction: newTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const transactionId = req.params.id;

  try {
    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    // Get the customer ID from the transaction
    const customerId = transaction.customerId;

    // Find the customer
    const customer = await User.findById(customerId).populate({
      path: "plan",
      populate: {
        path: "planService",
        model: "PlanServices",
      },
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "Customer not found" });
    }

    // Find the selected service in the customer's plan
    const selectedPlan = customer.plan.find(
      (plan) => plan._id.toString() === transaction.planId.toString()
    );

    if (!selectedPlan || !selectedPlan.planService) {
      return res
        .status(404)
        .json({ success: false, error: "Plan not found for the customer" });
    }

    const selectedService = selectedPlan.planService.find(
      (service) =>
        service._id.toString() === transaction.serviceIds[0].toString()
    );

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        error: "Service not found in the customer's plan",
      });
    }

    // Update the selected service's remaining balance
    selectedService.remainingBalance += transaction.amount;
    await selectedService.save();

    // Delete the transaction from the database
    await transaction.remove();

    res
      .status(200)
      .json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    next(error);
  }
});

exports.editTransaction1 = asyncHandler(async (req, res, next) => {
  const transactionId = req.params.transactionId;
  const { customerId, planId, serviceId, paymentMethod, amount } = req.body;

  try {
    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    // Get the customer ID from the transaction
    const oldCustomerId = transaction.customerId;

    // Find the customer with the old customer ID
    const oldCustomer = await User.findById(oldCustomerId).populate({
      path: "plan",
      populate: {
        path: "planService",
        model: "PlanServices",
      },
    });

    if (!oldCustomer) {
      return res
        .status(404)
        .json({ success: false, error: "Customer not found" });
    }

    // Find the selected service in the old customer's plan
    const oldSelectedPlan = oldCustomer.plan.find(
      (plan) => plan._id.toString() === transaction.planId.toString()
    );

    if (!oldSelectedPlan || !oldSelectedPlan.planService) {
      return res
        .status(404)
        .json({ success: false, error: "Plan not found for the customer" });
    }

    const oldSelectedService = oldSelectedPlan.planService.find(
      (service) =>
        service._id.toString() === transaction.serviceIds[0].toString()
    );

    if (!oldSelectedService) {
      return res.status(404).json({
        success: false,
        error: "Service not found in the customer's plan",
      });
    }

    // Update the old selected service's remaining balance
    oldSelectedService.remainingBalance += transaction.amount;

    // Save the updated old customer and old selected service
    await oldCustomer.save();

    // Update the transaction with the new values
    // transaction.customerId = customerId;
    transaction.planId = planId;
    transaction.serviceIds = [serviceId];
    transaction.paymentMethod = paymentMethod;
    transaction.amount = amount;

    // Find the new customer
    const newCustomer = await User.findById(customerId).populate({
      path: "plan",
      populate: {
        path: "planService",
        model: "PlanServices",
      },
    });

    if (!newCustomer) {
      return res
        .status(404)
        .json({ success: false, error: "New customer not found" });
    }

    // Find the selected service in the new customer's plan
    const newSelectedPlan = newCustomer.plan.find(
      (plan) => plan._id.toString() === planId.toString()
    );

    if (!newSelectedPlan || !newSelectedPlan.planService) {
      return res
        .status(404)
        .json({ success: false, error: "New plan not found for the customer" });
    }

    const newSelectedService = newSelectedPlan.planService.find(
      (service) => service._id.toString() === serviceId
    );

    if (!newSelectedService) {
      return res.status(404).json({
        success: false,
        error: "New service not found in the customer's plan",
      });
    }

    // Check if the transaction amount exceeds the new service price
    if (amount > newSelectedService.servicePrice) {
      return res.status(400).json({
        success: false,
        error: "Transaction amount exceeds service price",
      });
    }

    // Update the new selected service's remaining balance
    newSelectedService.remainingBalance -= amount;

    // Save the updated new customer and new selected service
    await newCustomer.save();

    // Save the updated transaction
    await transaction.save();

    res
      .status(200)
      .json({ success: true, message: "Transaction updated successfully" });
  } catch (error) {
    next(error);
  }
});

exports.editTransaction = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    if (transaction.transactionStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        error: "Only pending transactions can be edited",
      });
    }

    const selectedService = await PlanServices.findById(transaction.serviceIds[0]);

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        error: "Service not found in the transaction",
      });
    }

    const totalAmountSpent = await Transaction.aggregate([
      { $match: { customerId: transaction.customerId, serviceIds: transaction.serviceIds[0] } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const availableBalance = selectedService.servicePrice - (totalAmountSpent[0]?.totalAmount || 0) + transaction.amount;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: "Transaction amount exceeds available balance",
      });
    }

    // Update transaction fields
    transaction.amount = amount;
    transaction.paymentMethod = paymentMethod;
    transaction.remainingBalance = availableBalance - amount;

    // Update multipleFiles if present in the request body
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((file) => file.path.replace(/\\/g, "/"));
      transaction.multipleFiles = transaction.multipleFiles
        ? transaction.multipleFiles + "," + newFiles.join(",")
        : newFiles.join(",");
    }

    await transaction.save();

    res.json({ success: true, remainingBalance: transaction.remainingBalance, transaction });
  } catch (error) {
    console.error("Error in editTransaction:", error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};

exports.getAllTransactions = asyncHandler(async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;
    const searchTerm = req.query.searchTerm;

    // Create the query object
    const query = {};

    // Add search criteria if searchTerm is provided
    if (searchTerm) {
      query.$or = [
        { transactionId: { $regex: searchTerm, $options: "i" } },
        { paymentMethod: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Calculate the total count of transactions matching the query
    const totalCount = await Transaction.countDocuments(query);

    // Find transactions with pagination and populate user, plan, and service information
    const transactions = await Transaction.find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate("customerId", "firstName lastName email") // Populate user information
      .populate({
        path: "planId",
        select: "planName", // Select the fields you want to include from the plan document
        populate: {
          path: "planService",
          model: "PlanServices",
          select: "serviceName servicePrice", // Select the fields you want to include from the planService document
        },
      })
      .populate("serviceIds", "serviceName servicePrice"); // Populate service information

    res.status(200).json({
      success: true,
      count: transactions.length,
      total: totalCount,
      pageSize,
      page,
      transactions,
    });
  } catch (error) {
    next(error);
  }
});

exports.getTransactionsByCustomerId = asyncHandler(async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;
    const searchTerm = req.query.searchTerm;

    // Check if the customerId is a valid ObjectId before querying the database
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid customerId" });
    }

    // Create the query object
    const query = { customerId };

    // Add search criteria if searchTerm is provided
    if (searchTerm) {
      query.$or = [
        { transactionId: { $regex: searchTerm, $options: "i" } },
        { paymentMethod: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Calculate the total count of transactions matching the query
    const totalCount = await Transaction.countDocuments(query);

    // Find transactions with pagination and populate user, plan, and service information
    const transactions = await Transaction.find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate("customerId", "firstName lastName email") // Populate user information
      .populate({
        path: "planId",
        select: "planName", // Select the fields you want to include from the plan document
        populate: {
          path: "planService",
          model: "PlanServices",
          select: "serviceName servicePrice", // Select the fields you want to include from the planService document
        },
      })
      .populate("serviceIds", "serviceName servicePrice"); // Populate service information

    res.status(200).json({
      success: true,
      count: transactions.length,
      total: totalCount,
      pageSize,
      page,
      transactions,
    });
  } catch (error) {
    next(error);
  }
});

exports.getTransactionById = asyncHandler(async (req, res, next) => {
  try {
    const transactionID = req.params.id;

    // Find the transaction by transactionID and populate user, plan, and service information
    const transaction = await Transaction.findById(transactionID)
      .populate("customerId", "firstName lastName email contact1 contact2 address") // Populate user information
      .populate({
        path: "planId",
        select: "planName", // Select the fields you want to include from the plan document
        populate: {
          path: "planService",
          model: "PlanServices",
          select: "serviceName", // Select the fields you want to include from the planService document
        },
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email profile contact1 contact2',
        populate: {
          path: 'partnerUser',
          model: 'Partner',
          select: 'partnerName email contact1 contact2 avatar status',
        },
      })
      .populate("serviceIds", "serviceName serviceDescription serviceAreaOfCover"); // Populate service information

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
});

//this method create transaction considering service preAuthorization
exports.createTransaction2 = async (req, res) => {
  try {
    const { customerId, planId, serviceId, paymentMethod, amount } = req.body;

    const customer = await User.findById(customerId).populate({
      path: "plan",
      populate: {
        path: "planService",
        model: "PlanServices",
      },
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "Customer not found" });
    }

    const selectedPlan = customer.plan.find(
      (plan) => plan._id.toString() === planId
    );

    if (!selectedPlan || !selectedPlan.planService) {
      return res
        .status(404)
        .json({ success: false, error: "Plan not found for the customer" });
    }

    const selectedService = selectedPlan.planService.find(
      (service) => service._id.toString() === serviceId
    );

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        error: "Service not found in the customer's plan",
      });
    }

    if (selectedService.remainingBalance === undefined) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance for the transaction",
      });
    }

    const transactions = await Transaction.find({
      customerId,
      serviceIds: serviceId,
    }).lean();

    const totalAmountSpent = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    const availableBalance = selectedService.servicePrice - totalAmountSpent;
    const remainder = availableBalance - amount;

    console.log("Transaction Amount:", amount);
    console.log("Available Balance:", availableBalance);
    console.log("Remainder:", remainder);

    if (remainder < 0) {
      console.log("Transaction amount exceeds service price");
      return res.status(400).json({
        success: false,
        error: "Transaction amount exceeds service price",
      });
    }

    if (selectedService.preAuthorization === "yes") {
      // Set the transaction status to "Pending" if preAuthorization is required
      // Otherwise, set the status to "Completed"
      const status = "Pending";
      const newTransaction = await Transaction.create({
        customerId,
        planId,
        serviceIds: [serviceId],
        paymentMethod,
        amount,
        status,
      });

      res.status(201).json({
        success: true,
        availableBalance,
        remainder,
        transaction: newTransaction,
      });
    } else {
      // Create the transaction with status "Completed"
      const status = "Completed";
      const newTransaction = await Transaction.create({
        customerId,
        planId,
        serviceIds: [serviceId],
        paymentMethod,
        amount,
        status,
      });

      // Update the selected service's remaining balance
      selectedService.remainingBalance =
        selectedService.remainingBalance - amount;
      await selectedService.save();

      res.status(201).json({
        success: true,
        availableBalance,
        remainder,
        transaction: newTransaction,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};

const { sendNotification } = require("../routes/sseRoutes");

// Transaction controller with SSE notification 2

exports.createTransaction = async (req, res) => {
  try {
    const { customerId, planId, serviceId, paymentMethod, amount } = req.body;

    const customer = await User.findById(customerId).populate({
      path: "plan",
      populate: {
        path: "planService",
        model: "PlanServices",
      },
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "Customer not found" });
    }

    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: "No files were uploaded",
      });
      return;
    }

    const newFiles = req.files.map((file) => file.path.replace(/\\/g, "/"));

    let multipleFiles = ""; // Set default value as empty string if multipleFiles is undefined or null

    if (multipleFiles) {
      multipleFiles += ",";
    }

    multipleFiles += newFiles.join(",");

    const selectedPlan = customer.plan.find(
      (plan) => plan._id.toString() === planId
    );

    if (!selectedPlan || !selectedPlan.planService) {
      return res
        .status(404)
        .json({ success: false, error: "Plan not found for the customer" });
    }

    const selectedService = selectedPlan.planService.find(
      (service) => service._id.toString() === serviceId
    );

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        error: "Service not found in the customer's plan",
      });
    }

    if (selectedService.remainingBalance === undefined) {
      return res.status(400).json({
        success: false,
        error: "Service does not have a remaining balance",
      });
    }

    const transactions = await Transaction.find({
      customerId,
      serviceIds: serviceId,
    }).lean();

    const totalAmountSpent = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    const availableBalance = selectedService.servicePrice - totalAmountSpent;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: "Transaction amount exceeds available balance",
      });
    }

    let transactionStatus = "Pending";
    let remainingBalance = 0;

    if (selectedService.preAuthorization === "yes") {
      transactionStatus = "Pending";

      const notificationMessage = "Transaction requires pre-authorization";
      remainingBalance = availableBalance - amount; // Calculate the remaining balance after the transaction
      await selectedService.updateOne({ remainingBalance }); // Update the remaining balance in the database

      const newTransaction = await Transaction.create({
        customerId,
        planId,
        serviceIds: [serviceId],
        paymentMethod,
        amount,
        amountSpent: 0,
        remainingBalance,
        transactionStatus,
        multipleFiles,
        preAuthorization: selectedService.preAuthorization,
        adminApprovalStatus: false,
        user: req.user.id,
      });
      sendNotification(notificationMessage, newTransaction._id);

      res
        .status(201)
        .json({ success: true, remainingBalance, transaction: newTransaction });
    } else {
      remainingBalance = selectedService.remainingBalance - amount; // Calculate the remaining balance after the transaction
      await selectedService.updateOne({ remainingBalance }); // Update the remaining balance in the database

      transactionStatus = "Completed";

      const newTransaction = await Transaction.create({
        customerId,
        planId,
        serviceIds: [serviceId],
        paymentMethod,
        amount,
        amountSpent: amount,
        remainingBalance,
        transactionStatus,
        multipleFiles,
        preAuthorization: selectedService.preAuthorization,
        adminApprovalStatus: false,
        user: req.user.id,
      });

      res
        .status(201)
        .json({ success: true, remainingBalance, transaction: newTransaction });
    }
  } catch (error) {
    console.error("Error in createTransaction:", error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};

// Revoke an transaction ?? Revert money

exports.revokeTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { revokeReason } = req.body;

    // Find the transaction by its ID
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    // Check if the transaction is in "Pending" status (Requires admin approval)
    if (transaction.transactionStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        error: "Cannot revoke a transaction that is not pending",
      });
    }

    // Find the associated plan service to update the remaining balance
    const selectedService = await PlanServices.findById(
      transaction.serviceIds[0]
    );

    // Store the previous remaining balance of the associated plan service
    const previousRemainingBalance = selectedService.remainingBalance;

    // Add the transaction amount back to the plan service's remaining balance
    selectedService.remainingBalance += transaction.amount;
    await selectedService.save();

    // Store the actual remaining balance of the associated plan service after revoking
    const actualRemainingBalance = selectedService.remainingBalance;

    // Calculate the difference in remaining balance and update the transaction's remaining balance
    const differenceInRemainingBalance =
      actualRemainingBalance - previousRemainingBalance;
    transaction.remainingBalance += differenceInRemainingBalance;
    await transaction.save();

    // Set the transaction status to "Revoked" or "Cancelled"
    transaction.transactionStatus = "Revoked"; // or "Cancelled" depending on your preference
    transaction.revokeReason = revokeReason; // Add the reason for revoking the transaction
    await transaction.save();

    // Store the previous remaining balance of the transaction
    const previousTransactionRemainingBalance =
      previousRemainingBalance - transaction.amount;

    // Store the actual remaining balance of the transaction after revoking
    const actualTransactionRemainingBalance = transaction.remainingBalance;

    // Send notification
    const notificationMessage = "Your transaction has been revoked";
    sendNotification(notificationMessage, transactionId);

    res.status(200).json({
      success: true,
      message: "Transaction revoked successfully",
      previousRemainingBalance,
      actualRemainingBalance,
      previousTransactionRemainingBalance,
      actualTransactionRemainingBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};

// controllers/transactionController.js

exports.approveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the transaction by its ID
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    // Check if the transaction is in "Pending" status
    if (transaction.transactionStatus !== "Pending") {
      return res
        .status(400)
        .json({
          success: false,
          error: "Cannot approve a transaction that is not pending",
        });
    }

    // Update the transaction status to "Approved"
    transaction.transactionStatus = "Approved";
    await transaction.save();

    // Send notification for transaction approval
    const notificationMessage = "Transaction approved";
    sendNotification(notificationMessage, transactionId);

    res
      .status(200)
      .json({
        success: true,
        message: "Transaction approved successfully",
        transaction,
      });
  } catch (error) {
    console.error("Error in approveTransaction:", error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};

//get my transactions
exports.getMyTransactions = asyncHandler(async (req, res, next) => {
  try {
    // Parse pagination parameters from the request query
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    // Parse the search term from the request query
    const searchTerm = req.query.searchTerm;

    // Create the query object
    const query = { user: req.user.id };

    // Add search criteria if searchTerm is provided
    if (searchTerm) {
      query.$or = [
        { 'customerId.firstName': { $regex: searchTerm, $options: 'i' } },
        { 'customerId.lastName': { $regex: searchTerm, $options: 'i' } },
        { invoiceNumber: { $regex: searchTerm, $options: 'i' } },
        { transactionStatus: { $regex: searchTerm, $options: 'i' } },
        { 'planId.planName': { $regex: searchTerm, $options: 'i' } },
        {
          $and: [
            { serviceIds: { $exists: true, $not: { $size: 0 } } },
            {
              serviceIds: {
                $elemMatch: { serviceName: { $regex: searchTerm, $options: 'i' } },
              },
            },
          ],
        },
      ];
    }

    // Count the total number of transactions that match the query
    const totalCount = await Transaction.countDocuments(query);

    // Find transactions with pagination and populate related information
    const transactions = await Transaction.find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate('customerId', 'firstName lastName email')
      .populate({
        path: 'planId',
        select: 'planName',
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email profile',
        populate: {
          path: 'partnerUser',
          model: 'Partner',
          select: 'partnerName email contact1 contact2 avatar status',
        },
      })
      .populate({
        path: 'serviceIds',
        select: 'serviceName',
      });

    // Return the paginated and searched transactions
    res.status(200).json({
      success: true,
      count: transactions.length,
      total: totalCount,
      pageSize,
      page,
      transactions,
    });
  } catch (error) {
    next(error);
  }
});


exports.getTransactionByPartnerUserId = async (req, res, next) => {
  try {
    const partnerUserId = req.params.partnerUserId;

    // Find the transactions that match the partnerUser _id
    const transactions = await Transaction.find({ "user.partnerUser": partnerUserId })
      .populate("customerId", "firstName lastName email") // Populate user information
      .populate({
        path: "planId",
        select: "planName", // Select the fields you want to include from the plan document
        populate: {
          path: "planService",
          model: "PlanServices",
          select: "serviceName servicePrice", // Select the fields you want to include from the planService document
        },
      })
      .populate("serviceIds", "serviceName servicePrice"); // Populate service information

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Transactions not found for the partnerUser" });
    }

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};


exports.deleteFile = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    const fileName = req.body.file; // Assuming the file name is passed in the request body

    // Check if the user ID and file name are provided
    if (!userId || !fileName) {
      return res.status(400).json({
        success: false,
        message: "User ID and file name are required",
      });
    }

    try {
      // Remove the file entry from the User table
      const trans = await Transaction.findById(transactionId);
      if (!trans) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      // Remove the file name from the user's file string
      const files = trans.multipleFiles.split(",");
      const fileIndex = files.indexOf(fileName);
      if (fileIndex !== -1) {
        files.splice(fileIndex, 1);
        trans.multipleFiles = files.join(",");
        await trans.save();
      }

      res.status(200).json({
        success: true,
        message: "File deleted",
      });
    } catch (error) {
      console.error("Error deleting file from Transaction table:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete the file from the Transaction table",
      });
    }
  } catch (error) {
    return next(error);
  }
};


exports.uploadTransactionMultipleFiles = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existingUser = await Transaction.findById(id);

    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: "No files were uploaded",
      });
      return;
    }

    const newFiles = req.files.map((file) => file.path.replace(/\\/g, "/"));

    let multipleFiles = existingUser.multipleFiles || ""; // Set default value as empty string if multipleFiles is undefined or null

    if (multipleFiles) {
      multipleFiles += ",";
    }

    multipleFiles += newFiles.join(",");

    const fileUpload = await Transaction.findByIdAndUpdate(
      id,
      { multipleFiles },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      multipleFiles: fileUpload.multipleFiles,
      file: fileUpload,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
