const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const customertransactionSchema = new mongoose.Schema(
  {
    // se quem vai gravar e o usuario logado,
    // entao nao ha necessidade de cadastrar partner,
    // porque esta la logado, mas vou devicePixelRatio, talvez
    // eles podem facturar algum valor ao cliente
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
    serviceName: { type: String },
    planName: { type: String },
    planPrice: { type: String },
    serviceName: { type: String },
    servicePrice: { type: String },
    partnerName: { type: String },
    amountLeftPlan: { type: String },
    amountLeftService: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CustomerTransaction",
  customertransactionSchema
);
