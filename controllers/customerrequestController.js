const CustomerRequest = require("../models/customerRequest");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Create a customer request with status history and changedBy reference
exports.createCustomerRequest = asyncHandler(async (req, res, next) => {

  const files = req.file?.path;
    console.log("Received form data:", req.body);
    console.log("files :", files);
//   try {
//     const { title, comment } = req.body;

//     console.log("Hama: ", title)
//     // Check if 'title' is provided
//     if (!title) {
//       return next(new ErrorResponse("Title field is required", 400));
//     }

//     // Get the authenticated user's ID
//     const createdBy = req.user.id;

//     const files = req.file?.path;
//     // Create the customer request
//     const customerRequest = await CustomerRequest.create({
//       customer: createdBy, // Set the customer to the authenticated user
//       title,
//       files,
//       comment,

//       statusHistory: [
//         {
//           changedBy: createdBy, // Set the changedBy to the authenticated user
//         },
//       ],
//     });

//     res.status(201).json({
//       success: true,
//       customerRequest,
//     });
//   } catch (error) {
//     next(error);
//   }
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
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;
    const searchTerm = req.query.searchTerm;

    // Get the ID of the logged-in user
    const userId = req.user.id;

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

// Update the status of a customer request
exports.status = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const adminId = req.user.id; // Assuming you have an authenticated user

    const request = await CustomerRequest.findByIdAndUpdate(
      id,
      {
        $set: { status: status },
        $push: { statusHistory: { status: status, changedBy: adminId } },
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Customer request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating status" });
  }
});
