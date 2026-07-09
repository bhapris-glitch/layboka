/**
 * ============================================================
 * Layboka - Async Error Handler
 * ============================================================
 * Wraps async Express route handlers and automatically forwards
 * any rejected promise or thrown error to the global error
 * handling middleware.
 *
 * Usage:
 *
 * router.get(
 *   "/profile",
 *   catchAsync(async (req, res) => {
 *     const user = await User.findById(req.user.id);
 *
 *     res.status(200).json({
 *       success: true,
 *       data: user
 *     });
 *   })
 * );
 * ============================================================
 */

const catchAsync = (handler) => {
  if (typeof handler !== "function") {
    throw new TypeError("catchAsync expects a function.");
  }

  return async (req, res, next) => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };
};

export default catchAsync;
