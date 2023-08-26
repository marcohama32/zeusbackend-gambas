const express = require("express");
const router = express.Router();
const {
    dashboardData
} = require("../controllers/DashboardController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get(
  "/dashboard/getdata",
  isAuthenticated,
  isAdmin,
  dashboardData
);

module.exports = router;
