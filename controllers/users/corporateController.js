const Company = require("../../models/companyModel");
const Plan = require("../../models/planModel");
const User = require("../../models/userModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const bcrypt = require("bcrypt");

//create Corporate Customer
exports.createCorporatelUser = asyncHandler(async (req, res, next) => {
  try {
    const company = req.params.company;
    const {
      dob,
      idNumber,
      idType,
      address,
      contact1,
      contact2,
      email,
      enrolmentDate,
      memberShipID,
      firstName,
      manager,
      gender,
      lastName,
      monthlyFee,
      plan,
      password,
      
    } = req.body;

    const requiredFields = [
      dob,
      idNumber,
      idType,
      address,
      contact1,
      contact2,
      email,
      enrolmentDate,
      memberShipID,
      firstName,
      manager,
      gender,
      lastName,
      monthlyFee,
      plan,
      company
    ];

    if (requiredFields.some((field) => !field)) {
      return next(new ErrorResponse("Fields cannot be null", 400));
    }
    // Check if contact is a valid number
    if (isNaN(contact1) || isNaN(contact2) || isNaN(monthlyFee)) {
      return next(new ErrorResponse("Validate all fields", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new ErrorResponse("User with the same data already exists", 400)
      );
    }
    const existingUserByMemberShipID = await User.findOne({ memberShipID });
    if (existingUserByMemberShipID) {
      return res.status(400).json({
        success: false,
        error: "User with the same memberShipID already exists",
      });
    }


    const existingPlan = await Plan.findById(plan);
    if (!existingPlan) {
      return next(new ErrorResponse("Plan doesn't exist, please check", 400));
    }

    const avatar = req.file?.path;

    // Use the same hashing logic as in the model's pre-save hook
    let hashedPassword = password;
    if (!hashedPassword) {
      hashedPassword = await bcrypt.hash("mediplus", 10);
    }

    const customer = await User.create({
      dob,
      idNumber,
      idType,
      address,
      contact1,
      contact2,
      email,
      enrolmentDate,
      memberShipID,
      firstName,
      gender,
      lastName,
      manager,
      monthlyFee,
      plan,
      relation: "Main",
      role: 4,
      avatar,
      company,
      userType: 4,
      password: hashedPassword,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
});

//update Company
exports.editCorporatelUser = asyncHandler(async (req, res, next) => {
  const company = req.params.company;
  const avatar = req.file?.path;

  const {
    dob,
    idNumber,
    idType,
    address,
    contact1,
    contact2,
    email,
    enrolmentDate,
    memberShipID,
    firstName,
    manager,
    gender,
    lastName,
    monthlyFee,
    plan,
    status,
    relation,
    password
  } = req.body;

  const requiredFields = [
    dob,
    idNumber,
    idType,
    address,
    contact1,
    contact2,
    email,
    enrolmentDate,
    memberShipID,
    firstName,
    manager,
    gender,
    lastName,
    monthlyFee,
    plan,
    status,
    relation
  ];

  if (requiredFields.some((field) => !field)) {
    return next(new ErrorResponse("Fields cannot be null", 400));
  }
  // Check if contact is a valid number
  if (isNaN(contact1) || isNaN(contact2) || isNaN(monthlyFee)) {
    return next(new ErrorResponse("Contact must be a number", 400));
  }

  // Check if plan  exists for the given plan
  // console.log(plan)
  // Check if serviceName already exists for the given plan
  if (!(await Plan.exists({ _id: plan }))) {
    return next(new ErrorResponse("Plan doesn't exist, please check", 400));
  }

  let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

  const updatedCompany = await User.findByIdAndUpdate(
    company,
    {
      dob,
      idNumber,
      idType,
      address,
      contact1,
      contact2,
      email,
      enrolmentDate,
      memberShipID,
      firstName,
      manager,
      gender,
      lastName,
      monthlyFee,
      plan,
      relation,
      role: 4,
      avatar,
      userType: 4,
      status,
      password: hashedPassword,
      user: req.user.id,
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


exports.getAllCorporateCustomer = async (req, res, next) => {
  let pageSize = Number(req.query.pageSize) || 10;
  let page = Number(req.query.pageNumber) || 1;
  const searchTerm = req.query.searchTerm;

  // Validate pageSize and pageNumber
  if (pageSize <= 0) {
    return res.status(400).json({ success: false, error: "Invalid pageSize. Must be greater than 0" });
  }

  if (page <= 0) {
    return res.status(400).json({ success: false, error: "Invalid pageNumber. Must be greater than 0" });
  }

  try {
    let query = { userType: 4 };

    if (searchTerm) {
      query = {
        $and: [
          { userType: 4 },
          {
            $or: [
              { firstName: { $regex: searchTerm, $options: "i" } },
              { lastName: { $regex: searchTerm, $options: "i" } },
              { idNumber: { $regex: searchTerm, $options: "i" } },
              { contact1: { $regex: searchTerm, $options: "i" } },
              { contact2: { $regex: searchTerm, $options: "i" } },
              { memberShipID: { $regex: searchTerm, $options: "i" } },
              { relation: { $regex: searchTerm, $options: "i" } },
            ],
          },
        ],
      };

      const dateSearch = new Date(searchTerm);
      if (!isNaN(dateSearch)) {
        query.$and.push({ enrolmentDate: dateSearch });
      }
    }

    const count = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select("-password")
      .populate({
        path: "plan",
        populate: {
          path: "planService",
          model: "PlanServices",
        },
      })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const userWithPlans = users.map((user) => {
      // Check if the user has a plan and if the plan array is not empty
      if (user.plan && user.plan.length > 0) {
        // Calculate updated remaining balance for each service in the user's plan
        const updatedPlanService = user.plan[0].planService.map((service) => {
          const spentOnService = service.servicePrice - (service.remainingBalance || 0);
          const updatedRemainingBalance = service.servicePrice - spentOnService;
          return { ...service.toObject(), remainingBalance: updatedRemainingBalance };
        });

        return {
          ...user.toObject(),
          plan: [
            {
              ...user.plan[0].toObject(),
              planService: updatedPlanService,
            },
          ],
        };
      } else {
        // If the user has no plan or the plan array is empty, return the user as is
        return { ...user.toObject(), plan: [] };
      }
    });

    res.status(200).json({
      success: true,
      users: userWithPlans,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    return next(error);
  }
};




const fs = require("fs");
const path = require("path");

exports.deleteFile = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const fileName = req.body.file; // Assuming the file name is passed in the request body

    // Check if the user ID and file name are provided
    if (!userId || !fileName) {
      return res.status(400).json({
        success: false,
        message: "User ID and file name are required",
      });
    }

    try {
      // Remove the file entry from the User table
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove the file name from the user's file string
      const files = user.multipleFiles.split(",");
      const fileIndex = files.indexOf(fileName);
      if (fileIndex !== -1) {
        files.splice(fileIndex, 1);
        user.multipleFiles = files.join(",");
        await user.save();
      }

      res.status(200).json({
        success: true,
        message: "File deleted",
      });
    } catch (error) {
      console.error("Error deleting file from User table:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete the file from the User table",
      });
    }
  } catch (error) {
    return next(error);
  }
};
