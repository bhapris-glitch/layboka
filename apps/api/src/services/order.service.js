/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Conversation from "../../models/Conversation.js";
import Visitor from "../../models/Visitor.js";
import Shop from "../../models/Shop.js";

import {
    calculateRevenueAnalytics,
    recordAI
    /*
|--------------------------------------------------------------------------
| Get Shop Orders
|--------------------------------------------------------------------------
*/

export async function getShopOrders(

    shopId,

    {

        page = 1,

        limit = ORDER_CONFIG.DEFAULT_LIMIT,

        status,

        financialStatus,

        fulfillmentStatus

    } = {}

) {

    limit = Math.min(

        Number(limit),

        ORDER_CONFIG.MAX_LIMIT

    );

    const skip =

        (Number(page) - 1) * limit;

    const query = {

        shop: shopId,

        deleted: false

    };

    if (status) {

        query.status = status;

    }

    if (financialStatus) {

        query.financialStatus =

            financialStatus;

    }

    if (fulfillmentStatus) {

        query.fulfillmentStatus =

            fulfillmentStatus;

    }

    const [

        orders,

        total

    ] = await Promise.all([

        Order.find(query)

            .populate(

                "visitor",

                "firstName lastName email"

            )

            .populate(

                "conversation",

                "conversationId"

            )

            .sort({

                createdAt: -1

            })

            .skip(skip)

            .limit(limit)

            .lean(),

        Order.countDocuments(query)

    ]);

    return {

        orders,

        pagination: {

            page: Number(page),

            limit,

            total,

            pages: Math.ceil(

                total / limit

            )

        }

    };

}

/*
|--------------------------------------------------------------------------
| Search Orders
|--------------------------------------------------------------------------
*/

export async function searchOrders(

    shopId,

    keyword,

    limit = ORDER_CONFIG.DEFAULT_LIMIT

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

    })

    .sort({

        createdAt: -1

    })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Get Recent Orders
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

    .populate(

        "visitor",

        "firstName lastName"

    )

    .lean();

}

/*
|--------------------------------------------------------------------------
| Customer Orders
|--------------------------------------------------------------------------
*/

export async function getCustomerOrders(

    visitorId,

    limit = ORDER_CONFIG.MAX_LIMIT

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
| Sync Shopify Order
|--------------------------------------------------------------------------
*/

export async function syncShopifyOrder(

    shopId,

    shopifyOrder

) {

    const existingOrder =

        await getOrderByShopifyId(

            shopifyOrder.id,

            shopId

        );

    if (existingOrder) {

        return updateOrder(

            existingOrder._id,

            mapShopifyOrder(

                shopifyOrder

            )

        );

    }

    const visitor =

        await Visitor.findOne({

            shop: shopId,

            email:

                shopifyOrder.email,

            deleted: false

        });

    const conversation =

        visitor

            ? await Conversation.findOne({

                  shop: shopId,

                  visitor: visitor._id,

                  deleted: false

              })

              .sort({

                  createdAt: -1

              })

            : null;

    const orderData = {

        ...mapShopifyOrder(

            shopifyOrder

        ),

        shop: shopId,

        visitor:

            visitor?._id || null,

        conversation:

            conversation?._id || null

    };

    const order =

        await createOrder(

            orderData

        );

    await attributeAIRevenue(

        order,

        conversation

    );

    return order;

}

/*
|--------------------------------------------------------------------------
| AI Revenue Attribution
|--------------------------------------------------------------------------
*/

export async function attributeAIRevenue(

    order,

    conversation

) {

    if (

        !conversation ||

        !order

    ) {

        return null;

    }

    conversation.order = {

        orderId: order._id,

        shopifyOrderId:

            order.shopifyOrderId,

        orderNumber:

            order.orderNumber,

        subtotal:

            order.subtotalPrice,

        tax:

            order.totalTax,

        shipping:

            order.shippingPrice,

        discount:

            order.totalDiscount,

        total:

            order.totalPrice,

        currency:

            order.currency,

        purchased: true,

        purchasedAt:

            order.createdAt

    };

    conversation.aiRevenue = {

        ...conversation.aiRevenue,

        directRevenue:

            Number(

                order.totalPrice || 0

            ),

        totalRevenue:

            Number(

                order.totalPrice || 0

            )

    };

    conversation.resolution =

        "purchase";

    conversation.customerStage =

        "purchased";

    conversation.status =

        "resolved";

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Revenue Analytics
|--------------------------------------------------------------------------
*/

export async function calculateOrderRevenue(

    shopId,

    startDate,

    endDate

) {

    const orders =

        await Order.find({

            shop: shopId,

            deleted: false,

            createdAt: {

                $gte: startDate,

                $lte: endDate

            }

        });

    return orders.reduce(

        (

            total,

            order

        ) =>

            total +

            Number(

                order.totalPrice || 0

            ),

        0

    );

}
/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

export async function updateOrderStatus(

    orderId,

    status,

    additionalData = {}

) {

    const order = await Order.findById(orderId);

    if (!order) {

        throw new Error(

            "Order not found."

        );

    }

    order.status = status;

    if (

        additionalData.financialStatus !== undefined

    ) {

        order.financialStatus =

            additionalData.financialStatus;

    }

    if (

        additionalData.fulfillmentStatus !== undefined

    ) {

        order.fulfillmentStatus =

            additionalData.fulfillmentStatus;

    }

    if (

        additionalData.cancelReason !== undefined

    ) {

        order.cancelReason =

            additionalData.cancelReason;

    }

    if (

        additionalData.cancelledAt !== undefined

    ) {

        order.cancelledAt =

            additionalData.cancelledAt;

    }

    if (

        additionalData.refundedAt !== undefined

    ) {

        order.refundedAt =

            additionalData.refundedAt;

    }

    if (

        additionalData.fulfilledAt !== undefined

    ) {

        order.fulfilledAt =

            additionalData.fulfilledAt;

    }

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

    return updateOrderStatus(

        orderId,

        "cancelled",

        {

            financialStatus:

                "voided",

            cancelReason: reason,

            cancelledAt:

                new Date()

        }

    );

}

/*
|--------------------------------------------------------------------------
| Refund Order
|--------------------------------------------------------------------------
*/

export async function refundOrder(

    orderId,

    amount = 0

) {

    const order =

        await updateOrderStatus(

            orderId,

            "refunded",

            {

                financialStatus:

                    "refunded",

                refundedAt:

                    new Date()

            }

        );

    order.refundAmount =

        Number(amount);

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

    return Order.findByIdAndUpdate(

        orderId,

        {

            archived: true,

            archivedAt:

                new Date()

        },

        {

            new: true

        }

    );

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

    if (

        startDate ||

        endDate

    ) {

        query.createdAt = {};

        if (startDate) {

            query.createdAt.$gte =

                new Date(startDate);

        }

        if (endDate) {

            query.createdAt.$lte =

                new Date(endDate);

        }

    }

    const orders =

        await Order.find(query).lean();

    const analytics = {

        totalOrders: orders.length,

        totalRevenue: 0,

        averageOrderValue: 0,

        fulfilledOrders: 0,

        cancelledOrders: 0,

        refundedOrders: 0,

        aiAttributedOrders: 0,

        aiRevenue: 0

    };

    for (const order of orders) {

        const total = Number(

            order.totalPrice || 0

        );

        analytics.totalRevenue += total;

        if (

            order.fulfillmentStatus ===

            "fulfilled"

        ) {

            analytics.fulfilledOrders++;

        }

        if (

            order.status ===

            "cancelled"

        ) {

            analytics.cancelledOrders++;

        }

        if (

            order.status ===

            "refunded"

        ) {

            analytics.refundedOrders++;

        }

        if (

            order.conversation

        ) {

            analytics.aiAttributedOrders++;

            analytics.aiRevenue += total;

        }

    }

    analytics.averageOrderValue =

        analytics.totalOrders

            ? analytics.totalRevenue /

              analytics.totalOrders

            : 0;

    return analytics;

}

/*
|--------------------------------------------------------------------------
| Revenue Calculation
|--------------------------------------------------------------------------
*/

export async function calculateRevenue(

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

    if (

        startDate ||

        endDate

    ) {

        query.createdAt = {};

        if (startDate) {

            query.createdAt.$gte =

                new Date(startDate);

        }

        if (endDate) {

            query.createdAt.$lte =

                new Date(endDate);

        }

    }

    const orders =

        await Order.find(query)

        .select(

            "totalPrice"

        )

        .lean();

    return orders.reduce(

        (

            total,

            order

        ) =>

            total +

            Number(

                order.totalPrice || 0

            ),

        0

    );

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

    Object.entries(

        filters

    ).forEach(

        ([

            key,

            value

        ]) => {

            if (

                value !== undefined &&

                value !== null &&

                value !== ""

            ) {

                query[key] = value;

            }

        }

    );

    return Order.find(query)

        .sort({

            createdAt: -1

        })

        .lean();

}
/*
|--------------------------------------------------------------------------
| Shopify Webhook Handlers
|--------------------------------------------------------------------------
*/

export async function handleOrderCreated(

    shopId,

    shopifyOrder

) {

    try {

        return await syncShopifyOrder(

            shopId,

            shopifyOrder

        );

    } catch (error) {

        console.error(

            "Order Created Webhook Error:",

            error

        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Handle Order Updated
|--------------------------------------------------------------------------
*/

export async function handleOrderUpdated(

    shopId,

    shopifyOrder

) {

    try {

        return await syncShopifyOrder(

            shopId,

            shopifyOrder

        );

    } catch (error) {

        console.error(

            "Order Updated Webhook Error:",

            error

        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Handle Order Deleted
|--------------------------------------------------------------------------
*/

export async function handleOrderDeleted(

    shopId,

    shopifyOrderId

) {

    const order =

        await getOrderByShopifyId(

            shopifyOrderId,

            shopId

        );

    if (!order) {

        return null;

    }

    order.deleted = true;

    order.deletedAt =

        new Date();

    await order.save();

    return order;

}

/*
|--------------------------------------------------------------------------
| Order Service
|--------------------------------------------------------------------------
*/

export const OrderService = {

    createOrder,

    updateOrder,

    getOrder,

    getOrderByShopifyId,

    getShopOrders,

    searchOrders,

    getRecentOrders,

    getCustomerOrders,

    syncShopifyOrder,

    updateOrderStatus,

    cancelOrder,

    refundOrder,

    archiveOrder,

    getOrderAnalytics,

    calculateRevenue,

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
