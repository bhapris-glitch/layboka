// layboka/apps/api/src/middleware/errorHandler.js
import AppError from "../utils/AppError.js";

/**
 * Global Error Handler
 * ------------------------------------------------------------
 * Handles all application errors in one place.
 * This middleware should be the LAST middleware registered
 * in app.js.
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  /*
   |--------------------------------------------------------------------------
   | Log Error
   |--------------------------------------------------------------------------
   */

  console.error("======================================");
  console.error("❌ Global Error Handler");
  console.error("URL:", req.originalUrl);
  console.error("METHOD:", req.method);
  console.error("MESSAGE:", err.message);
  console.error("STACK:", err.stack);
  console.error("======================================");

  /*
   |--------------------------------------------------------------------------
   | Invalid MongoDB ObjectId
   |--------------------------------------------------------------------------
   */

  if (err.name === "CastError") {
    error = new AppError("Resource not found.", 404);
  }

  /*
   |--------------------------------------------------------------------------
   | Duplicate MongoDB Key
   |--------------------------------------------------------------------------
   */

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    error = new AppError(
      `${field} already exists.`,
      409
    );
  }

  /*
   |--------------------------------------------------------------------------
   | Mongoose Validation Error
   |--------------------------------------------------------------------------
   */

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");

    error = new AppError(message, 400);
  }

  /*
   |--------------------------------------------------------------------------
   | JWT Errors
   |--------------------------------------------------------------------------
   */

  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token.", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Authentication token has expired.", 401);
  }

  /*
   |--------------------------------------------------------------------------
   | Stripe Errors
   |--------------------------------------------------------------------------
   */

  if (err.type?.startsWith("Stripe")) {
    error = new AppError(err.message, 400);
  }

  /*
   |--------------------------------------------------------------------------
   | Shopify Errors
   |--------------------------------------------------------------------------
   */

  if (
    err.name === "ShopifyError" ||
    err.name === "HttpResponseError"
  ) {
    error = new AppError(
      "Shopify request failed.",
      400
    );
  }

  /*
   |--------------------------------------------------------------------------
   | OpenAI Errors
   |--------------------------------------------------------------------------
   */

  if (err.status === 429) {
    error = new AppError(
      "AI service is currently busy. Please try again shortly.",
      429
    );
  }

  /*
   |--------------------------------------------------------------------------
   | Default Response
   |--------------------------------------------------------------------------
   */

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message:
      error.message ||
      "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack
    })
  });
};

export default errorHandler;
