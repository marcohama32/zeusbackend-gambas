const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: [true, "Plan Name is required"],
    },
    planPrice: {
      type: String,
      trim: true,
      required: [true, "Plan Price is required"],
    },
    planDescription: {
      type: String,
      trim: true,
      required: [true, "Plan Description is required"],
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
