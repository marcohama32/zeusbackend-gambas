const Company = require("../../models/companyModel");
const Plan = require("../../models/planModel");
const User = require("../../models/userModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");

// upload files

exports.uploadSingleFile = async (req, res, next) => {
  try {
    const id = req.params.id;
    // const files = req.files;
    if (req.file) {
      avatar = req.file.path;
    }
    const fileUpload = await User.findByIdAndUpdate(
      id,
      {
        avatar,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      avatar: avatar, // Return the uploaded files in the response
      file: fileUpload,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadMultipleFiles = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existingUser = await User.findById(id);

    if (req.files) {
      const newFiles = req.files.map((file) => file.path);
      const multipleFiles = [...existingUser.multipleFiles, ...newFiles]; // Combine the existing files with the new files

      // Updating the user document with the updated multipleFiles
      const fileUpload = await User.findByIdAndUpdate(
        id,
        { multipleFiles },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        multipleFiles: fileUpload.multipleFiles,
        file: fileUpload,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "No files were uploaded",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};



//create IndividualCustomer
exports.createIndividualUser = asyncHandler(async (req, res, next) => {
  try {
    const {
      dob,
      idNumber,
      idType,
      address,
      contact1,
      contact2,
      email,
      enrolmentDate,
      firstName,
      gender,
      lastName,
      monthlyFee,
      plan,
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
      firstName,
      gender,
      lastName,
      monthlyFee,
      plan,
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

    const existingPlan = await Plan.findById(plan);
    if (!existingPlan) {
      return next(new ErrorResponse("Plan doesn't exist, please check", 400));
    }

    const avatar = req.file?.path;

    const customer = await User.create({
      dob,
      idNumber,
      idType,
      address,
      contact1,
      contact2,
      email,
      enrolmentDate,
      firstName,
      gender,
      lastName,
      monthlyFee,
      plan,
      relation: "Main",
      role: 5,
      avatar,
      userType: 5,
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
exports.editIndividualUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
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
    firstName,
    gender,
    lastName,
    monthlyFee,
    plan,
  } = req.body;
  relation = "Main";

  const requiredFields = [
    dob,
    idNumber,
    idType,
    address,
    contact1,
    contact2,
    email,
    enrolmentDate,
    firstName,
    gender,
    lastName,
    monthlyFee,
    plan,
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

  const updatedCompany = await User.findByIdAndUpdate(
    id,
    {
      dob,
      idNumber,
      idType,
      address,
      contact1,
      contact2,
      email,
      enrolmentDate,
      firstName,
      gender,
      lastName,
      monthlyFee,
      plan,
      relation: "Main",
      role: 5,
      avatar,
      userType: 5,
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

exports.getAllIndividualCustomer = async (req, res, next) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;
  const searchTerm = req.query.searchTerm; // Extract searchTerm from query params

  try {
    let query = { userType: 5 };

    if (searchTerm) {
      // Modify the query to include search conditions
      query = {
        $and: [
          { userType: 5 },
          {
            $or: [
              { firstName: { $regex: searchTerm, $options: "i" } },
              { lastName: { $regex: searchTerm, $options: "i" } },
              { enrolmentDate: { $regex: searchTerm, $options: "i" } },
              { idNumber: { $regex: searchTerm, $options: "i" } },
              { contact1: { $regex: searchTerm, $options: "i" } },
              { contact2: { $regex: searchTerm, $options: "i" } },
              { memberShipID: { $regex: searchTerm, $options: "i" } },
            ],
          },
        ],
      };
    }

    const count = await User.countDocuments(query);

    const userIndividual = await User.find(query)
      .sort({ createdAt: -1 })
      .select("-password")
      .populate("plan")
      .populate("user")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.status(200).json({
      success: true,
      userIndividual,
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