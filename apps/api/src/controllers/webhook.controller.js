/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Shopify Webhook Controller
|--------------------------------------------------------------------------
|
| Receives incoming Shopify webhook requests,
| validates them and delegates processing to
| the Shopify Webhook Service.
|
|--------------------------------------------------------------------------
*/

import catchAsync from "../utils/catchAsync.js";

import AppError from "../utils/AppError.js";

import logger from "../utils/logger.js";

import {

    processWebhook,

    WEBHOOK_TOPICS

} from "../services/shopify/webhook.service.js";


/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const SHOPIFY_TOPIC_HEADER =

    "x-shopify-topic";

const SHOPIFY_SHOP_HEADER =

    "x-shopify-shop-domain";

const SHOPIFY_WEBHOOK_ID =

    "x-shopify-webhook-id";


/*
|--------------------------------------------------------------------------
| Supported Webhook Topics
|--------------------------------------------------------------------------
*/

const SUPPORTED_TOPICS = Object.values(

    WEBHOOK_TOPICS

);


/*
|--------------------------------------------------------------------------
| Controller Startup
|--------------------------------------------------------------------------
*/

logger.info(

    "Shopify Webhook Controller initialized."

);
/*
|--------------------------------------------------------------------------
| Validate Webhook Request
|--------------------------------------------------------------------------
*/

const validateWebhookRequest = (

    req

) => {

    const topic =

        req.headers[SHOPIFY_TOPIC_HEADER];

    const shop =

        req.headers[SHOPIFY_SHOP_HEADER];

    const webhookId =

        req.headers[SHOPIFY_WEBHOOK_ID];

    if (!topic) {

        throw AppError.badRequest(

            "Missing Shopify webhook topic."

        );

    }

    if (!shop) {

        throw AppError.badRequest(

            "Missing Shopify shop domain."

        );

    }

    if (

        !SUPPORTED_TOPICS.includes(

            topic

        )

    ) {

        throw AppError.badRequest(

            `Unsupported webhook topic: ${topic}`

        );

    }

    return {

        topic,

        shop,

        webhookId

    };

};


/*
|--------------------------------------------------------------------------
| Log Incoming Webhook
|--------------------------------------------------------------------------
*/

const logWebhookRequest = (

    webhook

) => {

    logger.info(

        "Incoming Shopify webhook received.",

        {

            topic:

                webhook.topic,

            shop:

                webhook.shop,

            webhookId:

                webhook.webhookId

        }

    );

};
/*
|--------------------------------------------------------------------------
| Receive Shopify Webhook
|--------------------------------------------------------------------------
*/

export const receiveWebhook =

    catchAsync(

        async (

            req,

            res

        ) => {

            const webhook =

                validateWebhookRequest(

                    req

                );

            logWebhookRequest(

                webhook

            );

            await processWebhook({

                rawBody:

                    req.rawBody,

                headers:

                    req.headers,

                payload:

                    req.body

            });

            logger.info(

                "Shopify webhook processed successfully.",

                {

                    topic:

                        webhook.topic,

                    shop:

                        webhook.shop,

                    webhookId:

                        webhook.webhookId

                }

            );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Webhook processed successfully."

                });

        }

    );


/*
|--------------------------------------------------------------------------
| Webhook Processing Error
|--------------------------------------------------------------------------
*/

export const handleWebhookError = (

    error,

    req,

    res,

    next

) => {

    logger.error(

        "Webhook controller error.",

        {

            message:

                error.message,

            topic:

                req.headers[

                    SHOPIFY_TOPIC_HEADER

                ],

            shop:

                req.headers[

                    SHOPIFY_SHOP_HEADER

                ],

            webhookId:

                req.headers[

                    SHOPIFY_WEBHOOK_ID

                ]

        }

    );

    return next(

        error

    );

};
/*
|--------------------------------------------------------------------------
| Get Supported Webhook Topics
|--------------------------------------------------------------------------
*/

export const getSupportedWebhookTopics =

    catchAsync(

        async (

            req,

            res

        ) => {

            return res

                .status(200)

                .json({

                    success: true,

                    total:

                        SUPPORTED_TOPICS.length,

                    topics:

                        SUPPORTED_TOPICS

                });

        }

    );


/*
|--------------------------------------------------------------------------
| Webhook Health Check
|--------------------------------------------------------------------------
*/

export const webhookHealth =

    catchAsync(

        async (

            req,

            res

        ) => {

            return res

                .status(200)

                .json({

                    success: true,

                    service:

                        "Shopify Webhook Controller",

                    status:

                        "healthy",

                    timestamp:

                        new Date().toISOString(),

                    supportedTopics:

                        SUPPORTED_TOPICS.length

                });

        }

    );


/*
|--------------------------------------------------------------------------
| Controller Information
|--------------------------------------------------------------------------
*/

export const getControllerInfo = () => ({

    controller:

        "ShopifyWebhookController",

    version:

        "1.0.0",

    supportedTopics:

        SUPPORTED_TOPICS.length

});
/*
|--------------------------------------------------------------------------
| Startup Validation
|--------------------------------------------------------------------------
*/

if (

    SUPPORTED_TOPICS.length === 0

) {

    logger.warn(

        "No Shopify webhook topics have been registered."

    );

}

else {

    logger.info(

        `Shopify Webhook Controller ready. Supported topics: ${SUPPORTED_TOPICS.length}`

    );

}


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    validateWebhookRequest,

    logWebhookRequest

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    receiveWebhook,

    handleWebhookError,

    getSupportedWebhookTopics,

    webhookHealth,

    getControllerInfo,

    validateWebhookRequest,

    logWebhookRequest

};
