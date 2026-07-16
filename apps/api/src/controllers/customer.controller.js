/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import CustomerService from "../services/customer/customer.service.js";

import {

    successResponse,

    errorResponse

} from "../utils/response.js";


/*
|--------------------------------------------------------------------------
| Controller Helpers
|--------------------------------------------------------------------------
*/

function getShopId(

    req

) {

    return req.shop._id;

}


function getCustomerId(

    req

) {

    return req.params.customerId;

}
/*
|--------------------------------------------------------------------------
| Get Customer
|--------------------------------------------------------------------------
*/

async function getCustomer(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.getCustomer(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer retrieved successfully."

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
| Get Customer By Shopify ID
|--------------------------------------------------------------------------
*/

async function getCustomerByShopifyId(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.getCustomerByShopifyId(

                getShopId(

                    req

                ),

                req.params.shopifyCustomerId

            );

        return successResponse(

            res,

            customer,

            "Customer retrieved successfully."

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
| Get Customers
|--------------------------------------------------------------------------
*/

async function getCustomers(

    req,

    res

) {

    try {

        const customers =

            await CustomerService.getCustomers(

                getShopId(

                    req

                ),

                req.query

            );

        return successResponse(

            res,

            customers,

            "Customers retrieved successfully."

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
| Search Customers
|--------------------------------------------------------------------------
*/

async function searchCustomers(

    req,

    res

) {

    try {

        const customers =

            await CustomerService.searchCustomers(

                getShopId(

                    req

                ),

                req.query.keyword,

                req.query

            );

        return successResponse(

            res,

            customers,

            "Customer search completed successfully."

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
| Get Customer Orders
|--------------------------------------------------------------------------
*/

async function getCustomerOrders(

    req,

    res

) {

    try {

        const orders =

            await CustomerService.getCustomerOrders(

                getCustomerId(

                    req

                ),

                req.query

            );

        return successResponse(

            res,

            orders,

            "Customer orders retrieved successfully."

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
| Get Customer Analytics
|--------------------------------------------------------------------------
*/

async function getCustomerAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await CustomerService.getCustomerAnalytics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "Customer analytics retrieved successfully."

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
| Update Customer
|--------------------------------------------------------------------------
*/

async function updateCustomer(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.updateCustomer(

                getCustomerId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            customer,

            "Customer updated successfully."

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
| Sync Shopify Customer
|--------------------------------------------------------------------------
*/

async function syncShopifyCustomer(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.syncShopifyCustomer(

                getShopId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            customer,

            "Customer synchronized successfully."

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
| Sync All Customers
|--------------------------------------------------------------------------
*/

async function syncAllCustomers(

    req,

    res

) {

    try {

        const customers =

            await CustomerService.syncAllCustomers(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            customers,

            "All customers synchronized successfully."

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
| Delete Customer
|--------------------------------------------------------------------------
*/

async function deleteCustomer(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.deleteCustomer(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer deleted successfully."

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
| Restore Customer
|--------------------------------------------------------------------------
*/

async function restoreCustomer(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.restoreCustomer(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer restored successfully."

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
| Update Customer Statistics
|--------------------------------------------------------------------------
*/

async function updateCustomerStatistics(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.updateCustomerStatistics(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer statistics updated successfully."

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
| Delete Customer
|--------------------------------------------------------------------------
*/

async function deleteCustomer(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.deleteCustomer(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer deleted successfully."

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
| Restore Customer
|--------------------------------------------------------------------------
*/

async function restoreCustomer(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.restoreCustomer(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer restored successfully."

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
| Update Customer Statistics
|--------------------------------------------------------------------------
*/

async function updateCustomerStatistics(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.updateCustomerStatistics(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer statistics updated successfully."

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
| Mark Customer As Synced
|--------------------------------------------------------------------------
*/

async function markCustomerAsSynced(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.markCustomerAsSynced(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer marked as synced successfully."

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
| Mark Customer As Deleted
|--------------------------------------------------------------------------
*/

async function markCustomerAsDeleted(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.markCustomerAsDeleted(

                getCustomerId(

                    req

                )

            );

        return successResponse(

            res,

            customer,

            "Customer marked as deleted successfully."

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
| Update Last Seen At
|--------------------------------------------------------------------------
*/

async function updateLastSeenAt(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.updateLastSeenAt(

                getCustomerId(

                    req

                ),

                req.body.lastSeenAt

            );

        return successResponse(

            res,

            customer,

            "Customer last seen updated successfully."

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
| Handle Customer Created
|--------------------------------------------------------------------------
*/

async function handleCustomerCreated(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.handleCustomerCreated(

                getShopId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            customer,

            "Customer created successfully."

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
| Handle Customer Updated
|--------------------------------------------------------------------------
*/

async function handleCustomerUpdated(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.handleCustomerUpdated(

                getShopId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            customer,

            "Customer updated successfully."

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
| Handle Customer Deleted
|--------------------------------------------------------------------------
*/

async function handleCustomerDeleted(

    req,

    res

) {

    try {

        const customer =

            await CustomerService.handleCustomerDeleted(

                getShopId(

                    req

                ),

                req.params.shopifyCustomerId

            );

        return successResponse(

            res,

            customer,

            "Customer deleted successfully."

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
| Customer Controller
|--------------------------------------------------------------------------
*/

export const CustomerController = {

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

    updateLastSeenAt,

    handleCustomerCreated,

    handleCustomerUpdated,

    handleCustomerDeleted

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

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

    updateLastSeenAt,

    handleCustomerCreated,

    handleCustomerUpdated,

    handleCustomerDeleted

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default CustomerController;
