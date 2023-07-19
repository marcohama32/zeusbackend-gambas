const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");

//load all users
exports.allUsers = async (req, res, next) => {
  //enavle pagination
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const count = await User.find({}).estimatedDocumentCount();
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("-password")
      .populate("plan")
      .populate("user")
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.status(200).json({
      success: true,
      users,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
    next();
  } catch (error) {
    return next(error);
  }
};

//show single user
exports.singleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("plan").populate("user");
    if (user.avatar) {
      // Construct the full URL for the avatar image
      user.avatar = `${user.avatar}`; // Replace 'your-image-url' with the actual URL or path to your images
    }
    
    if (user.multipleFiles) {
      // Fetch the array of files
      const files = user.multipleFiles.split(',');

      // Construct the full URLs for the files
      const fileURLs = files.map(file => `${file}`);

      // Update the user object with the array of file URLs
      user.multipleFiles = fileURLs;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};


//edit user
exports.editUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, req.body, { new: true });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

//delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    return next(error);
  }
};

//jobs history
exports.createUserJobsHistory = async (req, res, next) => {
  const { title, description, salary, location } = req.body;
  try {
    const currentUser = await User.findOne({ _id: req.user._id });
    if (!currentUser) {
      return next(new ErrorResponse("You must log in", 401));
    } else {
      const addJobHistory = {
        title,
        description,
        salary,
        location,
        user: req.user._id
      };
      currentUser.jobsHistory.push(addJobHistory)
      await currentUser.save()
    }
    res.status(200).json({
      success: true,
      currentUser
    });
  } catch (error) {
    return next(error);
  }
};
