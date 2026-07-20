/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Shopify Webhook Service
|--------------------------------------------------------------------------
|
| Handles Shopify webhook verification, processing,
| synchronization and event dispatching.
|
|--------------------------------------------------------------------------
*/

import crypto from "crypto";

import logger from "../../utils/logger.js";

import Shop from "../../models/Shop.js";

import Product from "../../models/Product.js";

import Order from "../../models/Order.js";

import Customer from "../../models/Customer.js";

import Subscription from "../../models/Subscription.js";

import {

    getShop,

    getProducts,

    getOrders

} from "./shopify.service.js";

import {

    activateTrial,

    cancelSubscription,

    expireSubscription,

    handleSubscriptionUpdated,

    handleSubscriptionDeleted,

    handlePaymentSuccess,

    handlePaymentFailure

} from "../subscription/subscription.service.js";

import {

    createPaymentSuccessNotification,

    createPaymentFailedNotification

} from "../notification/notification.service.js";


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const SHOPIFY_WEBHOOK_SECRET =

    process.env.SHOPIFY_API_SECRET;

const WEBHOOK_HEADER =

    "x-shopify-hmac-sha256";

const SHOP_HEADER =

    "x-shopify-shop-domain";

const TOPIC_HEADER =

    "x-shopify-topic";


/*
|--------------------------------------------------------------------------
| Supported Webhook Events
|--------------------------------------------------------------------------
*/

export const WEBHOOK_TOPICS = Object.freeze({

    APP_UNINSTALLED:

        "app/uninstalled",

    ORDERS_CREATE:

        "orders/create",

    ORDERS_UPDATED:

        "orders/updated",

    ORDERS_PAID:

        "orders/paid",

    ORDERS_CANCELLED:

        "orders/cancelled",

    PRODUCTS_CREATE:

        "products/create",

    PRODUCTS_UPDATE:

        "products/update",

    PRODUCTS_DELETE:

        "products/delete",

    CUSTOMERS_DATA_REQUEST:

        "customers/data_request",

    CUSTOMERS_REDACT:

        "customers/redact",

    SHOP_REDACT:

        "shop/redact",

    APP_SUBSCRIPTIONS_UPDATE:

        "app_subscriptions/update",

    APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT:

        "app_subscriptions/approaching_capped_amount"

});


/*
|--------------------------------------------------------------------------
| Service Startup
|--------------------------------------------------------------------------
*/

logger.info(

    "Shopify Webhook Service initialized."

);
/*
|--------------------------------------------------------------------------
| Verify Shopify Webhook HMAC
|--------------------------------------------------------------------------
*/

export function verifyWebhookHmac(

    rawBody,

    hmacHeader

) {

    if (

        !rawBody ||

        !hmacHeader ||

        !SHOPIFY_WEBHOOK_SECRET

    ) {

        return false;

    }

    const generatedHmac = crypto

        .createHmac(

            "sha256",

            SHOPIFY_WEBHOOK_SECRET

        )

        .update(

            rawBody,

            "utf8"

        )

        .digest(

            "base64"

        );

    const generatedBuffer =

        Buffer.from(

            generatedHmac,

            "utf8"

        );

    const receivedBuffer =

        Buffer.from(

            hmacHeader,

            "utf8"

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
| Extract Webhook Headers
|--------------------------------------------------------------------------
*/

export function extractWebhookHeaders(

    headers = {}

) {

    return {

        topic:

            headers[TOPIC_HEADER] ||

            "",

        shop:

            headers[SHOP_HEADER] ||

            "",

        hmac:

            headers[WEBHOOK_HEADER] ||

            "",

        webhookId:

            headers["x-shopify-webhook-id"] ||

            "",

        apiVersion:

            headers["x-shopify-api-version"] ||

            ""

    };

}


/*
|--------------------------------------------------------------------------
| Parse Webhook Payload
|--------------------------------------------------------------------------
*/

export function parseWebhookPayload(

    payload

) {

    if (

        Buffer.isBuffer(

            payload

        )

    ) {

        payload =

            payload.toString(

                "utf8"

            );

    }

    if (

        typeof payload ===

        "string"

    ) {

        try {

            return JSON.parse(

                payload

            );

        }

        catch (

            error

        ) {

            logger.error(

                "Invalid Shopify webhook JSON.",

                {

                    message:

                        error.message

                }

            );

            throw new Error(

                "Invalid webhook payload."

            );

        }

    }

    return payload;

}


/*
|--------------------------------------------------------------------------
| Request Validation
|--------------------------------------------------------------------------
*/

export function validateWebhookRequest({

    rawBody,

    headers

}) {

    const webhookHeaders =

        extractWebhookHeaders(

            headers

        );

    const verified =

        verifyWebhookHmac(

            rawBody,

            webhookHeaders.hmac

        );

    if (!verified) {

        throw new Error(

            "Invalid Shopify webhook signature."

        );

    }

    return webhookHeaders;

        }
/*
|--------------------------------------------------------------------------
| APP_UNINSTALLED
|--------------------------------------------------------------------------
*/

async function handleAppUninstalled(

    shop,

    payload

) {

    logger.info(

        `App uninstalled by ${shop}`

    );

    await Shop.findOneAndUpdate(

        {

            shopifyDomain: shop

        },

        {

            $set: {

                installed: false,

                appStatus: "uninstalled",

                uninstalledAt: new Date()

            }

        }

    );

    await cancelSubscription(

        shop

    );

}


/*
|--------------------------------------------------------------------------
| SHOP_REDACT
|--------------------------------------------------------------------------
*/

async function handleShopRedact(

    shop,

    payload

) {

    logger.info(

        `Shop redact request received for ${shop}`

    );

    await Shop.findOneAndUpdate(

        {

            shopifyDomain: shop

        },

        {

            $set: {

                shopRedacted: true,

                redactedAt: new Date()

            }

        }

    );

}


/*
|--------------------------------------------------------------------------
| CUSTOMERS_REDACT
|--------------------------------------------------------------------------
*/

async function handleCustomersRedact(

    shop,

    payload

) {

    logger.info(

        `Customer redact request received for ${shop}`

    );

    if (

        !payload?.customer?.id

    ) {

        return;

    }

    await Customer.findOneAndUpdate(

        {

            shopifyCustomerId:

                payload.customer.id

        },

        {

            $set: {

                redacted: true,

                redactedAt: new Date()

            }

        }

    );

}


/*
|--------------------------------------------------------------------------
| CUSTOMERS_DATA_REQUEST
|--------------------------------------------------------------------------
*/

async function handleCustomersDataRequest(

    shop,

    payload

) {

    logger.info(

        `Customer data request received for ${shop}`

    );

    return Customer.find(

        {

            shopifyCustomerId:

                {

                    $in:

                        payload.customer_ids ||

                        []

                }

        }

    );

}
/*
|--------------------------------------------------------------------------
| ORDERS_CREATE
|--------------------------------------------------------------------------
*/

async function handleOrderCreated(

    shop,

    payload

) {

    logger.info(

        `Order created for ${shop}`

    );

    try {

        await Order.findOneAndUpdate(

            {

                shopifyOrderId: payload.id

            },

            {

                $set: {

                    ...payload,

                    shopifyDomain: shop,

                    lastSyncedAt: new Date()

                }

            },

            {

                upsert: true,

                new: true,

                setDefaultsOnInsert: true

            }

        );

    }

    catch (error) {

        logger.error(

            "Failed to sync created order.",

            {

                shop,

                orderId: payload?.id,

                error: error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| ORDERS_UPDATED
|--------------------------------------------------------------------------
*/

async function handleOrderUpdated(

    shop,

    payload

) {

    logger.info(

        `Order updated for ${shop}`

    );

    try {

        await Order.findOneAndUpdate(

            {

                shopifyOrderId: payload.id

            },

            {

                $set: {

                    ...payload,

                    lastSyncedAt: new Date()

                }

            }

        );

    }

    catch (error) {

        logger.error(

            "Failed to update order.",

            {

                shop,

                orderId: payload?.id,

                error: error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| PRODUCTS_CREATE
|--------------------------------------------------------------------------
*/

async function handleProductCreated(

    shop,

    payload

) {

    logger.info(

        `Product created for ${shop}`

    );

    try {

        await Product.findOneAndUpdate(

            {

                shopifyProductId: payload.id

            },

            {

                $set: {

                    ...payload,

                    shopifyDomain: shop,

                    lastSyncedAt: new Date()

                }

            },

            {

                upsert: true,

                new: true,

                setDefaultsOnInsert: true

            }

        );

    }

    catch (error) {

        logger.error(

            "Failed to sync created product.",

            {

                shop,

                productId: payload?.id,

                error: error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| PRODUCTS_UPDATE
|--------------------------------------------------------------------------
*/

async function handleProductUpdated(

    shop,

    payload

) {

    logger.info(

        `Product updated for ${shop}`

    );

    try {

        await Product.findOneAndUpdate(

            {

                shopifyProductId: payload.id

            },

            {

                $set: {

                    ...payload,

                    lastSyncedAt: new Date()

                }

            }

        );

    }

    catch (error) {

        logger.error(

            "Failed to update product.",

            {

                shop,

                productId: payload?.id,

                error: error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| PRODUCTS_DELETE
|--------------------------------------------------------------------------
*/

async function handleProductDeleted(

    shop,

    payload

) {

    logger.info(

        `Product deleted for ${shop}`

    );

    try {

        await Product.findOneAndDelete(

            {

                shopifyProductId: payload.id

            }

        );

    }

    catch (error) {

        logger.error(

            "Failed to delete product.",

            {

                shop,

                productId: payload?.id,

                error: error.message

            }

        );

    }

                }
/*
|--------------------------------------------------------------------------
| APP_SUBSCRIPTIONS_UPDATE
|--------------------------------------------------------------------------
*/

async function handleSubscriptionUpdated(

    shop,

    payload

) {

    logger.info(

        `Subscription updated for ${shop}`

    );

    try {

        const subscription =

    await handleSubscriptionUpdated(

        payload

    );

        await createPaymentSuccessNotification(

            shop,

            subscription

        );

        return subscription;

    }

    catch (error) {

        logger.error(

            "Subscription update failed.",

            {

                shop,

                error: error.message

            }

        );

        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT
|--------------------------------------------------------------------------
*/

async function handleApproachingCappedAmount(

    shop,

    payload

) {

    logger.warn(

        `Usage cap approaching for ${shop}`

    );

    try {

        await createPaymentFailedNotification(

            shop,

            {

                reason:

                    "Approaching capped billing amount.",

                payload

            }

        );

    }

    catch (error) {

        logger.error(

            "Failed to process capped amount notification.",

            {

                shop,

                error: error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| Webhook Dispatcher
|--------------------------------------------------------------------------
*/

async function dispatchWebhook(

    topic,

    shop,

    payload

) {

    switch (topic) {

        case WEBHOOK_TOPICS.APP_UNINSTALLED:

            return handleAppUninstalled(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.SHOP_REDACT:

            return handleShopRedact(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.CUSTOMERS_REDACT:

            return handleCustomersRedact(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.CUSTOMERS_DATA_REQUEST:

            return handleCustomersDataRequest(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.ORDERS_CREATE:

            return handleOrderCreated(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.ORDERS_UPDATED:

            return handleOrderUpdated(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.PRODUCTS_CREATE:

            return handleProductCreated(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.PRODUCTS_UPDATE:

            return handleProductUpdated(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.PRODUCTS_DELETE:

            return handleProductDeleted(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.APP_SUBSCRIPTIONS_UPDATE:

            return handleSubscriptionUpdated(

                shop,

                payload

            );

        case WEBHOOK_TOPICS.APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT:

            return handleApproachingCappedAmount(

                shop,

                payload

            );

        default:

            logger.warn(

                `Unhandled Shopify webhook topic: ${topic}`

            );

            return null;

    }

}


/*
|--------------------------------------------------------------------------
| Safe Webhook Processing
|--------------------------------------------------------------------------
*/

async function safelyProcessWebhook(

    topic,

    shop,

    payload

) {

    try {

        return await dispatchWebhook(

            topic,

            shop,

            payload

        );

    }

    catch (error) {

        logger.error(

            "Webhook processing failed.",

            {

                topic,

                shop,

                error: error.message

            }

        );

        throw error;

    }

            }
/*
|--------------------------------------------------------------------------
| Process Shopify Webhook
|--------------------------------------------------------------------------
*/

export async function processWebhook({

    rawBody,

    headers,

    payload

}) {

    const webhookHeaders =

        validateWebhookRequest({

            rawBody,

            headers

        });

    const parsedPayload =

        parseWebhookPayload(

            payload

        );

    logger.info(

        `Processing Shopify webhook: ${webhookHeaders.topic}`,

        {

            shop:

                webhookHeaders.shop,

            webhookId:

                webhookHeaders.webhookId

        }

    );

    return safelyProcessWebhook(

        webhookHeaders.topic,

        webhookHeaders.shop,

        parsedPayload

    );

}


/*
|--------------------------------------------------------------------------
| Startup Validation
|--------------------------------------------------------------------------
*/

if (

    !SHOPIFY_WEBHOOK_SECRET

) {

    logger.warn(

        "SHOPIFY_API_SECRET is not configured. Shopify webhook verification will fail."

    );

}

else {

    logger.info(

        "Shopify webhook verification enabled."

    );

}


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    dispatchWebhook,

    safelyProcessWebhook,

    handleAppUninstalled,

    handleShopRedact,

    handleCustomersRedact,

    handleCustomersDataRequest,

    handleOrderCreated,

    handleOrderUpdated,

    handleProductCreated,

    handleProductUpdated,

    handleProductDeleted,

    handleSubscriptionUpdated,

    handleApproachingCappedAmount

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    processWebhook,

    verifyWebhookHmac,

    validateWebhookRequest,

    extractWebhookHeaders,

    parseWebhookPayload,

    dispatchWebhook,

    safelyProcessWebhook,

    handleAppUninstalled,

    handleShopRedact,

    handleCustomersRedact,

    handleCustomersDataRequest,

    handleOrderCreated,

    handleOrderUpdated,

    handleProductCreated,

    handleProductUpdated,

    handleProductDeleted,

    handleSubscriptionUpdated,

    handleApproachingCappedAmount,

    WEBHOOK_TOPICS

};
