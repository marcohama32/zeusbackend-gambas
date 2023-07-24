const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, "Company Name is required"],
    },
    plan: {
      type: ObjectId,
      ref: "Plan",
      required: true,
    },
    servicePrice: {
      type: Number,
      trim: true,
      required: [true, "Service Price is required"],
    },
    serviceDescription: {
      type: String,
      trim: true,
      required: [true, "Contact is required"],
    },
    authorization: {
      type: Boolean,
      default: "false"
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
