const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");

exports.signup = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    dob,
    relation,
    monthlyFee,
    memberShipID,
    idType,
    idNumber,
    address,
    contact1,
    contact2,
    partnerLocation,
    userType,
    company,
    plan,
    password,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !gender ||
    !idType ||
    !idNumber ||
    !address ||
    !contact1 ||
    !userType
  ) {
    return next(new ErrorResponse("Fields cannot be null", 400));
  }

  try {
    const userExist = await User.findOne({ email });

    if (userExist) {
      return next(new ErrorResponse("Email has already been taken", 400));
    }

    let company = null;
    if (company) {
      // Check if company field is not empty
      company = mongoose.Types.ObjectId.isValid(company) ? mongoose.Types.ObjectId(company) : null;
    }
    let plan = null;
    if (plan) {
      // Check if company field is not empty
      plan = mongoose.Types.ObjectId.isValid(plan) ? mongoose.Types.ObjectId(plan) : null;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      gender,
      dob,
      relation,
      monthlyFee,
      memberShipID,
      idType,
      idNumber,
      address,
      contact1,
      contact2,
      partnerLocation,
      userType,
      company,
      plan,
      password,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};


exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide both email and password", 403)
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 400));
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return next(new ErrorResponse("Invalid credentials", 400));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const sendTokenResponse = async (user, codeStatus, res) => {
  const token = await user.getJwtToken();

  res
    .status(codeStatus)
    .cookie("token", token, { maxAge: 60 * 60 * 1000, httpOnly: true })
    .json({
      success: true,
      token,
      user: user._id,
      user: user.firstName,
      user: user.lastName,
      role: user.role,
    });
};

//log out
exports.logout = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "logged out",
  });
};

//user profile
exports.userProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    user,
  });
};
