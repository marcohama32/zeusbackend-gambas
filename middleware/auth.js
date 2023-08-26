const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  const token = req.headers.token;

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized: Token not provided", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    // Check if the user exists
    if (!req.user) {
      return next(new ErrorResponse("Not authorized: Invalid token", 401));
    }

    // Check if the token has expired
    if (decoded.exp < Date.now() / 1000) {
      return next(new ErrorResponse("Not authorized: Token expired", 401));
    }

    next();
  } catch (error) {
    // Clear any stored token or session information
    // For example, you can clear the token from cookies or local storage

    return next(new ErrorResponse("Not authorized: Invalid token", 401));
  }
};

// Middleware for admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 1) {
    return next(new ErrorResponse("Access denied: You must be an admin", 401));
  }
  next();
};

exports.isPartner = (req, res, next) => {
  if (req.user.role !== 6 && req.user.role !== 1) {
    return next(new ErrorResponse("Access denied: You dont have access", 401));
  }
  next();
};


exports.isTokenValid = async (req, res, next) => {
  try {
    const token = req.headers.token;

    // Check if token exists
    if (!token) {
      throw new Error("Token not provided");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve user from the database
    const user = await User.findById(decoded.id);

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the token has expired
    const resetPasswordExpiresMilliseconds = new Date(user.resetPasswordExpires).getTime();
    const currentTimeMilliseconds = Date.now() / 1000;
    
    if (resetPasswordExpiresMilliseconds < currentTimeMilliseconds) {

      throw new Error("Reset token expired");
      // You can handle the token expiration here
    }

    // Attach the user to the request object for later use
    req.user = user;

    // console.log("User: ", req.user);

    // If all checks pass, move on to the next middleware
    // next();
    if(req.user){
      return res.status(200).json({ success: true, message: "token is valid" });
    }
  } catch (error) {
    // Handle errors in a centralized error handler or middleware
    // You can send a more descriptive error message if needed
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};
