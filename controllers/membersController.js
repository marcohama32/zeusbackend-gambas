const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");

exports.addmembers = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    dob,
    relation,
    memberShipID,
    idType,
    idNumber,
    address,
    contact1,
    contact2,
    userType,
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
      // user: req.user.id,
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};


