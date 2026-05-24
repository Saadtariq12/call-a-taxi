import { APIError } from "../utils/APIerror.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
