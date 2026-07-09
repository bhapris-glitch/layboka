import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    // Store
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true
    },

    // Conversation Session
    sessionId: {
      type: String,
      required: true,
      index: true
    },

    // Shopify Customer (if logged in)
    customerId: {
      type: String,
      default: "",
      index: true
    },

    customerEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true
    },

    customerName: {
      type: String,
      default: "",
      trim: true
    },

    // Device
    ipAddress: {
      type: String,
      default: ""
    },

    userAgent: {
      type: String,
      default: ""
    },

    browser: {
      type: String,
      default: ""
    },

    operatingSystem: {
      type: String,
      default: ""
    },

    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown"
    },

    // Location
    country: {
      type: String,
      default: ""
    },

    region: {
      type: String,
      default: ""
    },

    city: {
      type: String,
      default: ""
    },

    timezone: {
      type: String,
      default: ""
    },

    language: {
      type: String,
      default: "en"
    },

    // Visit Information
    landingPage: {
      type: String,
      default: "/"
    },

    currentPage: {
      type: String,
      default: "/"
    },

    referrer: {
      type: String,
      default: ""
    },

    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    utmTerm: String,

    // AI Interaction
    hasChatted: {
      type: Boolean,
      default: false
    },

    totalMessages: {
      type: Number,
      default: 0
    },

    conversationCount: {
      type: Number,
      default: 0
    },

    lastConversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation"
    },

    // Shopping Behaviour
    viewedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    cartValue: {
      type: Number,
      default: 0
    },

    cartItems: {
      type: Number,
      default: 0
    },

    purchased: {
      type: Boolean,
      default: false
    },

    totalSpent: {
      type: Number,
      default: 0
    },

    // AI Lead Score
    leadScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    intent: {
      type: String,
      enum: [
        "unknown",
        "browsing",
        "researching",
        "buying",
        "support"
      ],
      default: "unknown"
    },

    // Status
    isOnline: {
      type: Boolean,
      default: true
    },

    firstVisitAt: {
      type: Date,
      default: Date.now
    },

    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
visitorSchema.index({ shop: 1, sessionId: 1 }, { unique: true });
visitorSchema.index({ customerId: 1 });
visitorSchema.index({ lastSeenAt: -1 });
visitorSchema.index({ leadScore: -1 });
visitorSchema.index({ purchased: 1 });
visitorSchema.index({ isOnline: 1 });

// Virtual
visitorSchema.virtual("isReturningVisitor").get(function () {
  return this.conversationCount > 1;
});

// Instance Methods
visitorSchema.methods.updateLastSeen = function () {
  this.lastSeenAt = new Date();
  return this.save();
};

visitorSchema.methods.incrementMessages = function () {
  this.totalMessages += 1;
  return this.save();
};

visitorSchema.methods.incrementConversation = function () {
  this.conversationCount += 1;
  return this.save();
};

visitorSchema.methods.markPurchased = function (amount = 0) {
  this.purchased = true;
  this.totalSpent += amount;
  return this.save();
};

visitorSchema.set("toJSON", {
  virtuals: true,
  versionKey: false
});

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
