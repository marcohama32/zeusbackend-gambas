const express = require("express");
const router = express.Router();
const { createPlan, singlePlan,getAllPlan, updatePlan, deletePlan, createService } = require("../controllers/planController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//@auth routes
// api/route
router.get("/allplans", getAllPlan);
router.put("/plan/update/:plan_id",isAuthenticated, isAdmin, updatePlan); 
router.get("/plan/:id", singlePlan);
router.delete("/plan/delete/:id", isAuthenticated, isAdmin, deletePlan);
router.post("/plan/create", isAuthenticated, isAdmin, createPlan);

router.post("/plan/service/create", isAuthenticated, isAdmin, createService);
module.exports = router;
