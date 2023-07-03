const Service = require("../models/serviceModel");
const Plan = require("../models/planModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

//create service
exports.createService = asyncHandler(async (req, res, next) => {
  try {
    const { serviceName, plan, servicePrice, serviceDescription } = req.body;

    if (!serviceName || !plan || !servicePrice || !serviceDescription) {
      return next(new ErrorResponse("Fields cannot be null", 400));
    }

    // Check if servicePrice is a valid number
    if (isNaN(servicePrice)) {
      return next(new ErrorResponse("Service price must be a number", 400));
    }

    // Check if plan exists
    const existingPlan = await Plan.findById(plan);
    if (!existingPlan) {
      return next(new ErrorResponse("Plan doesn't exist, please check", 400));
    }

    // Check if serviceName already exists for the given plan
    const existingService = await Service.findOne({ serviceName, plan });
    if (existingService) {
      return next(
        new ErrorResponse("Service with the same data already exists", 400)
      );
    }

    const service = await Service.create({
      serviceName,
      plan,
      servicePrice,
      serviceDescription,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      service,
    });
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
