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
