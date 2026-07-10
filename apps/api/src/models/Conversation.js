import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const conversationSchema = new Schema(
{
    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true
    },

    visitor: {
        type: Schema.Types.ObjectId,
        ref: "Visitor",
        required: true,
        index: true
    },

    merchant: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    subscription: {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
        default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Conversation Identity
    |--------------------------------------------------------------------------
    */

    conversationId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },

    title: {
        type: String,
        default: "New Conversation",
        maxlength: 200,
        trim: true
    },

    summary: {
        type: String,
        default: "",
        maxlength: 5000
    },

    language: {
        type: String,
        default: "en"
    },

    channel: {
        type: String,
        enum: [
            "shopify-widget",
            "shopify-product",
            "checkout",
            "cart",
            "landing-page",
            "dashboard",
            "api"
        ],
        default: "shopify-widget"
    },

    /*
    |--------------------------------------------------------------------------
    | AI Configuration
    |--------------------------------------------------------------------------
    */

    aiProvider: {
        type: String,
        enum: [
            "openai"
        ],
        default: "openai"
    },

    aiModel: {
        type: String,
        enum: [
            "gpt-4o-mini",
            "gpt-5"
        ],
        default: "gpt-4o-mini"
    },

    assistantName: {
        type: String,
        default: "Layboka AI"
    },

    personality: {
        type: String,
        default: "sales-executive"
    },

    systemPromptVersion: {
        type: String,
        default: "1.0.0"
    },

    temperature: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 2
    },

    /*
    |--------------------------------------------------------------------------
    | Conversation Status
    |--------------------------------------------------------------------------
    */

    status: {
        type: String,
        enum: [
            "active",
            "waiting",
            "resolved",
            "closed",
            "archived"
        ],
        default: "active",
        index: true
    },

    resolution: {
        type: String,
        enum: [
            "none",
            "answered",
            "purchase",
            "abandoned-cart",
            "human-support",
            "spam"
        ],
        default: "none"
    },

    priority: {
        type: String,
        enum: [
            "low",
            "normal",
            "high",
            "urgent"
        ],
        default: "normal"
    },

    source: {
        type: String,
        enum: [
            "homepage",
            "product-page",
            "collection-page",
            "cart-page",
            "checkout",
            "custom-page",
            "landing-page"
        ],
        default: "homepage"
    },

    /*
    |--------------------------------------------------------------------------
    | Human Agent
    |--------------------------------------------------------------------------
    */

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    humanHandoff: {
        type: Boolean,
        default: false
    },

    handoffRequestedAt: {
        type: Date,
        default: null
    },

    handoffAcceptedAt: {
        type: Date,
        default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Message Statistics
    |--------------------------------------------------------------------------
    */

    totalMessages: {
        type: Number,
        default: 0,
        min: 0
    },

    userMessages: {
        type: Number,
        default: 0
    },

    aiMessages: {
        type: Number,
        default: 0
    },

    humanMessages: {
        type: Number,
        default: 0
    },

    unreadMessages: {
        type: Number,
        default: 0
    },

    /*
    |--------------------------------------------------------------------------
    | Session
    |--------------------------------------------------------------------------
    */

    startedAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    lastMessageAt: {
        type: Date,
        default: Date.now
    },

    endedAt: {
        type: Date,
        default: null
    }

},
{
    timestamps: true,
    versionKey: false
});
    /*
    |--------------------------------------------------------------------------
    | OpenAI Usage
    |--------------------------------------------------------------------------
    */

    promptTokens: {
        type: Number,
        default: 0,
        min: 0
    },

    completionTokens: {
        type: Number,
        default: 0,
        min: 0
    },

    totalTokens: {
        type: Number,
        default: 0,
        min: 0
    },

    estimatedCost: {
        type: Number,
        default: 0,
        min: 0
    },

    apiCalls: {
        type: Number,
        default: 0,
        min: 0
    },

    averageResponseTime: {
        type: Number,
        default: 0
    },

    firstResponseTime: {
        type: Number,
        default: 0
    },

    lastResponseTime: {
        type: Number,
        default: 0
    },

    /*
    |--------------------------------------------------------------------------
    | AI Sales Executive Intelligence
    |--------------------------------------------------------------------------
    */

    detectedIntent: {
        type: String,
        enum: [
            "unknown",
            "greeting",
            "product_search",
            "product_question",
            "pricing",
            "shipping",
            "discount",
            "inventory",
            "order_tracking",
            "return_exchange",
            "checkout_help",
            "cart_recovery",
            "upsell",
            "cross_sell",
            "complaint",
            "support",
            "purchase"
        ],
        default: "unknown"
    },

    customerStage: {
        type: String,
        enum: [
            "visitor",
            "interested",
            "considering",
            "ready_to_buy",
            "purchased",
            "returning"
        ],
        default: "visitor"
    },

    confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    sentiment: {
        type: String,
        enum: [
            "neutral",
            "positive",
            "negative"
        ],
        default: "neutral"
    },

    sentimentScore: {
        type: Number,
        default: 0
    },

    /*
    |--------------------------------------------------------------------------
    | AI Memory
    |--------------------------------------------------------------------------
    */

    customerName: {
        type: String,
        default: ""
    },

    customerEmail: {
        type: String,
        default: ""
    },

    preferredLanguage: {
        type: String,
        default: "en"
    },

    preferredCurrency: {
        type: String,
        default: "USD"
    },

    customerNotes: {
        type: String,
        default: ""
    },

    memory: [{
        key: {
            type: String,
            required: true,
            trim: true
        },

        value: {
            type: Schema.Types.Mixed,
            required: true
        },

        confidence: {
            type: Number,
            default: 100
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    /*
    |--------------------------------------------------------------------------
    | Product Recommendations
    |--------------------------------------------------------------------------
    */

    recommendedProducts: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },

        shopifyProductId: {
            type: String,
            default: ""
        },

        title: {
            type: String,
            default: ""
        },

        handle: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            default: 0
        },

        score: {
            type: Number,
            default: 0
        },

        reason: {
            type: String,
            default: ""
        },

        clicked: {
            type: Boolean,
            default: false
        },

        addedToCart: {
            type: Boolean,
            default: false
        },

        purchased: {
            type: Boolean,
            default: false
        },

        recommendedAt: {
            type: Date,
            default: Date.now
        }
    }],

    recommendationsGenerated: {
        type: Number,
        default: 0
    },

    recommendationsClicked: {
        type: Number,
        default: 0
    },

    recommendationsPurchased: {
        type: Number,
        default: 0
    },

    /*
    |--------------------------------------------------------------------------
    | Upsell & Cross Sell
    |--------------------------------------------------------------------------
    */

    upsellOffered: {
        type: Boolean,
        default: false
    },

    crossSellOffered: {
        type: Boolean,
        default: false
    },

    acceptedUpsell: {
        type: Boolean,
        default: false
    },

    acceptedCrossSell: {
        type: Boolean,
        default: false
    },

    upsellRevenue: {
        type: Number,
        default: 0
},
    /*
    |--------------------------------------------------------------------------
    | Cart Recovery
    |--------------------------------------------------------------------------
    */

    cartRecovery: {
        attempted: {
            type: Boolean,
            default: false
        },

        recovered: {
            type: Boolean,
            default: false
        },

        recoveryLinkSent: {
            type: Boolean,
            default: false
        },

        abandonedCheckoutId: {
            type: String,
            default: ""
        },

        abandonedCartValue: {
            type: Number,
            default: 0
        },

        recoveredValue: {
            type: Number,
            default: 0
        },

        recoveredAt: {
            type: Date,
            default: null
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Shopify Order Attribution
    |--------------------------------------------------------------------------
    */

    order: {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            default: null
        },

        shopifyOrderId: {
            type: String,
            default: ""
        },

        orderNumber: {
            type: String,
            default: ""
        },

        subtotal: {
            type: Number,
            default: 0
        },

        tax: {
            type: Number,
            default: 0
        },

        shipping: {
            type: Number,
            default: 0
        },

        discount: {
            type: Number,
            default: 0
        },

        total: {
            type: Number,
            default: 0
        },

        currency: {
            type: String,
            default: "USD"
        },

        purchased: {
            type: Boolean,
            default: false
        },

        purchasedAt: {
            type: Date,
            default: null
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Revenue Attribution
    |--------------------------------------------------------------------------
    */

    aiRevenue: {
        directRevenue: {
            type: Number,
            default: 0
        },

        influencedRevenue: {
            type: Number,
            default: 0
        },

        recoveredRevenue: {
            type: Number,
            default: 0
        },

        totalRevenue: {
            type: Number,
            default: 0
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Customer Satisfaction
    |--------------------------------------------------------------------------
    */

    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        review: {
            type: String,
            default: "",
            maxlength: 2000
        },

        helpful: {
            type: Boolean,
            default: null
        },

        resolved: {
            type: Boolean,
            default: false
        },

        submittedAt: {
            type: Date,
            default: null
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Conversation Analytics
    |--------------------------------------------------------------------------
    */

    analytics: {
        pageViews: {
            type: Number,
            default: 0
        },

        productsViewed: {
            type: Number,
            default: 0
        },

        productsRecommended: {
            type: Number,
            default: 0
        },

        productsClicked: {
            type: Number,
            default: 0
        },

        addToCartEvents: {
            type: Number,
            default: 0
        },

        checkoutStarted: {
            type: Number,
            default: 0
        },

        purchasesCompleted: {
            type: Number,
            default: 0
        },

        averageMessageLength: {
            type: Number,
            default: 0
        },

        averageReplyTime: {
            type: Number,
            default: 0
        },

        engagementScore: {
            type: Number,
            default: 0
        },

        conversionScore: {
            type: Number,
            default: 0
        }
    },

    /*
    |--------------------------------------------------------------------------
    | AI Performance
    |--------------------------------------------------------------------------
    */

    performance: {
        successfulAnswers: {
            type: Number,
            default: 0
        },

        fallbackResponses: {
            type: Number,
            default: 0
        },

        hallucinationFlags: {
            type: Number,
            default: 0
        },

        humanEscalations: {
            type: Number,
            default: 0
        },

        aiConfidenceAverage: {
            type: Number,
            default: 0
        },

        overallScore: {
            type: Number,
            default: 0
        }
    },
    /*
    |--------------------------------------------------------------------------
    | Device Information
    |--------------------------------------------------------------------------
    */

    device: {
        type: {
            type: String,
            enum: [
                "desktop",
                "mobile",
                "tablet",
                "bot",
                "unknown"
            ],
            default: "unknown"
        },

        operatingSystem: {
            type: String,
            default: ""
        },

        browser: {
            type: String,
            default: ""
        },

        browserVersion: {
            type: String,
            default: ""
        },

        userAgent: {
            type: String,
            default: ""
        },

        screenResolution: {
            type: String,
            default: ""
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Visitor Location
    |--------------------------------------------------------------------------
    */

    location: {
        ip: {
            type: String,
            default: ""
        },

        country: {
            type: String,
            default: ""
        },

        countryCode: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: ""
        },

        postalCode: {
            type: String,
            default: ""
        },

        timezone: {
            type: String,
            default: ""
        },

        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Marketing Attribution
    |--------------------------------------------------------------------------
    */

    attribution: {
        source: {
            type: String,
            default: ""
        },

        medium: {
            type: String,
            default: ""
        },

        campaign: {
            type: String,
            default: ""
        },

        term: {
            type: String,
            default: ""
        },

        content: {
            type: String,
            default: ""
        },

        referrer: {
            type: String,
            default: ""
        },

        landingPage: {
            type: String,
            default: ""
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Internal Tags
    |--------------------------------------------------------------------------
    */

    tags: [{
        type: String,
        trim: true
    }],

    labels: [{
        type: String,
        trim: true
    }],

    internalNotes: {
        type: String,
        default: "",
        maxlength: 10000
    },

    /*
    |--------------------------------------------------------------------------
    | Conversation Metadata
    |--------------------------------------------------------------------------
    */

    metadata: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {}
    },

    archived: {
        type: Boolean,
        default: false
    },

    deleted: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true,
    versionKey: false
});

/*
|--------------------------------------------------------------------------
| Database Indexes
|--------------------------------------------------------------------------
*/

conversationSchema.index({
    shop: 1,
    visitor: 1
});

conversationSchema.index({
    conversationId: 1
});

conversationSchema.index({
    status: 1
});

conversationSchema.index({
    aiModel: 1
});

conversationSchema.index({
    startedAt: -1
});

conversationSchema.index({
    shop: 1,
    status: 1,
    lastMessageAt: -1
});

conversationSchema.index({
    "order.shopifyOrderId": 1
});

conversationSchema.index({
    "order.purchased": 1
});

conversationSchema.index({
    "cartRecovery.recovered": 1
});

conversationSchema.index({
    "feedback.rating": 1
});

conversationSchema.index({
    "location.country": 1
});

conversationSchema.index({
    tags: 1
});
/*
|--------------------------------------------------------------------------
| Virtual Properties
|--------------------------------------------------------------------------
*/

conversationSchema.virtual("duration").get(function () {
    if (!this.startedAt) return 0;

    const end = this.endedAt || new Date();

    return Math.max(
        0,
        Math.floor((end.getTime() - this.startedAt.getTime()) / 1000)
    );
});

conversationSchema.virtual("durationMinutes").get(function () {
    return Math.ceil(this.duration / 60);
});

conversationSchema.virtual("isActive").get(function () {
    return this.status === "active";
});

conversationSchema.virtual("isResolved").get(function () {
    return this.status === "resolved";
});

conversationSchema.virtual("isClosed").get(function () {
    return this.status === "closed";
});

conversationSchema.virtual("hasPurchase").get(function () {
    return this.order?.purchased === true;
});

conversationSchema.virtual("trialConversation").get(function () {
    return this.aiModel === "gpt-5";
});

/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

/**
 * Update last activity timestamp
 */
conversationSchema.methods.touch = function () {
    this.lastMessageAt = new Date();
    return this;
};

/**
 * Increase message counters
 */
conversationSchema.methods.incrementMessageCount = function (
    sender = "user"
) {
    this.totalMessages += 1;

    switch (sender) {
        case "user":
            this.userMessages += 1;
            break;

        case "assistant":
            this.aiMessages += 1;
            break;

        case "human":
            this.humanMessages += 1;
            break;

        default:
            break;
    }

    this.lastMessageAt = new Date();

    return this;
};

/**
 * Add OpenAI token usage
 */
conversationSchema.methods.addTokenUsage = function ({
    promptTokens = 0,
    completionTokens = 0,
    estimatedCost = 0
}) {
    this.promptTokens += promptTokens;
    this.completionTokens += completionTokens;

    this.totalTokens =
        this.promptTokens + this.completionTokens;

    this.estimatedCost += estimatedCost;

    this.apiCalls += 1;

    return this;
};

/**
 * Store response timing
 */
conversationSchema.methods.recordResponseTime = function (
    milliseconds
) {
    if (!this.firstResponseTime) {
        this.firstResponseTime = milliseconds;
    }

    this.lastResponseTime = milliseconds;

    const calls = Math.max(this.apiCalls, 1);

    this.averageResponseTime =
        (
            (this.averageResponseTime * (calls - 1)) +
            milliseconds
        ) / calls;

    return this;
};

/**
 * Add AI memory
 */
conversationSchema.methods.remember = function (
    key,
    value,
    confidence = 100
) {
    const existing = this.memory.find(
        item => item.key === key
    );

    if (existing) {
        existing.value = value;
        existing.confidence = confidence;
        existing.createdAt = new Date();
    } else {
        this.memory.push({
            key,
            value,
            confidence
        });
    }

    return this;
};

/**
 * Read AI memory
 */
conversationSchema.methods.recall = function (key) {
    const memory = this.memory.find(
        item => item.key === key
    );

    return memory ? memory.value : null;
};

/**
 * Update detected customer intent
 */
conversationSchema.methods.updateIntent = function (
    intent,
    confidence = 100
) {
    this.detectedIntent = intent;
    this.confidenceScore = confidence;

    return this;
};

/**
 * Mark human handoff
 */
conversationSchema.methods.requestHumanHandoff = function () {
    this.humanHandoff = true;
    this.handoffRequestedAt = new Date();

    return this;
};

/**
 * Resolve conversation
 */
conversationSchema.methods.markResolved = function (
    resolution = "answered"
) {
    this.status = "resolved";
    this.resolution = resolution;
    this.endedAt = new Date();

    return this;
};
/*
|--------------------------------------------------------------------------
| Revenue & Analytics Helpers
|--------------------------------------------------------------------------
*/

conversationSchema.methods.calculateTotalRevenue = function () {
    this.aiRevenue.totalRevenue =
        (this.aiRevenue.directRevenue || 0) +
        (this.aiRevenue.influencedRevenue || 0) +
        (this.aiRevenue.recoveredRevenue || 0);

    return this.aiRevenue.totalRevenue;
};

conversationSchema.methods.recordPurchase = function ({
    orderId = null,
    shopifyOrderId = "",
    total = 0,
    currency = "USD"
}) {
    this.order.orderId = orderId;
    this.order.shopifyOrderId = shopifyOrderId;
    this.order.total = total;
    this.order.currency = currency;
    this.order.purchased = true;
    this.order.purchasedAt = new Date();

    this.aiRevenue.directRevenue += total;
    this.calculateTotalRevenue();

    return this;
};

conversationSchema.methods.recordCartRecovery = function (
    recoveredValue = 0
) {
    this.cartRecovery.recovered = true;
    this.cartRecovery.recoveredValue = recoveredValue;
    this.cartRecovery.recoveredAt = new Date();

    this.aiRevenue.recoveredRevenue += recoveredValue;
    this.calculateTotalRevenue();

    return this;
};

conversationSchema.methods.addRecommendationClick = function () {
    this.recommendationsClicked += 1;
    return this;
};

conversationSchema.methods.addRecommendationPurchase = function () {
    this.recommendationsPurchased += 1;
    return this;
};

/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

conversationSchema.statics.findActiveConversation = function (
    visitorId
) {
    return this.findOne({
        visitor: visitorId,
        status: "active"
    });
};

conversationSchema.statics.findByConversationId = function (
    conversationId
) {
    return this.findOne({
        conversationId
    });
};

conversationSchema.statics.shopStatistics = function (shopId) {
    return this.aggregate([
        {
            $match: {
                shop: shopId
            }
        },
        {
            $group: {
                _id: "$shop",
                conversations: {
                    $sum: 1
                },
                revenue: {
                    $sum: "$aiRevenue.totalRevenue"
                },
                messages: {
                    $sum: "$totalMessages"
                },
                tokens: {
                    $sum: "$totalTokens"
                }
            }
        }
    ]);
};

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

conversationSchema.pre("save", function (next) {
if (!this.conversationId) {
    this.conversationId = crypto.randomUUID();
}
    this.totalTokens =
        this.promptTokens +
        this.completionTokens;

    this.calculateTotalRevenue();

    if (this.order.purchased) {
        this.status = "resolved";
    }

    next();
});

/*
|--------------------------------------------------------------------------
| JSON Output
|--------------------------------------------------------------------------
*/

conversationSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {

        delete ret.__v;

        return ret;
    }
});

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);

export default Conversation;
