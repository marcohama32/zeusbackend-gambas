const mongoose = require("mongoose");

const planServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  servicePrice: {
    type: Number,
    required: true,
  },
  serviceDescription: {
    type: String,
    required: true,
  },
  serviceAreaOfCover: {
    type: String,
    required: true,
  },
  preAuthorization: {
    type: String,
    enum: ["yes", "no"],
    required: true,
  },
  status: {
    type: String,
    default: "Active",
  },
});

module.exports = mongoose.model("PlanService", planServiceSchema);
