// layboka/apps/api/src/services/shopify/oauth.service.js
import crypto from "crypto";
import { URLSearchParams } from "url";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

export const OAUTH_CONFIG = Object.freeze({

    API_VERSION:
        process.env.SHOPIFY_API_VERSION || "2025-10",

    SHOPIFY_AUTH_URL:
        "https://{shop}/admin/oauth/authorize",

    SCOPES: (
        process.env.SHOPIFY_SCOPES ||
        [
            "read_products",
            "write_products",
            "read_orders",
            "write_orders",
            "read_customers",
            "write_customers",
            "read_inventory",
            "write_inventory",
            "read_discounts",
            "write_discounts",
            "read_themes",
            "write_themes",
            "read_script_tags",
            "write_script_tags"
        ].join(",")
    ),

    STATE_LENGTH: 32

});

/*
|--------------------------------------------------------------------------
| Validate Shopify Shop Domain
|--------------------------------------------------------------------------
*/

export function validateShopDomain(shop) {

    if (!shop) {

        return false;

    }

    const value = shop.trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | my-store.myshopify.com
    |--------------------------------------------------------------------------
    */

    const shopifyPattern =
        /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

    /*
    |--------------------------------------------------------------------------
    | Custom Domain
    |--------------------------------------------------------------------------
    */

    const customPattern =
        /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/;

    return (

        shopifyPattern.test(value) ||

        customPattern.test(value)

    );

}

/*
|--------------------------------------------------------------------------
| Normalize Shop Domain
|--------------------------------------------------------------------------
*/

export function normalizeShopDomain(shop) {

    if (!shop) {

        return "";

    }

    return shop
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

}

/*
|--------------------------------------------------------------------------
| Generate OAuth State
|--------------------------------------------------------------------------
*/

export function generateStateToken() {

    return crypto
        .randomBytes(
            OAUTH_CONFIG.STATE_LENGTH
        )
        .toString("hex");

}

/*
|--------------------------------------------------------------------------
| Build Redirect URI
|--------------------------------------------------------------------------
*/

export function buildRedirectUri() {

    return `${process.env.APP_URL}/api/shopify/oauth/callback`;

}

/*
|--------------------------------------------------------------------------
| Build Shopify OAuth URL
|--------------------------------------------------------------------------
*/

export function buildOAuthUrl({

    shop,

    state

}) {

    const normalizedShop =
        normalizeShopDomain(shop);

    const params =
        new URLSearchParams({

            client_id:
                process.env.SHOPIFY_API_KEY,

            scope:
                OAUTH_CONFIG.SCOPES,

            redirect_uri:
                buildRedirectUri(),

            state,

            grant_options: ""

        });

    return `https://${normalizedShop}/admin/oauth/authorize?${params.toString()}`;

}
