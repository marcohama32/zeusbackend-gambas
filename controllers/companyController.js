const Company = require("../models/companyModel");
const Plan = require("../models/planModel");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

//create company
//create IndividualCustomer
exports.createCompany = asyncHandler(async (req, res, next) => {
  try {
    const {
      companyName,
      brand,
      accountManager,
      contact1,
      contact2,
      email,
      manager,
    } = req.body;

    const requiredFields = [
      companyName,
      brand,
      accountManager,
      manager,
      contact1,
      contact2,
      email,
    ];

    if (requiredFields.some((field) => !field)) {
      return next(new ErrorResponse("Fields cannot be null", 400));
    }
    // Check if contact is a valid number
    if (isNaN(contact1) || isNaN(contact2)) {
      return next(new ErrorResponse("Validate all fields", 400));
    }

    const existingCompany = await Company.findOne({ companyName });
    if (existingCompany) {
      return next(
        new ErrorResponse("Company with the same data already exists", 400)
      );
    }

    const avatar = req.file?.path;

    const company = await Company.create({
      companyName,
      brand,
      accountManager,
      manager,
      contact1,
      contact2,
      email,
      avatar,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
});

//find company by id
exports.singleCompany = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.company_id)
      .populate("plan")
      .populate("user");

    if (!company) {
      return next(new ErrorResponse("Company not found", 404));
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
});

//update Company
exports.updatedCompany = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const {
    companyName,
    brand,
    accountManager,
    contact1,
    contact2,
    email,
    manager,
    status
  } = req.body;
  //check if empty
  const requiredFields = [
    companyName,
    brand,
    accountManager,
    manager,
    contact1,
    contact2,
    email,
    status
  ];

  if (requiredFields.some((field) => !field)) {
    return next(new ErrorResponse("Fields cannot be null", 400));
  }
  // Check if contact is a valid number
  if (isNaN(contact1) || isNaN(contact2)) {
    return next(new ErrorResponse("Validate all fields", 400));
  }

  const avatar = req.file?.path;

  const updatedCompany = await Company.findByIdAndUpdate(
    id,
    {
      companyName,
      brand,
      accountManager,
      contact1,
      contact2,
      email,
      avatar,
      manager,
      status
    },
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

//Get all companies
exports.getAllCompany = async (req, res, next) => {
  // Enable search
  const searchTerm = req.query.searchTerm;
  const accountManagerSearch = req.query.accountManager;

  const keyword = {};
  if (searchTerm || accountManagerSearch) {
    keyword["$or"] = [];

    if (searchTerm) {
      keyword["$or"].push({
        companyName: {
          $regex: searchTerm,
          $options: "i",
        },
      });
    }

    if (accountManagerSearch) {
      keyword["$or"].push({
        accountManager: {
          $regex: accountManagerSearch,
          $options: "i",
        },
      });
    }
  }

  // Enable pagination
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  try {
    // Fetch the companies with pagination and population
    const companies = await Company.find(keyword)
      .populate("plan")
      .populate("manager")
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    // Get the total count of documents with the applied keyword filter
    const count = await Company.countDocuments(keyword);

    res.status(200).json({
      success: true,
      page,
      companies,
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

//quero entrar na tabela de usuarios, e estrair todos os usuarios que tem o id da empresa
//irei receber esse id por parametro

exports.getThisCompanyUsers = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const allUsers = await User.find({ company: id })
      .populate({ path: "plan", select: "-__v" })
      .populate({ path: "user", select: "firstName lastName email" });

    res.status(200).json({
      success: true,
      allUsers,
    });
  } catch (error) {
    next(error);
  }
});
