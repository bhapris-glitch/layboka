import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Store
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true
    },

    // Shopify Order
    shopifyOrderId: {
      type: String,
      required: true,
      index: true
    },

    orderNumber: {
      type: String,
      default: ""
    },

    orderName: {
      type: String,
      default: ""
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "authorized",
        "paid",
        "partially_paid",
        "fulfilled",
        "partially_fulfilled",
        "cancelled",
        "refunded"
      ],
      default: "pending"
    },

    financialStatus: {
      type: String,
      default: ""
    },

    fulfillmentStatus: {
      type: String,
      default: ""
    },

    currency: {
      type: String,
      default: "USD"
    },

    subtotalPrice: {
      type: Number,
      default: 0
    },

    discountAmount: {
      type: Number,
      default: 0
    },

    taxAmount: {
      type: Number,
      default: 0
    },

    shippingAmount: {
      type: Number,
      default: 0
    },

    totalPrice: {
      type: Number,
      default: 0
    },

    totalRefunded: {
      type: Number,
      default: 0
    },

    // Customer
    customerId: {
      type: String,
      default: ""
    },

    customerEmail: {
      type: String,
      default: ""
    },

    customerName: {
      type: String,
      default: ""
    },

    customerPhone: {
      type: String,
      default: ""
    },

    // Shipping
    shippingAddress: {
      firstName: String,
      lastName: String,
      address1: String,
      address2: String,
      city: String,
      province: String,
      country: String,
      zip: String,
      phone: String
    },

    // Billing
    billingAddress: {
      firstName: String,
      lastName: String,
      address1: String,
      address2: String,
      city: String,
      province: String,
      country: String,
      zip: String,
      phone: String
    },

    // Products
    items: [
      {
        productId: String,
        variantId: String,
        title: String,
        sku: String,
        quantity: Number,
        price: Number,
        total: Number
      }
    ],

    paymentGateway: {
      type: String,
      default: ""
    },

    paymentMethod: {
      type: String,
      default: ""
    },

    note: {
      type: String,
      default: ""
    },

    tags: [
      {
        type: String
      }
    ],

    sourceName: {
      type: String,
      default: "shopify"
    },

    aiInfluenced: {
      type: Boolean,
      default: false
    },

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null
    },

    syncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
orderSchema.index({ shop: 1, shopifyOrderId: 1 }, { unique: true });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ financialStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual
orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((total, item) => total + (item.quantity || 0), 0);
});

// Instance Methods
orderSchema.methods.isPaid = function () {
  return ["paid", "partially_paid"].includes(this.financialStatus);
};

orderSchema.methods.isFulfilled = function () {
  return this.fulfillmentStatus === "fulfilled";
};

orderSchema.methods.isAIOrder = function () {
  return this.aiInfluenced;
};

shopSchema?.set; // placeholder removed? (No-op intentionally omitted)

// JSON Transform
orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
