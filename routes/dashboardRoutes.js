const express = require("express");
const router = express.Router();
const {
    dashboardData,
    TransactionsTotals,
    calculateAverageApprovalTime
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

router.get(
  "/total/transactionsbystatus",
  isAuthenticated,
  isAdmin,
  TransactionsTotals
);

router.get(
  "/get/averageapprovaltime",
  isAuthenticated,
  isAdmin,
  calculateAverageApprovalTime
);
module.exports = router;
