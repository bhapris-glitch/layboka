import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Owner
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true
    },

    // Shopify IDs
    shopifyProductId: {
      type: String,
      required: true
    },

    shopifyVariantIds: [
      {
        type: String
      }
    ],

    // Product Information
    title: {
      type: String,
      required: true,
      trim: true
    },

    handle: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    vendor: {
      type: String,
      default: ""
    },

    productType: {
      type: String,
      default: ""
    },

    tags: [
      {
        type: String
      }
    ],

    collections: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: [
        "active",
        "draft",
        "archived"
      ],
      default: "active"
    },

    // Pricing
    currency: {
      type: String,
      default: "USD"
    },

    price: {
      type: Number,
      default: 0
    },

    compareAtPrice: {
      type: Number,
      default: 0
    },

    cost: {
      type: Number,
      default: 0
    },

    // Inventory
    inventory: {
      type: Number,
      default: 0
    },

    inventoryTracked: {
      type: Boolean,
      default: true
    },

    availableForSale: {
      type: Boolean,
      default: true
    },

    // Media
    image: {
      type: String,
      default: ""
    },

    gallery: [
      {
        type: String
      }
    ],

    // SEO
    seoTitle: {
      type: String,
      default: ""
    },

    seoDescription: {
      type: String,
      default: ""
    },

    // AI Metadata
    recommendationScore: {
      type: Number,
      default: 0
    },

    popularityScore: {
      type: Number,
      default: 0
    },

    embeddingGenerated: {
      type: Boolean,
      default: false
    },

    aiDescription: {
      type: String,
      default: ""
    },

    aiKeywords: [
      {
        type: String
      }
    ],

    // Sales Metrics
    views: {
      type: Number,
      default: 0
    },

    chats: {
      type: Number,
      default: 0
    },

    purchases: {
      type: Number,
      default: 0
    },

    revenue: {
      type: Number,
      default: 0
    },

    conversionRate: {
      type: Number,
      default: 0
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

// Compound Indexes
productSchema.index({
  shop: 1,
  shopifyProductId: 1
}, {
  unique: true
});

productSchema.index({
  shop: 1,
  title: "text",
  description: "text"
});

productSchema.index({
  shop: 1,
  status: 1
});

productSchema.index({
  shop: 1,
  recommendationScore: -1
});

productSchema.index({
  shop: 1,
  popularityScore: -1
});

// Virtual
productSchema.virtual("isInStock").get(function () {
  return this.inventory > 0;
});

// Instance Method
productSchema.methods.incrementView = async function () {
  this.views += 1;
  return this.save();
};

const Product = mongoose.model("Product", productSchema);

export default Product;
