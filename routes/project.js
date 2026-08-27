const express = require("express");
const router = express.Router();

// Import middlewares
const authenticate = require("../middlewares/authenticate");
const uploadProject = require("../middlewares/uploadProject");

// Import controllers
const {
  getProjects,
  getProject,
  quickCreateProject,
  updateProject,
  updateProjectFlags,
  uploadMainImage,
  uploadProjectImages,
} = require("../controllers/project");

// Public routes
router.get("/", getProjects);
router.get("/:slug", getProject);

// Protected routes
router.post("/quick", authenticate, quickCreateProject);
router.patch("/:id", authenticate, updateProject);
router.patch("/:id/flags", authenticate, updateProjectFlags);
router.post(
  "/:id/main-image",
  authenticate,
  uploadProject.single("image"),
  uploadMainImage,
);
router.post(
  "/:id/images",
  authenticate,
  uploadProject.array("images", 20),
  uploadProjectImages,
);

module.exports = router;
