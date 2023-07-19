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
const { getThisCompanyUsers } = require("../controllers/companyController");
const {
  createIndividualUser,
  editIndividualUser,
  getAllIndividualCustomer,
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile
} = require("../controllers/users/individualcustomerController");
const upload = require('../middleware/upload')

//@auth routes
// api/route
router.get("/allcompanyuser/:id", getThisCompanyUsers);
router.get("/allusers", allUsers);
router.put("/user/edit/:id", editUser);
router.get("/user/:id", isAuthenticated, isAdmin, singleUser);
router.delete("/admin/user/delete/:id", isAuthenticated, isAdmin, deleteUser);
router.post(
  "/user/jobhistory",
  isAuthenticated,
  isAdmin,
  createUserJobsHistory,
  
);
module.exports = router;

/////////////////////////Individual Users Routes//////////////////////////
router.post("/user/invididual",upload.single('avatar'), isAuthenticated, isAdmin, createIndividualUser);
router.put(
  "/user/invididual/edit/:id",
  isAuthenticated,
  isAdmin,
  editIndividualUser
);
router.get(
  "/user/invididual/allindividualuser",
  isAuthenticated,
  getAllIndividualCustomer
);


// Example route using to upload sigle page
router.put('/user/uploadfile/:id', upload.single('avatar'), isAuthenticated, isAdmin, uploadSingleFile);

// Example route using the upload.array() middleware
router.put('/user/uploadmultiplefiles/:id', upload.array('multipleFiles[]'), isAuthenticated, isAdmin, uploadMultipleFiles);
router.delete("/admin/file/delete", isAuthenticated, isAdmin, deleteFile);