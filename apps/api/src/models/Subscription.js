// layboka/apps/api/src/models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // Owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Shopify Store
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true
    },

    // Subscription Plan
    plan: {
      type: String,
      enum: [
        "starter",
        "growth",
        "premium",
        "enterprise"
      ],
      required: true,
      default: "starter"
    },

    // Monthly Price (USD)
    amount: {
      type: Number,
      required: true,
      default: 25
    },

    currency: {
      type: String,
      default: "usd",
      uppercase: true
    },

    // Stripe
    stripeCustomerId: {
      type: String,
      default: ""
    },

    stripeSubscriptionId: {
      type: String,
      default: ""
    },

    stripePriceId: {
      type: String,
      default: ""
    },

    stripeInvoiceId: {
      type: String,
      default: ""
    },

    // Status
    status: {
      type: String,
      enum: [
        "trial",
        "active",
        "past_due",
        "cancelled",
        "expired",
        "paused"
      ],
      default: "trial",
      index: true
    },

    // Trial
    trialStart: {
      type: Date,
      default: Date.now
    },

    trialEnd: {
      type: Date,
      default: () => {
        const trial = new Date();
        trial.setDate(trial.getDate() + 7);
        return trial;
      }
    },

    trialUsed: {
      type: Boolean,
      default: false
    },

    // Billing
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },

    currentPeriodStart: {
      type: Date
    },

    currentPeriodEnd: {
      type: Date
    },

    nextBillingDate: {
      type: Date
    },

    cancelledAt: {
      type: Date
    },

    expiresAt: {
      type: Date
    },

    // AI Access
    aiModel: {
      type: String,
      enum: [
        "gpt-4o-mini",
        "gpt-5"
      ],
      default: "gpt-4o-mini"
    },

    premiumFeaturesEnabled: {
      type: Boolean,
      default: true
    },

    // Usage
    totalMessages: {
      type: Number,
      default: 0
    },

    totalTokens: {
      type: Number,
      default: 0
    },

    totalVisitors: {
      type: Number,
      default: 0
    },

    totalOrders: {
      type: Number,
      default: 0
    },

    totalRevenueGenerated: {
      type: Number,
      default: 0
    },

    // Internal Notes
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ trialEnd: 1 });

/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

subscriptionSchema.virtual("trialRemainingDays").get(function () {
  const today = new Date();

  if (today >= this.trialEnd) {
    return 0;
  }

  const diff = this.trialEnd - today;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

subscriptionSchema.virtual("isTrialActive").get(function () {
  return new Date() < this.trialEnd;
});

/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

subscriptionSchema.methods.getAIModel = function () {
  if (
    this.plan === "premium" ||
    this.plan === "enterprise"
  ) {
    return "gpt-5";
  }

  return "gpt-4o-mini";
};

subscriptionSchema.methods.isPremium = function () {
  return (
    this.plan === "premium" ||
    this.plan === "enterprise"
  );
};

subscriptionSchema.methods.isActive = function () {
  return (
    this.status === "active" ||
    this.status === "trial"
  );
};

/*
|--------------------------------------------------------------------------
| Pre Save Hook
|--------------------------------------------------------------------------
*/

subscriptionSchema.pre("save", function (next) {
  switch (this.plan) {
    case "starter":
      this.amount = 25;
      this.aiModel = "gpt-4o-mini";
      break;

    case "growth":
      this.amount = 59;
      this.aiModel = "gpt-4o-mini";
      break;

    case "premium":
      this.amount = 149;
      this.aiModel = "gpt-5";
      break;

    case "enterprise":
      this.amount = 0;
      this.aiModel = "gpt-5";
      break;

    default:
      this.amount = 25;
      this.aiModel = "gpt-4o-mini";
  }

  this.premiumFeaturesEnabled =
    this.plan === "premium" ||
    this.plan === "enterprise" ||
    this.status === "trial";

  next();
});

subscriptionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false
});

const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);

export default Subscription;
