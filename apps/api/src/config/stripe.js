import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is missing.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
  appInfo: {
    name: "Layboka",
    version: "1.0.0"
  },
  typescript: false
});

/**
 * Verify Stripe configuration
 */
export const verifyStripeConnection = async () => {
  try {
    const account = await stripe.accounts.retrieve();

    console.log("======================================");
    console.log("💳 Stripe Connected Successfully");
    console.log(`🏢 Account : ${account.business_profile?.name || "Unnamed"}`);
    console.log(`🌍 Country : ${account.country}`);
    console.log(`💱 Default Currency : ${account.default_currency?.toUpperCase()}`);
    console.log("======================================");

    return true;
  } catch (error) {
    console.error("======================================");
    console.error("❌ Stripe Connection Failed");
    console.error(error.message);
    console.error("======================================");

    throw error;
  }
};

/**
 * Subscription Plans
 */
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID
};

/**
 * Plan Prices
 */
export const PLAN_PRICING = {
  starter: {
    name: "Starter",
    amount: 25,
    currency: "usd"
  },
  growth: {
    name: "Growth",
    amount: 59,
    currency: "usd"
  },
  premium: {
    name: "Premium",
    amount: 149,
    currency: "usd"
  },
  enterprise: {
    name: "Enterprise",
    amount: 0,
    currency: "usd"
  }
};

/**
 * Trial Settings
 */
export const TRIAL_SETTINGS = {
  days: Number(process.env.FREE_TRIAL_DAYS || 7),
  plan: "premium"
};

export default stripe;
