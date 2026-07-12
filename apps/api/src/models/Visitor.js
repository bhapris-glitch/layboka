import mongoose from "mongoose";

const { Schema } = mongoose;

/*
|--------------------------------------------------------------------------
| Visitor Schema
|--------------------------------------------------------------------------
*/

const visitorSchema = new Schema(
{
    /*
    |--------------------------------------------------------------------------
    | Store Relationship
    |--------------------------------------------------------------------------
    */

    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true
    },

    /*
    |--------------------------------------------------------------------------
    | Session Information
    |--------------------------------------------------------------------------
    */

    sessionId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },

    sessionExpiresAt: {
        type: Date,
        default: null,
        index: true
    },

    firstVisitAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    lastSeenAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    lastActivityAt: {
        type: Date,
        default: Date.now
    },

    isOnline: {
        type: Boolean,
        default: true,
        index: true
    },

    /*
    |--------------------------------------------------------------------------
    | Shopify Customer
    |--------------------------------------------------------------------------
    */

    customerId: {
        type: String,
        default: "",
        trim: true,
        index: true
    },

    customerEmail: {
        type: String,
        default: "",
        lowercase: true,
        trim: true,
        index: true
    },

    customerName: {
        type: String,
        default: "",
        trim: true
    },

    firstName: {
        type: String,
        default: "",
        trim: true
    },

    lastName: {
        type: String,
        default: "",
        trim: true
    },

    phone: {
        type: String,
        default: "",
        trim: true
    },

    acceptsMarketing: {
        type: Boolean,
        default: false
    },

    /*
    |--------------------------------------------------------------------------
    | Device Information
    |--------------------------------------------------------------------------
    */

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

    browserVersion: {
        type: String,
        default: ""
    },

    operatingSystem: {
        type: String,
        default: ""
    },

    deviceType: {
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

    screenResolution: {
        type: String,
        default: ""
    },

    timezone: {
        type: String,
        default: "UTC"
    },

    language: {
        type: String,
        default: "en"
    },

    currency: {
        type: String,
        default: "USD"
    },

    /*
    |--------------------------------------------------------------------------
    | Visitor Status
    |--------------------------------------------------------------------------
    */

    status: {
        type: String,
        enum: [
            "active",
            "idle",
            "offline",
            "blocked"
        ],
        default: "active",
        index: true
    }

},
{
    timestamps: true,
    versionKey: false
});
    /*
    |--------------------------------------------------------------------------
    | Visitor Preferences
    |--------------------------------------------------------------------------
    */

    preferences: {

        language: {
            type: String,
            default: "en"
        },

        currency: {
            type: String,
            default: "USD"
        },

        theme: {
            type: String,
            enum: [
                "light",
                "dark",
                "auto"
            ],
            default: "light"
        },

        sound: {
            type: Boolean,
            default: true
        },

        notifications: {
            type: Boolean,
            default: true
        },

        marketingEmails: {
            type: Boolean,
            default: false
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Widget State
    |--------------------------------------------------------------------------
    */

    widgetState: {

        isOpen: {
            type: Boolean,
            default: false
        },

        isMinimized: {
            type: Boolean,
            default: false
        },

        hasWelcomed: {
            type: Boolean,
            default: false
        },

        lastOpenedAt: {
            type: Date,
            default: null
        },

        lastClosedAt: {
            type: Date,
            default: null
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Widget Analytics
    |--------------------------------------------------------------------------
    */

    analytics: {

        widgetLoads: {
            type: Number,
            default: 0
        },

        widgetOpens: {
            type: Number,
            default: 0
        },

        widgetCloses: {
            type: Number,
            default: 0
        },

        totalMessages: {
            type: Number,
            default: 0
        },

        aiResponses: {
            type: Number,
            default: 0
        },

        recommendationClicks: {
            type: Number,
            default: 0
        },

        checkoutClicks: {
            type: Number,
            default: 0
        },

        averageResponseTime: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Cart Recovery
    |--------------------------------------------------------------------------
    */

    cartRecovery: {

        enabled: {
            type: Boolean,
            default: false
        },

        abandonedCart: {
            type: Boolean,
            default: false
        },

        checkoutUrl: {
            type: String,
            default: ""
        },

        cartValue: {
            type: Number,
            default: 0
        },

        currency: {
            type: String,
            default: "USD"
        },

        recovered: {
            type: Boolean,
            default: false
        },

        recoveredAt: {
            type: Date,
            default: null
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Session Management
    |--------------------------------------------------------------------------
    */

    lastActivityAt: {
        type: Date,
        default: Date.now
    },

    sessionExpiresAt: {
        type: Date,
        default: null
    },
    /*
    |--------------------------------------------------------------------------
    | AI Intelligence
    |--------------------------------------------------------------------------
    */

    leadScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
        index: true
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
        default: "unknown",
        index: true
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

    sentiment: {
        type: String,
        enum: [
            "positive",
            "neutral",
            "negative"
        ],
        default: "neutral"
    },

    aiMemory: {

        favoriteCategories: [{
            type: String,
            trim: true
        }],

        favoriteBrands: [{
            type: String,
            trim: true
        }],

        preferredPriceRange: {

            min: {
                type: Number,
                default: 0
            },

            max: {
                type: Number,
                default: 0
            }

        },

        lastRecommendedProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }],

        notes: {
            type: String,
            default: ""
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Cart Recovery
    |--------------------------------------------------------------------------
    */

    cartRecovery: {

        enabled: {
            type: Boolean,
            default: false
        },

        abandonedCart: {
            type: Boolean,
            default: false
        },

        abandonedAt: {
            type: Date,
            default: null
        },

        checkoutUrl: {
            type: String,
            default: ""
        },

        cartValue: {
            type: Number,
            default: 0
        },

        currency: {
            type: String,
            default: "USD"
        },

        reminderSent: {
            type: Boolean,
            default: false
        },

        recovered: {
            type: Boolean,
            default: false
        },

        recoveredAt: {
            type: Date,
            default: null
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Widget State
    |--------------------------------------------------------------------------
    */

    widgetState: {

        isOpen: {
            type: Boolean,
            default: false
        },

        isMinimized: {
            type: Boolean,
            default: false
        },

        isTyping: {
            type: Boolean,
            default: false
        },

        lastOpenedAt: {
            type: Date,
            default: null
        },

        lastClosedAt: {
            type: Date,
            default: null
        },

        lastMessageAt: {
            type: Date,
            default: null
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }

    },
    /*
    |--------------------------------------------------------------------------
    | Widget State
    |--------------------------------------------------------------------------
    */

    widgetState: {

        isOpen: {
            type: Boolean,
            default: false
        },

        isMinimized: {
            type: Boolean,
            default: false
        },

        lastOpenedAt: {
            type: Date,
            default: null
        },

        lastClosedAt: {
            type: Date,
            default: null
        },

        totalOpens: {
            type: Number,
            default: 0
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Visitor Preferences
    |--------------------------------------------------------------------------
    */

    preferences: {

        language: {
            type: String,
            default: "en"
        },

        currency: {
            type: String,
            default: "USD"
        },

        theme: {
            type: String,
            enum: [
                "light",
                "dark",
                "system"
            ],
            default: "light"
        },

        sound: {
            type: Boolean,
            default: true
        },

        notifications: {
            type: Boolean,
            default: true
        },

        marketingEmails: {
            type: Boolean,
            default: false
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Cart Recovery
    |--------------------------------------------------------------------------
    */

    cartRecovery: {

        enabled: {
            type: Boolean,
            default: false
        },

        abandonedCart: {
            type: Boolean,
            default: false
        },

        checkoutUrl: {
            type: String,
            default: ""
        },

        cartValue: {
            type: Number,
            default: 0
        },

        currency: {
            type: String,
            default: "USD"
        },

        reminderSent: {
            type: Boolean,
            default: false
        },

        reminderSentAt: {
            type: Date,
            default: null
        },

        recovered: {
            type: Boolean,
            default: false
        },

        recoveredAt: {
            type: Date,
            default: null
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Visitor Analytics
    |--------------------------------------------------------------------------
    */

    analytics: {

        widgetLoads: {
            type: Number,
            default: 0
        },

        widgetOpens: {
            type: Number,
            default: 0
        },

        widgetCloses: {
            type: Number,
            default: 0
        },

        totalMessages: {
            type: Number,
            default: 0
        },

        aiResponses: {
            type: Number,
            default: 0
        },

        productsViewed: {
            type: Number,
            default: 0
        },

        productClicks: {
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

        purchases: {
            type: Number,
            default: 0
        },

        totalRevenue: {
            type: Number,
            default: 0
        },

        averageSessionDuration: {
            type: Number,
            default: 0
        },

        averageResponseTime: {
            type: Number,
            default: 0
        },

        lastInteractionAt: {
            type: Date,
            default: Date.now
        }

    },
    /*
    |--------------------------------------------------------------------------
    | Widget State
    |--------------------------------------------------------------------------
    */

    widgetState: {

        isInitialized: {
            type: Boolean,
            default: false
        },

        isOpen: {
            type: Boolean,
            default: false
        },

        isMinimized: {
            type: Boolean,
            default: false
        },

        lastOpenedAt: {
            type: Date,
            default: null
        },

        lastClosedAt: {
            type: Date,
            default: null
        },

        totalWidgetLoads: {
            type: Number,
            default: 0
        },

        totalWidgetOpens: {
            type: Number,
            default: 0
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Visitor Preferences
    |--------------------------------------------------------------------------
    */

    preferences: {

        language: {
            type: String,
            default: "en"
        },

        currency: {
            type: String,
            default: "USD"
        },

        theme: {
            type: String,
            enum: [
                "light",
                "dark",
                "system"
            ],
            default: "light"
        },

        sound: {
            type: Boolean,
            default: true
        },

        notifications: {
            type: Boolean,
            default: true
        },

        marketingEmails: {
            type: Boolean,
            default: false
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Widget Analytics
    |--------------------------------------------------------------------------
    */

    analytics: {

        widgetLoads: {
            type: Number,
            default: 0
        },

        widgetOpens: {
            type: Number,
            default: 0
        },

        widgetCloses: {
            type: Number,
            default: 0
        },

        totalMessages: {
            type: Number,
            default: 0
        },

        averageSessionDuration: {
            type: Number,
            default: 0
        },

        averageResponseTime: {
            type: Number,
            default: 0
        },

        recommendationsViewed: {
            type: Number,
            default: 0
        },

        recommendationsClicked: {
            type: Number,
            default: 0
        },

        addToCartClicks: {
            type: Number,
            default: 0
        },

        checkoutClicks: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | AI Customer Memory
    |--------------------------------------------------------------------------
    */

    aiMemory: {

        favoriteCategories: [{
            type: String,
            trim: true
        }],

        favoriteBrands: [{
            type: String,
            trim: true
        }],

        favoriteColors: [{
            type: String,
            trim: true
        }],

        favoriteSizes: [{
            type: String,
            trim: true
        }],

        averageBudget: {
            type: Number,
            default: 0
        },

        lastDetectedIntent: {
            type: String,
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

        sentiment: {
            type: String,
            enum: [
                "positive",
                "neutral",
                "negative"
            ],
            default: "neutral"
        },

        confidenceScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        notes: {
            type: String,
            default: "",
            maxlength: 5000
        }

    },
/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

visitorSchema.methods.updateLastSeen = async function () {

    this.lastSeenAt = new Date();
    this.lastActivityAt = new Date();

    return this.save();

};

visitorSchema.methods.incrementMessages = async function () {

    this.totalMessages += 1;

    if (this.analytics) {

        this.analytics.messages =
            (this.analytics.messages || 0) + 1;

    }

    return this.save();

};

visitorSchema.methods.incrementConversation = async function () {

    this.conversationCount += 1;

    return this.save();

};

visitorSchema.methods.incrementVisit = async function () {

    this.totalVisits += 1;
    this.lastSeenAt = new Date();

    return this.save();

};

visitorSchema.methods.markPurchased = async function (

    amount = 0

) {

    this.purchased = true;

    this.totalSpent += amount;

    this.totalOrders += 1;

    this.lastSeenAt = new Date();

    return this.save();

};

visitorSchema.methods.updateLeadScore = async function (

    score = 0

) {

    this.leadScore = Math.max(
        0,
        Math.min(score, 100)
    );

    return this.save();

};

visitorSchema.methods.addViewedProduct = async function (

    productId

) {

    if (!productId) {

        return this;

    }

    const exists = this.viewedProducts.some(

        id => id.toString() === productId.toString()

    );

    if (!exists) {

        this.viewedProducts.push(productId);

    }

    return this.save();

};

visitorSchema.methods.updateWidgetState = async function (

    state = {}

) {

    this.widgetState = {

        ...this.widgetState,

        ...state,

        updatedAt: new Date()

    };

    return this.save();

};

/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

visitorSchema.statics.findBySession = function (

    shopId,

    sessionId

) {

    return this.findOne({

        shop: shopId,

        sessionId,

        deleted: false

    });

};

visitorSchema.statics.findOnlineVisitors = function (

    shopId

) {

    return this.find({

        shop: shopId,

        isOnline: true,

        deleted: false

    });

};

visitorSchema.statics.findReturningVisitors = function (

    shopId

) {

    return this.find({

        shop: shopId,

        conversationCount: {

            $gt: 1

        },

        deleted: false

    });

};

/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

visitorSchema.virtual(

    "isReturningVisitor"

).get(function () {

    return this.conversationCount > 1;

});

visitorSchema.virtual(

    "averageOrderValue"

).get(function () {

    if (!this.totalOrders) {

        return 0;

    }

    return this.totalSpent / this.totalOrders;

});

/*
|--------------------------------------------------------------------------
| Database Indexes
|--------------------------------------------------------------------------
*/

visitorSchema.index({

    shop: 1,

    sessionId: 1

}, {

    unique: true

});

visitorSchema.index({

    shop: 1,

    customerId: 1

});

visitorSchema.index({

    shop: 1,

    lastSeenAt: -1

});

visitorSchema.index({

    leadScore: -1

});

visitorSchema.index({

    isOnline: 1

});

visitorSchema.index({

    purchased: 1

});

visitorSchema.index({

    "widgetState.isOpen": 1

});

visitorSchema.index({

    "preferences.language": 1

});

/*
|--------------------------------------------------------------------------
| JSON Options
|--------------------------------------------------------------------------
*/

visitorSchema.set("toJSON", {

    virtuals: true,

    versionKey: false

});

visitorSchema.set("toObject", {

    virtuals: true

});

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Visitor = mongoose.model(

    "Visitor",

    visitorSchema

);

export default Visitor;
