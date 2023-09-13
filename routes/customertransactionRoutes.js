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
  getTransactionsHistory,
  getLogedCustomerTransactions,
  createTransactionFarmacy,
  createTransactionHospital,
  getTransactionsFromCompany,
  cancelTransaction,
  generateInvoicePDF,
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
// create farmacy transaction
router.post(
  "/farmacytrasaction/create",
  upload.array("multipleFiles[]"),
  isAuthenticated,
  isPartner,
  createTransactionFarmacy
);
// create hospital transaction
router.post(
  "/hospitaltrasaction/create",
  upload.array("multipleFiles[]"),
  isAuthenticated,
  isPartner,
  createTransactionHospital
);
router.put("/revoke/transaction/:transactionId", isAuthenticated, revokeTransaction);
router.put("/cancel/transaction/:transactionId", isAuthenticated, cancelTransaction);
router.put("/aprove/transaction/:transactionId", isAuthenticated, approveTransaction);
router.get(
  "/ctransation/get/:customerId",
  isAuthenticated,
  getTransactionsByCustomerId
);
//get transaction from a company
router.get(
  "/companytransactions/get/:id",
  isAuthenticated,
  getTransactionsFromCompany
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
//All transactions from a especific user partner [loged partner]
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
//All transactions from a especific partner [loged partner] 
router.get(
  `/allcompanytransactions`,
  isAuthenticated,
  getTransactionsByPartnerUser
);
router.get(
  `/gettransactionshistory/:id`,
  isAuthenticated,
  getTransactionsHistory
);
router.get(
  "/get/logedusertransaction",
  isAuthenticated,
  getLogedCustomerTransactions
);
router.get(
  "/get/customerinvoice/:transactionID",
  // isAuthenticated,
  generateInvoicePDF
);



module.exports = router;
