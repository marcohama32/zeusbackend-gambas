const express = require('express')
const router = express.Router()
const { signup, signin, logout, userProfile} = require("../controllers/authController");
const { isAuthenticated, isAdmin } = require('../middleware/auth');


//@auth routes
// api/route
router.post("/signup", signup);
// router.post("/signup",isAuthenticated, isAdmin, signup);
router.post("/signin", signin);
router.get("/logout", logout);
router.get("/me", isAuthenticated, userProfile);

module.exports = router