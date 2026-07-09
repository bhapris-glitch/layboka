import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

const requiredEnv = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_APP_URL",
  "SHOPIFY_SCOPES"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,

  scopes: process.env.SHOPIFY_SCOPES
    .split(",")
    .map(scope => scope.trim()),

  hostName: process.env.SHOPIFY_APP_URL
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, ""),

  apiVersion: LATEST_API_VERSION,

  isEmbeddedApp: false
});

export default shopify;

/**
 * Generate Shopify OAuth URL
 */
export const getAuthUrl = async (shop) => {
  return await shopify.auth.begin({
    shop,
    callbackPath: "/api/v1/shopify/callback",
    isOnline: false
  });
};

/**
 * Validate Shopify Store Domain
 */
export const validateShopDomain = (shop) => {
  if (!shop || typeof shop !== "string") {
    return false;
  }

  const value = shop.trim().toLowerCase();

  // Shopify domain
  const shopifyRegex =
    /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

  // Custom domain
  const customRegex =
    /^([a-z0-9-]+\.)+[a-z]{2,}$/;

  return (
    shopifyRegex.test(value) ||
    customRegex.test(value)
  );
};

/**
 * Normalize Domain
 */
export const normalizeShopDomain = (shop) => {
  if (!shop) return "";

  return shop
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
};
