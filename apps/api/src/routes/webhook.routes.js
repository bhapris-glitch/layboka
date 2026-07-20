/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Shopify Webhook Routes
|--------------------------------------------------------------------------
|
| Defines all Shopify webhook endpoints and
| connects them to the Webhook Controller.
|
|--------------------------------------------------------------------------
*/

import express from "express";

import logger from "../utils/logger.js";

import {

    receiveWebhook,

    webhookHealth,

    getSupportedWebhookTopics

} from "../controllers/webhook.controller.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Route Constants
|--------------------------------------------------------------------------
*/

const ROUTES = Object.freeze({

    ROOT: "/",

    HEALTH: "/health",

    TOPICS: "/topics"

});


/*
|--------------------------------------------------------------------------
| Route Initialization
|--------------------------------------------------------------------------
*/

logger.info(

    "Shopify Webhook Routes initialized."

);
/*
|--------------------------------------------------------------------------
| Shopify Webhook Endpoint
|--------------------------------------------------------------------------
|
| Receives all incoming Shopify webhooks.
|
|--------------------------------------------------------------------------
*/

router.post(

    ROUTES.ROOT,

    receiveWebhook

);


/*
|--------------------------------------------------------------------------
| Webhook Health Endpoint
|--------------------------------------------------------------------------
*/

router.get(

    ROUTES.HEALTH,

    webhookHealth

);


/*
|--------------------------------------------------------------------------
| Supported Webhook Topics
|--------------------------------------------------------------------------
*/

router.get(

    ROUTES.TOPICS,

    getSupportedWebhookTopics

);


/*
|--------------------------------------------------------------------------
| Route Registration Log
|--------------------------------------------------------------------------
*/

logger.info(

    "Shopify webhook endpoints registered."

);
/*
|--------------------------------------------------------------------------
| Router Middleware
|--------------------------------------------------------------------------
*/

router.use(

    (

        req,

        res,

        next

    ) => {

        logger.info(

            "Incoming Shopify webhook request.",

            {

                method:

                    req.method,

                path:

                    req.originalUrl,

                topic:

                    req.headers[

                        "x-shopify-topic"

                    ],

                shop:

                    req.headers[

                        "x-shopify-shop-domain"

                    ]

            }

        );

        next();

    }

);


/*
|--------------------------------------------------------------------------
| JSON Content Validation
|--------------------------------------------------------------------------
*/

router.use(

    (

        req,

        res,

        next

    ) => {

        if (

            req.method === "POST"

        ) {

            const contentType =

                req.get(

                    "content-type"

                );

            if (

                contentType &&

                !contentType.includes(

                    "application/json"

                )

            ) {

                logger.warn(

                    `Unsupported Content-Type: ${contentType}`

                );

            }

        }

        next();

    }

);


/*
|--------------------------------------------------------------------------
| Router Ready
|--------------------------------------------------------------------------
*/

logger.info(

    "Shopify Webhook Router middleware loaded."

);
/*
|--------------------------------------------------------------------------
| Route Validation
|--------------------------------------------------------------------------
*/

if (

    !receiveWebhook ||

    !webhookHealth ||

    !getSupportedWebhookTopics

) {

    logger.error(

        "Webhook routes failed to initialize. One or more controllers are missing."

    );

    throw new Error(

        "Webhook controller initialization failed."

    );

}


/*
|--------------------------------------------------------------------------
| Registered Endpoints
|--------------------------------------------------------------------------
*/

const REGISTERED_ROUTES = Object.freeze([

    {

        method: "POST",

        path: ROUTES.ROOT,

        description: "Receive Shopify webhooks"

    },

    {

        method: "GET",

        path: ROUTES.HEALTH,

        description: "Webhook health check"

    },

    {

        method: "GET",

        path: ROUTES.TOPICS,

        description: "Supported webhook topics"

    }

]);


/*
|--------------------------------------------------------------------------
| Route Startup Log
|--------------------------------------------------------------------------
*/

logger.info(

    "Shopify webhook routes ready.",

    {

        totalRoutes:

            REGISTERED_ROUTES.length,

        routes:

            REGISTERED_ROUTES

    }

);


/*
|--------------------------------------------------------------------------
| Route Metadata
|--------------------------------------------------------------------------
*/

export const webhookRouteInfo = {

    module:

        "Shopify Webhook Routes",

    version:

        "1.0.0",

    endpoints:

        REGISTERED_ROUTES

};
// Final
/*
|--------------------------------------------------------------------------
| Router Validation
|--------------------------------------------------------------------------
*/

if (

    REGISTERED_ROUTES.length === 0

) {

    logger.warn(

        "No Shopify webhook routes have been registered."

    );

}

else {

    logger.info(

        `Shopify Webhook Router ready. Registered routes: ${REGISTERED_ROUTES.length}`

    );

}


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    REGISTERED_ROUTES

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default router;


/*
|--------------------------------------------------------------------------
| Route Module Complete
|--------------------------------------------------------------------------
|
| This router is intended to be mounted from:
|
| app.use("/api/webhooks", webhookRoutes);
|
| Route Structure:
|
| POST   /api/webhooks
| GET    /api/webhooks/health
| GET    /api/webhooks/topics
|
|--------------------------------------------------------------------------
*/
