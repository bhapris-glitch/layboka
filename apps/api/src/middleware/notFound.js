/**
 * -------------------------------------------------------
 * Layboka
 * Global 404 Middleware
 * -------------------------------------------------------
 * Handles all requests that don't match any route.
 * This middleware should always be registered
 * AFTER all application routes.
 * -------------------------------------------------------
 */

const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;
  error.status = "fail";
  error.isOperational = true;

  next(error);
};

export default notFound;
