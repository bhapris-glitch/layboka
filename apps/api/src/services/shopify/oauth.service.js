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
/*
|--------------------------------------------------------------------------
| Exchange Authorization Code For Access Token
|--------------------------------------------------------------------------
*/

export async function exchangeAccessToken({

    shop,

    code

}) {

    if (!shop || !code) {

        throw new Error(
            "Shop and authorization code are required."
        );

    }

    const response = await axios.post(

        `https://${shop}/admin/oauth/access_token`,

        {

            client_id: process.env.SHOPIFY_API_KEY,

            client_secret: process.env.SHOPIFY_API_SECRET,

            code

        },

        {

            headers: {

                "Content-Type": "application/json"

            },

            timeout: 30000

        }

    );

    if (!response.data?.access_token) {

        throw new Error(
            "Unable to obtain Shopify access token."
        );

    }

    return {

        accessToken:

            response.data.access_token,

        scope:

            response.data.scope || ""

    };

}

/*
|--------------------------------------------------------------------------
| Verify Shopify HMAC
|--------------------------------------------------------------------------
|
| Shopify signs OAuth callbacks using HMAC SHA256.
|--------------------------------------------------------------------------
*/

export function verifyHmac(query = {}) {

    const {

        hmac,

        signature,

        ...params

    } = query;

    if (!hmac) {

        return false;

    }

    const message = Object.keys(params)

        .sort()

        .map(key => {

            return `${key}=${params[key]}`;

        })

        .join("&");

    const generatedHmac = crypto

        .createHmac(

            "sha256",

            process.env.SHOPIFY_API_SECRET

        )

        .update(message)

        .digest("hex");

    return timingSafeEqual(

        generatedHmac,

        hmac

    );

}

/*
|--------------------------------------------------------------------------
| Validate OAuth Callback
|--------------------------------------------------------------------------
*/

export function validateOAuthCallback(query = {}) {

    if (!verifyHmac(query)) {

        throw new Error(

            "Invalid Shopify HMAC signature."

        );

    }

    if (!query.shop) {

        throw new Error(

            "Missing shop parameter."

        );

    }

    if (!query.code) {

        throw new Error(

            "Missing authorization code."

        );

    }

    if (!query.state) {

        throw new Error(

            "Missing OAuth state."

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Timing Safe Comparison
|--------------------------------------------------------------------------
*/

function timingSafeEqual(

    first,

    second

) {

    const bufferA = Buffer.from(first);

    const bufferB = Buffer.from(second);

    if (

        bufferA.length !==

        bufferB.length

    ) {

        return false;

    }

    return crypto.timingSafeEqual(

        bufferA,

        bufferB

    );

}
/*
|--------------------------------------------------------------------------
| Save / Update Shop
|--------------------------------------------------------------------------
*/

export async function persistShop({

    session,

    shopData,

    accessToken

}) {

    const encryptedToken = encryptAccessToken(
        accessToken
    );

    const update = {

        shopifyShopId:
            shopData.id,

        shopifyDomain:
            shopData.myshopify_domain,

        shopName:
            shopData.name,

        email:
            shopData.email,

        currency:
            shopData.currency,

        timezone:
            shopData.iana_timezone,

        country:
            shopData.country_name,

        planName:
            shopData.plan_name,

        owner:
            shopData.shop_owner,

        accessToken:
            encryptedToken,

        scope:
            session.scope,

        installed: true,

        installationDate:
            new Date(),

        lastConnectedAt:
            new Date(),

        appStatus: "active"

    };

    const shop = await Shop.findOneAndUpdate(

        {

            shopifyDomain:
                shopData.myshopify_domain

        },

        {

            $set: update

        },

        {

            upsert: true,

            new: true,

            setDefaultsOnInsert: true

        }

    );

    return shop;

}

/*
|--------------------------------------------------------------------------
| Install Webhooks
|--------------------------------------------------------------------------
*/

export async function installRequiredWebhooks(

    session

) {

    const registrations = [

        "APP_UNINSTALLED",

        "ORDERS_CREATE",

        "ORDERS_UPDATED",

        "CUSTOMERS_DATA_REQUEST",

        "CUSTOMERS_REDACT",

        "SHOP_REDACT"

    ];

    const results = [];

    for (const topic of registrations) {

        try {

            const result =

                await shopify.webhooks.register({

                    session,

                    topic

                });

            results.push({

                topic,

                success: result?.success === true

            });

        } catch (error) {

            console.error(

                `Webhook ${topic} failed:`,

                error.message

            );

            results.push({

                topic,

                success: false

            });

        }

    }

    return results;

}

/*
|--------------------------------------------------------------------------
| Complete OAuth
|--------------------------------------------------------------------------
*/

export async function completeOAuth(

    req,

    res

) {

    try {

        const session =

            await validateOAuthCallback(

                req,

                res

            );

        const shopData =

            await fetchShop(

                session

            );

        const shop =

            await persistShop({

                session,

                shopData,

                accessToken:
                    session.accessToken

            });

        await installRequiredWebhooks(

            session

        );

        const jwt =

            createInstallToken({

                shopId: shop._id,

                shop:
                    shop.shopifyDomain

            });

        return {

            success: true,

            shop,

            token: jwt,

            redirect:

                `/dashboard?token=${jwt}`

        };

    } catch (error) {

        console.error(

            "OAuth Completion Error:",

            error

        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| OAuth Service
|--------------------------------------------------------------------------
*/

export const OAuthService = {

    beginOAuth,

    validateOAuthCallback,

    fetchShop,

    encryptAccessToken,

    decryptAccessToken,

    persistShop,

    installRequiredWebhooks,

    completeOAuth

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default OAuthService;
