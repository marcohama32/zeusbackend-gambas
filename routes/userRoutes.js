const express = require("express");
const router = express.Router();
const {
  allUsers,
  singleUser,
  editUser,
  deleteUser,
  createUserJobsHistory,
  desactiveUser
} = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { getThisCompanyUsers } = require("../controllers/companyController");
const {
  createIndividualUser,
  editIndividualUser,
  getAllIndividualCustomer,
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
} = require("../controllers/users/individualcustomerController");
const upload = require("../middleware/upload");
const {
  createEmployerUser,
  getAllEmployer,
  editEmployer,
  getAllActiveEmployer
} = require("../controllers/users/employerController");
const {createCustomerDependent} = require("../controllers/users/customerDependentsController")
const {createPartnerUser, getAllPartnerUsers, singlePartnerUser, updatedPartnerUser, getUsersByPartner} = require("../controllers/partnerController")

//@auth routes
// api/route
router.get("/allcompanyuser/:id", getThisCompanyUsers);
router.get("/allusers", allUsers);
router.put("/user/edit/:id", upload.single("avatar"), editUser);
router.put("/user/inactive/:id", isAuthenticated, desactiveUser);
router.get("/user/:id", isAuthenticated, isAdmin, singleUser);
router.delete("/admin/user/delete/:id", isAuthenticated, isAdmin, deleteUser);
router.post(
  "/user/jobhistory",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createUserJobsHistory
);


/////////////////////////Individual Users Routes//////////////////////////
router.post(
  "/user/invididual",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createIndividualUser
);
router.put(
  "/user/invididual/edit/:id",
  upload.single("avatar"),
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
router.put(
  "/user/uploadfile/:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  uploadSingleFile
);

// Example route using the upload.array() middleware
router.put(
  "/user/uploadmultiplefiles/:id",
  upload.array("multipleFiles[]"),
  isAuthenticated,
  isAdmin,
  uploadMultipleFiles
);
router.delete("/admin/file/delete", isAuthenticated, isAdmin, deleteFile);

/////////////////////////////////////// manager User Routes //////////////////////////////
router.post(
  "/user/employer",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createEmployerUser
);

router.get("/user/employer/get",isAuthenticated, getAllEmployer);
router.get("/user/employer/active/get",isAuthenticated, getAllActiveEmployer);
router.put(
  "/user/employer/edit/:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  editEmployer
);


///////////////////////////////////////// dependentes //////////////////////////////
router.post(
  "/user/dependent/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createCustomerDependent
);

////////////////////////////////// create partner user ////////////////////////////////////
router.post(
  "/user/partneruser/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createPartnerUser
);

router.get("/user/partneruser/get",isAuthenticated, getAllPartnerUsers)
router.get("/user/partneruser/:id", isAuthenticated, isAdmin, singlePartnerUser);
router.get("/user/usersbypartner/:id", isAuthenticated, isAdmin, getUsersByPartner);
router.put(
  "/user/partneruser/update/:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  updatedPartnerUser
);



module.exports = router;