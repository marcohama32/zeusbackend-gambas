const express = require("express");
const router = express.Router();
const { createCompany, singleCompany,getAllCompany, updatedCompany, deleteCompany } = require("../controllers/companyController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get("/allcompany", getAllCompany);
router.put("/company/update/:id",isAuthenticated, isAdmin, updatedCompany); 
router.get("/company/:company_id", isAuthenticated, singleCompany);
router.delete("/company/delete/:id", isAuthenticated, isAdmin, deleteCompany);
router.post("/company/create", isAuthenticated, isAdmin, createCompany);

module.exports = router;
