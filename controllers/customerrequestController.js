const CustomerRequest = require("../models/customerRequest");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Create a customer request with status history and changedBy reference
exports.createCustomerRequest = asyncHandler(async (req, res, next) => {
  try {
    // Extract data from the request body
    const { title, comment } = req.body;

    // Check if 'title' is provided
    if (!title) {
      return next(new ErrorResponse("Title field is required", 400));
    }

    // Get the authenticated user's ID from the request
    const createdBy = req.user.id;

    // Check if a file was uploaded
    // const files = req.file?.path;


    const newFiles = req.files.map((file) => file.path.replace(/\\/g, "/"));

    let files = ""; // Set default value as empty string if multipleFiles is undefined or null

    if (files) {
      files += ",";
    }

    files += newFiles.join(",");



    // Create the customer request with status history
    const customerRequest = await CustomerRequest.create({
      customer: createdBy,
      title,
      files,
      comment,
      statusHistory: [
        {
          status: "Pending",
          changedBy: createdBy,
        },
      ],
    });

    // Respond with a 201 Created status and the newly created customer request
    res.status(201).json({
      success: true,
      customerRequest,
    });
  } catch (error) {
    // Forward errors to the error-handling middleware
    next(error);
  }
});



// Update a customer request || customer only can change status to canceled
exports.updateCustomerRequest = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, comment, status } = req.body;

    // Find the customer request by ID
    let customerRequest = await CustomerRequest.findById(id);

    if (!customerRequest) {
      return res.status(404).json({ message: "Customer request not found" });
    }

    // Check if the user is authorized to update the request
    if (customerRequest.customer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this request" });
    }

    // Check if the status can be updated to "Canceled"
    if (customerRequest.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "This request cannot be updated" });
    }

    const files = req.file?.path;

    // Update the customer request fields
    customerRequest.title = title || customerRequest.title;
    customerRequest.comment = comment || customerRequest.comment;
    customerRequest.files = files || customerRequest.files;

    // Save the updated customer request
    customerRequest = await customerRequest.save();

    res.status(200).json({
      success: true,
      customerRequest,
    });
  } catch (error) {
    next(error);
  }
});

//find by ID
exports.findCustomerRequestById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the customer request by ID
    const customerRequest = await CustomerRequest.findById(id);

    if (!customerRequest) {
      return res.status(404).json({ message: "Customer request not found" });
    }

    res.status(200).json({
      success: true,
      customerRequest,
    });
  } catch (error) {
    next(error);
  }
});

//find all requests
exports.getAllCustomerRequests = asyncHandler(async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;
    const searchTerm = req.query.searchTerm;

    // Create the query object
    const query = {};

    // Add search criteria if searchTerm is provided
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { comment: { $regex: searchTerm, $options: "i" } },
        { status: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Calculate the total count of customer requests matching the query
    const totalCount = await CustomerRequest.countDocuments(query);

    // Find customer requests with pagination
    const customerRequests = await CustomerRequest.find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: customerRequests.length,
      total: totalCount,
      pageSize,
      page,
      customerRequests,
    });
  } catch (error) {
    next(error);
  }
});

//loged user requests
exports.getCustomerRequestsByUser = asyncHandler(async (req, res, next) => {

  try {
    // Parse and validate pageSize and page parameters
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.pageNumber) || 1;

    if (pageSize <= 0 || page <= 0) {
      return next(new ErrorResponse("Invalid page or pageSize parameters", 400));
    }

    const searchTerm = req.query.searchTerm;

    // Get the ID of the logged-in user
    const userId = req.user.id;
    console.log("Logged-in User ID:", userId);

    // Create the query object
    const query = { customer: userId };

    // Add search criteria if searchTerm is provided
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { comment: { $regex: searchTerm, $options: "i" } },
        { status: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Calculate the total count of customer requests matching the query
    const totalCount = await CustomerRequest.countDocuments(query);

    // Find customer requests for the logged-in user with pagination
    const customerRequests = await CustomerRequest.find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize);


      console.log("MongoDB Query:", query);
      console.log("Total Count:", totalCount);
      console.log("Customer Requests:", customerRequests);
  
    // Create a structured response
    const response = {
      success: true,
      data: {
        count: customerRequests.length,
        total: totalCount,
        pageSize,
        page,
        customerRequests,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Update the status of a customer request
exports.UpdateStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log("Status: ", status)

  try {
    // Assuming you have an authenticated user
    const adminId = req.user.id;

    // Update status and status history using a separate function
    const updatedRequest = await updateRequestStatus(id, status, adminId);

    if (!updatedRequest) {
      // If the request is not found, return a 404 response
      return next(new ErrorResponse("Customer request not found", 404));
    }

    // Respond with the updated request
    res.json(updatedRequest);
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
});

// Function to update request status and history
const updateRequestStatus = async (requestId, newStatus, changedBy) => {
  try {
    const updatedRequest = await CustomerRequest.findByIdAndUpdate(
      requestId,
      {
        $set: { status: newStatus },
        $push: { statusHistory: { status: newStatus, changedBy } },
      },
      { new: true }
    );

    return updatedRequest;
  } catch (error) {
    // Handle any database-related errors here or pass them to the caller
    throw error;
  }
};

