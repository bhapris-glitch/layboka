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
