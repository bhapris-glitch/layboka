// File:
// layboka/apps/api/src/services/order.service.js

import Order from "../models/Order.js";
import Conversation from "../models/Conversation.js";
import Visitor from "../models/Visitor.js";
import Product from "../models/Product.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

export const ORDER_STATUS = Object.freeze({

    PENDING: "pending",

    CONFIRMED: "confirmed",

    PAID: "paid",

    PROCESSING: "processing",

    FULFILLED: "fulfilled",

    SHIPPED: "shipped",

    DELIVERED: "delivered",

    CANCELLED: "cancelled",

    REFUNDED: "refunded"

});

export const PAYMENT_STATUS = Object.freeze({

    PENDING: "pending",

    PAID: "paid",

    PARTIALLY_PAID: "partially_paid",

    REFUNDED: "refunded",

    PARTIALLY_REFUNDED: "partially_refunded",

    FAILED: "failed"

});

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export async function createOrder(orderData) {

    const order = await Order.create(orderData);

    return order;

}

/*
|--------------------------------------------------------------------------
| Update Order
|--------------------------------------------------------------------------
*/

export async function updateOrder(

    orderId,

    updates

) {

    return Order.findByIdAndUpdate(

        orderId,

        updates,

        {

            new: true,

            runValidators: true

        }

    );

}

/*
|--------------------------------------------------------------------------
| Get Order
|--------------------------------------------------------------------------
*/

export async function getOrder(orderId) {

    return Order.findById(orderId)

        .populate("shop")

        .populate("visitor")

        .populate("conversation")

        .populate("products.product");

}

/*
|--------------------------------------------------------------------------
| Get Order By Shopify Order ID
|--------------------------------------------------------------------------
*/

export async function getOrderByShopifyId(

    shopifyOrderId

) {

    return Order.findOne({

        shopifyOrderId

    });

}

/*
|--------------------------------------------------------------------------
| Get Shop Orders
|--------------------------------------------------------------------------
*/

export async function getShopOrders(

    shopId,

    {

        page = 1,

        limit = 20

    } = {}

) {

    return Order.find({

        shop: shopId,

        deleted: false

    })

    .sort({

        createdAt: -1

    })

    .skip(

        (page - 1) * limit

    )

    .limit(limit);

}
/*
|--------------------------------------------------------------------------
| Sync Shopify Order
|--------------------------------------------------------------------------
*/

export async function syncShopifyOrder(

    shop,

    shopifyOrder

) {

    if (!shopifyOrder) {

        throw new Error(
            "Shopify order is required."
        );

    }

    const existingOrder = await Order.findOne({

        shop: shop._id,

        shopifyOrderId: String(shopifyOrder.id)

    });

    const orderData = {

        orderNumber:
            shopifyOrder.name ||

            shopifyOrder.order_number,

        financialStatus:
            shopifyOrder.financial_status,

        fulfillmentStatus:
            shopifyOrder.fulfillment_status ||

            "unfulfilled",

        currency:
            shopifyOrder.currency,

        subtotalPrice:
            Number(shopifyOrder.subtotal_price || 0),

        totalTax:
            Number(shopifyOrder.total_tax || 0),

        totalDiscount:
            Number(shopifyOrder.total_discounts || 0),

        totalPrice:
            Number(shopifyOrder.total_price || 0),

        customer: {

            firstName:
                shopifyOrder.customer?.first_name || "",

            lastName:
                shopifyOrder.customer?.last_name || "",

            email:
                shopifyOrder.customer?.email || ""

        },

        rawData: shopifyOrder,

        syncedAt: new Date()

    };

    if (existingOrder) {

        Object.assign(

            existingOrder,

            orderData

        );

        await existingOrder.save();

        return existingOrder;

    }

    return Order.create({

        shop: shop._id,

        shopifyOrderId:
            String(shopifyOrder.id),

        ...orderData

    });

}

/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

export async function updateOrderStatus(

    orderId,

    updates = {}

) {

    const order = await Order.findById(

        orderId

    );

    if (!order) {

        throw new Error(
            "Order not found."
        );

    }

    if (updates.financialStatus) {

        order.financialStatus =
            updates.financialStatus;

    }

    if (updates.fulfillmentStatus) {

        order.fulfillmentStatus =
            updates.fulfillmentStatus;

    }

    if (updates.paymentStatus) {

        order.paymentStatus =
            updates.paymentStatus;

    }

    if (updates.status) {

        order.status =
            updates.status;

    }

    order.updatedAt = new Date();

    await order.save();

    return order;

}

/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

export async function cancelOrder(

    orderId,

    reason = ""

) {

    const order = await Order.findById(

        orderId

    );

    if (!order) {

        throw new Error(
            "Order not found."
        );

    }

    order.status = "cancelled";

    order.cancelled = true;

    order.cancelledAt = new Date();

    order.cancelReason = reason;

    await order.save();

    return order;

}

/*
|--------------------------------------------------------------------------
| Refund Order
|--------------------------------------------------------------------------
*/

export async function refundOrder(

    orderId,

    amount = null,

    reason = ""

) {

    const order = await Order.findById(

        orderId

    );

    if (!order) {

        throw new Error(
            "Order not found."
        );

    }

    order.refunded = true;

    order.refundedAt = new Date();

    order.refundReason = reason;

    order.refundAmount =
        amount ||

        order.totalPrice;

    if (

        order.refundAmount >=

        order.totalPrice

    ) {

        order.financialStatus =
            "refunded";

    } else {

        order.financialStatus =
            "partially_refunded";

    }

    await order.save();

    return order;

}

/*
|--------------------------------------------------------------------------
| Archive Order
|--------------------------------------------------------------------------
*/

export async function archiveOrder(

    orderId

) {

    const order = await Order.findById(

        orderId

    );

    if (!order) {

        throw new Error(
            "Order not found."
        );

    }

    order.archived = true;

    order.archivedAt = new Date();

    await order.save();

    return order;

      }
/*
|--------------------------------------------------------------------------
| Order Analytics
|--------------------------------------------------------------------------
*/

export async function getOrderAnalytics(

    shopId,

    {

        startDate,

        endDate

    } = {}

) {

    const query = {

        shop: shopId,

        deleted: false

    };

    if (startDate || endDate) {

        query.createdAt = {};

        if (startDate) {

            query.createdAt.$gte = new Date(startDate);

        }

        if (endDate) {

            query.createdAt.$lte = new Date(endDate);

        }

    }

    const orders = await Order.find(query).lean();

    const analytics = {

        totalOrders: orders.length,

        totalRevenue: 0,

        averageOrderValue: 0,

        totalTax: 0,

        totalShipping: 0,

        totalDiscount: 0,

        totalRefunded: 0,

        paidOrders: 0,

        pendingOrders: 0,

        cancelledOrders: 0

    };

    for (const order of orders) {

        analytics.totalRevenue += Number(order.total || 0);

        analytics.totalTax += Number(order.tax || 0);

        analytics.totalShipping += Number(order.shipping || 0);

        analytics.totalDiscount += Number(order.discount || 0);

        analytics.totalRefunded += Number(order.refundedAmount || 0);

        if (order.financialStatus === "paid") {

            analytics.paidOrders++;

        }

        if (order.financialStatus === "pending") {

            analytics.pendingOrders++;

        }

        if (order.cancelledAt) {

            analytics.cancelledOrders++;

        }

    }

    analytics.averageOrderValue =

        analytics.totalOrders > 0

            ? Number(

                (

                    analytics.totalRevenue /

                    analytics.totalOrders

                ).toFixed(2)

            )

            : 0;

    return analytics;

}

/*
|--------------------------------------------------------------------------
| Revenue Calculation
|--------------------------------------------------------------------------
*/

export async function calculateRevenue(

    shopId

) {

    const analytics =

        await getOrderAnalytics(shopId);

    return {

        grossRevenue:

            analytics.totalRevenue,

        refunded:

            analytics.totalRefunded,

        netRevenue:

            analytics.totalRevenue -

            analytics.totalRefunded

    };

}

/*
|--------------------------------------------------------------------------
| Customer Order History
|--------------------------------------------------------------------------
*/

export async function getCustomerOrders(

    visitorId,

    limit = 20

) {

    return Order.find({

        visitor: visitorId,

        deleted: false

    })

        .sort({

            createdAt: -1

        })

        .limit(limit)

        .lean();

}

/*
|--------------------------------------------------------------------------
| Recent Orders
|--------------------------------------------------------------------------
*/

export async function getRecentOrders(

    shopId,

    limit = 10

) {

    return Order.find({

        shop: shopId,

        deleted: false

    })

        .sort({

            createdAt: -1

        })

        .limit(limit)

        .lean();

}

/*
|--------------------------------------------------------------------------
| Search Orders
|--------------------------------------------------------------------------
*/

export async function searchOrders(

    shopId,

    keyword

) {

    return Order.find({

        shop: shopId,

        deleted: false,

        $or: [

            {

                orderNumber: {

                    $regex: keyword,

                    $options: "i"

                }

            },

            {

                customerEmail: {

                    $regex: keyword,

                    $options: "i"

                }

            },

            {

                customerName: {

                    $regex: keyword,

                    $options: "i"

                }

            }

        ]

    }).lean();

}

/*
|--------------------------------------------------------------------------
| Filter Orders
|--------------------------------------------------------------------------
*/

export async function filterOrders(

    shopId,

    filters = {}

) {

    const query = {

        shop: shopId,

        deleted: false

    };

    if (filters.financialStatus) {

        query.financialStatus =

            filters.financialStatus;

    }

    if (filters.fulfillmentStatus) {

        query.fulfillmentStatus =

            filters.fulfillmentStatus;

    }

    if (filters.customerId) {

        query.visitor =

            filters.customerId;

    }

    return Order.find(query)

        .sort({

            createdAt: -1

        })

        .lean();

}

/*
|--------------------------------------------------------------------------
| Shopify Webhook Helpers
|--------------------------------------------------------------------------
*/

export async function handleOrderCreated(

    orderData

) {

    return syncOrder(orderData);

}

export async function handleOrderUpdated(

    orderData

) {

    return syncOrder(orderData);

}

export async function handleOrderDeleted(

    shopifyOrderId

) {

    return Order.findOneAndUpdate(

        {

            shopifyOrderId

        },

        {

            deleted: true

        },

        {

            new: true

        }

    );

}

/*
|--------------------------------------------------------------------------
| Order Service
|--------------------------------------------------------------------------
*/

export const OrderService = {

    syncOrder,

    getOrderById,

    getOrderByShopifyId,

    updateOrder,

    deleteOrder,

    getOrderAnalytics,

    calculateRevenue,

    getCustomerOrders,

    getRecentOrders,

    searchOrders,

    filterOrders,

    handleOrderCreated,

    handleOrderUpdated,

    handleOrderDeleted

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default OrderService;
