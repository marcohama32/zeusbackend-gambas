const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company Name is required"],
    },
    brand: {
      type: String,
      trim: true,
      required: [true, "Brand is required"],
    },
    accountManager: {
      type: String,
      trim: true,
      required: [true, "Account Manager is required"],
    },
    contact1: {
        type: String,
        trim: true,
        required: [true, "Contact is required"],
      },
      contact2: {
        type: String,
        trim: true,
        required: ["Partner Business is required"],
      },
    plan: {
      type: ObjectId,
      ref: "Plan",
      required: true,
    },
    user: {
        type: ObjectId,
        ref: "User",
        required: true,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
