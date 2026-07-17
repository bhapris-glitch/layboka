/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Visitor from "../../models/Visitor.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Analytics from "../../models/Analytics.js";
import Shop from "../../models/Shop.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

export const ANALYTICS_CONFIG = {

    CACHE_TTL: 300,

    DEFAULT_PERIOD: "30d",

    MAX_RANGE_DAYS: 365,

    REALTIME_WINDOW_MINUTES: 15,

    TOP_PRODUCTS_LIMIT: 10,

    TOP_PAGES_LIMIT: 20,

    DEFAULT_TIMEZONE: "UTC"

};

/*
|--------------------------------------------------------------------------
| Visitor Analytics
|--------------------------------------------------------------------------
*/

export async function getVisitorAnalytics(

    shopId,

    options = {}

) {

    const {

        startDate,

        endDate

    } = options;

    const filter = {

        shop: shopId

    };

    if (startDate || endDate) {

        filter.createdAt = {};

        if (startDate) {

            filter.createdAt.$gte =

                new Date(startDate);

        }

        if (endDate) {

            filter.createdAt.$lte =

                new Date(endDate);

        }

    }

    const [

        totalVisitors,

        onlineVisitors,

        returningVisitors,

        visitors

    ] = await Promise.all([

        Visitor.countDocuments(filter),

        Visitor.countDocuments({

            ...filter,

            online: true

        }),

        Visitor.countDocuments({

            ...filter,

            totalVisits: {

                $gt: 1

            }

        }),

        Visitor.find(filter)
            .select(
                "country device.type language totalSpent totalOrders"
            )
            .lean()

    ]);

    return {

        totalVisitors,

        onlineVisitors,

        returningVisitors,

        visitors

    };

}

/*
|--------------------------------------------------------------------------
| Conversation Analytics
|--------------------------------------------------------------------------
*/

export async function getConversationAnalytics(

    shopId,

    options = {}

) {

    const {

        startDate,

        endDate

    } = options;

    const filter = {

        shop: shopId,

        deleted: false

    };

    if (startDate || endDate) {

        filter.createdAt = {};

        if (startDate) {

            filter.createdAt.$gte =

                new Date(startDate);

        }

        if (endDate) {

            filter.createdAt.$lte =

                new Date(endDate);

        }

    }

    const [

        totalConversations,

        activeConversations,

        resolvedConversations,

        conversations

    ] = await Promise.all([

        Conversation.countDocuments(filter),

        Conversation.countDocuments({

            ...filter,

            status: "active"

        }),

        Conversation.countDocuments({

            ...filter,

            status: "resolved"

        }),

        Conversation.find(filter)
            .select(
                "status totalMessages aiMessages userMessages lastMessageAt"
            )
            .lean()

    ]);

    return {

        totalConversations,

        activeConversations,

        resolvedConversations,

        conversations

    };

}
/*
|--------------------------------------------------------------------------
| Record AI Analytics
|--------------------------------------------------------------------------
*/

export async function recordAIAnalytics({

    conversation,

    message,

    model,

    usage,

    responseTime

}) {

    if (!conversation) {

        return null;

    }

    conversation.apiCalls += 1;

    conversation.promptTokens +=

        usage?.prompt_tokens || 0;

    conversation.completionTokens +=

        usage?.completion_tokens || 0;

    conversation.totalTokens +=

        usage?.total_tokens || 0;

    conversation.lastResponseTime =

        responseTime;

    if (

        !conversation.firstResponseTime ||

        conversation.firstResponseTime === 0

    ) {

        conversation.firstResponseTime =

            responseTime;

    }

    conversation.averageResponseTime =

        calculateAverageResponseTime(

            conversation.averageResponseTime,

            conversation.apiCalls,

            responseTime

        );

    conversation.estimatedCost +=

        calculateOpenAICost({

            model,

            promptTokens:

                usage?.prompt_tokens || 0,

            completionTokens:

                usage?.completion_tokens || 0

        });

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Token Usage
|--------------------------------------------------------------------------
*/

export function calculateTokenUsage({

    promptTokens = 0,

    completionTokens = 0

}) {

    return {

        promptTokens,

        completionTokens,

        totalTokens:

            promptTokens +

            completionTokens

    };

}

/*
|--------------------------------------------------------------------------
| OpenAI Cost Calculation
|--------------------------------------------------------------------------
*/

export function calculateOpenAICost({

    model,

    promptTokens,

    completionTokens

}) {

    const pricing = {

        "gpt-4o-mini": {

            input: 0.15,

            output: 0.60

        },

        "gpt-5": {

            input: 1.25,

            output: 10.00

        }

    };

    const rate =

        pricing[model] ||

        pricing["gpt-4o-mini"];

    const inputCost =

        (promptTokens / 1000000) *

        rate.input;

    const outputCost =

        (completionTokens / 1000000) *

        rate.output;

    return Number(

        (

            inputCost +

            outputCost

        ).toFixed(6)

    );

}

/*
|--------------------------------------------------------------------------
| Response Time Analytics
|--------------------------------------------------------------------------
*/

export function calculateAverageResponseTime(

    currentAverage,

    totalRequests,

    latestResponse

) {

    if (totalRequests <= 1) {

        return latestResponse;

    }

    return Math.round(

        (

            (

                currentAverage *

                (totalRequests - 1)

            ) +

            latestResponse

        ) / totalRequests

    );

}

/*
|--------------------------------------------------------------------------
| Performance Grade
|--------------------------------------------------------------------------
*/

export function getPerformanceGrade(

    responseTime

) {

    if (responseTime <= 500)

        return "A+";

    if (responseTime <= 1000)

        return "A";

    if (responseTime <= 1500)

        return "B";

    if (responseTime <= 2500)

        return "C";

    return "D";

      }
/*
|--------------------------------------------------------------------------
| Revenue Analytics
|--------------------------------------------------------------------------
*/

export async function calculateRevenueAnalytics(

    shopId,

    startDate,

    endDate

) {

    const conversations = await Conversation.find({

        shop: shopId,

        createdAt: {

            $gte: startDate,

            $lte: endDate

        },

        deleted: false

    });

    let directRevenue = 0;
    let influencedRevenue = 0;
    let recoveredRevenue = 0;

    for (const conversation of conversations) {

        directRevenue +=
            conversation.aiRevenue?.directRevenue || 0;

        influencedRevenue +=
            conversation.aiRevenue?.influencedRevenue || 0;

        recoveredRevenue +=
            conversation.aiRevenue?.recoveredRevenue || 0;

    }

    return {

        directRevenue,

        influencedRevenue,

        recoveredRevenue,

        totalRevenue:

            directRevenue +

            influencedRevenue +

            recoveredRevenue

    };

}

/*
|--------------------------------------------------------------------------
| Shopify Order Attribution
|--------------------------------------------------------------------------
*/

export async function getOrderAttribution(

    shopId,

    startDate,

    endDate

) {

    const orders = await Order.find({

        shop: shopId,

        createdAt: {

            $gte: startDate,

            $lte: endDate

        }

    });

    const attributedOrders = orders.filter(

        order => order.aiAttributed === true

    );

    return {

        totalOrders: orders.length,

        aiAttributedOrders:

            attributedOrders.length,

        attributedRevenue:

            attributedOrders.reduce(

                (sum, order) =>

                    sum + (order.totalPrice || 0),

                0

            )

    };

}

/*
|--------------------------------------------------------------------------
| AI Conversion Metrics
|--------------------------------------------------------------------------
*/

export async function getAIConversionMetrics(

    shopId,

    startDate,

    endDate

) {

    const conversations = await Conversation.find({

        shop: shopId,

        createdAt: {

            $gte: startDate,

            $lte: endDate

        },

        deleted: false

    });

    const purchases = conversations.filter(

        conversation =>

            conversation.order?.purchased === true

    );

    const conversionRate =

        conversations.length === 0

            ? 0

            : (

                purchases.length /

                conversations.length

            ) * 100;

    return {

        totalConversations:

            conversations.length,

        purchases:

            purchases.length,

        conversionRate:

            Number(

                conversionRate.toFixed(2)

            )

    };

}

/*
|--------------------------------------------------------------------------
| Cart Recovery Analytics
|--------------------------------------------------------------------------
*/

export async function getCartRecoveryAnalytics(

    shopId,

    startDate,

    endDate

) {

    const conversations = await Conversation.find({

        shop: shopId,

        createdAt: {

            $gte: startDate,

            $lte: endDate

        },

        deleted: false

    });

    const attempted = conversations.filter(

        conversation =>

            conversation.cartRecovery?.attempted

    );

    const recovered = conversations.filter(

        conversation =>

            conversation.cartRecovery?.recovered

    );

    const recoveredRevenue = recovered.reduce(

        (sum, conversation) =>

            sum +

            (

                conversation.cartRecovery

                    ?.recoveredValue || 0

            ),

        0

    );

    return {

        attempts:

            attempted.length,

        recovered:

            recovered.length,

        recoveryRate:

            attempted.length === 0

                ? 0

                : Number(

                    (

                        recovered.length /

                        attempted.length

                    ) * 100

                .toFixed(2)

                ),

        recoveredRevenue

    };

}
/*
|--------------------------------------------------------------------------
| Product Recommendation Analytics
|--------------------------------------------------------------------------
*/

export async function getRecommendationAnalytics(

    shopId,

    startDate,

    endDate

) {

    const conversations = await Conversation.find({

        shop: shopId,

        createdAt: {

            $gte: startDate,

            $lte: endDate

        },

        deleted: false

    });

    let generated = 0;
    let clicked = 0;
    let purchased = 0;
    let revenue = 0;

    for (const conversation of conversations) {

        generated += conversation.recommendationsGenerated || 0;

        clicked += conversation.recommendationsClicked || 0;

        purchased += conversation.recommendationsPurchased || 0;

        revenue += conversation.aiRevenue?.directRevenue || 0;

    }

    return {

        recommendationsGenerated: generated,

        recommendationsClicked: clicked,

        recommendationsPurchased: purchased,

        clickThroughRate:

            generated > 0

                ? Number(

                    (

                        (clicked / generated) * 100

                    ).toFixed(2)

                )

                : 0,

        purchaseRate:

            generated > 0

                ? Number(

                    (

                        (purchased / generated) * 100

                    ).toFixed(2)

                )

                : 0,

        revenue

    };

}

/*
|--------------------------------------------------------------------------
| Widget Analytics
|--------------------------------------------------------------------------
*/

export async function getWidgetAnalytics(

    shopId

) {

    const visitors = await Visitor.find({

        shop: shopId

    });

    let widgetLoads = 0;
    let widgetOpens = 0;
    let widgetCloses = 0;
    let totalSessions = 0;
    let messages = 0;

    for (const visitor of visitors) {

        widgetLoads += visitor.analytics?.widgetLoads || 0;

        widgetOpens += visitor.analytics?.widgetOpens || 0;

        widgetCloses += visitor.analytics?.widgetCloses || 0;

        totalSessions += visitor.analytics?.totalSessions || 0;

        messages += visitor.analytics?.messages || 0;

    }

    return {

        widgetLoads,

        widgetOpens,

        widgetCloses,

        totalSessions,

        totalMessages: messages,

        openRate:

            widgetLoads > 0

                ? Number(

                    (

                        (widgetOpens /

                            widgetLoads) *

                        100

                    ).toFixed(2)

                )

                : 0

    };

}

/*
|--------------------------------------------------------------------------
| Customer Engagement
|--------------------------------------------------------------------------
*/

export async function getCustomerEngagement(

    shopId

) {

    const conversations = await Conversation.find({

        shop: shopId,

        deleted: false

    });

    const visitors = await Visitor.countDocuments({

        shop: shopId

    });

    const activeConversations = conversations.filter(

        (conversation) =>

            conversation.status === "active"

    ).length;

    const averageMessages =

        conversations.length > 0

            ? Number(

                (

                    conversations.reduce(

                        (total, conversation) =>

                            total +

                            (conversation.totalMessages || 0),

                        0

                    ) /

                    conversations.length

                ).toFixed(2)

            )

            : 0;

    return {

        totalVisitors: visitors,

        conversations:

            conversations.length,

        activeConversations,

        averageMessagesPerConversation:

            averageMessages,

        engagementRate:

            visitors > 0

                ? Number(

                    (

                        (conversations.length /

                            visitors) *

                        100

                    ).toFixed(2)

                )

                : 0

    };

}

/*
|--------------------------------------------------------------------------
| Dashboard KPIs
|--------------------------------------------------------------------------
*/

export async function getDashboardKPIs(

    shopId

) {

    const [

        revenue,

        conversationStats,

        recommendationStats,

        widgetStats,

        engagementStats

    ] = await Promise.all([

        getRevenueAnalytics(shopId),

        getConversationAnalytics(shopId),

        getRecommendationAnalytics(

            shopId,

            new Date(0),

            new Date()

        ),

        getWidgetAnalytics(shopId),

        getCustomerEngagement(shopId)

    ]);

    return {

        revenue,

        conversations: conversationStats,

        recommendations:

            recommendationStats,

        widget: widgetStats,

        engagement:

            engagementStats,

        generatedAt:

            new Date()

    };

}
/*
|--------------------------------------------------------------------------
| Date Range Report
|--------------------------------------------------------------------------
*/

export async function getDateRangeReport(

    shopId,

    startDate,

    endDate

) {

    const analytics = await Analytics.find({

        shop: shopId,

        date: {

            $gte: new Date(startDate),

            $lte: new Date(endDate)

        }

    }).sort({

        date: 1

    });

    return analytics;

}

/*
|--------------------------------------------------------------------------
| Daily Summary
|--------------------------------------------------------------------------
*/

export async function getDailySummary(

    shopId,

    date = new Date()

) {

    const start = new Date(date);

    start.setHours(0, 0, 0, 0);

    const end = new Date(date);

    end.setHours(23, 59, 59, 999);

    return getDateRangeReport(

        shopId,

        start,

        end

    );

}

/*
|--------------------------------------------------------------------------
| Weekly Summary
|--------------------------------------------------------------------------
*/

export async function getWeeklySummary(

    shopId

) {

    const end = new Date();

    const start = new Date();

    start.setDate(

        end.getDate() - 7

    );

    return getDateRangeReport(

        shopId,

        start,

        end

    );

}

/*
|--------------------------------------------------------------------------
| Monthly Summary
|--------------------------------------------------------------------------
*/

export async function getMonthlySummary(

    shopId

) {

    const end = new Date();

    const start = new Date();

    start.setMonth(

        end.getMonth() - 1

    );

    return getDateRangeReport(

        shopId,

        start,

        end

    );

}

/*
|--------------------------------------------------------------------------
| Export Analytics
|--------------------------------------------------------------------------
*/

export function exportAnalyticsJSON(

    analytics

) {

    return JSON.stringify(

        analytics,

        null,

        2

    );

}

export function exportAnalyticsCSV(

    analytics

) {

    if (!analytics.length) {

        return "";

    }

    const headers = Object.keys(

        analytics[0].toObject()

    );

    const rows = analytics.map(

        (record) =>

            headers

                .map(

                    (key) =>

                        JSON.stringify(

                            record[key] ?? ""

                        )

                )

                .join(",")

    );

    return [

        headers.join(","),

        ...rows

    ].join("\n");

}

/*
|--------------------------------------------------------------------------
| Analytics Service
|--------------------------------------------------------------------------
*/

export const AnalyticsService = {

    incrementMessages,

    incrementVisitors,

    incrementConversations,

    incrementOrders,

    incrementRevenue,

    updateTokenUsage,

    updateResponseTime,

    updateRecommendationMetrics,

    getDashboardAnalytics,

    getConversionAnalytics,

    getRevenueAnalytics,

    getDateRangeReport,

    getDailySummary,

    getWeeklySummary,

    getMonthlySummary,

    exportAnalyticsJSON,

    exportAnalyticsCSV

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default AnalyticsService;
