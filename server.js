const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import main router
const routes = require("./routes");

// Initialize express app
const app = express();

// ============ Global Middleware ============
// Enable CORS for cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder (images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// ============ Routes ============
// Mount all API routes under /api
app.use("/api", routes);

// Simple health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Brandie Admin API is running",
  });
});

// ============ 404 Handler ============
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ============ Error Handler ============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// ============ Start Server ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
