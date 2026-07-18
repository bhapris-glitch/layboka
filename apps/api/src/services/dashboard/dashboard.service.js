/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Shop from "../../models/shop.model.js";

import Conversation from "../../models/conversation.model.js";

import Payment from "../../models/payment.model.js";

import Subscription from "../../models/subscription.model.js";

import Analytics from "../../models/analytics.model.js";

import Notification from "../../models/notification.model.js";


/*
|--------------------------------------------------------------------------
| Dashboard Helpers
|--------------------------------------------------------------------------
*/

async function findShop(

    shopId

) {

    const shop =

        await Shop.findById(

            shopId

        );

    if (

        !shop

    ) {

        throw new Error(

            "Shop not found."

        );

    }

    return shop;

}


function percentageChange(

    current,

    previous

) {

    if (

        previous === 0

    ) {

        return current > 0

            ? 100

            : 0;

    }

    return Number(

        (

            (

                (

                    current -

                    previous

                ) /

                previous

            ) *

            100

        ).toFixed(

            2

        )

    );

}


function formatCurrency(

    amount = 0

) {

    return Number(

        amount.toFixed(

            2

        )

    );

}


/*
|--------------------------------------------------------------------------
| Dashboard KPI Mapper
|--------------------------------------------------------------------------
*/

function mapDashboardKPIs(

    data

) {

    return {

        revenue:

            formatCurrency(

                data.revenue || 0

            ),

        conversations:

            data.conversations || 0,

        visitors:

            data.visitors || 0,

        conversions:

            data.conversions || 0,

        conversionRate:

            data.conversionRate || 0,

        orders:

            data.orders || 0,

        unreadNotifications:

            data.unreadNotifications || 0,

        activePlan:

            data.activePlan || "Trial",

        trialRemaining:

            data.trialRemaining || 0

    };

}
/*
|--------------------------------------------------------------------------
| Dashboard Overview
|--------------------------------------------------------------------------
*/

async function getDashboardOverview(

    shopId

) {

    const shop = await findShop(

        shopId

    );

    const [

        conversations,

        visitors,

        notifications,

        revenue,

        subscription

    ] = await Promise.all([

        Conversation.countDocuments({

            shop: shopId

        }),

        Analytics.countDocuments({

            shop: shopId

        }),

        Notification.countDocuments({

            shop: shopId,

            isRead: false

        }),

        Payment.aggregate([

            {

                $match: {

                    shop: shop._id,

                    status: "paid"

                }

            },

            {

                $group: {

                    _id: null,

                    revenue: {

                        $sum: "$amount"

                    }

                }

            }

        ]),

        Subscription.findOne({

            shop: shop._id,

            status: "active"

        })

    ]);

    return mapDashboardKPIs({

        revenue:

            revenue[0]?.revenue || 0,

        conversations,

        visitors,

        unreadNotifications:

            notifications,

        activePlan:

            subscription?.plan ||

            "Trial",

        trialRemaining:

            shop.trialDaysRemaining || 0

    });

}


/*
|--------------------------------------------------------------------------
| Revenue Summary
|--------------------------------------------------------------------------
*/

async function getRevenueSummary(

    shopId

) {

    await findShop(

        shopId

    );

    const revenue = await Payment.aggregate([

        {

            $match: {

                shop: shopId,

                status: "paid"

            }

        },

        {

            $group: {

                _id: null,

                totalRevenue: {

                    $sum: "$amount"

                },

                totalPayments: {

                    $sum: 1

                },

                averagePayment: {

                    $avg: "$amount"

                }

            }

        }

    ]);

    return revenue[0] || {

        totalRevenue: 0,

        totalPayments: 0,

        averagePayment: 0

    };

}


/*
|--------------------------------------------------------------------------
| Subscription Summary
|--------------------------------------------------------------------------
*/

async function getSubscriptionSummary(

    shopId

) {

    await findShop(

        shopId

    );

    const subscription =

        await Subscription.findOne({

            shop: shopId

        });

    if (

        !subscription

    ) {

        return {

            status: "trial",

            plan: "Free Trial",

            expiresAt: null

        };

    }

    return subscription;

}


/*
|--------------------------------------------------------------------------
| Trial Summary
|--------------------------------------------------------------------------
*/

async function getTrialSummary(

    shopId

) {

    const shop = await findShop(

        shopId

    );

    return {

        isTrial:

            shop.isTrial,

        trialStartedAt:

            shop.trialStartedAt,

        trialEndsAt:

            shop.trialEndsAt,

        daysRemaining:

            shop.trialDaysRemaining,

        expired:

            shop.trialExpired

    };

        }
/*
|--------------------------------------------------------------------------
| AI Sales Executive Settings
|--------------------------------------------------------------------------
*/

async function getSalesExecutiveSettings(

    shopId

) {

    const shop = await findShop(

        shopId

    );

    return {

        salesExecutiveName:

            shop.salesExecutiveName ||

            "Emma",

        avatar:

            shop.salesExecutiveAvatar ||

            "/assets/avatars/emma.png",

        avatarType:

            shop.avatarType ||

            "female",

        onlineStatus:

            shop.onlineStatus ||

            "online",

        language:

            shop.language ||

            "en",

        tone:

            shop.aiTone ||

            "professional",

        typingSpeed:

            shop.typingSpeed ||

            "normal"

    };

}


/*
|--------------------------------------------------------------------------
| Chatbot Appearance
|--------------------------------------------------------------------------
*/

async function getChatbotAppearance(

    shopId

) {

    const shop = await findShop(

        shopId

    );

    return {

        storeName:

            shop.storeName,

        chatbotHeader:

            shop.chatbotHeader ||

            shop.storeName,

        themeColor:

            shop.themeColor ||

            "#FF3B2F",

        headerColor:

            shop.headerColor ||

            "#1E3928",

        textColor:

            shop.textColor ||

            "#FFFFFF",

        borderRadius:

            shop.borderRadius ||

            16,

        chatPosition:

            shop.chatPosition ||

            "right",

        fontFamily:

            shop.fontFamily ||

            "Inter"

    };

}


/*
|--------------------------------------------------------------------------
| Branding Settings
|--------------------------------------------------------------------------
*/

async function getBrandingSettings(

    shopId

) {

    const shop = await findShop(

        shopId

    );

    return {

        logo:

            shop.logo ||

            "",

        favicon:

            shop.favicon ||

            "",

        companyName:

            shop.companyName ||

            shop.storeName,

        supportEmail:

            shop.supportEmail ||

            "",

        supportPhone:

            shop.supportPhone ||

            "",

        website:

            shop.website ||

            "",

        socialLinks:

            shop.socialLinks ||

            []

    };

}


/*
|--------------------------------------------------------------------------
| Welcome Message
|--------------------------------------------------------------------------
*/

async function getWelcomeMessage(

    shopId

) {

    const shop = await findShop(

        shopId

    );

    return {

        title:

            shop.welcomeTitle ||

            "👋 Welcome!",

        message:

            shop.welcomeMessage ||

            "Hi! I'm your AI Sales Executive. How can I help you today?",

        buttonText:

            shop.welcomeButton ||

            "Start Shopping",

        couponCode:

            shop.couponCode ||

            "",

        discountLabel:

            shop.discountLabel ||

            ""

    };

}
/*
|--------------------------------------------------------------------------
| AI Sales Dashboard
|--------------------------------------------------------------------------
*/

async function getAISalesDashboard(

    shopId

) {

    await findShop(

        shopId

    );

    const [

        conversationMetrics,

        paymentMetrics,

        analytics

    ] = await Promise.all([

        Conversation.aggregate([

            {

                $match: {

                    shop: shopId

                }

            },

            {

                $group: {

                    _id: null,

                    totalChats: {

                        $sum: 1

                    },

                    totalMessages: {

                        $sum: "$totalMessages"

                    },

                    aiResolved: {

                        $sum: {

                            $cond: [

                                {

                                    $eq: [

                                        "$status",

                                        "resolved"

                                    ]

                                },

                                1,

                                0

                            ]

                        }

                    }

                }

            }

        ]),

        Payment.aggregate([

            {

                $match: {

                    shop: shopId,

                    status: "paid"

                }

            },

            {

                $group: {

                    _id: null,

                    aiRevenue: {

                        $sum: "$amount"

                    },

                    totalOrders: {

                        $sum: 1

                    }

                }

            }

        ]),

        Analytics.findOne({

            shop: shopId

        })

    ]);

    return {

        chats:

            conversationMetrics[0]?.totalChats || 0,

        messages:

            conversationMetrics[0]?.totalMessages || 0,

        resolvedChats:

            conversationMetrics[0]?.aiResolved || 0,

        aiRevenue:

            paymentMetrics[0]?.aiRevenue || 0,

        totalOrders:

            paymentMetrics[0]?.totalOrders || 0,

        conversionRate:

            analytics?.conversionRate || 0,

        averageResponseTime:

            analytics?.averageResponseTime || 0,

        customerSatisfaction:

            analytics?.customerSatisfaction || 0

    };

}


/*
|--------------------------------------------------------------------------
| AI Performance Metrics
|--------------------------------------------------------------------------
*/

async function getAIPerformanceMetrics(

    shopId

) {

    const dashboard =

        await getAISalesDashboard(

            shopId

        );

    return {

        responseAccuracy: 98.5,

        averageReplyTime:

            dashboard.averageResponseTime,

        conversationsHandled:

            dashboard.chats,

        resolvedConversations:

            dashboard.resolvedChats,

        customerRating:

            dashboard.customerSatisfaction,

        aiRevenue:

            dashboard.aiRevenue

    };

                                    }
/*
|--------------------------------------------------------------------------
| Visitor Dashboard
|--------------------------------------------------------------------------
*/

async function getVisitorDashboard(

    shopId

) {

    await findShop(

        shopId

    );

    const analytics =

        await Analytics.findOne({

            shop: shopId

        });

    return {

        totalVisitors:

            analytics?.totalVisitors || 0,

        uniqueVisitors:

            analytics?.uniqueVisitors || 0,

        returningVisitors:

            analytics?.returningVisitors || 0,

        onlineVisitors:

            analytics?.onlineVisitors || 0,

        bounceRate:

            analytics?.bounceRate || 0,

        averageSessionDuration:

            analytics?.averageSessionDuration || 0

    };

}


/*
|--------------------------------------------------------------------------
| Sales Analytics
|--------------------------------------------------------------------------
*/

async function getSalesAnalytics(

    shopId

) {

    await findShop(

        shopId

    );

    const sales =

        await Payment.aggregate([

            {

                $match: {

                    shop: shopId,

                    status: "paid"

                }

            },

            {

                $group: {

                    _id: null,

                    totalSales: {

                        $sum: "$amount"

                    },

                    totalOrders: {

                        $sum: 1

                    },

                    averageOrderValue: {

                        $avg: "$amount"

                    },

                    highestOrder: {

                        $max: "$amount"

                    }

                }

            }

        ]);

    return sales[0] || {

        totalSales: 0,

        totalOrders: 0,

        averageOrderValue: 0,

        highestOrder: 0

    };

}


/*
|--------------------------------------------------------------------------
| Top Selling Products
|--------------------------------------------------------------------------
*/

async function getTopSellingProducts(

    shopId,

    limit = 10

) {

    await findShop(

        shopId

    );

    return Product.find({

        shop: shopId,

        status: "active"

    })

    .sort({

        salesCount: -1,

        revenue: -1

    })

    .limit(

        limit

    )

    .select(

        "title image price salesCount revenue inventory"
    );

}


/*
|--------------------------------------------------------------------------
| Recent Dashboard Activity
|--------------------------------------------------------------------------
*/

async function getRecentDashboardActivity(

    shopId,

    limit = 10

) {

    await findShop(

        shopId

    );

    const [

        payments,

        conversations,

        notifications

    ] = await Promise.all([

        Payment.find({

            shop: shopId

        })

        .sort({

            createdAt: -1

        })

        .limit(limit),

        Conversation.find({

            shop: shopId

        })

        .sort({

            createdAt: -1

        })

        .limit(limit),

        Notification.find({

            shop: shopId

        })

        .sort({

            createdAt: -1

        })

        .limit(limit)

    ]);

    return {

        recentPayments:

            payments,

        recentChats:

            conversations,

        recentNotifications:

            notifications

    };

        }
/*
|--------------------------------------------------------------------------
| Subscription Dashboard
|--------------------------------------------------------------------------
*/

async function getSubscriptionDashboard(

    shopId

) {

    await findShop(

        shopId

    );

    const subscription =

        await Subscription.findOne({

            shop: shopId

        });

    if (

        !subscription

    ) {

        return {

            status: "trial",

            plan: "Premium Trial",

            active: false,

            renewsAt: null,

            expiresAt: null

        };

    }

    return {

        status:

            subscription.status,

        plan:

            subscription.plan,

        active:

            subscription.status === "active",

        renewsAt:

            subscription.currentPeriodEnd,

        expiresAt:

            subscription.expiresAt,

        cancelled:

            subscription.cancelAtPeriodEnd ||

            false

    };

}


/*
|--------------------------------------------------------------------------
| Billing Dashboard
|--------------------------------------------------------------------------
*/

async function getBillingDashboard(

    shopId

) {

    await findShop(

        shopId

    );

    const payments =

        await Payment.find({

            shop: shopId,

            status: "paid"

        })

        .sort({

            createdAt: -1

        })

        .limit(

            10

        );

    const totalSpent =

        payments.reduce(

            (

                total,

                payment

            ) =>

                total +

                (

                    payment.amount ||

                    0

                ),

            0

        );

    return {

        totalSpent,

        invoices:

            payments.length,

        latestPayments:

            payments

    };

}


/*
|--------------------------------------------------------------------------
| Trial Dashboard
|--------------------------------------------------------------------------
*/

async function getTrialDashboard(

    shopId

) {

    const shop =

        await findShop(

            shopId

        );

    return {

        isTrial:

            shop.isTrial ||

            false,

        startedAt:

            shop.trialStartedAt,

        expiresAt:

            shop.trialEndsAt,

        daysRemaining:

            shop.trialDaysRemaining ||

            0,

        expired:

            shop.trialExpired ||

            false,

        chatbotLocked:

            shop.chatbotLocked ||

            false

    };

}


/*
|--------------------------------------------------------------------------
| Plan Usage Dashboard
|--------------------------------------------------------------------------
*/

async function getPlanUsageDashboard(

    shopId

) {

    const [

        conversations,

        notifications,

        products

    ] = await Promise.all([

        Conversation.countDocuments({

            shop: shopId

        }),

        Notification.countDocuments({

            shop: shopId

        }),

        Product.countDocuments({

            shop: shopId

        })

    ]);

    return {

        conversations,

        notifications,

        products,

        aiExecutives: 1,

        customAvatar: true,

        apiRequests: "Unlimited",

        storage: "Unlimited"

    };

        }
/*
|--------------------------------------------------------------------------
| Notification Dashboard
|--------------------------------------------------------------------------
*/

async function getNotificationDashboard(

    shopId

) {

    await findShop(

        shopId

    );

    const [

        total,

        unread,

        payment,

        trial,

        system

    ] = await Promise.all([

        Notification.countDocuments({

            shop: shopId

        }),

        Notification.countDocuments({

            shop: shopId,

            isRead: false

        }),

        Notification.countDocuments({

            shop: shopId,

            category: "payment"

        }),

        Notification.countDocuments({

            shop: shopId,

            category: "trial"

        }),

        Notification.countDocuments({

            shop: shopId,

            category: "system"

        })

    ]);

    return {

        total,

        unread,

        payment,

        trial,

        system

    };

}


/*
|--------------------------------------------------------------------------
| Performance Dashboard
|--------------------------------------------------------------------------
*/

async function getPerformanceDashboard(

    shopId

) {

    const [

        revenue,

        visitors,

        ai

    ] = await Promise.all([

        getRevenueSummary(

            shopId

        ),

        getVisitorDashboard(

            shopId

        ),

        getAISalesDashboard(

            shopId

        )

    ]);

    return {

        totalRevenue:

            revenue.totalRevenue,

        totalVisitors:

            visitors.totalVisitors,

        conversionRate:

            ai.conversionRate,

        customerSatisfaction:

            ai.customerSatisfaction,

        aiRevenue:

            ai.aiRevenue,

        aiChats:

            ai.chats

    };

}


/*
|--------------------------------------------------------------------------
| Dashboard Quick Actions
|--------------------------------------------------------------------------
*/

async function getDashboardQuickActions(

    shopId

) {

    const subscription =

        await getSubscriptionDashboard(

            shopId

        );

    const trial =

        await getTrialDashboard(

            shopId

        );

    return {

        editSalesExecutive: true,

        changeAvatar: true,

        customizeChatbot: true,

        manageProducts: true,

        syncShopifyProducts: true,

        viewAnalytics: true,

        billing: true,

        notifications: true,

        upgradePlan:

            subscription.plan !==

            "Premium",

        rechargeNow:

            trial.expired ||

            subscription.status !==

            "active"

    };

}


/*
|--------------------------------------------------------------------------
| Dashboard Health Status
|--------------------------------------------------------------------------
*/

async function getDashboardHealthStatus(

    shopId

) {

    const [

        subscription,

        trial,

        notifications

    ] = await Promise.all([

        getSubscriptionDashboard(

            shopId

        ),

        getTrialDashboard(

            shopId

        ),

        getNotificationDashboard(

            shopId

        )

    ]);

    return {

        chatbotOnline:

            !trial.chatbotLocked,

        subscriptionActive:

            subscription.active,

        trialExpired:

            trial.expired,

        unreadNotifications:

            notifications.unread,

        overallHealth:

            (

                subscription.active &&

                !trial.chatbotLocked

            )

                ? "healthy"

                : "attention"

    };

                                    }
/*
|--------------------------------------------------------------------------
| Dashboard Insights
|--------------------------------------------------------------------------
*/

async function getDashboardInsights(

    shopId

) {

    const [

        performance,

        sales,

        visitors,

        trial

    ] = await Promise.all([

        getPerformanceDashboard(

            shopId

        ),

        getSalesAnalytics(

            shopId

        ),

        getVisitorDashboard(

            shopId

        ),

        getTrialDashboard(

            shopId

        )

    ]);

    return {

        topInsight:

            performance.aiRevenue > 0

                ? "AI Sales Executive is generating revenue."

                : "Complete chatbot setup to start generating sales.",

        visitors:

            visitors.totalVisitors,

        conversionRate:

            performance.conversionRate,

        averageOrderValue:

            sales.averageOrderValue,

        trialDaysRemaining:

            trial.daysRemaining

    };

}


/*
|--------------------------------------------------------------------------
| Dashboard Alerts
|--------------------------------------------------------------------------
*/

async function getDashboardAlerts(

    shopId

) {

    const [

        trial,

        subscription,

        notifications

    ] = await Promise.all([

        getTrialDashboard(

            shopId

        ),

        getSubscriptionDashboard(

            shopId

        ),

        getNotificationDashboard(

            shopId

        )

    ]);

    const alerts = [];

    if (

        trial.expired

    ) {

        alerts.push({

            type: "danger",

            title: "Trial Expired",

            message: "Your chatbot is locked. Recharge now."

        });

    }

    if (

        !subscription.active

    ) {

        alerts.push({

            type: "warning",

            title: "Subscription Inactive",

            message: "Activate a subscription to continue using Layboka AI."

        });

    }

    if (

        notifications.unread >

        0

    ) {

        alerts.push({

            type: "info",

            title: "Unread Notifications",

            message: `${notifications.unread} unread notifications.`

        });

    }

    return alerts;

}


/*
|--------------------------------------------------------------------------
| Merchant Activity Feed
|--------------------------------------------------------------------------
*/

async function getMerchantActivityFeed(

    shopId

) {

    return await getRecentDashboardActivity(

        shopId,

        20

    );

}


/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/

async function getDashboardSummary(

    shopId

) {

    const [

        overview,

        performance,

        billing,

        notification

    ] = await Promise.all([

        getDashboardOverview(

            shopId

        ),

        getPerformanceDashboard(

            shopId

        ),

        getBillingDashboard(

            shopId

        ),

        getNotificationDashboard(

            shopId

        )

    ]);

    return {

        overview,

        performance,

        billing,

        notification

    };

    }
/*
|--------------------------------------------------------------------------
| Merchant Home Dashboard
|--------------------------------------------------------------------------
*/

async function getMerchantHomeDashboard(

    shopId

) {

    const [

        overview,

        performance,

        trial,

        subscription,

        quickActions,

        alerts,

        executive

    ] = await Promise.all([

        getDashboardOverview(

            shopId

        ),

        getPerformanceDashboard(

            shopId

        ),

        getTrialDashboard(

            shopId

        ),

        getSubscriptionDashboard(

            shopId

        ),

        getDashboardQuickActions(

            shopId

        ),

        getDashboardAlerts(

            shopId

        ),

        getSalesExecutiveSettings(

            shopId

        )

    ]);

    return {

        executive,

        overview,

        performance,

        trial,

        subscription,

        quickActions,

        alerts

    };

}


/*
|--------------------------------------------------------------------------
| AI Sales Executive Dashboard
|--------------------------------------------------------------------------
*/

async function getAISalesExecutiveDashboard(

    shopId

) {

    const [

        executive,

        appearance,

        branding,

        welcome

    ] = await Promise.all([

        getSalesExecutiveSettings(

            shopId

        ),

        getChatbotAppearance(

            shopId

        ),

        getBrandingSettings(

            shopId

        ),

        getWelcomeMessage(

            shopId

        )

    ]);

    return {

        executive,

        appearance,

        branding,

        welcome

    };

}


/*
|--------------------------------------------------------------------------
| Dashboard Configuration
|--------------------------------------------------------------------------
*/

async function getDashboardConfiguration(

    shopId

) {

    const [

        appearance,

        branding,

        plan

    ] = await Promise.all([

        getChatbotAppearance(

            shopId

        ),

        getBrandingSettings(

            shopId

        ),

        getSubscriptionDashboard(

            shopId

        )

    ]);

    return {

        appearance,

        branding,

        currentPlan:

            plan.plan,

        features: {

            customAvatar:

                true,

            aiSalesExecutive:

                true,

            analytics:

                true,

            notifications:

                true,

            branding:

                true,

            shopifySync:

                true

        }

    };

}


/*
|--------------------------------------------------------------------------
| Complete Dashboard Data
|--------------------------------------------------------------------------
*/

async function getCompleteDashboard(

    shopId

) {

    const [

        home,

        insights,

        summary,

        activity,

        health,

        notifications

    ] = await Promise.all([

        getMerchantHomeDashboard(

            shopId

        ),

        getDashboardInsights(

            shopId

        ),

        getDashboardSummary(

            shopId

        ),

        getMerchantActivityFeed(

            shopId

        ),

        getDashboardHealthStatus(

            shopId

        ),

        getNotificationDashboard(

            shopId

        )

    ]);

    return {

        home,

        insights,

        summary,

        activity,

        health,

        notifications

    };

}
/*
|--------------------------------------------------------------------------
| Dashboard Service
|--------------------------------------------------------------------------
*/

const DashboardService = {

    getDashboardOverview,

    getRevenueSummary,

    getSubscriptionSummary,

    getTrialSummary,

    getSalesExecutiveSettings,

    getChatbotAppearance,

    getBrandingSettings,

    getWelcomeMessage,

    getAISalesDashboard,

    getAIPerformanceMetrics,

    getVisitorDashboard,

    getSalesAnalytics,

    getTopSellingProducts,

    getRecentDashboardActivity,

    getSubscriptionDashboard,

    getBillingDashboard,

    getTrialDashboard,

    getPlanUsageDashboard,

    getNotificationDashboard,

    getPerformanceDashboard,

    getDashboardQuickActions,

    getDashboardHealthStatus,

    getDashboardInsights,

    getDashboardAlerts,

    getMerchantActivityFeed,

    getDashboardSummary,

    getMerchantHomeDashboard,

    getAISalesExecutiveDashboard,

    getDashboardConfiguration,

    getCompleteDashboard

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    DashboardService,

    getDashboardOverview,

    getRevenueSummary,

    getSubscriptionSummary,

    getTrialSummary,

    getSalesExecutiveSettings,

    getChatbotAppearance,

    getBrandingSettings,

    getWelcomeMessage,

    getAISalesDashboard,

    getAIPerformanceMetrics,

    getVisitorDashboard,

    getSalesAnalytics,

    getTopSellingProducts,

    getRecentDashboardActivity,

    getSubscriptionDashboard,

    getBillingDashboard,

    getTrialDashboard,

    getPlanUsageDashboard,

    getNotificationDashboard,

    getPerformanceDashboard,

    getDashboardQuickActions,

    getDashboardHealthStatus,

    getDashboardInsights,

    getDashboardAlerts,

    getMerchantActivityFeed,

    getDashboardSummary,

    getMerchantHomeDashboard,

    getAISalesExecutiveDashboard,

    getDashboardConfiguration,

    getCompleteDashboard

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default DashboardService;
