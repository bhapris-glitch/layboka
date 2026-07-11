// layboka/apps/api/src/services/shopify/shopify.service.js
import "@shopify/shopify-api/adapters/node";

import {
    shopifyApi,
    LATEST_API_VERSION
} from "@shopify/shopify-api";

import { RestClient } from "@shopify/shopify-api";

import Shop from "../../models/Shop.js";

/*
|--------------------------------------------------------------------------
| Shopify Configuration
|--------------------------------------------------------------------------
*/

export const shopify = shopifyApi({

    apiKey: process.env.SHOPIFY_API_KEY,

    apiSecretKey: process.env.SHOPIFY_API_SECRET,

    scopes: process.env.SHOPIFY_SCOPES
        ?.split(","),

    hostName: process.env.APP_HOST
        ?.replace(/^https?:\/\//, ""),

    hostScheme: "https",

    apiVersion:
        process.env.SHOPIFY_API_VERSION ||
        LATEST_API_VERSION,

    isEmbeddedApp: true

});

/*
|--------------------------------------------------------------------------
| Get Shop Record
|--------------------------------------------------------------------------
*/

export async function getShop(shopId) {

    return Shop.findById(shopId);

}

/*
|--------------------------------------------------------------------------
| Get Shop By Domain
|--------------------------------------------------------------------------
*/

export async function getShopByDomain(domain) {

    return Shop.findOne({

        shop: domain

    });

}

/*
|--------------------------------------------------------------------------
| Create REST Client
|--------------------------------------------------------------------------
*/

export async function getRestClient(shopId) {

    const shop =
        await getShop(shopId);

    if (!shop) {

        throw new Error(
            "Shop not found."
        );

    }

    return new RestClient({

        session: {

            shop: shop.shop,

            accessToken:
                shop.accessToken

        }

    });

}

/*
|--------------------------------------------------------------------------
| Validate Access Token
|--------------------------------------------------------------------------
*/

export async function validateAccessToken(shopId) {

    try {

        const client =
            await getRestClient(shopId);

        await client.get({

            path: "shop"

        });

        return true;

    } catch {

        return false;

    }

}
