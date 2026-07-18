/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import DashboardService from "../services/dashboard/dashboard.service.js";


/*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/

function successResponse(

    res,

    data,

    message = "Success"

) {

    return res.status(200).json({

        success: true,

        message,

        data

    });

}


function errorResponse(

    res,

    error

) {

    console.error(

        error

    );

    return res.status(

        error.statusCode || 500

    ).json({

        success: false,

        message:

            error.message ||

            "Internal Server Error"

    });

}


/*
|--------------------------------------------------------------------------
| Request Helpers
|--------------------------------------------------------------------------
*/

function getShopId(

    req

) {

    return (

        req.shop?.id ||

        req.user?.shopId ||

        req.params.shopId ||

        req.body.shopId ||

        req.query.shopId

    );

}


/*
|--------------------------------------------------------------------------
| Dashboard Overview
|--------------------------------------------------------------------------
*/

async function getDashboardOverview(

    req,

    res

) {

    try {

        const dashboard =

            await DashboardService.getDashboardOverview(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            dashboard,

            "Dashboard overview loaded successfully."

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
| Revenue Summary
|--------------------------------------------------------------------------
*/

async function getRevenueSummary(

    req,

    res

) {

    try {

        const revenue =

            await DashboardService.getRevenueSummary(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            revenue,

            "Revenue summary loaded successfully."

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
| Subscription Summary
|--------------------------------------------------------------------------
*/

async function getSubscriptionSummary(

    req,

    res

) {

    try {

        const subscription =

            await DashboardService.getSubscriptionSummary(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription summary loaded successfully."

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
| Trial Summary
|--------------------------------------------------------------------------
*/

async function getTrialSummary(

    req,

    res

) {

    try {

        const trial =

            await DashboardService.getTrialSummary(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            trial,

            "Trial summary loaded successfully."

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
| AI Sales Executive Settings
|--------------------------------------------------------------------------
*/

async function getSalesExecutiveSettings(

    req,

    res

) {

    try {

        const settings =

            await DashboardService.getSalesExecutiveSettings(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            settings,

            "AI Sales Executive settings loaded successfully."

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
| Chatbot Appearance
|--------------------------------------------------------------------------
*/

async function getChatbotAppearance(

    req,

    res

) {

    try {

        const appearance =

            await DashboardService.getChatbotAppearance(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            appearance,

            "Chatbot appearance loaded successfully."

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
| Branding Settings
|--------------------------------------------------------------------------
*/

async function getBrandingSettings(

    req,

    res

) {

    try {

        const branding =

            await DashboardService.getBrandingSettings(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            branding,

            "Branding settings loaded successfully."

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
| Welcome Message
|--------------------------------------------------------------------------
*/

async function getWelcomeMessage(

    req,

    res

) {

    try {

        const welcome =

            await DashboardService.getWelcomeMessage(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            welcome,

            "Welcome message loaded successfully."

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
| AI Sales Dashboard
|--------------------------------------------------------------------------
*/

async function getAISalesDashboard(

    req,

    res

) {

    try {

        const dashboard =

            await DashboardService.getAISalesDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            dashboard,

            "AI Sales dashboard loaded successfully."

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
| AI Performance Metrics
|--------------------------------------------------------------------------
*/

async function getAIPerformanceMetrics(

    req,

    res

) {

    try {

        const metrics =

            await DashboardService.getAIPerformanceMetrics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            metrics,

            "AI performance metrics loaded successfully."

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
| Visitor Dashboard
|--------------------------------------------------------------------------
*/

async function getVisitorDashboard(

    req,

    res

) {

    try {

        const visitors =

            await DashboardService.getVisitorDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            visitors,

            "Visitor dashboard loaded successfully."

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
| Sales Analytics
|--------------------------------------------------------------------------
*/

async function getSalesAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await DashboardService.getSalesAnalytics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "Sales analytics loaded successfully."

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
| Top Selling Products
|--------------------------------------------------------------------------
*/

async function getTopSellingProducts(

    req,

    res

) {

    try {

        const products =

            await DashboardService.getTopSellingProducts(

                getShopId(

                    req

                ),

                Number(

                    req.query.limit

                ) || 10

            );

        return successResponse(

            res,

            products,

            "Top selling products loaded successfully."

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
| Recent Dashboard Activity
|--------------------------------------------------------------------------
*/

async function getRecentDashboardActivity(

    req,

    res

) {

    try {

        const activity =

            await DashboardService.getRecentDashboardActivity(

                getShopId(

                    req

                ),

                Number(

                    req.query.limit

                ) || 10

            );

        return successResponse(

            res,

            activity,

            "Recent dashboard activity loaded successfully."

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
| Subscription Dashboard
|--------------------------------------------------------------------------
*/

async function getSubscriptionDashboard(

    req,

    res

) {

    try {

        const subscription =

            await DashboardService.getSubscriptionDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription dashboard loaded successfully."

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
| Billing Dashboard
|--------------------------------------------------------------------------
*/

async function getBillingDashboard(

    req,

    res

) {

    try {

        const billing =

            await DashboardService.getBillingDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            billing,

            "Billing dashboard loaded successfully."

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
| Trial Dashboard
|--------------------------------------------------------------------------
*/

async function getTrialDashboard(

    req,

    res

) {

    try {

        const trial =

            await DashboardService.getTrialDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            trial,

            "Trial dashboard loaded successfully."

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
| Plan Usage Dashboard
|--------------------------------------------------------------------------
*/

async function getPlanUsageDashboard(

    req,

    res

) {

    try {

        const usage =

            await DashboardService.getPlanUsageDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            usage,

            "Plan usage dashboard loaded successfully."

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
| Notification Dashboard
|--------------------------------------------------------------------------
*/

async function getNotificationDashboard(

    req,

    res

) {

    try {

        const notifications =

            await DashboardService.getNotificationDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            notifications,

            "Notification dashboard loaded successfully."

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
| Performance Dashboard
|--------------------------------------------------------------------------
*/

async function getPerformanceDashboard(

    req,

    res

) {

    try {

        const performance =

            await DashboardService.getPerformanceDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            performance,

            "Performance dashboard loaded successfully."

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
| Dashboard Quick Actions
|--------------------------------------------------------------------------
*/

async function getDashboardQuickActions(

    req,

    res

) {

    try {

        const actions =

            await DashboardService.getDashboardQuickActions(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            actions,

            "Dashboard quick actions loaded successfully."

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
| Dashboard Health Status
|--------------------------------------------------------------------------
*/

async function getDashboardHealthStatus(

    req,

    res

) {

    try {

        const health =

            await DashboardService.getDashboardHealthStatus(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            health,

            "Dashboard health status loaded successfully."

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
| Dashboard Insights
|--------------------------------------------------------------------------
*/

async function getDashboardInsights(

    req,

    res

) {

    try {

        const insights =

            await DashboardService.getDashboardInsights(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            insights,

            "Dashboard insights loaded successfully."

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
| Dashboard Alerts
|--------------------------------------------------------------------------
*/

async function getDashboardAlerts(

    req,

    res

) {

    try {

        const alerts =

            await DashboardService.getDashboardAlerts(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            alerts,

            "Dashboard alerts loaded successfully."

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
| Merchant Activity Feed
|--------------------------------------------------------------------------
*/

async function getMerchantActivityFeed(

    req,

    res

) {

    try {

        const activity =

            await DashboardService.getMerchantActivityFeed(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            activity,

            "Merchant activity feed loaded successfully."

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
| Dashboard Summary
|--------------------------------------------------------------------------
*/

async function getDashboardSummary(

    req,

    res

) {

    try {

        const summary =

            await DashboardService.getDashboardSummary(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            summary,

            "Dashboard summary loaded successfully."

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
| Merchant Home Dashboard
|--------------------------------------------------------------------------
*/

async function getMerchantHomeDashboard(

    req,

    res

) {

    try {

        const dashboard =

            await DashboardService.getMerchantHomeDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            dashboard,

            "Merchant dashboard loaded successfully."

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
| AI Sales Executive Dashboard
|--------------------------------------------------------------------------
*/

async function getAISalesExecutiveDashboard(

    req,

    res

) {

    try {

        const dashboard =

            await DashboardService.getAISalesExecutiveDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            dashboard,

            "AI Sales Executive dashboard loaded successfully."

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
| Dashboard Configuration
|--------------------------------------------------------------------------
*/

async function getDashboardConfiguration(

    req,

    res

) {

    try {

        const configuration =

            await DashboardService.getDashboardConfiguration(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            configuration,

            "Dashboard configuration loaded successfully."

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
| Complete Dashboard
|--------------------------------------------------------------------------
*/

async function getCompleteDashboard(

    req,

    res

) {

    try {

        const dashboard =

            await DashboardService.getCompleteDashboard(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            dashboard,

            "Complete dashboard loaded successfully."

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
| Named Exports
|--------------------------------------------------------------------------
*/

export {

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

export default {

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
