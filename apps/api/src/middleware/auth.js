// layboka/apps/api/src/middleware/auth.js
import User from "../models/User.js";
import {
  extractBearerToken,
  verifyAccessToken
} from "../utils/jwt.js";

/**
 * Merchant Authentication
 * Protects Dashboard APIs
 */
export const protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been disabled."
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

/**
 * Optional Authentication
 * Continues even if user is not logged in.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Role Authorization
 *
 * Example:
 * router.get("/admin",
 * protect,
 * authorize("admin"),
 * controller);
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied."
      });
    }

    next();
  };
};

/**
 * Merchant Ownership Check
 * Used for dashboard/store APIs.
 */
export const requireStoreOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required."
    });
  }

  if (
    req.user.role !== "merchant" &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Merchant access required."
    });
  }

  next();
};

export default {
  protect,
  optionalAuth,
  authorize,
  requireStoreOwner
};
