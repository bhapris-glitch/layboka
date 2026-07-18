/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import express from "express";

import {

    authenticate,

    requireActiveSubscription

} from "../middleware/auth.middleware.js";

import {

    getCompleteDashboard,

    getMerchantHomeDashboard,

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

    getAISalesExecutiveDashboard,

    getDashboardConfiguration

} from "../controllers/dashboard.controller.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(

    authenticate

);


/*
|--------------------------------------------------------------------------
| Active Subscription Protection
|--------------------------------------------------------------------------
*/

router.use(

    requireActiveSubscription

);
/*
|--------------------------------------------------------------------------
| Dashboard Home
|--------------------------------------------------------------------------
*/

router.get(

    "/",

    getCompleteDashboard

);


router.get(

    "/home",

    getMerchantHomeDashboard

);


/*
|--------------------------------------------------------------------------
| Dashboard Overview
|--------------------------------------------------------------------------
*/

router.get(

    "/overview",

    getDashboardOverview

);


router.get(

    "/summary",

    getDashboardSummary

);


/*
|--------------------------------------------------------------------------
| Revenue
|--------------------------------------------------------------------------
*/

router.get(

    "/revenue",

    getRevenueSummary

);


/*
|--------------------------------------------------------------------------
| Subscription
|--------------------------------------------------------------------------
*/

router.get(

    "/subscription",

    getSubscriptionSummary

);


router.get(

    "/subscription/details",

    getSubscriptionDashboard

);


/*
|--------------------------------------------------------------------------
| Trial
|--------------------------------------------------------------------------
*/

router.get(

    "/trial",

    getTrialSummary

);


router.get(

    "/trial/details",

    getTrialDashboard

);
/*
|--------------------------------------------------------------------------
| AI Sales Executive
|--------------------------------------------------------------------------
*/

router.get(

    "/ai-sales-executive",

    getAISalesExecutiveDashboard

);


router.get(

    "/sales-executive",

    getSalesExecutiveSettings

);


/*
|--------------------------------------------------------------------------
| Chatbot Appearance
|--------------------------------------------------------------------------
*/

router.get(

    "/chatbot",

    getChatbotAppearance

);


/*
|--------------------------------------------------------------------------
| Branding
|--------------------------------------------------------------------------
*/

router.get(

    "/branding",

    getBrandingSettings

);


/*
|--------------------------------------------------------------------------
| Welcome Popup
|--------------------------------------------------------------------------
*/

router.get(

    "/welcome",

    getWelcomeMessage

);


/*
|--------------------------------------------------------------------------
| AI Sales Dashboard
|--------------------------------------------------------------------------
*/

router.get(

    "/ai-sales",

    getAISalesDashboard

);


router.get(

    "/ai-performance",

    getAIPerformanceMetrics

);
/*
|--------------------------------------------------------------------------
| Visitor Analytics
|--------------------------------------------------------------------------
*/

router.get(

    "/visitors",

    getVisitorDashboard

);


/*
|--------------------------------------------------------------------------
| Sales Analytics
|--------------------------------------------------------------------------
*/

router.get(

    "/sales",

    getSalesAnalytics

);


/*
|--------------------------------------------------------------------------
| Top Selling Products
|--------------------------------------------------------------------------
*/

router.get(

    "/products",

    getTopSellingProducts

);


/*
|--------------------------------------------------------------------------
| Merchant Activity
|--------------------------------------------------------------------------
*/

router.get(

    "/activity",

    getMerchantActivityFeed

);


router.get(

    "/recent-activity",

    getRecentDashboardActivity

);


/*
|--------------------------------------------------------------------------
| Performance
|--------------------------------------------------------------------------
*/

router.get(

    "/performance",

    getPerformanceDashboard

);


router.get(

    "/performance/ai",

    getAIPerformanceMetrics

);


/*
|--------------------------------------------------------------------------
| Dashboard Health
|--------------------------------------------------------------------------
*/

router.get(

    "/health",

    getDashboardHealthStatus

);
/*
|--------------------------------------------------------------------------
| Billing
|--------------------------------------------------------------------------
*/

router.get(

    "/billing",

    getBillingDashboard

);


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

router.get(

    "/notifications",

    getNotificationDashboard

);


/*
|--------------------------------------------------------------------------
| Plan Usage
|--------------------------------------------------------------------------
*/

router.get(

    "/plan-usage",

    getPlanUsageDashboard

);


/*
|--------------------------------------------------------------------------
| Dashboard Quick Actions
|--------------------------------------------------------------------------
*/

router.get(

    "/quick-actions",

    getDashboardQuickActions

);


/*
|--------------------------------------------------------------------------
| Dashboard Alerts
|--------------------------------------------------------------------------
*/

router.get(

    "/alerts",

    getDashboardAlerts

);


/*
|--------------------------------------------------------------------------
| Dashboard Insights
|--------------------------------------------------------------------------
*/

router.get(

    "/insights",

    getDashboardInsights

);


/*
|--------------------------------------------------------------------------
| Dashboard Configuration
|--------------------------------------------------------------------------
*/

router.get(

    "/configuration",

    getDashboardConfiguration

);


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
