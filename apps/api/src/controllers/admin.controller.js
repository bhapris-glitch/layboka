/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import AdminService from "../services/admin/admin.service.js";

import {
    successResponse,
    errorResponse
} from "../utils/response.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

/**
 * Get Shop ID from authenticated request
 *
 * Priority:
 * 1. req.shop._id
 * 2. req.user.shop
 * 3. req.params.shopId
 * 4. req.body.shop
 * 5. req.query.shopId
 */

function getShopId(req) {

    return (

        req.shop?._id ||

        req.shop?.id ||

        req.user?.shop ||

        req.user?.shopId ||

        req.params?.shopId ||

        req.body?.shop ||

        req.body?.shopId ||

        req.query?.shopId

    );

}


/*
|--------------------------------------------------------------------------
| Get Subscription Usage
|--------------------------------------------------------------------------
*/

async function getSubscriptionUsage(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const usage =

            await AdminService.getSubscriptionUsage(

                shopId

            );


        return successResponse(

            res,

            usage,

            "Subscription usage retrieved successfully."

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
| Check Subscription Access
|--------------------------------------------------------------------------
*/

async function checkSubscriptionAccess(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const access =

            await AdminService.checkSubscriptionAccess(

                shopId

            );


        return successResponse(

            res,

            access,

            "Subscription access checked successfully."

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
| Get Dashboard Statistics
|--------------------------------------------------------------------------
*/

async function getDashboardStatistics(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const statistics =

            await AdminService.getDashboardStatistics(

                shopId

            );


        return successResponse(

            res,

            statistics,

            "Dashboard statistics retrieved successfully."

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
| Get Store Overview
|--------------------------------------------------------------------------
*/

async function getStoreOverview(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const overview =

            await AdminService.getStoreOverview(

                shopId

            );


        return successResponse(

            res,

            overview,

            "Store overview retrieved successfully."

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
| Get Recent Orders
|--------------------------------------------------------------------------
*/

async function getRecentOrders(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const limit =

            req.query?.limit ||

            req.body?.limit ||

            10;


        const orders =

            await AdminService.getRecentOrders(

                shopId,

                Number(

                    limit

                )

            );


        return successResponse(

            res,

            orders,

            "Recent orders retrieved successfully."

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
| Get Top Products
|--------------------------------------------------------------------------
*/

async function getTopProducts(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const limit =

            req.query?.limit ||

            req.body?.limit ||

            10;


        const products =

            await AdminService.getTopProducts(

                shopId,

                Number(

                    limit

                )

            );


        return successResponse(

            res,

            products,

            "Top products retrieved successfully."

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
| Get Customer Statistics
|--------------------------------------------------------------------------
*/

async function getCustomerStatistics(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const statistics =

            await AdminService.getCustomerStatistics(

                shopId

            );


        return successResponse(

            res,

            statistics,

            "Customer statistics retrieved successfully."

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
| Get Admin Dashboard
|--------------------------------------------------------------------------
*/

async function getAdminDashboard(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const dashboard =

            await AdminService.getAdminDashboard(

                shopId

            );


        return successResponse(

            res,

            dashboard,

            "Admin dashboard retrieved successfully."

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
| Get AI Model For Shop
|--------------------------------------------------------------------------
*/

async function getAIModelForShop(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const aiModel =

            await AdminService.getAIModelForShop(

                shopId

            );


        return successResponse(

            res,

            {

                aiModel

            },

            "AI model retrieved successfully."

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
| Check AI Request Access
|--------------------------------------------------------------------------
*/

async function checkAIRequestAccess(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const estimatedTokens =

            Number(

                req.body?.estimatedTokens ||

                req.body?.tokens ||

                req.query?.estimatedTokens ||

                0

            );


        const access =

            await AdminService.checkAIRequestAccess(

                shopId,

                estimatedTokens

            );


        return successResponse(

            res,

            access,

            "AI request access checked successfully."

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
| Get Store Information
|--------------------------------------------------------------------------
*/

async function getStoreInformation(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const storeInformation =

            await AdminService.getStoreInformation(

                shopId

            );


        return successResponse(

            res,

            storeInformation,

            "Store information retrieved successfully."

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
| Update Store Information
|--------------------------------------------------------------------------
*/

async function updateStoreInformation(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const storeInformation =

            await AdminService.updateStoreInformation(

                shopId,

                req.body

            );


        return successResponse(

            res,

            storeInformation,

            "Store information updated successfully."

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
| Get Subscription And Access
|--------------------------------------------------------------------------
*/

async function getSubscriptionAndAccess(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const subscriptionAndAccess =

            await AdminService.getSubscriptionAndAccess(

                shopId

            );


        return successResponse(

            res,

            subscriptionAndAccess,

            "Subscription and access information retrieved successfully."

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
| Track Subscription Usage
|--------------------------------------------------------------------------
*/

async function trackSubscriptionUsage(

    req,

    res

) {

    try {

        const shopId =

            getShopId(

                req

            );


        const tokensUsed =

            Number(

                req.body?.tokensUsed ||

                req.body?.tokens ||

                0

            );


        const messagesUsed =

            Number(

                req.body?.messagesUsed ||

                req.body?.messages ||

                1

            );


        const usage =

            await AdminService.trackSubscriptionUsage(

                shopId,

                tokensUsed,

                messagesUsed

            );


        return successResponse(

            res,

            usage,

            "Subscription usage tracked successfully."

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
| Admin Controller
|--------------------------------------------------------------------------
*/

const AdminController = {

    getSubscriptionUsage,

    checkSubscriptionAccess,

    getDashboardStatistics,

    getStoreOverview,

    getRecentOrders,

    getTopProducts,

    getCustomerStatistics,

    getAdminDashboard,

    getAIModelForShop,

    checkAIRequestAccess,

    getStoreInformation,

    updateStoreInformation,

    getSubscriptionAndAccess,

    trackSubscriptionUsage

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    getSubscriptionUsage,

    checkSubscriptionAccess,

    getDashboardStatistics,

    getStoreOverview,

    getRecentOrders,

    getTopProducts,

    getCustomerStatistics,

    getAdminDashboard,

    getAIModelForShop,

    checkAIRequestAccess,

    getStoreInformation,

    updateStoreInformation,

    getSubscriptionAndAccess,

    trackSubscriptionUsage

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default AdminController;
