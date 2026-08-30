const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base folder where project images are stored
const projectImagesBase = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "projects",
);

// Resolve the destination folder for a request based on the project id
const getProjectDir = (req) => {
  const projectId = req.params.id;
  if (!projectId) {
    throw new Error("Project id is required for upload");
  }
  return path.join(projectImagesBase, projectId);
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save into a dedicated folder named by the project id
    const dir = getProjectDir(req);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  },
});

// File filter - allow common image formats including GIF
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed (jpg, jpeg, png, gif, webp)"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;
