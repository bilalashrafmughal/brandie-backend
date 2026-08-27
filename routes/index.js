const express = require("express");
const router = express.Router();

// Import sub-routers
const userRoutes = require("./user");

// Main routes entry - all sub-routers are mounted here
router.use("/users", userRoutes);

module.exports = router;
