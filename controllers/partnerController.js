const Partner = require("../models/partnerModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

//create service
exports.createPartner = asyncHandler(async (req, res, next) => {
  try {
    const {
      partnerName,
      partnerLocation,
      partnerBusiness,
      contact1,
      contact2,
    } = req.body;

    if (
      !partnerName ||
      !partnerLocation ||
      !partnerBusiness ||
      !contact1 ||
      !contact2
    ) {
      return next(new ErrorResponse("Fields cannot be null", 400));
    }

    // Check if contact is a valid number
    if (isNaN(contact1) || isNaN(contact2)) {
      return next(new ErrorResponse("Contact must be a number", 400));
    }

    // Check if serviceName already exists for the given plan
    const existingPartner = await Partner.findOne({ partnerName });
    if (existingPartner) {
      return next(new ErrorResponse("Partner already exists", 400));
    }

    const partner = await Partner.create({
      partnerName,
      partnerLocation,
      partnerBusiness,
      contact1,
      contact2,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      partner,
    });
  } catch (error) {
    next(error);
  }
});

//find company by id
exports.singlePartner = asyncHandler(async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.partner_id).populate(
      "user"
    );

    if (!partner) {
      return next(new ErrorResponse("Partner not found", 404));
    }

    res.status(200).json({
      success: true,
      partner,
    });
  } catch (error) {
    next(error);
  }
});

//update Company
exports.updatedPartner = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { partnerName, partnerLocation, partnerBusiness, contact1, contact2 } =
    req.body;

  if (
    !partnerName ||
    !partnerLocation ||
    !partnerBusiness ||
    !contact1 ||
    !contact2
  ) {
    return next(new ErrorResponse("Fields cannot be null", 400));
  }

  // Check if contact is a valid number
  if (isNaN(contact1) || isNaN(contact2)) {
    return next(new ErrorResponse("Contact must be a number", 400));
  }

  const updatedPartner = await Partner.findByIdAndUpdate(
    id,
    { partnerName, partnerLocation, partnerBusiness, contact1, contact2 },
    { new: true }
  );

  if (!updatedPartner) {
    return next(new ErrorResponse("Partner not found", 404));
  }

  res.status(200).json({
    success: true,
    partner: updatedPartner,
  });
});

//Get all all job category
exports.getAllPartner = async (req, res, next) => {
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
  const count = await Partner.find().countDocuments(); //jobType e o nome dentro do modelo job

  try {
    const partner = await Partner.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.status(200).json({
      success: true,
      page,
      partner,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    next(error);
  }
};

//delete plan
exports.deletePartner = asyncHandler(async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return next(new ErrorResponse("Company not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});
