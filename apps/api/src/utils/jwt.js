import jwt from "jsonwebtoken";

/**
 * JWT Configuration
 */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}

/**
 * Generate Access Token
 * @param {Object} payload
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "Layboka",
    audience: "Layboka-Users"
  });
};

/**
 * Verify Access Token
 * @param {string} token
 * @returns {Object}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: "Layboka",
    audience: "Layboka-Users"
  });
};

/**
 * Decode JWT without verification.
 * Useful for debugging only.
 * Do not use for authentication or authorization.
 *
 * @param {string} token
 * @returns {Object|null}
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Extract Bearer token from Authorization header.
 *
 * @param {string} authorizationHeader
 * @returns {string|null}
 */
export const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;

  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};

/**
 * Generate Email Verification Token
 */
export const generateEmailVerificationToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      type: "email_verification"
    },
    JWT_SECRET,
    {
      expiresIn: "24h",
      issuer: "Layboka",
      audience: "Layboka-Users"
    }
  );
};

/**
 * Generate Password Reset Token
 */
export const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      type: "password_reset"
    },
    JWT_SECRET,
    {
      expiresIn: "30m",
      issuer: "Layboka",
      audience: "Layboka-Users"
    }
  );
};

/**
 * Verify Email Verification Token
 */
export const verifyEmailVerificationToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: "Layboka",
    audience: "Layboka-Users"
  });
};

/**
 * Verify Password Reset Token
 */
export const verifyPasswordResetToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: "Layboka",
    audience: "Layboka-Users"
  });
};

export default {
  generateAccessToken,
  verifyAccessToken,
  decodeToken,
  extractBearerToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken
};
