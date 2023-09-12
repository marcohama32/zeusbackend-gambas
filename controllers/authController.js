const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
// Import required modules
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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


exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse("Please provide both email and password", 403));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 400));
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return next(new ErrorResponse("Invalid credentials", 400));
    }

    if (user.status !== "Active") {
      return next(new ErrorResponse("User account is not active, contact admin", 401));
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
      firstName: user.firstName,
      lastName: user.lastName,
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
exports.userProfile2 = async (req, res, next) => {

  const user = await User.findById(req.user.id)
  .sort({ createdAt: -1 })
      .select("-password")
      .populate({
        path: "plan",
        populate: {
          path: "planService",
          model: "PlanServices",
        },
      })
      .populate({
        path: "manager",
        select: "firstName lastName email",
        populate: {
          path: "lineManager",
          model: "User",
          select: "firstName lastName email",
        },
      })
      .populate({
        path: "user",
        select: "firstName lastName email",
      }).populate("myMembers")
      .populate("myMembers")
      .populate({
        path: "accountOwner",
        populate: {
          path: "manager",
          select: "firstName lastName email",
        }
      }).populate("manager")
      .populate({
        path: "user",
        select: "firstName lastName email",
      })

  res.status(200).json({
    success: true,
    user,
  });
};


exports.userProfile3 = async (req, res, next) => {
  
  const pageSize =  12; // Since it's for a single profile, pageSize doesn't matter
  const page = Number(req.query.pageNumber) || 1;
  const searchTerm = req.query.searchTerm;

  // Validate pageSize and pageNumber
  if (pageSize <= 0) {
    return res.status(400).json({ success: false, error: "Invalid pageSize. Must be greater than 0" });
  }

  if (page <= 0) {
    return res.status(400).json({ success: false, error: "Invalid pageNumber. Must be greater than 0" });
  }
  let query = {};
  try {
  if (searchTerm) {
    query = {
      $and: [
        { $or: [
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

    const user = await User.findOne(query)
    .sort({ createdAt: -1 })
      .select("-password")
      .populate({
        path: "plan",
        populate: {
          path: "planService",
          model: "PlanServices",
        },
      })
      .populate({
        path: "manager",
        select: "firstName lastName email",
        populate: {
          path: "lineManager",
          model: "User",
          select: "firstName lastName email",
        },
      })
      .populate({
        path: "user",
        select: "firstName lastName email",
      })
      .populate("myMembers")
      .populate({
        path: "accountOwner",
        populate: {
          path: "manager",
          select: "firstName lastName email",
        },
      })
      .populate("manager")
      .populate({
        path: "user",
        select: "firstName lastName email",
      })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.status(200).json({
      success: true,
      user,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  
  } catch (error) {
    return next(error);
  }
};

//user profile
exports.userProfile = async (req, res, next) => {
  // console.log("Received headers:", req.headers);
  const user = await User.findById(req.user.id)
  .sort({ createdAt: -1 })
      .select("-password")
      .populate({
        path: "plan",
        populate: {
          path: "planService",
          model: "PlanServices",
        },
      })
      .populate({
        path: "manager",
        select: "firstName lastName email",
        populate: {
          path: "lineManager",
          model: "User",
          select: "firstName lastName email",
        },
      })
      .populate({
        path: "user",
        select: "firstName lastName email",
      }).populate("myMembers")
      .populate("myMembers")
      .populate({
        path: "accountOwner",
        populate: {
          path: "manager",
          select: "firstName lastName email _id",
          populate: {
            path: "lineManager",
            select: "firstName lastName email _id", // You can select the fields you need
          }
        }
      })      
      .populate({
        path: "user",
        select: "firstName lastName email",
      })

  res.status(200).json({
    success: true,
    user,
  });
};


// Initiate password reset
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      // Generate reset token and expiry time
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();

      // Send password reset email
      const resetURL = `http://localhost:8080/reset/${resetToken}`;
      const mailOptions = {
          from: 'test@clubedepetroleo.co.mz', // Update with your email
          to: 'marcohama32@hotmail.com',
          subject: 'Password Reset',
          text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetURL} \n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      // Create a transporter object using SMTP
      const transporter = nodemailer.createTransport({
          host: 'mail.fra2.palosrv.com', // Hostname of the SMTP server
          port: 587, // Port for sending emails (587 for TLS)
          secure: false, // Set to true if you are using port 465 (secure)
          auth: {
              user: 'test@clubedepetroleo.co.mz', // Your email address
              pass: 'cE^egrq4ETB1', // Your email password
          },
      });

      // Send the email
      await transporter.sendMail(mailOptions);

      res.json({ message: 'Password reset email sent.' });
  } catch (error) {
    if (error.name === 'Operation `users.findOne()` buffering timed out after 10000ms') {
      return res.status(500).json({ message: 'The operation timed out. Please try again later.' });
    }
      next(error);
  }
};
// Reset password
exports.resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
          return res.status(400).json({ message: 'Invalid or expired token.' });
      }

      // Update user's password and clear reset token fields
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successful.' });
  } catch (error) {
      next(error);
  }
};