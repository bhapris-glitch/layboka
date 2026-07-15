/*
|--------------------------------------------------------------------------
| Services
|--------------------------------------------------------------------------
*/

import crypto from "crypto";

import ShopifyService from "./shopify.service.js";
import OrderService from "../order/order.service.js";
import ProductService from "../product/product.service.js";
import CustomerService from "../customer/customer.service.js";
import InventoryService from "../inventory/inventory.service.js";
import AnalyticsService from "../analytics/analytics.service.js";
import ConversationService from "../conversation/conversation.service.js";
import EmailService from "../email/email.service.js";

/*
|--------------------------------------------------------------------------
| Models
|--------------------------------------------------------------------------
*/

import Shop from "../../models/Shop.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Customer from "../../models/Customer.js";
import Inventory from "../../models/Inventory.js";
import Conversation from "../../models/Conversation.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const {

    SHOPIFY_API_SECRET,

    SHOPIFY_API_VERSION,

    NODE_ENV

} = process.env;

/*
|--------------------------------------------------------------------------
| Logger
|--------------------------------------------------------------------------
*/

const logger = {

    info(message, meta = {}) {

        console.log(

            `[Webhook] ${message}`,

            meta

        );

    },

    warn(message, meta = {}) {

        console.warn(

            `[Webhook] ${message}`,

            meta

        );

    },

    error(message, meta = {}) {

        console.error(

            `[Webhook] ${message}`,

            meta

        );

    }

};

/*
|--------------------------------------------------------------------------
| Supported Shopify Webhook Topics
|--------------------------------------------------------------------------
*/

export const WEBHOOK_TOPICS = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Orders
    |--------------------------------------------------------------------------
    */

    ORDER_CREATED: "orders/create",

    ORDER_UPDATED: "orders/updated",

    ORDER_CANCELLED: "orders/cancelled",

    ORDER_PAID: "orders/paid",

    ORDER_DELETED: "orders/delete",

    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    PRODUCT_CREATED: "products/create",

    PRODUCT_UPDATED: "products/update",

    PRODUCT_DELETED: "products/delete",

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    CUSTOMER_CREATED: "customers/create",

    CUSTOMER_UPDATED: "customers/update",

    CUSTOMER_DELETED: "customers/delete",

    /*
    |--------------------------------------------------------------------------
    | Inventory
    |--------------------------------------------------------------------------
    */

    INVENTORY_UPDATED: "inventory_levels/update",

    /*
    |--------------------------------------------------------------------------
    | Shop
    |--------------------------------------------------------------------------
    */

    SHOP_UPDATED: "shop/update",

    APP_UNINSTALLED: "app/uninstalled",

    /*
    |--------------------------------------------------------------------------
    | GDPR
    |--------------------------------------------------------------------------
    */

    CUSTOMERS_DATA_REQUEST: "customers/data_request",

    CUSTOMERS_REDACT: "customers/redact",

    SHOP_REDACT: "shop/redact"

});

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

function getWebhookTopic(headers = {}) {

    return (

        headers["x-shopify-topic"] ||

        headers["X-Shopify-Topic"] ||

        ""

    );

}

function getShopDomain(headers = {}) {

    return (

        headers["x-shopify-shop-domain"] ||

        headers["X-Shopify-Shop-Domain"] ||

        ""

    );

}

function getWebhookId(headers = {}) {

    return (

        headers["x-shopify-webhook-id"] ||

        headers["X-Shopify-Webhook-Id"] ||

        ""

    );

}

function isProduction() {

    return NODE_ENV === "production";

}
/*
|--------------------------------------------------------------------------
| Verify Shopify Webhook Signature
|--------------------------------------------------------------------------
*/

export function verifyWebhookSignature(

    rawBody,

    signature

) {

    try {

        if (!SHOPIFY_API_SECRET) {

            throw new Error(

                "SHOPIFY_API_SECRET is missing."

            );

        }


        if (!rawBody || !signature) {

            return false;

        }


        const generatedSignature =

            crypto

                .createHmac(

                    "sha256",

                    SHOPIFY_API_SECRET

                )

                .update(

                    rawBody,

                    "utf8"

                )

                .digest(

                    "base64"

                );


        return crypto.timingSafeEqual(

            Buffer.from(generatedSignature),

            Buffer.from(signature)

        );


    } catch (error) {

        logger.error(

            "Webhook signature verification failed.",

            {

                error:

                    error.message

            }

        );


        return false;

    }

}


/*
|--------------------------------------------------------------------------
| Get Webhook Context
|--------------------------------------------------------------------------
*/

export async function getWebhookContext(

    req

) {

    try {

        const headers = req.headers || {};


        const topic =

            getWebhookTopic(

                headers

            );


        const shopDomain =

            getShopDomain(

                headers

            );


        const webhookId =

            getWebhookId(

                headers

            );


        if (!shopDomain) {

            throw new Error(

                "Shop domain missing from webhook."

            );

        }


        const shop =

            await Shop.findOne({

                shopDomain

            });


        if (!shop) {

            throw new Error(

                `Shop not found: ${shopDomain}`

            );

        }


        return {

            shop,

            shopId: shop._id,

            shopDomain,

            topic,

            webhookId,

            payload: req.body

        };


    } catch (error) {

        logger.error(

            "Unable to create webhook context.",

            {

                error:

                    error.message

            }

        );


        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| Process Webhook
|--------------------------------------------------------------------------
*/

export async function processWebhook(

    context

) {

    try {

        const {

            topic

        } = context;


        logger.info(

            "Processing webhook.",

            {

                topic,

                shop:

                    context.shopDomain

            }

        );


        switch (topic) {


            case WEBHOOK_TOPICS.ORDER_CREATED:

                return handleOrderCreated(

                    context

                );


            case WEBHOOK_TOPICS.ORDER_UPDATED:

                return handleOrderUpdated(

                    context

                );


            case WEBHOOK_TOPICS.ORDER_CANCELLED:

                return handleOrderCancelled(

                    context

                );


            case WEBHOOK_TOPICS.ORDER_PAID:

                return handleOrderPaid(

                    context

                );


            case WEBHOOK_TOPICS.ORDER_DELETED:

                return handleOrderDeleted(

                    context

                );


            case WEBHOOK_TOPICS.PRODUCT_CREATED:

                return handleProductCreated(

                    context

                );


            case WEBHOOK_TOPICS.PRODUCT_UPDATED:

                return handleProductUpdated(

                    context

                );


            case WEBHOOK_TOPICS.PRODUCT_DELETED:

                return handleProductDeleted(

                    context

                );


            case WEBHOOK_TOPICS.CUSTOMER_CREATED:

                return handleCustomerCreated(

                    context

                );


            case WEBHOOK_TOPICS.CUSTOMER_UPDATED:

                return handleCustomerUpdated(

                    context

                );


            case WEBHOOK_TOPICS.CUSTOMER_DELETED:

                return handleCustomerDeleted(

                    context

                );


            case WEBHOOK_TOPICS.INVENTORY_UPDATED:

                return handleInventoryLevelUpdated(

                    context

                );


            case WEBHOOK_TOPICS.SHOP_UPDATED:

                return handleShopUpdate(

                    context

                );


            case WEBHOOK_TOPICS.APP_UNINSTALLED:

                return handleAppUninstalled(

                    context

                );


            case WEBHOOK_TOPICS.CUSTOMERS_DATA_REQUEST:

            case WEBHOOK_TOPICS.CUSTOMERS_REDACT:

            case WEBHOOK_TOPICS.SHOP_REDACT:

                return handleGdprWebhook(

                    context

                );


            default:

                logger.warn(

                    "Unhandled webhook topic.",

                    {

                        topic

                    }

                );


                return {

                    processed: false,

                    reason: "Unsupported webhook topic"

                };

        }


    } catch (error) {

        logger.error(

            "Webhook processing failed.",

            {

                error:

                    error.message,

                topic:

                    context?.topic

            }

        );


        throw error;

    }

}
/*
|--------------------------------------------------------------------------
| Handle Order Created Webhook
|--------------------------------------------------------------------------
*/

export async function handleOrderCreated(

    context

) {

    try {

        const {

            shop,

            payload

        } = context;


        logger.info(

            "Processing order created webhook.",

            {

                shop:

                    shop.shopDomain,

                orderId:

                    payload?.id

            }

        );


        /*
        |--------------------------------------------------------------------------
        | Create Order
        |--------------------------------------------------------------------------
        */

        const order =

            await OrderService.handleOrderCreated(

                shop._id,

                payload

            );


        /*
        |--------------------------------------------------------------------------
        | Analytics Update
        |--------------------------------------------------------------------------
        */

        await AnalyticsService.trackOrderCreated(

            shop._id,

            order

        );


        /*
        |--------------------------------------------------------------------------
        | Conversation / AI Memory Update
        |--------------------------------------------------------------------------
        */

        if (

            order.customer

        ) {

            await ConversationService.updateCustomerOrderContext(

                shop._id,

                order.customer,

                order

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Email Automation
        |--------------------------------------------------------------------------
        */

        await EmailService.sendOrderCreatedEmail(

            shop._id,

            order

        );


        return {

            processed: true,

            event: "order_created",

            order

        };


    } catch (error) {


        logger.error(

            "Order created webhook failed.",

            {

                error:

                    error.message

            }

        );


        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| Handle Order Updated Webhook
|--------------------------------------------------------------------------
*/

export async function handleOrderUpdated(

    context

) {

    try {


        const {

            shop,

            payload

        } = context;



        logger.info(

            "Processing order updated webhook.",

            {

                shop:

                    shop.shopDomain,

                orderId:

                    payload?.id

            }

        );


        /*
        |--------------------------------------------------------------------------
        | Update Order
        |--------------------------------------------------------------------------
        */

        const order =

            await OrderService.handleOrderUpdated(

                shop._id,

                payload

            );



        /*
        |--------------------------------------------------------------------------
        | Analytics Sync
        |--------------------------------------------------------------------------
        */

        await AnalyticsService.trackOrderUpdated(

            shop._id,

            order

        );



        /*
        |--------------------------------------------------------------------------
        | Customer Conversation Update
        |--------------------------------------------------------------------------
        */

        if (

            order.customer

        ) {


            await ConversationService.updateCustomerOrderContext(

                shop._id,

                order.customer,

                order

            );


        }



        return {

            processed: true,

            event:

                "order_updated",

            order

        };


    } catch (error) {


        logger.error(

            "Order updated webhook failed.",

            {

                error:

                    error.message

            }

        );


        throw error;

    }

                }
/*
|--------------------------------------------------------------------------
| Handle Order Cancelled
|--------------------------------------------------------------------------
*/

export async function handleOrderCancelled(

    context

) {

    try {

        const {

            shop,

            payload

        } = context;

        logger.info(

            "Processing order cancelled webhook.",

            {

                shop: shop.shopDomain,

                orderId: payload?.id

            }

        );

        const order =

            await OrderService.handleOrderCancelled(

                shop._id,

                payload

            );

        return {

            processed: true,

            event: "order_cancelled",

            order

        };

    } catch (error) {

        logger.error(

            "Order cancelled webhook failed.",

            {

                error: error.message

            }

        );

        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| Handle Order Paid
|--------------------------------------------------------------------------
*/

export async function handleOrderPaid(

    context

) {

    try {

        const {

            shop,

            payload

        } = context;

        logger.info(

            "Processing order paid webhook.",

            {

                shop: shop.shopDomain,

                orderId: payload?.id

            }

        );

        const order =

            await OrderService.handleOrderPaid(

                shop._id,

                payload

            );

        return {

            processed: true,

            event: "order_paid",

            order

        };

    } catch (error) {

        logger.error(

            "Order paid webhook failed.",

            {

                error: error.message

            }

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

    context

) {

    try {

        const {

            shop,

            payload

        } = context;

        logger.info(

            "Processing order deleted webhook.",

            {

                shop: shop.shopDomain,

                orderId: payload?.id

            }

        );

        const result =

            await OrderService.handleOrderDeleted(

                shop._id,

                payload

            );

        return {

            processed: true,

            event: "order_deleted",

            result

        };

    } catch (error) {

        logger.error(

            "Order deleted webhook failed.",

            {

                error: error.message

            }

        );

        throw error;

    }

            }
/*
|--------------------------------------------------------------------------
| Handle Product Created Webhook
|--------------------------------------------------------------------------
*/

export async function handleProductCreated(

    context

) {

    try {

        const {

            shop,

            payload

        } = context;


        logger.info(

            "Processing product created webhook.",

            {

                shop:

                    shop.shopDomain,

                productId:

                    payload?.id

            }

        );


        const product =

            await ProductService.handleProductCreated(

                shop._id,

                payload

            );


        return {

            processed: true,

            event: "product_created",

            product

        };


    } catch (error) {


        logger.error(

            "Product created webhook failed.",

            {

                error:

                    error.message

            }

        );


        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| Handle Product Updated Webhook
|--------------------------------------------------------------------------
*/

export async function handleProductUpdated(

    context

) {

    try {


        const {

            shop,

            payload

        } = context;



        logger.info(

            "Processing product updated webhook.",

            {

                shop:

                    shop.shopDomain,

                productId:

                    payload?.id

            }

        );



        const product =

            await ProductService.handleProductUpdated(

                shop._id,

                payload

            );



        return {

            processed: true,

            event: "product_updated",

            product

        };


    } catch (error) {


        logger.error(

            "Product updated webhook failed.",

            {

                error:

                    error.message

            }

        );


        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| Handle Product Deleted Webhook
|--------------------------------------------------------------------------
*/

export async function handleProductDeleted(

    context

) {

    try {


        const {

            shop,

            payload

        } = context;



        logger.info(

            "Processing product deleted webhook.",

            {

                shop:

                    shop.shopDomain,

                productId:

                    payload?.id

            }

        );



        const result =

            await ProductService.handleProductDeleted(

                shop._id,

                payload

            );



        return {

            processed: true,

            event: "product_deleted",

            result

        };


    } catch (error) {


        logger.error(

            "Product deleted webhook failed.",

            {

                error:

                    error.message

            }

        );


        throw error;

    }

}
