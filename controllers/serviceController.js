const Service = require("../models/notaplicableplanService");
const Plan = require("../models/planModel");
const PlanService = require("../models/serviceModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

// Create service and add it to a plan
exports.createServiceForPlan = asyncHandler(async (req, res, next) => {
  try {
    const {
      planId,
      serviceName,
      servicePrice,
      serviceDescription,
      serviceAreaOfCover,
      preAuthorization,
    } = req.body;

    if (
      !planId ||
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

    // Find the plan to which we want to add the service
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, error: "Plan not found" });
    }

    // Check if a service with the same name already exists in the plan
    const existingService = plan.planService.find(
      (service) => service.service.serviceName === serviceName
    );

    if (existingService) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Service with the same name already exists in the plan",
        });
    }

    // Get the user reference from the req.user object
    const user = req.user.id;

    // Create the new service with the user and plan references
    const newService = await PlanService.create({
      serviceName,
      servicePrice: parseFloat(servicePrice),
      serviceDescription,
      serviceAreaOfCover,
      preAuthorization,
      user, // Add the user reference
      plan: plan._id, // Add the plan reference
    });



// Update the plan's total balance with the new service price
const totalBalance = plan.planService.reduce((sum, service) => {
  const servicePrice = parseFloat(service.service.servicePrice);
  if (isNaN(servicePrice)) {
    // Log the problematic service and its price for debugging
    console.error("Invalid service price for service:", service.service.serviceName);
    console.error("Service price:", service.service.servicePrice);
    throw new Error("Invalid service price for one of the services");
  }
  return sum + servicePrice;
}, 0);

if (isNaN(totalBalance)) {
  // Log the plan and its current services for debugging
  console.error("Invalid total balance for plan:", plan.planName);
  console.error("Current services:", plan.planService);
  throw new Error("Invalid total balance");
}

plan.planTotalBalance = totalBalance.toFixed(2); // Assuming you want to round to 2 decimal places
await plan.save();






    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    next(error);
  }
});

//find plan by id
exports.singleService = asyncHandler(async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.service_id)
      .populate("plan")
      .populate("user");

    if (!service) {
      return next(new ErrorResponse("Service not found", 404));
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
});

//update plan
exports.updatedService = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { serviceName, plan, servicePrice, serviceDescription } = req.body;

  if (!id || !serviceName || !plan || !servicePrice || !serviceDescription) {
    return next(new ErrorResponse("Fields cannot be null", 403));
  }
  // Check if servicePrice is a valid number
  if (isNaN(servicePrice)) {
    return next(new ErrorResponse("Service price must be a number", 400));
  }


  const updatedService = await Service.findByIdAndUpdate(
    id,
    { serviceName, plan, servicePrice, serviceDescription },
    { new: true }
  );

  if (!updatedService) {
    return next(new ErrorResponse("Service not found", 404));
  }

  res.status(200).json({
    success: true,
    service: updatedService,
  });
});

//Get all all job category
exports.getAllService = asyncHandler(async (req, res, next) => {
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
  const count = await Service.find().countDocuments(); //jobType e o nome dentro do modelo job

  try {
    const service = await Service.find()
      .populate("plan")
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.status(200).json({
      success: true,
      page,
      service,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    next(error);
  }
});

//delete plan
exports.deleteService = asyncHandler(async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return next(new ErrorResponse("Service not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});
