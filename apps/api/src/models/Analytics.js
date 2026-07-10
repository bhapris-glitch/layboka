import mongoose from "mongoose";

const { Schema } = mongoose;

const analyticsSchema = new Schema(
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

    merchant: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    subscription: {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
        default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Analytics Identity
    |--------------------------------------------------------------------------
    */

    analyticsId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },

    reportName: {
        type: String,
        default: "Store Analytics",
        maxlength: 200,
        trim: true
    },

    reportType: {
        type: String,
        enum: [
            "hourly",
            "daily",
            "weekly",
            "monthly",
            "yearly",
            "custom"
        ],
        default: "daily",
        index: true
    },

    /*
    |--------------------------------------------------------------------------
    | Time Period
    |--------------------------------------------------------------------------
    */

    date: {
        type: Date,
        required: true,
        index: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    timezone: {
        type: String,
        default: "UTC"
    },

    /*
    |--------------------------------------------------------------------------
    | Visitor Metrics
    |--------------------------------------------------------------------------
    */

    visitors: {

        totalVisitors: {
            type: Number,
            default: 0,
            min: 0
        },

        uniqueVisitors: {
            type: Number,
            default: 0,
            min: 0
        },

        newVisitors: {
            type: Number,
            default: 0,
            min: 0
        },

        returningVisitors: {
            type: Number,
            default: 0,
            min: 0
        },

        anonymousVisitors: {
            type: Number,
            default: 0,
            min: 0
        },

        registeredVisitors: {
            type: Number,
            default: 0,
            min: 0
        },

        bouncedVisitors: {
            type: Number,
            default: 0,
            min: 0
        },

        averageSessionDuration: {
            type: Number,
            default: 0
        },

        averagePagesViewed: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Conversation Metrics
    |--------------------------------------------------------------------------
    */

    conversations: {

        total: {
            type: Number,
            default: 0
        },

        active: {
            type: Number,
            default: 0
        },

        resolved: {
            type: Number,
            default: 0
        },

        closed: {
            type: Number,
            default: 0
        },

        humanHandoffs: {
            type: Number,
            default: 0
        },

        averageMessages: {
            type: Number,
            default: 0
        },

        averageConversationTime: {
            type: Number,
            default: 0
        },

        averageFirstResponseTime: {
            type: Number,
            default: 0
        },

        customerSatisfaction: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        }

    },
      /*
    |--------------------------------------------------------------------------
    | AI Sales Executive Metrics
    |--------------------------------------------------------------------------
    */

    aiExecutive: {

        totalResponses: {
            type: Number,
            default: 0,
            min: 0
        },

        successfulResponses: {
            type: Number,
            default: 0,
            min: 0
        },

        fallbackResponses: {
            type: Number,
            default: 0,
            min: 0
        },

        humanEscalations: {
            type: Number,
            default: 0,
            min: 0
        },

        recommendationsGenerated: {
            type: Number,
            default: 0,
            min: 0
        },

        recommendationsClicked: {
            type: Number,
            default: 0,
            min: 0
        },

        recommendationsPurchased: {
            type: Number,
            default: 0,
            min: 0
        },

        cartsRecovered: {
            type: Number,
            default: 0,
            min: 0
        },

        ordersInfluenced: {
            type: Number,
            default: 0,
            min: 0
        },

        aiConversionRate: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | OpenAI / GPT Usage
    |--------------------------------------------------------------------------
    */

    aiUsage: {

        provider: {
            type: String,
            enum: [
                "openai"
            ],
            default: "openai"
        },

        gpt4oMiniRequests: {
            type: Number,
            default: 0
        },

        gpt5Requests: {
            type: Number,
            default: 0
        },

        totalRequests: {
            type: Number,
            default: 0
        },

        successfulRequests: {
            type: Number,
            default: 0
        },

        failedRequests: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Token Usage
    |--------------------------------------------------------------------------
    */

    tokenUsage: {

        promptTokens: {
            type: Number,
            default: 0
        },

        completionTokens: {
            type: Number,
            default: 0
        },

        totalTokens: {
            type: Number,
            default: 0
        },

        averageTokensPerConversation: {
            type: Number,
            default: 0
        },

        averageTokensPerMessage: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | AI Cost Tracking
    |--------------------------------------------------------------------------
    */

    cost: {

        inputCost: {
            type: Number,
            default: 0
        },

        outputCost: {
            type: Number,
            default: 0
        },

        totalCost: {
            type: Number,
            default: 0
        },

        estimatedProfit: {
            type: Number,
            default: 0
        },

        averageCostPerConversation: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | AI Response Performance
    |--------------------------------------------------------------------------
    */

    responsePerformance: {

        averageResponseTime: {
            type: Number,
            default: 0
        },

        fastestResponse: {
            type: Number,
            default: 0
        },

        slowestResponse: {
            type: Number,
            default: 0
        },

        averageConfidenceScore: {
            type: Number,
            default: 0
        },

        averageSentimentScore: {
            type: Number,
            default: 0
        },

        averageCustomerRating: {
            type: Number,
            default: 0
        }

    },
      /*
    |--------------------------------------------------------------------------
    | Product Analytics
    |--------------------------------------------------------------------------
    */

    products: {

        totalProducts: {
            type: Number,
            default: 0
        },

        productsViewed: {
            type: Number,
            default: 0
        },

        uniqueProductsViewed: {
            type: Number,
            default: 0
        },

        aiRecommendedProducts: {
            type: Number,
            default: 0
        },

        topViewedProduct: {
            type: String,
            default: ""
        },

        topRecommendedProduct: {
            type: String,
            default: ""
        },

        averageProductsViewed: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Recommendation Analytics
    |--------------------------------------------------------------------------
    */

    recommendations: {

        generated: {
            type: Number,
            default: 0
        },

        displayed: {
            type: Number,
            default: 0
        },

        clicked: {
            type: Number,
            default: 0
        },

        addedToCart: {
            type: Number,
            default: 0
        },

        purchased: {
            type: Number,
            default: 0
        },

        clickThroughRate: {
            type: Number,
            default: 0
        },

        purchaseRate: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Upsell Analytics
    |--------------------------------------------------------------------------
    */

    upsell: {

        offered: {
            type: Number,
            default: 0
        },

        accepted: {
            type: Number,
            default: 0
        },

        rejected: {
            type: Number,
            default: 0
        },

        revenue: {
            type: Number,
            default: 0
        },

        acceptanceRate: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Cross-Sell Analytics
    |--------------------------------------------------------------------------
    */

    crossSell: {

        offered: {
            type: Number,
            default: 0
        },

        accepted: {
            type: Number,
            default: 0
        },

        rejected: {
            type: Number,
            default: 0
        },

        revenue: {
            type: Number,
            default: 0
        },

        acceptanceRate: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Cart Recovery Analytics
    |--------------------------------------------------------------------------
    */

    cartRecovery: {

        abandonedCarts: {
            type: Number,
            default: 0
        },

        recoveryAttempts: {
            type: Number,
            default: 0
        },

        recoveredCarts: {
            type: Number,
            default: 0
        },

        recoveryRate: {
            type: Number,
            default: 0
        },

        abandonedCartValue: {
            type: Number,
            default: 0
        },

        recoveredRevenue: {
            type: Number,
            default: 0
        },

        averageRecoveredValue: {
            type: Number,
            default: 0
        }

    },
      /*
    |--------------------------------------------------------------------------
    | Revenue Analytics
    |--------------------------------------------------------------------------
    */

    revenue: {

        grossRevenue: {
            type: Number,
            default: 0
        },

        netRevenue: {
            type: Number,
            default: 0
        },

        aiGeneratedRevenue: {
            type: Number,
            default: 0
        },

        aiInfluencedRevenue: {
            type: Number,
            default: 0
        },

        recoveredRevenue: {
            type: Number,
            default: 0
        },

        upsellRevenue: {
            type: Number,
            default: 0
        },

        crossSellRevenue: {
            type: Number,
            default: 0
        },

        averageOrderValue: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Order Analytics
    |--------------------------------------------------------------------------
    */

    orders: {

        totalOrders: {
            type: Number,
            default: 0
        },

        completedOrders: {
            type: Number,
            default: 0
        },

        cancelledOrders: {
            type: Number,
            default: 0
        },

        refundedOrders: {
            type: Number,
            default: 0
        },

        aiAssistedOrders: {
            type: Number,
            default: 0
        },

        averageItemsPerOrder: {
            type: Number,
            default: 0
        },

        averageOrderProcessingTime: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Customer Analytics
    |--------------------------------------------------------------------------
    */

    customers: {

        newCustomers: {
            type: Number,
            default: 0
        },

        returningCustomers: {
            type: Number,
            default: 0
        },

        repeatPurchaseRate: {
            type: Number,
            default: 0
        },

        customerLifetimeValue: {
            type: Number,
            default: 0
        },

        averageCustomerRating: {
            type: Number,
            default: 0
        },

        averageConversationPerCustomer: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Conversion Metrics
    |--------------------------------------------------------------------------
    */

    conversion: {

        visitorToConversation: {
            type: Number,
            default: 0
        },

        conversationToCart: {
            type: Number,
            default: 0
        },

        cartToCheckout: {
            type: Number,
            default: 0
        },

        checkoutToPurchase: {
            type: Number,
            default: 0
        },

        visitorToPurchase: {
            type: Number,
            default: 0
        },

        aiConversionRate: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Marketing Attribution
    |--------------------------------------------------------------------------
    */

    marketing: {

        organicTraffic: {
            type: Number,
            default: 0
        },

        directTraffic: {
            type: Number,
            default: 0
        },

        paidTraffic: {
            type: Number,
            default: 0
        },

        socialTraffic: {
            type: Number,
            default: 0
        },

        emailTraffic: {
            type: Number,
            default: 0
        },

        referralTraffic: {
            type: Number,
            default: 0
        },

        topCampaign: {
            type: String,
            default: ""
        },

        topSource: {
            type: String,
            default: ""
        }

    },
      /*
    |--------------------------------------------------------------------------
    | Performance Metrics
    |--------------------------------------------------------------------------
    */

    performance: {

        averageApiLatency: {
            type: Number,
            default: 0
        },

        uptimePercentage: {
            type: Number,
            default: 100
        },

        successfulApiCalls: {
            type: Number,
            default: 0
        },

        failedApiCalls: {
            type: Number,
            default: 0
        },

        timeoutRequests: {
            type: Number,
            default: 0
        },

        averageDatabaseQueryTime: {
            type: Number,
            default: 0
        },

        cacheHitRate: {
            type: Number,
            default: 0
        },

        averageMemoryUsage: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Device Analytics
    |--------------------------------------------------------------------------
    */

    devices: {

        desktop: {
            type: Number,
            default: 0
        },

        mobile: {
            type: Number,
            default: 0
        },

        tablet: {
            type: Number,
            default: 0
        },

        bot: {
            type: Number,
            default: 0
        },

        chrome: {
            type: Number,
            default: 0
        },

        safari: {
            type: Number,
            default: 0
        },

        firefox: {
            type: Number,
            default: 0
        },

        edge: {
            type: Number,
            default: 0
        },

        otherBrowsers: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Geographic Analytics
    |--------------------------------------------------------------------------
    */

    geography: {

        topCountry: {
            type: String,
            default: ""
        },

        topState: {
            type: String,
            default: ""
        },

        topCity: {
            type: String,
            default: ""
        },

        countries: [{
            country: String,
            visitors: Number,
            revenue: Number
        }]

    },

    /*
    |--------------------------------------------------------------------------
    | Metadata
    |--------------------------------------------------------------------------
    */

    metadata: {

        generatedBy: {
            type: String,
            default: "Layboka AI"
        },

        version: {
            type: String,
            default: "1.0.0"
        },

        notes: {
            type: String,
            default: ""
        },

        custom: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {}
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Soft Delete
    |--------------------------------------------------------------------------
    */

    archived: {
        type: Boolean,
        default: false,
        index: true
    },

    archivedAt: {
        type: Date,
        default: null
    },

    deleted: {
        type: Boolean,
        default: false,
        index: true
    },

    deletedAt: {
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
| Database Indexes
|--------------------------------------------------------------------------
*/

analyticsSchema.index({
    shop: 1,
    date: -1
});

analyticsSchema.index({
    merchant: 1,
    date: -1
});

analyticsSchema.index({
    subscription: 1
});

analyticsSchema.index({
    reportType: 1,
    date: -1
});

analyticsSchema.index({
    startDate: 1,
    endDate: 1
});

analyticsSchema.index({
    analyticsId: 1
});

analyticsSchema.index({
    archived: 1,
    deleted: 1
});

analyticsSchema.index({
    "revenue.grossRevenue": -1
});

analyticsSchema.index({
    "orders.totalOrders": -1
});

analyticsSchema.index({
    "customers.customerLifetimeValue": -1
});

analyticsSchema.index({
    "conversion.aiConversionRate": -1
});
/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

analyticsSchema.virtual("isArchived").get(function () {
    return this.archived;
});

analyticsSchema.virtual("isDeleted").get(function () {
    return this.deleted;
});

analyticsSchema.virtual("reportDurationDays").get(function () {

    if (!this.startDate || !this.endDate) {
        return 0;
    }

    const diff =
        this.endDate.getTime() - this.startDate.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));

});

analyticsSchema.virtual("totalAiRevenue").get(function () {

    return (
        (this.revenue.aiGeneratedRevenue || 0) +
        (this.revenue.aiInfluencedRevenue || 0)
    );

});

analyticsSchema.virtual("totalRecoveredRevenue").get(function () {

    return (
        (this.cartRecovery.recoveredRevenue || 0) +
        (this.revenue.recoveredRevenue || 0)
    );

});

/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

analyticsSchema.methods.archive = async function () {

    this.archived = true;
    this.archivedAt = new Date();

    return this.save();

};

analyticsSchema.methods.restore = async function () {

    this.archived = false;
    this.archivedAt = null;

    return this.save();

};

analyticsSchema.methods.softDelete = async function () {

    this.deleted = true;
    this.deletedAt = new Date();

    return this.save();

};

analyticsSchema.methods.restoreDeleted = async function () {

    this.deleted = false;
    this.deletedAt = null;

    return this.save();

};

analyticsSchema.methods.calculateTotalRevenue = function () {

    return (
        (this.revenue.grossRevenue || 0) +
        (this.revenue.recoveredRevenue || 0) +
        (this.revenue.upsellRevenue || 0) +
        (this.revenue.crossSellRevenue || 0)
    );

};

analyticsSchema.methods.calculateTotalTokenCost = function () {

    return this.cost.totalCost || 0;

};

/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

analyticsSchema.statics.findByShop = function (shopId) {

    return this.find({
        shop: shopId,
        deleted: false
    }).sort({
        date: -1
    });

};

analyticsSchema.statics.findDaily = function (shopId) {

    return this.find({
        shop: shopId,
        reportType: "daily",
        deleted: false
    }).sort({
        date: -1
    });

};

analyticsSchema.statics.findMonthly = function (shopId) {

    return this.find({
        shop: shopId,
        reportType: "monthly",
        deleted: false
    }).sort({
        date: -1
    });

};

analyticsSchema.statics.findBetweenDates = function (
    shopId,
    startDate,
    endDate
) {

    return this.find({

        shop: shopId,

        date: {
            $gte: startDate,
            $lte: endDate
        },

        deleted: false

    }).sort({
        date: 1
    });

};

/*
|--------------------------------------------------------------------------
| Pre Save Middleware
|--------------------------------------------------------------------------
*/

analyticsSchema.pre("save", function (next) {

    this.cost.totalCost =
        (this.cost.inputCost || 0) +
        (this.cost.outputCost || 0);

    this.aiUsage.totalRequests =
        (this.aiUsage.gpt4oMiniRequests || 0) +
        (this.aiUsage.gpt5Requests || 0);

    next();

});

/*
|--------------------------------------------------------------------------
| JSON / Object Transform
|--------------------------------------------------------------------------
*/

analyticsSchema.set("toJSON", {

    virtuals: true,

    transform(doc, ret) {

        delete ret.__v;

        return ret;

    }

});

analyticsSchema.set("toObject", {

    virtuals: true

});

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

const Analytics =
    mongoose.models.Analytics ||
    mongoose.model(
        "Analytics",
        analyticsSchema
    );

export default Analytics;
