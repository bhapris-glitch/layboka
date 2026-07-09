// layboka/apps/api/src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

/**
 * Default API Limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

/**
 * Authentication Limiter
 * Prevents brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes."
  }
});

/**
 * AI Chat Limiter
 * Protects OpenAI usage.
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Chat rate limit exceeded."
  }
});

/**
 * Shopify Webhook Limiter
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Contact / Enterprise Form
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later."
  }
});

/**
 * Password Reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests."
  }
});

/**
 * Email Verification
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Stripe Webhook
 */
export const stripeWebhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Admin API
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Admin API rate limit exceeded."
  }
});

export default apiLimiter;
