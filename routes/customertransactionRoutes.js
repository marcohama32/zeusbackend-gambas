const express = require("express");
const router = express.Router();
const {
  createTransaction,
  revokeTransaction,
  getTransactionsByCustomerId,
  getTransactionById,
  approveTransaction,
  getMyTransactions,
  deleteFile,
  editTransaction,
  uploadTransactionMultipleFiles,
  getAllTransactions,
  getTransactionsByPartnerUser,
  getLogedCustomerTransactions,
} = require("../controllers/customertransactionController");
const { isAuthenticated, isAdmin, isPartner } = require("../middleware/auth");
const {
  uploadSingleFile,
  uploadMultipleFiles,
} = require("../controllers/users/individualcustomerController");
const upload = require("../middleware/upload");

//@auth routes
// api/route
// then change to isPartner
router.post(
  "/ctransation/create",
  upload.array("multipleFiles[]"),
  isAuthenticated,
  isPartner,
  createTransaction
);
router.put("/revoke/transaction/:transactionId", isAuthenticated, revokeTransaction);
router.put("/aprove/transaction/:transactionId", isAuthenticated, approveTransaction);
router.get(
  "/ctransation/get/:customerId",
  isAuthenticated,
  getTransactionsByCustomerId
);
router.get(
  "/ctransation/getall",
  isAuthenticated,
  isAdmin,
  getAllTransactions
);
router.get(
  "/ctransation/get/transaction/:id",
  isAuthenticated,
  getTransactionById
);

router.get("/get/mytransaction", isAuthenticated, getMyTransactions);

router.delete("/transaction/file/delete", isAuthenticated, deleteFile);

router.put(
  "/transaction/uploadmultiplefiles/:id",
  upload.array("multipleFiles[]"),
  isAuthenticated,
  uploadTransactionMultipleFiles
);

router.put(
  "/update/transaction/:transactionId",
  isAuthenticated,
  editTransaction
);

router.get(
  `/allcompanytransactions`,
  isAuthenticated,
  getTransactionsByPartnerUser
);

router.get(
  "/get/logedusertransaction",
  isAuthenticated,
  getLogedCustomerTransactions
);

module.exports = router;
