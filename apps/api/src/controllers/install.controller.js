import asyncHandler from "express-async-handler";

import InstallService from "../services/shopify/install.service.js";

/*
|--------------------------------------------------------------------------
| Start Shopify Installation
|--------------------------------------------------------------------------
*/

export const install = asyncHandler(

    async (req, res) => {

        const { shop } = req.body;

        const canonicalShop =

            await InstallService.validateShop(

                shop

            );

        const state =

            InstallService.generateStateToken();

        const url =

            InstallService.buildOAuthUrl({

                shop: canonicalShop,

                state: state.token

            });

        return res.status(200).json({

            success: true,

            redirectUrl: url,

            state: state.token,

            expiresAt: state.expiresAt

        });

    }

);

/*
|--------------------------------------------------------------------------
| Check Installation
|--------------------------------------------------------------------------
*/

export const checkInstallation = asyncHandler(

    async (req, res) => {

        const { shop } = req.params;

        const existing =

            await InstallService.findInstalledShop(

                shop

            );

        if (!existing) {

            return res.status(404).json({

                success: false,

                installed: false,

                message: "Shop not installed."

            });

        }

        return res.json({

            success: true,

            installed: existing.installed,

            shop: existing

        });

    }

);
/*
|--------------------------------------------------------------------------
| Shopify OAuth Callback
|--------------------------------------------------------------------------
*/

export const callback = asyncHandler(

    async (req, res) => {

        const {

            shop,

            code,

            state,

            scope

        } = req.query;

        /*
        |--------------------------------------------------------------------------
        | Validate Request
        |--------------------------------------------------------------------------
        */

        if (!shop || !code) {

            return res.status(400).json({

                success: false,

                message: "Invalid Shopify callback."

            });

        }

        /*
        |--------------------------------------------------------------------------
        | Exchange Access Token
        |--------------------------------------------------------------------------
        */

        const accessToken =

            await InstallService.exchangeAccessToken({

                shop,

                code

            });

        /*
        |--------------------------------------------------------------------------
        | Fetch Shop Information
        |--------------------------------------------------------------------------
        */

        const shopData =

            await InstallService.fetchShopDetails(

                shop,

                accessToken

            );

        /*
        |--------------------------------------------------------------------------
        | Save Shop
        |--------------------------------------------------------------------------
        */

        const savedShop =

            await InstallService.saveShop({

                shop,

                shopData,

                accessToken

            });

        /*
        |--------------------------------------------------------------------------
        | Create Merchant
        |--------------------------------------------------------------------------
        */

        const merchant =

            await InstallService.createMerchant(

                savedShop

            );

        /*
        |--------------------------------------------------------------------------
        | Create Trial Subscription
        |--------------------------------------------------------------------------
        */

        await InstallService.createTrialSubscription(

            savedShop,

            merchant

        );

        /*
        |--------------------------------------------------------------------------
        | Register Webhooks
        |--------------------------------------------------------------------------
        */

        await InstallService.registerWebhooks({

            shop,

            accessToken

        });

        /*
        |--------------------------------------------------------------------------
        | Complete Installation
        |--------------------------------------------------------------------------
        */

        await InstallService.completeInstallation({

            shop: savedShop,

            accessToken,

            scope,

            installedBy: merchant._id

        });

        /*
        |--------------------------------------------------------------------------
        | Redirect Merchant
        |--------------------------------------------------------------------------
        */

        return res.redirect(

            `${process.env.FRONTEND_URL}/dashboard?shop=${savedShop.shopDomain}`

        );

    }

);

/*
|--------------------------------------------------------------------------
| Reinstall Existing Shop
|--------------------------------------------------------------------------
*/

export const reinstall = asyncHandler(

    async (req, res) => {

        const {

            shop,

            accessToken,

            scope

        } = req.body;

        const existingShop =

            await InstallService.findInstalledShop(

                shop

            );

        if (!existingShop) {

            return res.status(404).json({

                success: false,

                message: "Shop not found."

            });

        }

        await InstallService.reinstallShop({

            shop: existingShop,

            accessToken,

            scope

        });

        return res.json({

            success: true,

            message: "Shop reinstalled successfully."

        });

    }

);
/*
|--------------------------------------------------------------------------
| Uninstall Shopify App
|--------------------------------------------------------------------------
*/

export const uninstall = asyncHandler(

    async (req, res) => {

        const { shop } = req.body;

        const existingShop =
            await InstallService.findInstalledShop(shop);

        if (!existingShop) {

            return res.status(404).json({

                success: false,

                message: "Shop not found."

            });

        }

        await InstallService.uninstallShop(

            existingShop

        );

        return res.json({

            success: true,

            message: "Shop uninstalled successfully."

        });

    }

);

/*
|--------------------------------------------------------------------------
| Sync Shopify Store
|--------------------------------------------------------------------------
*/

export const syncStore = asyncHandler(

    async (req, res) => {

        const { shop } = req.params;

        const existingShop =
            await InstallService.findInstalledShop(shop);

        if (!existingShop) {

            return res.status(404).json({

                success: false,

                message: "Shop not found."

            });

        }

        const accessToken =
            existingShop.accessToken;

        const products =
            await InstallService.syncProducts({

                shop,

                accessToken

            });

        const collections =
            await InstallService.syncCollections({

                shop,

                accessToken

            });

        const policies =
            await InstallService.syncPolicies({

                shop,

                accessToken

            });

        return res.json({

            success: true,

            message: "Store synchronized successfully.",

            data: {

                products: products.length,

                collections: collections.length,

                policies: policies.length

            }

        });

    }

);

/*
|--------------------------------------------------------------------------
| Installation Status
|--------------------------------------------------------------------------
*/

export const installationStatus = asyncHandler(

    async (req, res) => {

        const { shop } = req.params;

        const existingShop =
            await InstallService.findInstalledShop(shop);

        return res.json({

            success: true,

            installed: !!existingShop,

            status: existingShop?.installStatus || "not_installed",

            aiEnabled: existingShop?.aiEnabled || false,

            chatbotEnabled:
                existingShop?.chatbotEnabled || false,

            installedAt:
                existingShop?.installedAt || null

        });

    }

);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

export const healthCheck = asyncHandler(

    async (req, res) => {

        return res.json({

            success: true,

            service: "Install Controller",

            status: "healthy",

            timestamp: new Date()

        });

    }

);

/*
|--------------------------------------------------------------------------
| Install Controller
|--------------------------------------------------------------------------
*/

export const InstallController = {

    install,

    callback,

    checkInstallation,

    reinstall,

    uninstall,

    syncStore,

    installationStatus,

    healthCheck

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default InstallController;
