const express = require("express");
const router = express.Router();
const {
  createCustomerRequest,
  updateCustomerRequest,
  findCustomerRequestById,
  getAllCustomerRequests,
  getCustomerRequestsByUser,
  status,
} = require("../controllers/customerrequestController");
const { isAuthenticated, isAdmin, isPartner } = require("../middleware/auth");

const upload = require("../middleware/upload");

//@auth routes
// api/route
router.post(
  "/request/createnew",
  upload.single("files"),
//   isAuthenticated,
  createCustomerRequest
);

router.put(
  "/request/update/:id",
  upload.single("files"),
  isAuthenticated,
  updateCustomerRequest
);

router.get("/request/get/:id", isAuthenticated, findCustomerRequestById);

router.get("/request/getall", isAuthenticated, getAllCustomerRequests);

router.get(
  "/request/get/logeduser",
  isAuthenticated,
  getCustomerRequestsByUser
);

router.put("/status/:id", isAuthenticated, status);

module.exports = router;
