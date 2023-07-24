const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const planServiceSchema = new mongoose.Schema({
  service: {
    type: ObjectId,
    ref: "Service",
    required: true,
  },
  // other plan service fields...
});

const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: [true, "Plan Name is required"],
    },
    planTotalBalance: {
      type: Number,
      trim: true,
      required: [true, "Plan Price is required"],
    },
   
    planDescription: {
      type: String,
      trim: true,
      required: [true, "Plan Description is required"],
    },
    planService: [planServiceSchema], // Using the planServiceSchema as an array element
    status: {
      type: String,
      default: "Active"
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
