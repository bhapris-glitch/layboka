import crypto from "crypto";

import Shop from "../../models/Shop.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import Visitor from "../../models/Visitor.js";
import Conversation from "../../models/Conversation.js";

/*
|--------------------------------------------------------------------------
| Supported Shopify Webhooks
|--------------------------------------------------------------------------
*/

export const SHOPIFY_WEBHOOKS = Object.freeze({

    APP_UNINSTALLED: "app/uninstalled",

    SHOP_UPDATE: "shop/update",

    PRODUCTS_CREATE: "products/create",

    PRODUCTS_UPDATE: "products/update",

    PRODUCTS_DELETE: "products/delete",

    ORDERS_CREATE: "orders/create",

    ORDERS_UPDATED: "orders/updated",

    ORDERS_PAID: "orders/paid",

    ORDERS_CANCELLED: "orders/cancelled",

    CUSTOMERS_CREATE: "customers/create",

    CUSTOMERS_UPDATE: "customers/update",

    CARTS_UPDATE: "carts/update"

});

/*
|--------------------------------------------------------------------------
| Verify Shopify Webhook Signature
|--------------------------------------------------------------------------
*/

export function verifyWebhookSignature(

    rawBody,

    hmacHeader

) {

    const secret = process.env.SHOPIFY_API_SECRET;

    if (!secret) {

        throw new Error(

            "SHOPIFY_API_SECRET is missing."

        );

    }

    const generatedHmac = crypto

        .createHmac(

            "sha256",

            secret

        )

        .update(rawBody, "utf8")

        .digest("base64");

    const generatedBuffer = Buffer.from(

        generatedHmac

    );

    const receivedBuffer = Buffer.from(

        hmacHeader || ""

    );

    if (

        generatedBuffer.length !==

        receivedBuffer.length

    ) {

        return false;

    }

    return crypto.timingSafeEqual(

        generatedBuffer,

        receivedBuffer

    );

}

/*
|--------------------------------------------------------------------------
| Parse Webhook Headers
|--------------------------------------------------------------------------
*/

export function getWebhookContext(headers = {}) {

    return {

        topic:

            headers["x-shopify-topic"],

        shop:

            headers["x-shopify-shop-domain"],

        webhookId:

            headers["x-shopify-webhook-id"],

        apiVersion:

            headers["x-shopify-api-version"],

        triggeredAt:

            new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Find Shop
|--------------------------------------------------------------------------
*/

export async function findShop(

    shopDomain

) {

    return Shop.findOne({

        shopDomain,

        isInstalled: true,

        deleted: false

    });

}
/*
|--------------------------------------------------------------------------
| Product Webhook Handler
|--------------------------------------------------------------------------
*/

export async function handleProductWebhook(

    shop,

    topic,

    payload

) {

    switch (topic) {

        case "products/create":

            return handleProductCreate(

                shop,

                payload

            );

        case "products/update":

            return handleProductUpdate(

                shop,

                payload

            );

        case "products/delete":

            return handleProductDelete(

                shop,

                payload

            );

        default:

            return null;

    }

}

/*
|--------------------------------------------------------------------------
| Product Create
|--------------------------------------------------------------------------
*/

export async function handleProductCreate(

    shop,

    payload

) {

    try {

        const product =

            await syncProduct(

                shop,

                payload

            );

        return {

            success: true,

            action: "created",

            product

        };

    } catch (error) {

        console.error(

            "Product Create Webhook:",

            error

        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Product Update
|--------------------------------------------------------------------------
*/

export async function handleProductUpdate(

    shop,

    payload

) {

    try {

        const product =

            await syncProduct(

                shop,

                payload

            );

        return {

            success: true,

            action: "updated",

            product

        };

    } catch (error) {

        console.error(

            "Product Update Webhook:",

            error

        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Product Delete
|--------------------------------------------------------------------------
*/

export async function handleProductDelete(

    shop,

    payload

) {

    try {

        const product =

            await Product.findOne({

                shop: shop._id,

                shopifyProductId: String(

                    payload.id

                )

            });

        if (!product) {

            return {

                success: false,

                message: "Product not found."

            };

        }

        product.deleted = true;

        product.deletedAt = new Date();

        product.status = "deleted";

        await product.save();

        return {

            success: true,

            action: "deleted"

        };

    } catch (error) {

        console.error(

            "Product Delete Webhook:",

            error

        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Product Synchronization
|--------------------------------------------------------------------------
*/

export async function syncProduct(

    shop,

    payload

) {

    let product =

        await Product.findOne({

            shop: shop._id,

            shopifyProductId: String(

                payload.id

            )

        });

    if (!product) {

        product = new Product({

            shop: shop._id,

            shopifyProductId: String(

                payload.id

            )

        });

    }

    product.title =
        payload.title ?? "";

    product.handle =
        payload.handle ?? "";

    product.description =
        payload.body_html ?? "";

    product.vendor =
        payload.vendor ?? "";

    product.productType =
        payload.product_type ?? "";

    product.tags =
        payload.tags
            ? payload.tags
                  .split(",")
                  .map(tag => tag.trim())
            : [];

    product.status =
        payload.status ?? "active";

    product.published =
        payload.status === "active";

    /*
    |--------------------------------------------------------------------------
    | Product Images
    |--------------------------------------------------------------------------
    */

    product.images =

        (payload.images || []).map(

            image => ({

                shopifyImageId:

                    String(image.id),

                src: image.src,

                alt:

                    image.alt ||

                    ""

            })

        );

    /*
    |--------------------------------------------------------------------------
    | Variants
    |--------------------------------------------------------------------------
    */

    product.variants =
        payload.variants || [];

    /*
    |--------------------------------------------------------------------------
    | Inventory
    |--------------------------------------------------------------------------
    */

    await updateInventory(

        product,

        payload

    );

    await product.save();

    return product;

}

/*
|--------------------------------------------------------------------------
| Inventory Updates
|--------------------------------------------------------------------------
*/

export async function updateInventory(

    product,

    payload

) {

    const variants =

        payload.variants || [];

    let totalInventory = 0;

    let minPrice = null;

    let compareAtPrice = null;

    for (const variant of variants) {

        totalInventory +=

            Number(

                variant.inventory_quantity || 0

            );

        const price =

            Number(

                variant.price || 0

            );

        if (

            minPrice === null ||

            price < minPrice

        ) {

            minPrice = price;

        }

        if (

            variant.compare_at_price

        ) {

            compareAtPrice = Number(

                variant.compare_at_price

            );

        }

    }

    product.inventoryQuantity =
        totalInventory;

    product.price =
        minPrice || 0;

    product.compareAtPrice =
        compareAtPrice || 0;

    product.inStock =
        totalInventory > 0;

}
/*
|--------------------------------------------------------------------------
| Order Webhook Router
|--------------------------------------------------------------------------
*/

export async function handleOrderWebhook(

    shop,

    topic,

    payload

) {

    switch (topic) {

        case "orders/create":

            return handleOrderCreate(

                shop,

                payload

            );

        case "orders/updated":

            return handleOrderUpdated(

                shop,

                payload

            );

        case "orders/paid":

            return handleOrderPaid(

                shop,

                payload

            );

        case "orders/cancelled":

            return handleOrderCancelled(

                shop,

                payload

            );

        case "orders/fulfilled":

            return handleOrderFulfilled(

                shop,

                payload

            );

        default:

            return null;

    }

}

/*
|--------------------------------------------------------------------------
| Order Created
|--------------------------------------------------------------------------
*/

export async function handleOrderCreate(

    shop,

    payload

) {

    const order = await syncOrder(

        shop,

        payload

    );

    await attributeRevenue(

        shop,

        order

    );

    await trackAIConversion(

        shop,

        order

    );

    return {

        success: true,

        action: "created",

        order

    };

}

/*
|--------------------------------------------------------------------------
| Order Updated
|--------------------------------------------------------------------------
*/

export async function handleOrderUpdated(

    shop,

    payload

) {

    const order = await syncOrder(

        shop,

        payload

    );

    return {

        success: true,

        action: "updated",

        order

    };

}

/*
|--------------------------------------------------------------------------
| Order Paid
|--------------------------------------------------------------------------
*/

export async function handleOrderPaid(

    shop,

    payload

) {

    const order = await syncOrder(

        shop,

        payload

    );

    order.financialStatus = "paid";

    order.paid = true;

    order.paidAt = new Date();

    await order.save();

    await attributeRevenue(

        shop,

        order

    );

    await trackAIConversion(

        shop,

        order

    );

    return {

        success: true,

        action: "paid",

        order

    };

}

/*
|--------------------------------------------------------------------------
| Order Cancelled
|--------------------------------------------------------------------------
*/

export async function handleOrderCancelled(

    shop,

    payload

) {

    const order = await syncOrder(

        shop,

        payload

    );

    order.cancelled = true;

    order.cancelledAt = new Date();

    order.status = "cancelled";

    await order.save();

    return {

        success: true,

        action: "cancelled",

        order

    };

}

/*
|--------------------------------------------------------------------------
| Order Fulfilled
|--------------------------------------------------------------------------
*/

export async function handleOrderFulfilled(

    shop,

    payload

) {

    const order = await syncOrder(

        shop,

        payload

    );

    order.fulfillmentStatus = "fulfilled";

    order.fulfilled = true;

    order.fulfilledAt = new Date();

    await order.save();

    return {

        success: true,

        action: "fulfilled",

        order

    };

}

/*
|--------------------------------------------------------------------------
| Order Synchronization
|--------------------------------------------------------------------------
*/

export async function syncOrder(

    shop,

    payload

) {

    let order = await Order.findOne({

        shop: shop._id,

        shopifyOrderId: String(payload.id)

    });

    if (!order) {

        order = new Order({

            shop: shop._id,

            shopifyOrderId: String(payload.id)

        });

    }

    order.orderNumber =
        payload.name || "";

    order.customerEmail =
        payload.email || "";

    order.currency =
        payload.currency || "USD";

    order.financialStatus =
        payload.financial_status || "";

    order.fulfillmentStatus =
        payload.fulfillment_status || "";

    order.subtotal =
        Number(

            payload.current_subtotal_price || 0

        );

    order.tax =
        Number(

            payload.total_tax || 0

        );

    order.shipping =
        Number(

            payload.total_shipping_price_set
                ?.shop_money?.amount || 0

        );

    order.discount =
        Number(

            payload.total_discounts || 0

        );

    order.total =
        Number(

            payload.total_price || 0

        );

    order.items =
        payload.line_items || [];

    order.status =
        payload.cancelled_at

            ? "cancelled"

            : "completed";

    order.processedAt =
        payload.processed_at

            ? new Date(

                payload.processed_at

            )

            : new Date();

    await order.save();

    return order;

}

/*
|--------------------------------------------------------------------------
| Revenue Attribution
|--------------------------------------------------------------------------
*/

export async function attributeRevenue(

    shop,

    order

) {

    const conversation =

        await Conversation.findOne({

            shop: shop._id,

            visitor:

                order.visitor,

            status: "active"

        }).sort({

            lastMessageAt: -1

        });

    if (!conversation) {

        return;

    }

    conversation.order = {

        orderId: order._id,

        shopifyOrderId:

            order.shopifyOrderId,

        orderNumber:

            order.orderNumber,

        subtotal:

            order.subtotal,

        tax:

            order.tax,

        shipping:

            order.shipping,

        discount:

            order.discount,

        total:

            order.total,

        currency:

            order.currency,

        purchased: true,

        purchasedAt:

            new Date()

    };

    conversation.aiRevenue.directRevenue +=

        order.total;

    conversation.aiRevenue.totalRevenue +=

        order.total;

    await conversation.save();

}

/*
|--------------------------------------------------------------------------
| AI Conversion Tracking
|--------------------------------------------------------------------------
*/

export async function trackAIConversion(

    shop,

    order

) {

    const analytics =

        await Analytics.findOne({

            shop: shop._id

        });

    if (!analytics) {

        return;

    }

    analytics.aiConversions += 1;

    analytics.aiRevenue +=

        order.total;

    analytics.orders += 1;

    analytics.revenue +=

        order.total;

    analytics.lastOrderAt =

        new Date();

    await analytics.save();

}
/*
|--------------------------------------------------------------------------
| Customer Webhook Handler
|--------------------------------------------------------------------------
*/

export async function handleCustomerWebhook(

    shop,

    topic,

    payload

) {

    switch (topic) {

        case "customers/create":

            return handleCustomerCreate(

                shop,

                payload

            );

        case "customers/update":

            return handleCustomerUpdate(

                shop,

                payload

            );

        case "customers/delete":

            return handleCustomerDelete(

                shop,

                payload

            );

        default:

            return null;

    }

}

/*
|--------------------------------------------------------------------------
| Customer Create
|--------------------------------------------------------------------------
*/

export async function handleCustomerCreate(

    shop,

    payload

) {

    const visitor = await Visitor.findOne({

        shop: shop._id,

        email: payload.email

    });

    if (visitor) {

        visitor.customerId = String(payload.id);

        visitor.firstName = payload.first_name || "";

        visitor.lastName = payload.last_name || "";

        visitor.acceptsMarketing =

            payload.accepts_marketing || false;

        visitor.ordersCount =

            payload.orders_count || 0;

        visitor.totalSpent =

            Number(payload.total_spent || 0);

        await visitor.save();
    }

    return {

        success: true,

        action: "customer_created"

    };

}

/*
|--------------------------------------------------------------------------
| Customer Update
|--------------------------------------------------------------------------
*/

export async function handleCustomerUpdate(

    shop,

    payload

) {

    const visitor = await Visitor.findOne({

        shop: shop._id,

        customerId: String(payload.id)

    });

    if (!visitor) {

        return {

            success: false,

            message: "Visitor not found."

        };

    }

    visitor.email = payload.email || visitor.email;

    visitor.firstName = payload.first_name || "";

    visitor.lastName = payload.last_name || "";

    visitor.ordersCount = payload.orders_count || 0;

    visitor.totalSpent = Number(

        payload.total_spent || 0

    );

    visitor.acceptsMarketing =

        payload.accepts_marketing || false;

    await visitor.save();

    return {

        success: true,

        action: "customer_updated"

    };

}

/*
|--------------------------------------------------------------------------
| Customer Delete
|--------------------------------------------------------------------------
*/

export async function handleCustomerDelete(

    shop,

    payload

) {

    await Visitor.updateOne(

        {

            shop: shop._id,

            customerId: String(payload.id)

        },

        {

            deleted: true,

            deletedAt: new Date()

        }

    );

    return {

        success: true,

        action: "customer_deleted"

    };

}

/*
|--------------------------------------------------------------------------
| App Uninstalled
|--------------------------------------------------------------------------
*/

export async function handleAppUninstalled(

    shop

) {

    /*
    |--------------------------------------------------------------------------
    | Disable Shop
    |--------------------------------------------------------------------------
    */

    shop.installed = false;

    shop.status = "uninstalled";

    shop.uninstalledAt = new Date();

    await shop.save();

    /*
    |--------------------------------------------------------------------------
    | Cancel Subscription
    |--------------------------------------------------------------------------
    */

    await Subscription.updateMany(

        {

            shop: shop._id,

            status: "active"

        },

        {

            status: "cancelled",

            cancelledAt: new Date()

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Cleanup Conversations
    |--------------------------------------------------------------------------
    */

    await Conversation.updateMany(

        {

            shop: shop._id

        },

        {

            archived: true

        }

    );

    return {

        success: true,

        action: "app_uninstalled"

    };

}

/*
|--------------------------------------------------------------------------
| GDPR Customer Redact
|--------------------------------------------------------------------------
*/

export async function handleCustomerRedact(

    payload

) {

    await Visitor.updateMany(

        {

            customerId: String(payload.customer.id)

        },

        {

            email: "",

            firstName: "",

            lastName: "",

            phone: "",

            customerNotes: "",

            deleted: true

        }

    );

    return {

        success: true

    };

}

/*
|--------------------------------------------------------------------------
| GDPR Shop Redact
|--------------------------------------------------------------------------
*/

export async function handleShopRedact(

    shop

) {

    await Conversation.deleteMany({

        shop: shop._id

    });

    await Message.deleteMany({

        shop: shop._id

    });

    await Visitor.deleteMany({

        shop: shop._id

    });

    return {

        success: true

    };

}

/*
|--------------------------------------------------------------------------
| GDPR Customers Data Request
|--------------------------------------------------------------------------
*/

export async function handleCustomersDataRequest(

    payload

) {

    const visitor = await Visitor.findOne({

        customerId: String(

            payload.customer.id

        )

    });

    return {

        success: true,

        customer: visitor

    };

}

/*
|--------------------------------------------------------------------------
| Shop Cleanup
|--------------------------------------------------------------------------
*/

export async function cleanupShopData(

    shopId

) {

    await Conversation.deleteMany({

        shop: shopId

    });

    await Message.deleteMany({

        shop: shopId

    });

    await Visitor.deleteMany({

        shop: shopId

    });

    await Analytics.deleteMany({

        shop: shopId

    });

    return true;

}

/*
|--------------------------------------------------------------------------
| Conversation Cleanup
|--------------------------------------------------------------------------
*/

export async function cleanupConversation(

    conversationId

) {

    await Message.deleteMany({

        conversation: conversationId

    });

    await Conversation.deleteOne({

        _id: conversationId

    });

    return true;

}

/*
|--------------------------------------------------------------------------
| Subscription Updates
|--------------------------------------------------------------------------
*/

export async function updateSubscriptionStatus(

    shop,

    status

) {

    const subscription =

        await Subscription.findOne({

            shop: shop._id

        });

    if (!subscription) {

        return null;

    }

    subscription.status = status;

    subscription.updatedAt = new Date();

    await subscription.save();

    return subscription;

            }
/*
|--------------------------------------------------------------------------
| Webhook Service
|--------------------------------------------------------------------------
|
| Central service object exposing all webhook handlers and helpers.
|--------------------------------------------------------------------------
*/

export const WebhookService = {

    /*
    |--------------------------------------------------------------------------
    | Verification
    |--------------------------------------------------------------------------
    */

    verifyWebhook,

    processWebhook,

    parseWebhookPayload,

    /*
    |--------------------------------------------------------------------------
    | Product Webhooks
    |--------------------------------------------------------------------------
    */

    handleProductWebhook,

    handleProductCreate,

    handleProductUpdate,

    handleProductDelete,

    syncProduct,

    updateInventory,

    /*
    |--------------------------------------------------------------------------
    | Order Webhooks
    |--------------------------------------------------------------------------
    */

    handleOrderWebhook,

    handleOrderCreate,

    handleOrderUpdate,

    handleOrderCancel,

    handleOrderFulfilled,

    syncOrder,

    /*
    |--------------------------------------------------------------------------
    | Customer Webhooks
    |--------------------------------------------------------------------------
    */

    handleCustomerWebhook,

    handleCustomerCreate,

    handleCustomerUpdate,

    handleCustomerDelete,

    /*
    |--------------------------------------------------------------------------
    | Shop Webhooks
    |--------------------------------------------------------------------------
    */

    handleAppUninstalled,

    handleShopUpdate,

    /*
    |--------------------------------------------------------------------------
    | Utilities
    |--------------------------------------------------------------------------
    */

    logWebhook,

    updateWebhookStatus

};

/*
|--------------------------------------------------------------------------
| Helper Exports
|--------------------------------------------------------------------------
*/

export {

    verifyWebhook,

    processWebhook,

    parseWebhookPayload,

    handleProductWebhook,

    handleProductCreate,

    handleProductUpdate,

    handleProductDelete,

    syncProduct,

    updateInventory,

    handleOrderWebhook,

    handleOrderCreate,

    handleOrderUpdate,

    handleOrderCancel,

    handleOrderFulfilled,

    syncOrder,

    handleCustomerWebhook,

    handleCustomerCreate,

    handleCustomerUpdate,

    handleCustomerDelete,

    handleAppUninstalled,

    handleShopUpdate,

    logWebhook,

    updateWebhookStatus

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default WebhookService;
