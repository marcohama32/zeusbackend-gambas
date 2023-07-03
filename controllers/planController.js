const Plan = require("../models/planModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

//create plan
exports.createPlan = async (req, res, next) => {
  try {
    const { planName, planPrice, planDescription } = req.body;

    if (!planName || !planPrice || !planDescription) {
      return next(new ErrorResponse("Fields cannot be null", 400));
    }

    // Check if planPrice is a valid number
    if (isNaN(planPrice)) {
      return next(new ErrorResponse("Plan price must be a number", 400));
    }

    // Check if planName already exists
    const existingPlan = await Plan.findOne({ planName });
    if (existingPlan) {
      return next(
        new ErrorResponse("Plan with the same name already exists", 400)
      );
    }

    const plan = await Plan.create({
      planName,
      planPrice,
      planDescription,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

//find plan by id
exports.singlePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return next(new ErrorResponse("Plan not found", 404));
    }

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

//update plan
exports.updatePlan = asyncHandler(async (req, res, next) => {
  const id = req.params.plan_id;
  const { planName, planPrice, planDescription } = req.body;

  if (!id || !planName || !planPrice || !planDescription) {
    return next(new ErrorResponse("Fields cannot be null", 403));
  }

  const updatedPlan = await Plan.findByIdAndUpdate(
    id,
    { planName, planPrice, planDescription },
    { new: true }
  );

  if (!updatedPlan) {
    return next(new ErrorResponse("Plan not found", 404));
  }

  res.status(200).json({
    success: true,
    plan: updatedPlan,
  });
});

//Get all all job category
exports.getAllPlan = async (req, res, next) => {
  //enable seach
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  //enable pagination
  const pageSize = 5;
  const page = Number(req.query.pageNumber) || 1;

  // const count = await Job.find({ ...keyword }).estimatedDocumentCount();
  const count = await Plan.find().countDocuments(); //jobType e o nome dentro do modelo job

  try {
    const plan = await Plan.find()
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.status(200).json({
      success: true,
      page,
      plan,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    next(error);
  }
};


//delete plan
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return next(new ErrorResponse("Plan not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

