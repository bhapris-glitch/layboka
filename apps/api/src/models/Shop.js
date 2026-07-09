// layboka/apps/api/src/models/Shop.js
import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    // Shop Owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Shopify Store Information
    shop: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    customDomain: {
      type: String,
      default: ""
    },

    storeName: {
      type: String,
      default: ""
    },

    email: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    currency: {
      type: String,
      default: "USD"
    },

    timezone: {
      type: String,
      default: ""
    },

    country: {
      type: String,
      default: ""
    },

    language: {
      type: String,
      default: "en"
    },

    planName: {
      type: String,
      enum: [
        "starter",
        "growth",
        "premium",
        "enterprise"
      ],
      default: "starter"
    },

    // Shopify OAuth
    accessToken: {
      type: String,
      required: true,
      select: false
    },

    scope: {
      type: String,
      default: ""
    },

    installedAt: {
      type: Date,
      default: Date.now
    },

    uninstallAt: {
      type: Date
    },

    isInstalled: {
      type: Boolean,
      default: true
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

    trialExpired: {
      type: Boolean,
      default: false
    },

    // AI Configuration
    aiEnabled: {
      type: Boolean,
      default: true
    },

    aiModel: {
      type: String,
      enum: [
        "gpt-4o-mini",
        "gpt-5"
      ],
      default: "gpt-5"
    },

    chatbotInstalled: {
      type: Boolean,
      default: false
    },

    chatbotVersion: {
      type: String,
      default: "1.0.0"
    },

    // Subscription
    stripeCustomerId: {
      type: String,
      default: ""
    },

    stripeSubscriptionId: {
      type: String,
      default: ""
    },

    subscriptionStatus: {
      type: String,
      enum: [
        "trial",
        "active",
        "cancelled",
        "expired",
        "past_due"
      ],
      default: "trial"
    },

    // Statistics
    totalVisitors: {
      type: Number,
      default: 0
    },

    totalChats: {
      type: Number,
      default: 0
    },

    totalOrders: {
      type: Number,
      default: 0
    },

    totalRevenue: {
      type: Number,
      default: 0
    },

    conversionRate: {
      type: Number,
      default: 0
    },

    averageOrderValue: {
      type: Number,
      default: 0
    },

    // Feature Lock
    premiumLocked: {
      type: Boolean,
      default: false
    },

    // Status
    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "suspended"
      ],
      default: "active"
    },

    lastSyncAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
shopSchema.index({ owner: 1 });
shopSchema.index({ shop: 1 });
shopSchema.index({ subscriptionStatus: 1 });
shopSchema.index({ trialEnd: 1 });
shopSchema.index({ status: 1 });

// Virtual
shopSchema.virtual("trialRemainingDays").get(function () {
  const now = new Date();

  if (this.trialEnd <= now) {
    return 0;
  }

  const diff = this.trialEnd - now;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Instance Method
shopSchema.methods.isTrialActive = function () {
  return new Date() < this.trialEnd;
};

shopSchema.methods.getAIModel = function () {
  if (
    this.planName === "premium" ||
    this.planName === "enterprise"
  ) {
    return "gpt-5";
  }

  return "gpt-4o-mini";
};

shopSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    delete ret.accessToken;
    return ret;
  }
});

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
