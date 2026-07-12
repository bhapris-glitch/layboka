import crypto from "crypto";
import querystring from "querystring";

import Shop from "../../models/Shop.js";

import {
    SHOPIFY_API_KEY,
    SHOPIFY_SCOPES,
    SHOPIFY_APP_URL
} from "../../config/shopify.js";

/*
|--------------------------------------------------------------------------
| Installation Configuration
|--------------------------------------------------------------------------
*/

export const INSTALL_CONFIG = Object.freeze({

    API_VERSION: "2025-10",

    SHOPIFY_DOMAIN: "shopify.com",

    STATE_TOKEN_BYTES: 32,

    STATE_EXPIRES_IN: 1000 * 60 * 10, // 10 Minutes

    INSTALL_PATH: "/api/shopify/auth",

    CALLBACK_PATH: "/api/shopify/callback"

});

/*
|--------------------------------------------------------------------------
| Normalize Shop Domain
|--------------------------------------------------------------------------
*/

export function normalizeShopDomain(shop = "") {

    let domain = shop
        .trim()
        .toLowerCase();

    domain = domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");

    return domain;

}

/*
|--------------------------------------------------------------------------
| Validate Shopify Shop
|--------------------------------------------------------------------------
*/

export function validateShop(shop = "") {

    const domain = normalizeShopDomain(shop);

    const pattern =
        /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

    return pattern.test(domain);

}

/*
|--------------------------------------------------------------------------
| Generate OAuth State Token
|--------------------------------------------------------------------------
*/

export function generateStateToken() {

    return {

        token: crypto
            .randomBytes(
                INSTALL_CONFIG.STATE_TOKEN_BYTES
            )
            .toString("hex"),

        expiresAt: new Date(

            Date.now() +

            INSTALL_CONFIG.STATE_EXPIRES_IN

        )

    };

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

    const query = querystring.stringify({

        client_id: SHOPIFY_API_KEY,

        scope: SHOPIFY_SCOPES,

        redirect_uri:
            `${SHOPIFY_APP_URL}${INSTALL_CONFIG.CALLBACK_PATH}`,

        state,

        response_type: "code"

    });

    return `https://${shop}/admin/oauth/authorize?${query}`;

}

/*
|--------------------------------------------------------------------------
| Check Existing Installation
|--------------------------------------------------------------------------
*/

export async function findInstalledShop(

    shopDomain

) {

    return Shop.findOne({

        shop:

            normalizeShopDomain(

                shopDomain

            ),

        deleted: false

    });

}
/*
|--------------------------------------------------------------------------
| Exchange OAuth Code For Access Token
|--------------------------------------------------------------------------
*/

export async function exchangeAccessToken({

    shop,

    code

}) {

    try {

        const response = await axios.post(

            `https://${shop}/admin/oauth/access_token`,

            {

                client_id: env.SHOPIFY_API_KEY,

                client_secret: env.SHOPIFY_API_SECRET,

                code

            },

            {

                headers: {

                    "Content-Type": "application/json"

                }

            }

        );

        return response.data.access_token;

    } catch (error) {

        throw new Error(

            `Unable to exchange access token: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Fetch Shop Details
|--------------------------------------------------------------------------
*/

export async function fetchShopDetails(

    shop,

    accessToken

) {

    try {

        const response = await axios.get(

            `https://${shop}/admin/api/${env.SHOPIFY_API_VERSION}/shop.json`,

            {

                headers: {

                    "X-Shopify-Access-Token":

                        accessToken

                }

            }

        );

        return response.data.shop;

    } catch (error) {

        throw new Error(

            `Unable to fetch shop details: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Save Shop
|--------------------------------------------------------------------------
*/

export async function saveShop({

    shop,

    shopData,

    accessToken

}) {

    let existingShop = await Shop.findOne({

        shopDomain: shop

    });

    if (!existingShop) {

        existingShop = new Shop({

            shopDomain: shop

        });

    }

    existingShop.shopifyShopId =

        String(shopData.id);

    existingShop.name =

        shopData.name;

    existingShop.email =

        shopData.email;

    existingShop.owner =

        shopData.shop_owner;

    existingShop.phone =

        shopData.phone;

    existingShop.country =

        shopData.country_name;

    existingShop.currency =

        shopData.currency;

    existingShop.timezone =

        shopData.iana_timezone;

    existingShop.planName =

        shopData.plan_name;

    existingShop.myshopifyDomain =

        shopData.myshopify_domain;

    existingShop.primaryDomain =

        shopData.domain;

    existingShop.accessToken =

        accessToken;

    existingShop.installed = true;

    existingShop.installedAt =

        new Date();

    await existingShop.save();

    return existingShop;

}

/*
|--------------------------------------------------------------------------
| Create Merchant Account
|--------------------------------------------------------------------------
*/

export async function createMerchant(

    shop

) {

    let merchant = await User.findOne({

        email: shop.email

    });

    if (merchant) {

        return merchant;

    }

    merchant = await User.create({

        name: shop.owner,

        email: shop.email,

        role: "merchant",

        shop: shop._id,

        emailVerified: true,

        isActive: true

    });

    return merchant;

}

/*
|--------------------------------------------------------------------------
| Create Trial Subscription
|--------------------------------------------------------------------------
*/

export async function createTrialSubscription(

    shop,

    merchant

) {

    const existing = await Subscription.findOne({

        shop: shop._id,

        status: {

            $in: [

                "trial",

                "active"

            ]

        }

    });

    if (existing) {

        return existing;

    }

    return Subscription.create({

        shop: shop._id,

        merchant: merchant._id,

        plan: "Starter",

        status: "trial",

        currency: "USD",

        monthlyPrice: 25,

        trialDays: 7,

        trialStartedAt: new Date(),

        trialEndsAt: new Date(

            Date.now() +

            7 * 24 * 60 * 60 * 1000

        ),

        tokenLimit: 300,

        model: "gpt-4o-mini",

        active: true

    });

      }
/*
|----------------------- PART- 3 ---------------------------------------------------
| Register Required Webhooks
|--------------------------------------------------------------------------
*/

export async function registerWebhooks({

    accessToken,

    shop

}) {

    const webhooks = [

        {
            topic: "app/uninstalled",
            path: "/webhooks/app-uninstalled"
        },

        {
            topic: "orders/create",
            path: "/webhooks/orders-create"
        },

        {
            topic: "orders/updated",
            path: "/webhooks/orders-updated"
        },

        {
            topic: "products/create",
            path: "/webhooks/products-create"
        },

        {
            topic: "products/update",
            path: "/webhooks/products-update"
        },

        {
            topic: "products/delete",
            path: "/webhooks/products-delete"
        },

        {
            topic: "customers/create",
            path: "/webhooks/customers-create"
        },

        {
            topic: "customers/update",
            path: "/webhooks/customers-update"
        }

    ];

    const results = [];

    for (const webhook of webhooks) {

        try {

            const response = await shopifyRequest({

                shop,

                accessToken,

                method: "POST",

                endpoint: "/admin/api/2025-10/webhooks.json",

                data: {

                    webhook: {

                        topic: webhook.topic,

                        address:

                            `${process.env.APP_URL}${webhook.path}`,

                        format: "json"

                    }

                }

            });

            results.push(response);

        } catch (error) {

            console.error(

                `Webhook registration failed: ${webhook.topic}`,

                error.message

            );

        }

    }

    return results;

}

/*
|--------------------------------------------------------------------------
| Register Theme App Embed
|--------------------------------------------------------------------------
*/

export async function registerAppEmbed({

    accessToken,

    shop

}) {

    /*
    |--------------------------------------------------------------------------
    | Theme App Extension is installed automatically by Shopify.
    |
    | This function exists for:
    | • validation
    | • future configuration
    | • feature flags
    |--------------------------------------------------------------------------
    */

    return {

        installed: true,

        type: "theme-app-extension",

        message:

            "Theme App Embed available."

    };

}

/*
|--------------------------------------------------------------------------
| Sync Products
|--------------------------------------------------------------------------
*/

export async function syncProducts({

    shop,

    accessToken

}) {

    const response = await shopifyRequest({

        shop,

        accessToken,

        endpoint: "/admin/api/2025-10/products.json?limit=250"

    });

    return response.products || [];

}

/*
|--------------------------------------------------------------------------
| Sync Collections
|--------------------------------------------------------------------------
*/

export async function syncCollections({

    shop,

    accessToken

}) {

    const response = await shopifyRequest({

        shop,

        accessToken,

        endpoint: "/admin/api/2025-10/custom_collections.json"

    });

    return response.custom_collections || [];

}

/*
|--------------------------------------------------------------------------
| Sync Store Policies
|--------------------------------------------------------------------------
*/

export async function syncPolicies({

    shop,

    accessToken

}) {

    const response = await shopifyRequest({

        shop,

        accessToken,

        endpoint: "/admin/api/2025-10/policies.json"

    });

    return response.policies || [];

}

/*
|--------------------------------------------------------------------------
| Domain Normalization
|--------------------------------------------------------------------------
*/

export function normalizeShopDomain(input = "") {

    let domain = input
        .trim()
        .toLowerCase();

    domain = domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");

    if (!domain) {

        throw new Error(

            "Shop domain is required."

        );

    }

    return domain;

}

/*
|--------------------------------------------------------------------------
| Resolve Canonical Shopify Domain
|--------------------------------------------------------------------------
|
| If a merchant enters:
|
|    mystore.com
|
| this function should resolve:
|
|    mystore.myshopify.com
|
| In production this should use Shopify's official lookup
| (or your stored installation records) rather than guessing.
|--------------------------------------------------------------------------
*/

export async function resolveMyShopifyDomain(domain) {

    if (domain.endsWith(".myshopify.com")) {

        return domain;

    }

    /*
    |--------------------------------------------------------------------------
    | TODO:
    |
    | Resolve custom domains using:
    |
    | • stored Shop model
    | • previous installations
    | • Shopify lookup endpoint
    |--------------------------------------------------------------------------
    */

    throw new Error(

        "Custom domains must be resolved to the canonical *.myshopify.com domain before starting OAuth."

    );

}

/*
|--------------------------------------------------------------------------
| Validate Shop
|--------------------------------------------------------------------------
*/

export async function validateShop(input) {

    const normalized =

        normalizeShopDomain(input);

    const canonical =

        await resolveMyShopifyDomain(

            normalized

        );

    return canonical;

      }
/*
|------------------------PART- 4 --------------------------------------------------
| Complete Installation
|--------------------------------------------------------------------------
*/

export async function completeInstallation({

    shop,

    accessToken,

    scope,

    installedBy = null

}) {

    try {

        /*
        |--------------------------------------------------------------------------
        | Update Installation Status
        |--------------------------------------------------------------------------
        */

        shop.accessToken = accessToken;

        shop.scope = scope;

        shop.installed = true;

        shop.installStatus = "installed";

        shop.installedAt = new Date();

        shop.uninstalledAt = null;

        shop.lastConnectedAt = new Date();

        shop.installedBy = installedBy;

        /*
        |--------------------------------------------------------------------------
        | Activate AI
        |--------------------------------------------------------------------------
        */

        shop.aiEnabled = true;

        shop.chatbotEnabled = true;

        /*
        |--------------------------------------------------------------------------
        | Reset Trial (New Install Only)
        |--------------------------------------------------------------------------
        */

        if (!shop.subscriptionStartedAt) {

            shop.subscriptionStatus = "trial";

            shop.subscriptionStartedAt = new Date();

            shop.trialStartedAt = new Date();

            shop.trialEndsAt = calculateTrialEndDate();

        }

        await shop.save();

        return shop;

    } catch (error) {

        throw new Error(

            `Complete installation failed: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Reinstall Existing Shop
|--------------------------------------------------------------------------
*/

export async function reinstallShop({

    shop,

    accessToken,

    scope

}) {

    try {

        shop.accessToken = accessToken;

        shop.scope = scope;

        shop.installed = true;

        shop.installStatus = "installed";

        shop.uninstalledAt = null;

        shop.lastConnectedAt = new Date();

        shop.aiEnabled = true;

        shop.chatbotEnabled = true;

        await shop.save();

        return shop;

    } catch (error) {

        throw new Error(

            `Reinstall failed: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Uninstall Shop
|--------------------------------------------------------------------------
*/

export async function uninstallShop(shop) {

    try {

        shop.installed = false;

        shop.installStatus = "uninstalled";

        shop.uninstalledAt = new Date();

        shop.aiEnabled = false;

        shop.chatbotEnabled = false;

        shop.accessToken = "";

        await shop.save();

        return true;

    } catch (error) {

        throw new Error(

            `Uninstall failed: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Install Service
|--------------------------------------------------------------------------
*/

export const InstallService = {

    validateShopDomain,

    normalizeShopDomain,

    createInstallation,

    exchangeAccessToken,

    installScriptTag,

    installAppEmbed,

    registerWebhooks,

    syncShop,

    completeInstallation,

    reinstallShop,

    uninstallShop

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default InstallService;
