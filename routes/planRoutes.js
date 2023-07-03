const express = require("express");
const router = express.Router();
const { createPlan, singlePlan,getAllPlan, updatePlan, deletePlan } = require("../controllers/planController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get("/allplans", getAllPlan);
router.put("/plan/update/:plan_id",isAuthenticated, isAdmin, updatePlan); 
router.get("/plan/:id", isAuthenticated, singlePlan);
router.delete("/plan/delete/:id", isAuthenticated, isAdmin, deletePlan);
router.post("/plan/create", isAuthenticated, isAdmin, createPlan);

module.exports = router;
