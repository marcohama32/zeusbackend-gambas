const express = require("express");
const router = express.Router();
const {
  allUsers,
  singleUser,
  editUser,
  deleteUser,
  createUserJobsHistory,
} = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get("/allusers", isAuthenticated, allUsers);
router.put("/user/edit/:id", editUser);
router.get("/user/:id", isAuthenticated, isAdmin, singleUser);
router.delete("/admin/user/delete/:id", isAuthenticated, isAdmin, deleteUser);
router.post(
  "/user/jobhistory",
  isAuthenticated,
  isAdmin,
  createUserJobsHistory
);
module.exports = router;
