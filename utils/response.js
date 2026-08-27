// Utility helpers for consistent API responses

// Success response helper
const successResponse = (res, data = {}, message = "Success", status = 200) => {
  return res.status(status).json({
    status: "success",
    message,
    data,
  });
};

// Error response helper
const errorResponse = (res, message = "Error", status = 400, errors = null) => {
  const body = {
    status: "error",
    message,
  };
  if (errors) {
    body.errors = errors;
  }
  return res.status(status).json(body);
};

module.exports = {
  successResponse,
  errorResponse,
};
