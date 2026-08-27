const express = require("express");
const router = express.Router();

// Import sub-routers
const userRoutes = require("./user");
const companyRoutes = require("./company");

// Main routes entry - all sub-routers are mounted here
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);

module.exports = router;
