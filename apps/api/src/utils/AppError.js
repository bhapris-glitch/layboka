/**
 * ==========================================================
 * Layboka SaaS
 * Custom Application Error Class
 * ==========================================================
 */

class AppError extends Error {
  /**
   * @param {string} message Error message
   * @param {number} statusCode HTTP status code
   * @param {Object} options Additional error details
   */
  constructor(message, statusCode = 500, options = {}) {
    super(message);

    this.name = "AppError";

    this.statusCode = statusCode;

    this.status =
      String(statusCode).startsWith("4") ? "fail" : "error";

    this.isOperational = true;

    this.code = options.code || null;

    this.details = options.details || null;

    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error into API response
   */
  toJSON() {
    return {
      success: false,
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    };
  }

  /**
   * Common HTTP Errors
   */

  static badRequest(message = "Bad Request", details = null) {
    return new AppError(message, 400, { details });
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource Not Found") {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409);
  }

  static validation(message = "Validation Failed", details = null) {
    return new AppError(message, 422, { details });
  }

  static tooManyRequests(message = "Too Many Requests") {
    return new AppError(message, 429);
  }

  static internal(message = "Internal Server Error") {
    return new AppError(message, 500);
  }

  static serviceUnavailable(message = "Service Unavailable") {
    return new AppError(message, 503);
  }
}

export default AppError;
