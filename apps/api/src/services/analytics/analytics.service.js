/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Analytics from "../../models/analytics.model.js";

import Shop from "../../models/shop.model.js";

import Customer from "../../models/customer.model.js";

import Subscription from "../../models/subscription.model.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

async function findAnalytics(

    analyticsId

) {

    const analytics =

        await Analytics.findById(

            analyticsId

        );

    if (

        !analytics

    ) {

        throw new Error(

            "Analytics record not found."

        );

    }

    return analytics;

}


async function findShopAnalytics(

    shopId,

    period,

    date

) {

    return Analytics.findOne({

        shop: shopId,

        period,

        date

    });

}


/*
|--------------------------------------------------------------------------
| Analytics Mapper
|--------------------------------------------------------------------------
*/

function mapAnalytics(

    analytics

) {

    return analytics.toJSON();

}
/*
|--------------------------------------------------------------------------
| Create Analytics
|--------------------------------------------------------------------------
*/

async function createAnalytics(

    analyticsData

) {

    const analytics =

        await Analytics.create(

            analyticsData

        );

    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Get Analytics
|--------------------------------------------------------------------------
*/

async function getAnalytics(

    analyticsId

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );

    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Get Analytics By Shop
|--------------------------------------------------------------------------
*/

async function getAnalyticsByShop(

    shopId,

    period = null,

    date = null

) {

    const query = {

        shop: shopId

    };


    if (

        period

    ) {

        query.period =

            period;

    }


    if (

        date

    ) {

        query.date =

            date;

    }


    const analytics =

        await Analytics.find(

            query

        )

        .sort({

            date: -1

        });


    return analytics.map(

        mapAnalytics

    );

      }
/*
|--------------------------------------------------------------------------
| Update Analytics
|--------------------------------------------------------------------------
*/

async function updateAnalytics(

    analyticsId,

    updateData

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    Object.assign(

        analytics,

        updateData

    );


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Delete Analytics
|--------------------------------------------------------------------------
*/

async function deleteAnalytics(

    analyticsId

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    await analytics.deleteOne();


    return {

        success: true

    };

}


/*
|--------------------------------------------------------------------------
| Create Or Update Analytics
|--------------------------------------------------------------------------
*/

async function upsertAnalytics(

    shopId,

    period,

    date,

    analyticsData

) {

    let analytics =

        await findShopAnalytics(

            shopId,

            period,

            date

        );


    if (

        analytics

    ) {

        Object.assign(

            analytics,

            analyticsData

        );

    }

    else {

        analytics =

            await Analytics.create({

                shop:

                    shopId,

                period,

                date,

                ...analyticsData

            });

    }


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}
/*
|--------------------------------------------------------------------------
| Track Order
|--------------------------------------------------------------------------
*/

async function trackOrder(

    analyticsId,

    orderData = {}

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    analytics.orders += 1;


    analytics.revenue +=

        Number(

            orderData.total ||

            0

        );


    analytics.averageOrderValue =

        analytics.orders > 0

            ? analytics.revenue /

              analytics.orders

            : 0;


    if (

        orderData.productPurchased

    ) {

        analytics.productsPurchased += 1;

    }


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Track Revenue
|--------------------------------------------------------------------------
*/

async function trackRevenue(

    analyticsId,

    amount

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    analytics.revenue +=

        Number(

            amount ||

            0

        );


    analytics.averageOrderValue =

        analytics.orders > 0

            ? analytics.revenue /

              analytics.orders

            : 0;


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Track Conversion
|--------------------------------------------------------------------------
*/

async function trackConversion(

    analyticsId,

    converted = true

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    if (

        converted

    ) {

        analytics.productsPurchased += 1;

    }


    analytics.conversionRate =

        analytics.visitors > 0

            ? (

                analytics.productsPurchased /

                analytics.visitors

            ) * 100

            : 0;


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}
/*
|--------------------------------------------------------------------------
| Track AI Conversation
|--------------------------------------------------------------------------
*/

async function trackAIConversation(

    analyticsId

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    analytics.aiConversations += 1;

    analytics.messagesSent += 1;


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Track Token Usage
|--------------------------------------------------------------------------
*/

async function trackTokenUsage(

    analyticsId,

    tokens

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    analytics.tokensUsed +=

        Number(

            tokens ||

            0

        );


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Track Product Recommendation
|--------------------------------------------------------------------------
*/

async function trackRecommendation(

    analyticsId,

    recommendation = {}

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    analytics.productsRecommended += 1;


    if (

        recommendation.converted

    ) {

        analytics.revenueGeneratedByAI +=

            Number(

                recommendation.revenue ||

                0

            );

    }


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}
/*
|--------------------------------------------------------------------------
| Track Cart Recovery
|--------------------------------------------------------------------------
*/

async function trackCartRecovery(

    analyticsId,

    recovery = {}

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    analytics.cartRecoveries += 1;


    analytics.revenueGeneratedByAI +=

        Number(

            recovery.revenue ||

            0

        );


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Track Customer Feedback
|--------------------------------------------------------------------------
*/

async function trackCustomerFeedback(

    analyticsId,

    rating,

    positive = true

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    if (

        positive

    ) {

        analytics.positiveFeedback += 1;

    }

    else {

        analytics.negativeFeedback += 1;

    }


    const totalFeedback =

        analytics.positiveFeedback +

        analytics.negativeFeedback;


    analytics.customerSatisfaction =

        totalFeedback > 0

            ? (

                (

                    analytics.positiveFeedback /

                    totalFeedback

                ) * 5

              )

            : Number(

                rating ||

                0

            );


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}


/*
|--------------------------------------------------------------------------
| Track Response Time
|--------------------------------------------------------------------------
*/

async function trackResponseTime(

    analyticsId,

    responseTime

) {

    const analytics =

        await findAnalytics(

            analyticsId

        );


    analytics.averageResponseTime =

        Number(

            responseTime ||

            0

        );


    analytics.resolvedChats += 1;


    await analytics.save();


    return mapAnalytics(

        analytics

    );

}
/*
|--------------------------------------------------------------------------
| Generate Daily Analytics
|--------------------------------------------------------------------------
*/

async function generateDailyAnalytics(

    shopId,

    date

) {

    return Analytics.find({

        shop: shopId,

        period: "daily",

        date

    }).sort({

        date: -1

    });

}


/*
|--------------------------------------------------------------------------
| Generate Weekly Analytics
|--------------------------------------------------------------------------
*/

async function generateWeeklyAnalytics(

    shopId

) {

    return Analytics.find({

        shop: shopId,

        period: "weekly"

    }).sort({

        date: -1

    });

}


/*
|--------------------------------------------------------------------------
| Generate Monthly Analytics
|--------------------------------------------------------------------------
*/

async function generateMonthlyAnalytics(

    shopId

) {

    return Analytics.find({

        shop: shopId,

        period: "monthly"

    }).sort({

        date: -1

    });

  }
/*
|--------------------------------------------------------------------------
| Generate Yearly Analytics
|--------------------------------------------------------------------------
*/

async function generateYearlyAnalytics(

    shopId

) {

    return Analytics.find({

        shop: shopId,

        period: "yearly"

    }).sort({

        date: -1

    });

}


/*
|--------------------------------------------------------------------------
| Dashboard Analytics
|--------------------------------------------------------------------------
*/

async function getDashboardAnalytics(

    shopId

) {

    const [

        subscription,

        customers,

        analytics

    ] = await Promise.all([

        Subscription.findOne({

            shop: shopId

        }),

        Customer.countDocuments({

            shop: shopId

        }),

        Analytics.find({

            shop: shopId

        }).sort({

            date: -1

        })

    ]);


    return {

        subscription,

        customers,

        analytics

    };

}


/*
|--------------------------------------------------------------------------
| Analytics Summary
|--------------------------------------------------------------------------
*/

async function getAnalyticsSummary(

    shopId

) {

    const analytics =

        await Analytics.find({

            shop: shopId

        });


    const summary = {

        totalRevenue: 0,

        totalOrders: 0,

        totalVisitors: 0,

        totalConversations: 0,

        totalTokensUsed: 0

    };


    for (

        const item of analytics

    ) {

        summary.totalRevenue +=

            item.revenue;


        summary.totalOrders +=

            item.orders;


        summary.totalVisitors +=

            item.visitors;


        summary.totalConversations +=

            item.aiConversations;


        summary.totalTokensUsed +=

            item.tokensUsed;

    }


    return summary;

      }
/*
|--------------------------------------------------------------------------
| Analytics Service
|--------------------------------------------------------------------------
*/

const AnalyticsService = {

    createAnalytics,

    getAnalytics,

    getAnalyticsByShop,

    updateAnalytics,

    deleteAnalytics,

    upsertAnalytics,

    trackOrder,

    trackRevenue,

    trackConversion,

    trackAIConversation,

    trackTokenUsage,

    trackRecommendation,

    trackCartRecovery,

    trackCustomerFeedback,

    trackResponseTime,

    generateDailyAnalytics,

    generateWeeklyAnalytics,

    generateMonthlyAnalytics,

    generateYearlyAnalytics,

    getDashboardAnalytics,

    getAnalyticsSummary

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    createAnalytics,

    getAnalytics,

    getAnalyticsByShop,

    updateAnalytics,

    deleteAnalytics,

    upsertAnalytics,

    trackOrder,

    trackRevenue,

    trackConversion,

    trackAIConversation,

    trackTokenUsage,

    trackRecommendation,

    trackCartRecovery,

    trackCustomerFeedback,

    trackResponseTime,

    generateDailyAnalytics,

    generateWeeklyAnalytics,

    generateMonthlyAnalytics,

    generateYearlyAnalytics,

    getDashboardAnalytics,

    getAnalyticsSummary

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default AnalyticsService;
