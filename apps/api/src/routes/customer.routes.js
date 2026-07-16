/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import { Router } from "express";

import {

    CustomerController

} from "../controllers/customer.controller.js";

import authenticate from "../middleware/authenticate.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = Router();


/*
|--------------------------------------------------------------------------
| Middleware
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

    getCustomer,

    getCustomerByShopifyId,

    getCustomers,

    searchCustomers,

    getCustomerOrders,

    getCustomerAnalytics,

    updateCustomer,

    syncShopifyCustomer,

    syncAllCustomers,

    deleteCustomer,

    restoreCustomer,

    updateCustomerStatistics,

    updateCustomerSegment,

    updateCustomerScore,

    updateLifetimeValue,

    markCustomerAsSynced,

    markCustomerAsDeleted,

    updateLastSeenAt

} = CustomerController;
/*
|--------------------------------------------------------------------------
| Customer Read Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/",

    getCustomers

);


router.get(

    "/:customerId",

    getCustomer

);


router.get(

    "/shopify/:shopifyCustomerId",

    getCustomerByShopifyId

);


router.get(

    "/:customerId/orders",

    getCustomerOrders

);
/*
|--------------------------------------------------------------------------
| Customer Management Routes
|--------------------------------------------------------------------------
*/

router.patch(

    "/:customerId",

    updateCustomer

);


router.delete(

    "/:customerId",

    deleteCustomer

);


router.patch(

    "/:customerId/restore",

    restoreCustomer

);


router.post(

    "/sync",

    syncShopifyCustomer

);


router.post(

    "/sync-all",

    syncAllCustomers

);
/*
|--------------------------------------------------------------------------
| Customer Analytics & Profile Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/analytics",

    getCustomerAnalytics

);


router.get(

    "/search",

    searchCustomers

);


router.patch(

    "/:customerId/statistics",

    updateCustomerStatistics

);


router.patch(

    "/:customerId/segment",

    updateCustomerSegment

);


router.patch(

    "/:customerId/score",

    updateCustomerScore

);


router.patch(

    "/:customerId/lifetime-value",

    updateLifetimeValue

);
/*
|--------------------------------------------------------------------------
| Customer Status Routes
|--------------------------------------------------------------------------
*/

router.patch(

    "/:customerId/synced",

    markCustomerAsSynced

);


router.patch(

    "/:customerId/deleted",

    markCustomerAsDeleted

);


router.patch(

    "/:customerId/last-seen",

    updateLastSeenAt

);


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
