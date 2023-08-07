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
  editTransaction1,
  uploadTransactionMultipleFiles
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
router.put("/revoke/:transactionId", isAuthenticated, revokeTransaction);
router.put("/aprove/:transactionId", isAuthenticated, approveTransaction);
router.get(
  "/ctransation/get/:customerId",
  isAuthenticated,
  getTransactionsByCustomerId
);
router.get(
  "/ctransation/get/transaction/:id",
  isAuthenticated,
  getTransactionById
);

router.get(
    "/get/mytransaction",
    isAuthenticated,
    getMyTransactions
  );
  

  router.delete("/transaction/file/delete", isAuthenticated, deleteFile);

  router.put(
    "/transaction/uploadmultiplefiles/:id",
    upload.array("multipleFiles[]"),
    isAuthenticated,
    uploadTransactionMultipleFiles
  );


  router.put("/update/transaction/:transactionId", isAuthenticated, editTransaction1);

module.exports = router;
