const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    serviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlanServices",
        required: true,
      },
    ],
    multipleFiles: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // Additional fields for tracking information
    amountSpent: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    // Add any other fields related to the transaction here
    transactionStatus: {
      type: String,
      enum: ["Pending", "Completed", "Revoked"],
      default: "Pending",
    },
    preAuthorization: {
      type: String,
      enum: ["yes", "no"], // Accepts "yes" or "no" as string values
      required: true,
      default: "no", // New field to indicate if pre-authorization is required
    },
    adminApprovalStatus: {
      type: Boolean,
      default: false, // New field to indicate if admin approved the transaction
    },
    revokeReason: {
      type: String, // New field for commenting the reason for revoking the transaction by the admin
      required: function () {
        return this.transactionStatus === "Revoked";
      },
    },
    invoiceNumber: {
      type: String,
      required: true,
      default: function () {
        // Generate a default invoice number when creating a new transaction
        const prefix = "INV";
        const date = new Date();
        const timestamp = date.getTime();
        const randomDigits = Math.floor(Math.random() * 1000);
        return `${prefix}-${timestamp}-${randomDigits}`;
      },
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: false,
    },
  },
    
  { timestamps: true }
);


module.exports = mongoose.model("Transaction", transactionSchema);
