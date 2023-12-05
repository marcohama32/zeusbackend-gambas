const express = require("express");
const router = express.Router();
const { createJob, singleJob,getAllJob, updateJob } = require("../controllers/jobsController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get("/alljobs", getAllJob);
router.put("/job/update/:job_id",isAuthenticated, isAdmin, updateJob); 
router.get("/job/:id", isAuthenticated, singleJob);
// router.delete("/admin/user/delete/:id", isAuthenticated, isAdmin, deleteUser);

router.post("/job/create", isAuthenticated, isAdmin, createJob);

module.exports = router;
