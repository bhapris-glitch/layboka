/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import OrderService from "../services/order/order.service.js";

/*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/

const successResponse = (

    res,

    message,

    data = null,

    status = 200

) => {

    return res.status(status).json({

        success: true,

        message,

        data

    });

};

const errorResponse = (

    res,

    error,

    status = 500

) => {

    return res.status(status).json({

        success: false,

        message:

            error.message ||

            "Internal Server Error"

    });

};

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export async function create(

    req,

    res

) {

    try {

        const order =

            await OrderService.createOrder(

                req.shop._id,

                req.body

            );

        return successResponse(

            res,

            "Order created successfully.",

            order,

            201

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Update Order
|--------------------------------------------------------------------------
*/

export async function update(

    req,

    res

) {

    try {

        const {

            orderId

        } = req.params;

        const order =

            await OrderService.updateOrder(

                orderId,

                req.body

            );

        return successResponse(

            res,

            "Order updated successfully.",

            order

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Get Single Order
|--------------------------------------------------------------------------
*/

export async function getOne(

    req,

    res

) {

    try {

        const {

            orderId

        } = req.params;

        const order =

            await OrderService.getOrder(

                orderId

            );

        return successResponse(

            res,

            "Order retrieved successfully.",

            order

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Get Shop Orders
|--------------------------------------------------------------------------
*/

export async function getAll(

    req,

    res

) {

    try {

        const {

            page,

            limit,

            status,

            financialStatus,

            fulfillmentStatus,

            search

        } = req.query;

        const orders =

            await OrderService.getShopOrders(

                req.shop._id,

                {

                    page,

                    limit,

                    status,

                    financialStatus,

                    fulfillmentStatus,

                    search

                }

            );

        return successResponse(

            res,

            "Orders retrieved successfully.",

            orders

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

              }
/*
|--------------------------------------------------------------------------
| Search Orders
|--------------------------------------------------------------------------
*/

export async function search(

    req,

    res

) {

    try {

        const {

            keyword,

            page,

            limit

        } = req.query;

        if (!keyword) {

            return errorResponse(

                res,

                new Error(

                    "Search keyword is required."

                ),

                400

            );

        }

        const orders =

            await OrderService.searchOrders(

                req.shop._id,

                keyword,

                {

                    page,

                    limit

                }

            );

        return successResponse(

            res,

            "Orders retrieved successfully.",

            orders

        );

    } catch (error) {

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

export async function getRecent(

    req,

    res

) {

    try {

        const {

            limit

        } = req.query;

        const orders =

            await OrderService.getRecentOrders(

                req.shop._id,

                limit

            );

        return successResponse(

            res,

            "Recent orders retrieved successfully.",

            orders

        );

    } catch (error) {

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

export async function getCustomerOrders(

    req,

    res

) {

    try {

        const {

            customerId

        } = req.params;

        const {

            page,

            limit

        } = req.query;

        const orders =

            await OrderService.getCustomerOrders(

                req.shop._id,

                customerId,

                {

                    page,

                    limit

                }

            );

        return successResponse(

            res,

            "Customer orders retrieved successfully.",

            orders

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

                  }
/*
|--------------------------------------------------------------------------
| Sync Shopify Order
|--------------------------------------------------------------------------
*/

export async function sync(

    req,

    res

) {

    try {

        const {

            shopifyOrder

        } = req.body;

        if (!shopifyOrder) {

            return errorResponse(

                res,

                new Error(

                    "Shopify order data is required."

                ),

                400

            );

        }

        const order =

            await OrderService.syncShopifyOrder(

                req.shop._id,

                shopifyOrder

            );

        return successResponse(

            res,

            "Order synchronized successfully.",

            order

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

export async function updateStatus(

    req,

    res

) {

    try {

        const {

            orderId

        } = req.params;

        const {

            status,

            financialStatus,

            fulfillmentStatus

        } = req.body;

        const order =

            await OrderService.updateOrderStatus(

                orderId,

                {

                    status,

                    financialStatus,

                    fulfillmentStatus

                }

            );

        return successResponse(

            res,

            "Order status updated successfully.",

            order

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

export async function cancel(

    req,

    res

) {

    try {

        const {

            orderId

        } = req.params;

        const {

            reason

        } = req.body;

        const order =

            await OrderService.cancelOrder(

                orderId,

                reason

            );

        return successResponse(

            res,

            "Order cancelled successfully.",

            order

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Refund Order
|--------------------------------------------------------------------------
*/

export async function refund(

    req,

    res

) {

    try {

        const {

            orderId

        } = req.params;

        const {

            amount,

            reason

        } = req.body;


        const order =

            await OrderService.refundOrder(

                orderId,

                {

                    amount,

                    reason

                }

            );


        return successResponse(

            res,

            "Order refunded successfully.",

            order

        );


    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Archive Order
|--------------------------------------------------------------------------
*/

export async function archive(

    req,

    res

) {

    try {

        const {

            orderId

        } = req.params;


        const order =

            await OrderService.archiveOrder(

                orderId

            );


        return successResponse(

            res,

            "Order archived successfully.",

            order

        );


    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Order Analytics
|--------------------------------------------------------------------------
*/

export async function analytics(

    req,

    res

) {

    try {


        const analytics =

            await OrderService.getOrderAnalytics(

                req.shop._id,

                req.query

            );


        return successResponse(

            res,

            "Order analytics retrieved successfully.",

            analytics

        );


    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Calculate Revenue
|--------------------------------------------------------------------------
*/

export async function revenue(

    req,

    res

) {

    try {

        const revenue =

            await OrderService.calculateRevenue(

                req.shop._id,

                req.query

            );

        return successResponse(

            res,

            "Revenue calculated successfully.",

            revenue

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Filter Orders
|--------------------------------------------------------------------------
*/

export async function filter(

    req,

    res

) {

    try {

        const orders =

            await OrderService.filterOrders(

                req.shop._id,

                req.query

            );

        return successResponse(

            res,

            "Orders filtered successfully.",

            orders

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Order Controller
|--------------------------------------------------------------------------
*/

export const OrderController = {

    create,

    update,

    getOne,

    getAll,

    search,

    getRecent,

    getCustomerOrders,

    sync,

    updateStatus,

    cancel,

    refund,

    archive,

    analytics,

    revenue,

    filter

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default OrderController;
