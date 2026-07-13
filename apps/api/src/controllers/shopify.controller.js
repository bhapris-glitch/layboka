import asyncHandler from "express-async-handler";

import {
    getShop,
    getShopInformation,
    getProducts,
    getCollections,
    getCustomers,
    getOrders,
    getInventory,
    getLocations,
    syncProducts,
    syncOrders,
    syncCustomers,
    syncInventory,
    syncShop
} from "../services/shopify/shopify.service.js";

import {
    getThemes,
    publishTheme
} from "../services/shopify/theme.service.js";

import {
    installScriptTag,
    uninstallScriptTag,
    getScriptTags
} from "../services/shopify/scriptTag.service.js";

import {
    registerWebhooks,
    unregisterWebhooks
} from "../services/shopify/webhook.service.js";

import {
    beginOAuth,
    completeOAuth
} from "../services/shopify/oauth.service.js";
class ShopifyController {

    /*
    |--------------------------------------------------------------------------
    | Get Current Shop
    |--------------------------------------------------------------------------
    */

    async getCurrentShop(req, res) {

        const shop = await getShop(req.user.shopId);

        return res.status(200).json({

            success: true,

            message: "Shop fetched successfully.",

            data: shop

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Shop Information
    |--------------------------------------------------------------------------
    */

    async getShopInformation(req, res) {

        const session = req.shopify.session;

        const shop = await getShopInformation(session);

        return res.status(200).json({

            success: true,

            message: "Shop information fetched successfully.",

            data: shop

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Products
    |--------------------------------------------------------------------------
    */

    async getProducts(req, res) {

        const session = req.shopify.session;

        const {

            first = 50,

            after = null,

            query = ""

        } = req.query;

        const products = await getProducts(

            session,

            {

                first: Number(first),

                after,

                query

            }

        );

        return res.status(200).json({

            success: true,

            message: "Products fetched successfully.",

            data: products

        });

    }

}

const shopifyController = new ShopifyController();

    /*
    |--------------------------------------------------------------------------
    | Get Collections
    |--------------------------------------------------------------------------
    */

    async getCollections(req, res) {

        const session = req.shopify.session;

        const {

            first = 50,

            after = null

        } = req.query;

        const collections = await getCollections(

            session,

            {

                first: Number(first),

                after

            }

        );

        return res.status(200).json({

            success: true,

            message: "Collections fetched successfully.",

            data: collections

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Themes
    |--------------------------------------------------------------------------
    */

    async getThemes(req, res) {

        const session = req.shopify.session;

        const themes = await getThemes(session);

        return res.status(200).json({

            success: true,

            message: "Themes fetched successfully.",

            data: themes

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Publish Theme
    |--------------------------------------------------------------------------
    */

    async publishTheme(req, res) {

        const session = req.shopify.session;

        const { themeId } = req.params;

        const result = await publishTheme(

            session,

            themeId

        );

        return res.status(200).json({

            success: true,

            message: "Theme published successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Script Tags
    |--------------------------------------------------------------------------
    */

    async getScriptTags(req, res) {

        const session = req.shopify.session;

        const scripts = await getScriptTags(session);

        return res.status(200).json({

            success: true,

            message: "Script tags fetched successfully.",

            data: scripts

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Install Chat Widget
    |--------------------------------------------------------------------------
    */

    async installScriptTag(req, res) {

        const session = req.shopify.session;

        const result = await installScriptTag(session);

        return res.status(200).json({

            success: true,

            message: "Chat widget installed successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Uninstall Chat Widget
    |--------------------------------------------------------------------------
    */

    async uninstallScriptTag(req, res) {

        const session = req.shopify.session;

        const result = await uninstallScriptTag(session);

        return res.status(200).json({

            success: true,

            message: "Chat widget removed successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Register Webhooks
    |--------------------------------------------------------------------------
    */

    async registerWebhooks(req, res) {

        const session = req.shopify.session;

        const result = await registerWebhooks(session);

        return res.status(200).json({

            success: true,

            message: "Webhooks registered successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Unregister Webhooks
    |--------------------------------------------------------------------------
    */

    async unregisterWebhooks(req, res) {

        const session = req.shopify.session;

        const result = await unregisterWebhooks(session);

        return res.status(200).json({

            success: true,

            message: "Webhooks removed successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Begin OAuth
    |--------------------------------------------------------------------------
    */

    async beginOAuth(req, res) {

        return beginOAuth(req, res);

    }

    /*
    |--------------------------------------------------------------------------
    | Complete OAuth
    |--------------------------------------------------------------------------
    */

    async completeOAuth(req, res) {

        return completeOAuth(req, res);

    }

    /*
    |--------------------------------------------------------------------------
    | Get Customers
    |--------------------------------------------------------------------------
    */

    async getCustomers(req, res) {

        const session = req.shopify.session;

        const {

            first = 50,

            after = null,

            query = ""

        } = req.query;

        const customers = await getCustomers(

            session,

            {

                first: Number(first),

                after,

                query

            }

        );

        return res.status(200).json({

            success: true,

            message: "Customers fetched successfully.",

            data: customers

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Orders
    |--------------------------------------------------------------------------
    */

    async getOrders(req, res) {

        const session = req.shopify.session;

        const {

            first = 50,

            after = null,

            query = ""

        } = req.query;

        const orders = await getOrders(

            session,

            {

                first: Number(first),

                after,

                query

            }

        );

        return res.status(200).json({

            success: true,

            message: "Orders fetched successfully.",

            data: orders

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Inventory
    |--------------------------------------------------------------------------
    */

    async getInventory(req, res) {

        const session = req.shopify.session;

        const inventory = await getInventory(

            session

        );

        return res.status(200).json({

            success: true,

            message: "Inventory fetched successfully.",

            data: inventory

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Locations
    |--------------------------------------------------------------------------
    */

    async getLocations(req, res) {

        const session = req.shopify.session;

        const locations = await getLocations(

            session

        );

        return res.status(200).json({

            success: true,

            message: "Locations fetched successfully.",

            data: locations

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Sync Products
    |--------------------------------------------------------------------------
    */

    async syncProducts(req, res) {

        const session = req.shopify.session;

        const result = await syncProducts(session);

        return res.status(200).json({

            success: true,

            message: "Products synchronized successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Sync Orders
    |--------------------------------------------------------------------------
    */

    async syncOrders(req, res) {

        const session = req.shopify.session;

        const result = await syncOrders(session);

        return res.status(200).json({

            success: true,

            message: "Orders synchronized successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Sync Customers
    |--------------------------------------------------------------------------
    */

    async syncCustomers(req, res) {

        const session = req.shopify.session;

        const result = await syncCustomers(session);

        return res.status(200).json({

            success: true,

            message: "Customers synchronized successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Sync Inventory
    |--------------------------------------------------------------------------
    */

    async syncInventory(req, res) {

        const session = req.shopify.session;

        const result = await syncInventory(session);

        return res.status(200).json({

            success: true,

            message: "Inventory synchronized successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Sync Shop
    |--------------------------------------------------------------------------
    */

    async syncShop(req, res) {

        const session = req.shopify.session;

        const result = await syncShop(session);

        return res.status(200).json({

            success: true,

            message: "Shop synchronized successfully.",

            data: result

        });

    }

/*
|--------------------------------------------------------------------------
| Export Controller Methods
|--------------------------------------------------------------------------
*/
export const getCurrentShop = asyncHandler(

    shopifyController.getCurrentShop.bind(shopifyController)

);

export const getShopInformation = asyncHandler(

    shopifyController.getShopInformation.bind(shopifyController)

);

export const getProducts = asyncHandler(

    shopifyController.getProducts.bind(shopifyController)

);


export const getCollections = asyncHandler(

    shopifyController.getCollections.bind(shopifyController)

);

export const getCustomers = asyncHandler(

    shopifyController.getCustomers.bind(shopifyController)

);

export const getOrders = asyncHandler(

    shopifyController.getOrders.bind(shopifyController)

);

export const getInventory = asyncHandler(

    shopifyController.getInventory.bind(shopifyController)

);

export const getLocations = asyncHandler(

    shopifyController.getLocations.bind(shopifyController)

);
export const syncProducts = asyncHandler(

    shopifyController.syncProducts.bind(shopifyController)

);

export const syncOrders = asyncHandler(

    shopifyController.syncOrders.bind(shopifyController)

);

export const syncCustomers = asyncHandler(

    shopifyController.syncCustomers.bind(shopifyController)

);

export const syncInventory = asyncHandler(

    shopifyController.syncInventory.bind(shopifyController)

);

export const syncShop = asyncHandler(

    shopifyController.syncShop.bind(shopifyController)

);
export const getThemes = asyncHandler(

    shopifyController.getThemes.bind(shopifyController)

);

export const publishTheme = asyncHandler(

    shopifyController.publishTheme.bind(shopifyController)

);

export const getScriptTags = asyncHandler(

    shopifyController.getScriptTags.bind(shopifyController)

);

export const installScriptTag = asyncHandler(

    shopifyController.installScriptTag.bind(shopifyController)

);

export const uninstallScriptTag = asyncHandler(

    shopifyController.uninstallScriptTag.bind(shopifyController)

);

export const registerWebhooks = asyncHandler(

    shopifyController.registerWebhooks.bind(shopifyController)

);

export const unregisterWebhooks = asyncHandler(

    shopifyController.unregisterWebhooks.bind(shopifyController)

);

export const beginOAuth = asyncHandler(

    shopifyController.beginOAuth.bind(shopifyController)

);

export const completeOAuth = asyncHandler(

    shopifyController.completeOAuth.bind(shopifyController)

);
