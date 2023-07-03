const Company = require("../models/companyModel");
const Plan = require("../models/planModel");
const Service = require("../models/serviceModel");
const User = require("../models/userModel");
const Partner = require("../models/partnerModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const customertransactionModel = require("../models/customertransactionModel");

//create service
exports.createCTransations = asyncHandler(async (req, res, next) => {
  try {
    const { user, plan, service, expense, partner } = req.body;

    if (!plan || !service || !expense) {
      return next(new ErrorResponse("Fields cannot be null", 400));
    }

    // Check if contact is a valid number
    if (isNaN(expense)) {
      return next(new ErrorResponse("Expense must be a number", 400));
    }

    // Check if user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return next(new ErrorResponse("User doesn't exist, please check", 400));
    }

    // Check if plan exists
    const existingPlan = await Plan.findById(plan);
    if (!existingPlan) {
      return next(new ErrorResponse("Plan doesn't exist, please check", 400));
    }
    // Check if service exists
    const existingService = await Service.findById(service);
    if (!existingService) {
      return next(
        new ErrorResponse("Service doesn't exist, please check", 400)
      );
    }
    // Check if partner exists
    const existingPartner = await Partner.findById(partner);
    if (!existingPartner) {
      return next(
        new ErrorResponse("Service doesn't exist, please check", 400)
      );
    }

    if (expense > existingService.servicePrice) {
      return next(
        new ErrorResponse("You dont have credits for this service, please contact you provider ", 400)
      );
    }
 
    // Check if serviceName already exists for the given plan
    // const existingCompany = await Company.findOne({ companyName });
    // if (existingCompany) {
    //   return next(
    //     new ErrorResponse("Service with the same data already exists", 400)
    //   );
    // }

    // console.log(existingService.serviceName)
    // console.log('plan name:',existingPlan.planName,'plan price', existingPlan.planPrice)
    // console.log('service name:',existingService.serviceName,'service price', existingService.servicePrice)
    // console.log('Partner',existingPartner.partnerName)
    // console.log('expense',expense)
    // console.log('amountLeftPlan',existingPlan.planPrice - expense)
    // console.log('amountLeftService',existingService.servicePrice - expense)

    const CustomerTransaction = await customertransactionModel.create({
      serviceName: existingService.serviceName,
      planName: existingPlan.planName,
      planPrice: existingPlan.planPrice,
      serviceName: existingService.serviceName,
      servicePrice: existingService.servicePrice,
      partnerName: existingPartner.partnerName,
      user,
      plan,
      service,
      expense,
      amountLeftPlan: existingPlan.planPrice - expense,
      amountLeftService: existingService.servicePrice - expense,
      partner,
      employer: req.user.id,
    });

    res.status(201).json({
      success: true,
      CustomerTransaction,
    });
  } catch (error) {
    next(error);
  }
});

//find company by id
exports.singleTransaction = asyncHandler(async (req, res, next) => {
  try {
    const transaction = await customertransactionModel.findById(req.params.transaction_id)
      .populate("plan")
      .populate("user",["firstName","lastName"])
      .populate("partner")
      .populate("service");

    if (!transaction) {
      return next(new ErrorResponse("Transaction not found", 404));
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

//update Company
exports.updatedCompany = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { companyName, brand, accountManager, contact1, contact2, plan } =
    req.body;
  //check if empty
  if (
    !companyName ||
    !plan ||
    !brand ||
    !accountManager ||
    !contact1 ||
    !contact2
  ) {
    return next(new ErrorResponse("Fields cannot be null", 400));
  }

  // Check if contact is a valid number
  if (isNaN(contact1) || isNaN(contact2)) {
    return next(new ErrorResponse("Contact must be a number", 400));
  }

  const updatedCompany = await Company.findByIdAndUpdate(
    id,
    { companyName, brand, accountManager, contact1, contact2, plan },
    { new: true }
  );

  if (!updatedCompany) {
    return next(new ErrorResponse("Service not found", 404));
  }

  res.status(200).json({
    success: true,
    company: updatedCompany,
  });
});

//Get all all job category
exports.getAllCompany = async (req, res, next) => {
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
  const count = await Company.find().countDocuments(); //jobType e o nome dentro do modelo job

  try {
    const company = await Company.find()
      .populate("plan")
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.status(200).json({
      success: true,
      page,
      company,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    next(error);
  }
};

//delete plan
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return next(new ErrorResponse("Company not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});
