const FilesTemplate = require("../models/filesTemplate");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

//create IndividualCustomer
exports.createFileTemplate = asyncHandler(async (req, res, next) => {
  try {
    const { description } = req.body;

    // Check if 'description' is provided
    if (!description) {
      return next(new ErrorResponse("Description field is required", 400));
    }

    const fileTemplate = req.file?.path;

    const fileUpload = await FilesTemplate.create({
      description,
      fileTemplate,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      fileUpload,
    });
  } catch (error) {
    next(error);
  }
});

exports.updateFileTemplate = asyncHandler(async (req, res, next) => {
  try {
    const { description } = req.body;
    const fileId = req.params.id; // Assuming you're passing the file ID as a URL parameter
    console.log("Description: ", description);

    // Check if 'description' is provided
    if (!description) {
      return next(new ErrorResponse("Description field is required", 400));
    }

    const updatedFields = {
      description,
    };

    if (req.file) {
      updatedFields.avatar = req.file.path;
    }

    // Find the file template by ID and update it
    const file = await FilesTemplate.findByIdAndUpdate(fileId, updatedFields, {
      new: true,
      runValidators: true,
    });

    if (!file) {
      return next(new ErrorResponse("File template not found", 404));
    }

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    next(error);
  }
});

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
