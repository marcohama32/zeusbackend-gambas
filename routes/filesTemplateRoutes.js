const express = require("express");
const router = express.Router();
const { createFileTemplate} = require("../controllers/filesTemplateController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

//@auth routes
// api/route
// router.get("/alljobs", getAllJob);
// router.put("/job/update/:job_id",isAuthenticated, isAdmin, updateJob); 
// router.get("/job/:id", isAuthenticated, singleJob);
// router.delete("/admin/user/delete/:id", isAuthenticated, isAdmin, deleteUser);

router.post("/filestemplate/create",upload.single("fileTemplate"), isAuthenticated, isAdmin, createFileTemplate);

module.exports = router;
