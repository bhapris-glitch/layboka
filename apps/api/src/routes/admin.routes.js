/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import express from "express";

import AdminController from "../controllers/admin.controller.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/

/**
 * Get complete admin dashboard
 *
 * GET /api/admin/dashboard
 */

router.get(

    "/dashboard",

    AdminController.getAdminDashboard

);


/**
 * Get dashboard statistics
 *
 * GET /api/admin/dashboard/statistics
 */

router.get(

    "/dashboard/statistics",

    AdminController.getDashboardStatistics

);


/*
|--------------------------------------------------------------------------
| Store Routes
|--------------------------------------------------------------------------
*/

/**
 * Get store overview
 *
 * GET /api/admin/store/overview
 */

router.get(

    "/store/overview",

    AdminController.getStoreOverview

);


/**
 * Get complete store information
 *
 * GET /api/admin/store
 */

router.get(

    "/store",

    AdminController.getStoreInformation

);


/**
 * Update store information
 *
 * PUT /api/admin/store
 */

router.put(

    "/store",

    AdminController.updateStoreInformation

);
/*
|--------------------------------------------------------------------------
| Subscription Routes
|--------------------------------------------------------------------------
*/

/**
 * Get subscription usage
 *
 * GET /api/admin/subscription/usage
 */

router.get(

    "/subscription/usage",

    AdminController.getSubscriptionUsage

);


/**
 * Check subscription access
 *
 * GET /api/admin/subscription/access
 */

router.get(

    "/subscription/access",

    AdminController.checkSubscriptionAccess

);


/**
 * Get subscription and access information
 *
 * GET /api/admin/subscription
 */

router.get(

    "/subscription",

    AdminController.getSubscriptionAndAccess

);


/*
|--------------------------------------------------------------------------
| AI Access Routes
|--------------------------------------------------------------------------
*/

/**
 * Get AI model assigned to the shop
 *
 * GET /api/admin/ai/model
 */

router.get(

    "/ai/model",

    AdminController.getAIModelForShop

);


/**
 * Check whether an AI request is allowed
 *
 * POST /api/admin/ai/access
 */

router.post(

    "/ai/access",

    AdminController.checkAIRequestAccess

);
/*
|--------------------------------------------------------------------------
| Subscription Usage Tracking
|--------------------------------------------------------------------------
*/

/**
 * Track subscription usage
 *
 * POST /api/admin/subscription/usage
 *
 * Body:
 * {
 *     "tokensUsed": 100,
 *     "messagesUsed": 1
 * }
 */

router.post(

    "/subscription/usage",

    AdminController.trackSubscriptionUsage

);


/*
|--------------------------------------------------------------------------
| Order Routes
|--------------------------------------------------------------------------
*/

/**
 * Get recent orders
 *
 * GET /api/admin/orders/recent
 *
 * Optional query:
 * ?limit=10
 */

router.get(

    "/orders/recent",

    AdminController.getRecentOrders

);


/*
|--------------------------------------------------------------------------
| Product Routes
|--------------------------------------------------------------------------
*/

/**
 * Get top products
 *
 * GET /api/admin/products/top
 *
 * Optional query:
 * ?limit=10
 */

router.get(

    "/products/top",

    AdminController.getTopProducts

);


/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/

/**
 * Get customer statistics
 *
 * GET /api/admin/customers/statistics
 */

router.get(

    "/customers/statistics",

    AdminController.getCustomerStatistics

);
