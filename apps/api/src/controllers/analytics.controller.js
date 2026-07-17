/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import AnalyticsService from "../services/analytics/analytics.service.js";

import {

    successResponse,

    errorResponse

} from "../utils/apiResponse.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

function getAnalyticsId(

    req

) {

    return (

        req.params.analyticsId ||

        req.body.analyticsId

    );

}


function getShopId(

    req

) {

    return (

        req.params.shopId ||

        req.body.shopId ||

        req.user?.shop

    );

}
/*
|--------------------------------------------------------------------------
| Create Analytics
|--------------------------------------------------------------------------
*/

async function createAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.createAnalytics(

                req.body

            );

        return successResponse(

            res,

            analytics,

            "Analytics created successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Analytics
|--------------------------------------------------------------------------
*/

async function getAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.getAnalytics(

                getAnalyticsId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "Analytics retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Analytics By Shop
|--------------------------------------------------------------------------
*/

async function getAnalyticsByShop(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.getAnalyticsByShop(

                getShopId(

                    req

                ),

                req.query.period,

                req.query.date

            );

        return successResponse(

            res,

            analytics,

            "Shop analytics retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Update Analytics
|--------------------------------------------------------------------------
*/

async function updateAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.updateAnalytics(

                getAnalyticsId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            analytics,

            "Analytics updated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Delete Analytics
|--------------------------------------------------------------------------
*/

async function deleteAnalytics(

    req,

    res

) {

    try {

        const result =

            await AnalyticsService.deleteAnalytics(

                getAnalyticsId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Analytics deleted successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Upsert Analytics
|--------------------------------------------------------------------------
*/

async function upsertAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.upsertAnalytics(

                getShopId(

                    req

                ),

                req.body.period,

                req.body.date,

                req.body

            );

        return successResponse(

            res,

            analytics,

            "Analytics saved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

              }
/*
|--------------------------------------------------------------------------
| Track Order
|--------------------------------------------------------------------------
*/

async function trackOrder(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackOrder(

                getAnalyticsId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            analytics,

            "Order tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Track Revenue
|--------------------------------------------------------------------------
*/

async function trackRevenue(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackRevenue(

                getAnalyticsId(

                    req

                ),

                req.body.amount

            );

        return successResponse(

            res,

            analytics,

            "Revenue tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Track Conversion
|--------------------------------------------------------------------------
*/

async function trackConversion(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackConversion(

                getAnalyticsId(

                    req

                ),

                req.body.converted

            );

        return successResponse(

            res,

            analytics,

            "Conversion tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

          }
/*
|--------------------------------------------------------------------------
| Track AI Conversation
|--------------------------------------------------------------------------
*/

async function trackAIConversation(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackAIConversation(

                getAnalyticsId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "AI conversation tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Track Token Usage
|--------------------------------------------------------------------------
*/

async function trackTokenUsage(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackTokenUsage(

                getAnalyticsId(

                    req

                ),

                req.body.tokens

            );

        return successResponse(

            res,

            analytics,

            "Token usage tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Track Product Recommendation
|--------------------------------------------------------------------------
*/

async function trackRecommendation(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackRecommendation(

                getAnalyticsId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            analytics,

            "Product recommendation tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Track Cart Recovery
|--------------------------------------------------------------------------
*/

async function trackCartRecovery(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackCartRecovery(

                getAnalyticsId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            analytics,

            "Cart recovery tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Track Customer Feedback
|--------------------------------------------------------------------------
*/

async function trackCustomerFeedback(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackCustomerFeedback(

                getAnalyticsId(

                    req

                ),

                req.body.rating,

                req.body.positive

            );

        return successResponse(

            res,

            analytics,

            "Customer feedback tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Track Response Time
|--------------------------------------------------------------------------
*/

async function trackResponseTime(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.trackResponseTime(

                getAnalyticsId(

                    req

                ),

                req.body.responseTime

            );

        return successResponse(

            res,

            analytics,

            "Response time tracked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Generate Daily Analytics
|--------------------------------------------------------------------------
*/

async function generateDailyAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.generateDailyAnalytics(

                getShopId(

                    req

                ),

                req.query.date

            );

        return successResponse(

            res,

            analytics,

            "Daily analytics generated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Generate Weekly Analytics
|--------------------------------------------------------------------------
*/

async function generateWeeklyAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.generateWeeklyAnalytics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "Weekly analytics generated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Generate Monthly Analytics
|--------------------------------------------------------------------------
*/

async function generateMonthlyAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.generateMonthlyAnalytics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "Monthly analytics generated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

                  }
/*
|--------------------------------------------------------------------------
| Generate Yearly Analytics
|--------------------------------------------------------------------------
*/

async function generateYearlyAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await AnalyticsService.generateYearlyAnalytics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "Yearly analytics generated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Dashboard Analytics
|--------------------------------------------------------------------------
*/

async function getDashboardAnalytics(

    req,

    res

) {

    try {

        const dashboard =

            await AnalyticsService.getDashboardAnalytics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            dashboard,

            "Dashboard analytics retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Analytics Summary
|--------------------------------------------------------------------------
*/

async function getAnalyticsSummary(

    req,

    res

) {

    try {

        const summary =

            await AnalyticsService.getAnalyticsSummary(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            summary,

            "Analytics summary retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Analytics Controller
|--------------------------------------------------------------------------
*/

const AnalyticsController = {

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

export default AnalyticsController;
