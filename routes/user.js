const express = require("express");
const router = express.Router();

// Import controllers
const { getUser, createUser, signIn } = require("../controllers/user");

// User routes
router.get("/", getUser);
router.post("/", createUser);
router.post("/signin", signIn);

module.exports = router;
