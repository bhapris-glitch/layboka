/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import { Router } from "express";

import {

    AnalyticsController

} from "../controllers/analytics.controller.js";

import authenticate from "../middleware/authenticate.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = Router();


/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
*/

router.use(

    authenticate

);


/*
|--------------------------------------------------------------------------
| Controller Alias
|--------------------------------------------------------------------------
*/

const {

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

} = AnalyticsController;
/*
|--------------------------------------------------------------------------
| Analytics CRUD Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/",

    createAnalytics

);


router.get(

    "/:analyticsId",

    getAnalytics

);


router.get(

    "/shop/:shopId",

    getAnalyticsByShop

);


router.put(

    "/:analyticsId",

    updateAnalytics

);


router.delete(

    "/:analyticsId",

    deleteAnalytics

);


router.post(

    "/upsert",

    upsertAnalytics

);

/*
|--------------------------------------------------------------------------
| Analytics Tracking Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/track/order",

    trackOrder

);


router.post(

    "/track/revenue",

    trackRevenue

);


router.post(

    "/track/conversion",

    trackConversion

);


router.post(

    "/track/ai",

    trackAIConversation

);


router.post(

    "/track/tokens",

    trackTokenUsage

);


router.post(

    "/track/recommendation",

    trackRecommendation

);
/*
|--------------------------------------------------------------------------
| Customer Analytics Tracking Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/track/cart-recovery",

    trackCartRecovery

);


router.post(

    "/track/feedback",

    trackCustomerFeedback

);


router.post(

    "/track/response-time",

    trackResponseTime

);


/*
|--------------------------------------------------------------------------
| Analytics Reports
|--------------------------------------------------------------------------
*/

router.get(

    "/reports/daily",

    generateDailyAnalytics

);


router.get(

    "/reports/weekly",

    generateWeeklyAnalytics

);


router.get(

    "/reports/monthly",

    generateMonthlyAnalytics

);


router.get(

    "/reports/yearly",

    generateYearlyAnalytics

);


/*
|--------------------------------------------------------------------------
| Dashboard & Summary
|--------------------------------------------------------------------------
*/

router.get(

    "/dashboard",

    getDashboardAnalytics

);


router.get(

    "/summary",

    getAnalyticsSummary

);
/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
