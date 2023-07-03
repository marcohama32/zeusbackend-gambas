const express = require("express");
const router = express.Router();
const {
  createJobType,
  getAllJobType,
  updateJobType,
  deleteJobType
} = require("../controllers/jobTypeController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get("/alltypes", getAllJobType);
router.put("/type/edit/:type_id",isAuthenticated, isAdmin, updateJobType);
// router.get("/user/:id", isAuthenticated, isAdmin, singleUser);
router.delete("/type/delete/:type_id", isAuthenticated, isAdmin, deleteJobType);

router.post("/type/create", isAuthenticated, createJobType);

module.exports = router;
