const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  logout,
  userProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  isAuthenticated,
  isAdmin,
  isTokenValid,
} = require("../middleware/auth");

//@auth routes
// api/route
router.post("/signup", signup);
// router.post("/signup",isAuthenticated, isAdmin, signup);
router.post("/signin", signin);
router.get("/logout", logout);
router.get("/me", isAuthenticated, userProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check/verify-token/", isTokenValid);

module.exports = router;
