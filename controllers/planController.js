const Plan = require("../models/planModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

//create plan
exports.createPlan = async (req, res, next) => {
  try {
    const { planName, planPrice, planDescription, areaOfCover } = req.body;

    if (!planName || !planPrice || !planDescription || !areaOfCover) {
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
      areaOfCover,
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
  const { planName, planPrice, planDescription, areaOfCover } = req.body;

  if (!id || !planName || !planPrice || !planDescription || !areaOfCover) {
    return next(new ErrorResponse("Fields cannot be null", 403));
  }

  const updatedPlan = await Plan.findByIdAndUpdate(
    id,
    { planName, planPrice, planDescription, areaOfCover },
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
  const pageSize = 10;
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

//////////////////// services //////////////////////

//create service
exports.createService = async (req, res, next) => {
  try {
    const {
      serviceName,
      servicePrice,
      serviceDescription,
      serviceAreaOfCover,
      preAuthorization,
    } = req.body;

    if (
      !serviceName ||
      !servicePrice ||
      !serviceDescription ||
      !serviceAreaOfCover ||
      !preAuthorization
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Fields cannot be null" });
    }

    // Check if servicePrice is a valid number
    if (isNaN(servicePrice)) {
      return res
        .status(400)
        .json({ success: false, error: "Service price must be a number" });
    }

    // Check if serviceName already exists
    const existingService = await Plan.findOne({
      "planService.serviceName": serviceName,
    });
    if (existingService) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Service with the same name already exists",
        });
    }

    // Create a new service and add it to the planService array
    const newService = {
      serviceDescription,
      serviceAreaOfCover,
      serviceName,
      servicePrice,
      preAuthorization,
    };

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    plan.planService.push(newService);
    await plan.save();

    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    next(error);
  }
};

//create update
exports.updateService = async (req, res, next) => {
  try {
    const {
      serviceName,
      servicePrice,
      serviceDescription,
      serviceAreaOfCover,
      preAuthorization,
    } = req.body;

    if (
      !serviceName ||
      !servicePrice ||
      !serviceDescription ||
      !serviceAreaOfCover ||
      !preAuthorization
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Fields cannot be null" });
    }

    // Check if servicePrice is a valid number
    if (isNaN(servicePrice)) {
      return res
        .status(400)
        .json({ success: false, error: "Service price must be a number" });
    }

    // Find the plan by ID
    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    // Find the index of the service to update in the planService array
    const serviceIndex = plan.planService.findIndex(
      (service) => service._id.toString() === req.params.serviceId
    );

    if (serviceIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }

    // Update the service fields
    plan.planService[serviceIndex].serviceName = serviceName;
    plan.planService[serviceIndex].servicePrice = servicePrice;
    plan.planService[serviceIndex].serviceDescription = serviceDescription;
    plan.planService[serviceIndex].serviceAreaOfCover = serviceAreaOfCover;
    plan.planService[serviceIndex].preAuthorization = preAuthorization;

    await plan.save();

    res.status(200).json({ success: true, service: plan.planService[serviceIndex] });
  } catch (error) {
    next(error);
  }
};

//delete service
exports.deleteService = async (req, res, next) => {
  try {
    const planId = req.params.planId;
    const serviceId = req.params.serviceId;

    // Find the plan by ID
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    // Find the index of the service in the planService array
    const serviceIndex = plan.planService.findIndex(
      (service) => service._id.toString() === serviceId
    );

    if (serviceIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found in the plan" });
    }

    // Remove the service from the planService array
    plan.planService.splice(serviceIndex, 1);

    // Save the updated plan
    await plan.save();

    res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
};