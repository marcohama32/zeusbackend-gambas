const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const customertransactionSchema = new mongoose.Schema(
  {

    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: ObjectId,
      ref: "Plan",
      required: true,
    },
    service: {
      type: ObjectId,
      ref: "Service",
      required: true,
    },
    expense: {
      type: String,
      required: [true, "Expense is required"],
    },
    amountLeftPlan: {
      type: String,
      trim: true,
      required: [true, "Amount not send required"],
    },
    amountLeftService: {
      type: String,
      trim: true,
      required: [true, "Amount not send required"],
    },
    partner: {
      type: ObjectId,
      ref: "Partner",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CustomerTransaction",
  customertransactionSchema
);
