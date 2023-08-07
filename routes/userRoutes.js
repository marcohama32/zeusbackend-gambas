const express = require("express");
const router = express.Router();
const {
  allUsers,
  allCustomersUsers,
  singleUser,
  editUser,
  deleteUser,
  createUserJobsHistory,
  desactiveUser,
  UserByMembershipID
} = require("../controllers/userController");
const { isAuthenticated, isAdmin, isPartner } = require("../middleware/auth");
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
  getAllActiveAgents,
  getAllActiveManagers,
  getAllActiveAdmins,
} = require("../controllers/users/employerController");
const {
  createCorporateDependent,
  updateCorporateDependent,
  createIndividualDependent,
  updateInvidividualDependent
} = require("../controllers/users/customerDependentsController");
const {
  createPartnerUser,
  getAllPartnerUsers,
  singlePartnerUser,
  updatedPartnerUser,
  getUsersByPartner,
} = require("../controllers/partnerController");
const {
  createAgentUser,
  editAgentUser,
  getAllAgentUser,
  updatedAgent,
} = require("../controllers/users/agentEmployerController");
const {
  createAdminUser,
  updatedAdmin,
  getAllAdminUser,
} = require("../controllers/users/adminEmployerController");
const {
  createManagerUser,
  updatedManager,
} = require("../controllers/users/managerEmployerController");
const {
  createCorporatelUser,
  editCorporatelUser,
  getAllCorporateCustomer,
} = require("../controllers/users/corporateController");

//@auth routes
// api/route
router.get("/allcompanyuser/:id", getThisCompanyUsers);
router.get("/allusers", isAuthenticated, allUsers);
router.get("/allcustomers", isAuthenticated, allCustomersUsers);
router.put("/user/edit/:id", upload.single("avatar"), editUser);
router.put("/user/inactive/:id", isAuthenticated, desactiveUser);
router.get("/user/:id", isAuthenticated,isPartner, singleUser);
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

/////////////////////////////// Corporate customers //////////////////////////////////
router.post(
  "/user/corporate/:company",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createCorporatelUser
);
router.put(
  "/user/corporate/edit/:company",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  editCorporatelUser
);
router.get(
  "/user/corporate/allcorporateuser",
  isAuthenticated,
  getAllCorporateCustomer
);

/////////////////////////////////////// manager User Routes //////////////////////////////
router.post(
  "/user/employer",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createEmployerUser
);

router.get("/user/employer/get", isAuthenticated, getAllEmployer);

//?///////////////////Get all agent//////////////////////////////
router.get(
  "/user/employer/agent/active/get",
  isAuthenticated,
  getAllActiveAgents
);
//?///////////////////Get all agent//////////////////////////////
router.get(
  "/user/employer/manager/active/get",
  isAuthenticated,
  getAllActiveManagers
);
//?///////////////////Get all agent//////////////////////////////
router.get(
  "/user/employer/admin/active/get",
  isAuthenticated,
  getAllActiveAdmins
);

router.put(
  "/user/agent/update//:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  editEmployer
);

///////////////////////////////////////// dependentes //////////////////////////////
//  corporate
router.post(
  "/user/dependent/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createCorporateDependent
);

router.put(
  "/user/corporatedependent/update/:id",
  upload.single("avatar"),
  isAuthenticated,
  updateCorporateDependent
);

//  individual

router.post(
  "/user/individualdependent/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createIndividualDependent
);

router.put(
  "/user/individualdependent/update/:id",
  upload.single("avatar"),
  isAuthenticated,
  updateInvidividualDependent
);

////////////////////////////////// create partner user ////////////////////////////////////
router.post(
  "/user/corporatedependent/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createPartnerUser
);

//////////////////////////////// partner /////////////////////////////////////////
router.get("/user/partneruser/get", isAuthenticated, getAllPartnerUsers);
router.get(
  "/user/partneruser/:id",
  isAuthenticated,
  isAdmin,
  singlePartnerUser
);
router.get(
  "/user/usersbypartner/:id",
  isAuthenticated,
  isAdmin,
  getUsersByPartner
);
router.put(
  "/user/partneruser/update/:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  updatedPartnerUser
);

////////////////////////////////// create agent user ////////////////////////////////////
router.post(
  "/user/agent/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createAgentUser
);

router.get("/user/agent/get", isAuthenticated, getAllAgentUser);
router.put(
  "/user/agent/update/:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  updatedAgent
);

/////////////////////////////// Admin //////////////////////////////////

router.post(
  "/user/admin/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createAdminUser
);

router.get("/user/admin/get", isAuthenticated, getAllActiveAdmins);
router.put(
  "/user/admin/update/:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  updatedAdmin
);

/////////////////////////////// Manager //////////////////////////////////

router.post(
  "/user/manager/create",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  createManagerUser
);

router.put(
  "/user/manager/update/:id",
  upload.single("avatar"),
  isAuthenticated,
  isAdmin,
  updatedManager
);

//get user by memberShip ID
router.get("/membershipid",isAuthenticated, UserByMembershipID);


module.exports = router;
