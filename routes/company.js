const express = require("express");
const router = express.Router();

// Import middlewares
const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");

// Import controllers
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  uploadLogo,
} = require("../controllers/company");

// Public routes
router.get("/", getCompanies);
router.get("/:slug", getCompany);

// Protected routes
router.post("/", authenticate, createCompany);
router.patch("/:id", authenticate, updateCompany);
router.post("/:id/logo", authenticate, upload.single("logo"), uploadLogo);

module.exports = router;
