const express = require("express");
const router = express.Router();
const { createCTransations, singleTransaction,getAllCompany, updatedCompany, deleteCompany } = require("../controllers/customertransactionController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get("/allcompany", getAllCompany);
router.put("/company/update/:id",isAuthenticated, isAdmin, updatedCompany); 
router.get("/ctransation/:transaction_id", isAuthenticated, singleTransaction);
router.delete("/company/delete/:id", isAuthenticated, isAdmin, deleteCompany);
router.post("/ctransation/create", isAuthenticated, isAdmin, createCTransations);

module.exports = router;
