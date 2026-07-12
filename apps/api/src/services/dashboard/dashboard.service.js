import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Visitor from "../../models/Visitor.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Analytics from "../../models/Analytics.js";

const DEFAULT_DAYS = 30;

/*
|--------------------------------------------------------------------------
| Date Range Helper
|--------------------------------------------------------------------------
*/

function getDateRange(days = DEFAULT_DAYS) {

    const endDate = new Date();

    const startDate = new Date();

    startDate.setDate(

        endDate.getDate() - days

    );

    return {

        startDate,

        endDate

    };

}

/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/

export async function getDashboardSummary(

    shopId,

    days = DEFAULT_DAYS

) {

    const {

        startDate,

        endDate

    } = getDateRange(days);

    const [

        totalVisitors,

        totalConversations,

        totalMessages,

        totalOrders

    ] = await Promise.all([

        Visitor.countDocuments({

            shop: shopId,

            createdAt: {

                $gte: startDate,

                $lte: endDate

            }

        }),

        Conversation.countDocuments({

            shop: shopId,

            createdAt: {

                $gte: startDate,

                $lte: endDate

            }

        }),

        Message.countDocuments({

            shop: shopId,

            createdAt: {

                $gte: startDate,

                $lte: endDate

            }

        }),

        Order.countDocuments({

            shop: shopId,

            createdAt: {

                $gte: startDate,

                $lte: endDate

            }

        })

    ]);

    return {

        totalVisitors,

        totalConversations,

        totalMessages,

        totalOrders

    };

}

/*
|--------------------------------------------------------------------------
| KPI Overview
|--------------------------------------------------------------------------
*/

export async function getKPIOverview(

    shopId,

    days = DEFAULT_DAYS

) {

    const {

        startDate,

        endDate

    } = getDateRange(days);

    const revenue = await Order.aggregate([

        {

            $match: {

                shop: shopId,

                createdAt: {

                    $gte: startDate,

                    $lte: endDate

                }

            }

        },

        {

            $group: {

                _id: null,

                revenue: {

                    $sum: "$total"

                },

                orders: {

                    $sum: 1

                }

            }

        }

    ]);

    return {

        revenue:

            revenue[0]?.revenue || 0,

        orders:

            revenue[0]?.orders || 0

    };

}
/*
|--------------------------------------------------------------------------
| Revenue Dashboard
|--------------------------------------------------------------------------
*/

export async function getRevenueMetrics(

    shopId,

    startDate,

    endDate

) {

    const revenue = await Order.aggregate([

        {
            $match: {

                shop: shopId,

                createdAt: {

                    $gte: startDate,

                    $lte: endDate

                },

                deleted: false

            }

        },

        {
            $group: {

                _id: null,

                totalRevenue: {

                    $sum: "$total"

                },

                totalOrders: {

                    $sum: 1

                },

                averageOrderValue: {

                    $avg: "$total"

                },

                aiRevenue: {

                    $sum: "$aiRevenue.directRevenue"

                }

            }

        }

    ]);

    return revenue[0] || {

        totalRevenue: 0,

        totalOrders: 0,

        averageOrderValue: 0,

        aiRevenue: 0

    };

}

/*
|--------------------------------------------------------------------------
| AI Usage Metrics
|--------------------------------------------------------------------------
*/

export async function getAIUsageMetrics(

    shopId,

    startDate,

    endDate

) {

    const usage = await Conversation.aggregate([

        {

            $match: {

                shop: shopId,

                createdAt: {

                    $gte: startDate,

                    $lte: endDate

                },

                deleted: false

            }

        },

        {

            $group: {

                _id: null,

                conversations: {

                    $sum: 1

                },

                messages: {

                    $sum: "$totalMessages"

                },

                promptTokens: {

                    $sum: "$promptTokens"

                },

                completionTokens: {

                    $sum: "$completionTokens"

                },

                totalTokens: {

                    $sum: "$totalTokens"

                },

                estimatedCost: {

                    $sum: "$estimatedCost"

                }

            }

        }

    ]);

    return usage[0] || {

        conversations: 0,

        messages: 0,

        promptTokens: 0,

        completionTokens: 0,

        totalTokens: 0,

        estimatedCost: 0

    };

}

/*
|--------------------------------------------------------------------------
| Visitor Metrics
|--------------------------------------------------------------------------
*/

export async function getVisitorMetrics(

    shopId,

    startDate,

    endDate

) {

    const visitors = await Visitor.aggregate([

        {

            $match: {

                shop: shopId,

                createdAt: {

                    $gte: startDate,

                    $lte: endDate

                },

                deleted: false

            }

        },

        {

            $group: {

                _id: null,

                totalVisitors: {

                    $sum: 1

                },

                returningVisitors: {

                    $sum: {

                        $cond: [

                            {

                                $gt: [

                                    "$totalVisits",

                                    1

                                ]

                            },

                            1,

                            0

                        ]

                    }

                },

                onlineVisitors: {

                    $sum: {

                        $cond: [

                            "$isOnline",

                            1,

                            0

                        ]

                    }

                }

            }

        }

    ]);

    return visitors[0] || {

        totalVisitors: 0,

        returningVisitors: 0,

        onlineVisitors: 0

    };

      }
/*
|--------------------------------------------------------------------------
| Revenue Analytics
|--------------------------------------------------------------------------
*/

export async function getRevenueAnalytics(

    shopId,

    startDate,

    endDate

) {

    const orders = await Order.find({

        shop: shopId,

        createdAt: {

            $gte: startDate,

            $lte: endDate

        },

        deleted: false

    });

    const analytics = {

        totalRevenue: 0,

        aiRevenue: 0,

        recoveredRevenue: 0,

        averageOrderValue: 0,

        totalOrders: orders.length

    };

    for (const order of orders) {

        analytics.totalRevenue += order.totalPrice || 0;

        analytics.aiRevenue +=

            order.aiAttributedRevenue || 0;

        analytics.recoveredRevenue +=

            order.recoveredRevenue || 0;

    }

    analytics.averageOrderValue =

        analytics.totalOrders > 0

            ? analytics.totalRevenue /

              analytics.totalOrders

            : 0;

    return analytics;

}

/*
|--------------------------------------------------------------------------
| AI Usage Analytics
|--------------------------------------------------------------------------
*/

export async function getAIUsageAnalytics(

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

    let totalPromptTokens = 0;

    let totalCompletionTokens = 0;

    let totalTokens = 0;

    let totalCost = 0;

    let apiCalls = 0;

    conversations.forEach((conversation) => {

        totalPromptTokens +=

            conversation.promptTokens || 0;

        totalCompletionTokens +=

            conversation.completionTokens || 0;

        totalTokens +=

            conversation.totalTokens || 0;

        totalCost +=

            conversation.estimatedCost || 0;

        apiCalls +=

            conversation.apiCalls || 0;

    });

    return {

        conversations:

            conversations.length,

        apiCalls,

        promptTokens:

            totalPromptTokens,

        completionTokens:

            totalCompletionTokens,

        totalTokens,

        estimatedCost:

            totalCost

    };

}

/*
|--------------------------------------------------------------------------
| Top Recommended Products
|--------------------------------------------------------------------------
*/

export async function getTopProducts(

    shopId,

    limit = 10

) {

    return Product.find({

        shop: shopId,

        deleted: false

    })

    .sort({

        aiRecommendationScore: -1,

        totalSales: -1

    })

    .limit(limit)

    .select(

        "title image price totalSales aiRecommendationScore"

    );

}

/*
|--------------------------------------------------------------------------
| Recent Conversations
|--------------------------------------------------------------------------
*/

export async function getRecentConversations(

    shopId,

    limit = 10

) {

    return Conversation.find({

        shop: shopId,

        deleted: false

    })

    .populate(

        "visitor",

        "customerName customerEmail"

    )

    .sort({

        updatedAt: -1

    })

    .limit(limit)

    .select(

        "conversationId status customerStage detectedIntent lastMessageAt totalMessages"

    );

}
/*
|--------------------------------------------------------------------------
| Build Dashboard Summary
|--------------------------------------------------------------------------
*/

export async function buildDashboardSummary(

    shopId,

    startDate,

    endDate

) {

    const [

        overview,

        revenue,

        conversations,

        visitors,

        products,

        subscription

    ] = await Promise.all([

        getOverviewMetrics(

            shopId,

            startDate,

            endDate

        ),

        getRevenueMetrics(

            shopId,

            startDate,

            endDate

        ),

        getConversationMetrics(

            shopId,

            startDate,

            endDate

        ),

        getVisitorMetrics(

            shopId,

            startDate,

            endDate

        ),

        getTopProducts(

            shopId,

            startDate,

            endDate

        ),

        getSubscriptionMetrics(

            shopId

        )

    ]);

    return {

        generatedAt: new Date(),

        period: {

            startDate,

            endDate

        },

        overview,

        revenue,

        conversations,

        visitors,

        products,

        subscription

    };

}

/*
|--------------------------------------------------------------------------
| Dashboard Service
|--------------------------------------------------------------------------
*/

export const DashboardService = {

    getOverviewMetrics,

    getRevenueMetrics,

    getConversationMetrics,

    getVisitorMetrics,

    getTopProducts,

    getRevenueChart,

    getConversationChart,

    getVisitorChart,

    getSalesFunnel,

    getRecentOrders,

    getRecentConversations,

    getRecentVisitors,

    getTopPerformingProducts,

    getSubscriptionMetrics,

    buildDashboardSummary

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default DashboardService;
