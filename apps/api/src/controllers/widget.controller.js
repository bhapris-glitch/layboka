/*
|--------------------------------------------------------------------------
| Widget Controller
|--------------------------------------------------------------------------
*/

import asyncHandler from "express-async-handler";

import WidgetService from "../services/widget.service.js";
import ConversationService from "../services/conversation.service.js";
import InstallService from "../services/install.service.js";
import AnalyticsService from "../services/analytics.service.js";

import Shop from "../models/Shop.js";

/*
|--------------------------------------------------------------------------
| Widget Controller Class
|--------------------------------------------------------------------------
*/

class WidgetController {

    /*
    |--------------------------------------------------------------------------
    | Load Widget
    |--------------------------------------------------------------------------
    */

    async loadWidget(req, res) {

        const {

            shop

        } = req.query;

        if (!shop) {

            return res.status(400).json({

                success: false,

                message: "Shop domain is required."

            });

        }

        const shopData = await Shop.findOne({

            shop,

            isActive: true

        });

        if (!shopData) {

            return res.status(404).json({

                success: false,

                message: "Shop not found."

            });

        }

        const widget = await WidgetService.loadWidget(

            shopData

        );

        return res.status(200).json({

            success: true,

            data: widget

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Widget Configuration
    |--------------------------------------------------------------------------
    */

    async getWidgetConfig(req, res) {

        const {

            shopId

        } = req.params;

        const config =

            await WidgetService.getWidgetConfig(

                shopId

            );

        return res.status(200).json({

            success: true,

            data: config

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Widget Settings
    |--------------------------------------------------------------------------
    */

    async getWidgetSettings(req, res) {

        const {

            shopId

        } = req.params;

        const settings =

            await WidgetService.getWidgetSettings(

                shopId

            );

        return res.status(200).json({

            success: true,

            data: settings

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Update Widget Settings
    |--------------------------------------------------------------------------
    */

    async updateWidgetSettings(req, res) {

        const { shopId } = req.params;

        const settings = req.body;

        const updatedSettings =
            await WidgetService.updateWidgetSettings(

                shopId,

                settings

            );

        return res.status(200).json({

            success: true,

            message: "Widget settings updated successfully.",

            data: updatedSettings

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Update Widget Theme
    |--------------------------------------------------------------------------
    */

    async updateWidgetTheme(req, res) {

        const { shopId } = req.params;

        const theme = req.body;

        const updatedTheme =
            await WidgetService.updateWidgetTheme(

                shopId,

                theme

            );

        return res.status(200).json({

            success: true,

            message: "Widget theme updated successfully.",

            data: updatedTheme

        });

    }

      /*
    |--------------------------------------------------------------------------
    | Install Widget
    |--------------------------------------------------------------------------
    */

    async installWidget(req, res) {

        const { shopId } = req.params;

        const result = await InstallService.installWidget(

            shopId

        );

        return res.status(200).json({

            success: true,

            message: "Widget installed successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Uninstall Widget
    |--------------------------------------------------------------------------
    */

    async uninstallWidget(req, res) {

        const { shopId } = req.params;

        const result = await InstallService.uninstallWidget(

            shopId

        );

        return res.status(200).json({

            success: true,

            message: "Widget uninstalled successfully.",

            data: result

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Get Installation Status
    |--------------------------------------------------------------------------
    */

    async getInstallationStatus(req, res) {

        const { shopId } = req.params;

        const status = await InstallService.getInstallationStatus(

            shopId

        );

        return res.status(200).json({

            success: true,

            data: status

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Regenerate Shopify Script Tag
    |--------------------------------------------------------------------------
    */

    async regenerateScriptTag(req, res) {

        const { shopId } = req.params;

        const scriptTag =

            await InstallService.regenerateScriptTag(

                shopId

            );

        return res.status(200).json({

            success: true,

            message: "Script Tag regenerated successfully.",

            data: scriptTag

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Enable / Disable Widget
    |--------------------------------------------------------------------------
    */

    async toggleWidget(req, res) {

        const { shopId } = req.params;

        const { enabled } = req.body;

        const widget =
            await WidgetService.toggleWidget(

                shopId,

                enabled

            );

        return res.status(200).json({

            success: true,

            message: enabled
                ? "Widget enabled successfully."
                : "Widget disabled successfully.",

            data: widget

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Reset Widget
    |--------------------------------------------------------------------------
    */

    async resetWidget(req, res) {

        const { shopId } = req.params;

        const widget =
            await WidgetService.resetWidget(

                shopId

            );

        return res.status(200).json({

            success: true,

            message: "Widget reset successfully.",

            data: widget

        });

    }
  
    /*
    |--------------------------------------------------------------------------
    | Get Widget Theme
    |--------------------------------------------------------------------------
    */

    async getWidgetTheme(req, res) {

        const {

            shopId

        } = req.params;

        const theme =

            await WidgetService.getWidgetTheme(

                shopId

            );

        return res.status(200).json({

            success: true,

            data: theme

        });

    }

}

const widgetController = new WidgetController();

/*
|--------------------------------------------------------------------------
| Export Async Controllers
|--------------------------------------------------------------------------
*/

export const loadWidget =
    asyncHandler(
        widgetController.loadWidget.bind(widgetController)
    );

export const getWidgetConfig =
    asyncHandler(
        widgetController.getWidgetConfig.bind(widgetController)
    );

export const getWidgetSettings =
    asyncHandler(
        widgetController.getWidgetSettings.bind(widgetController)
    );

export const getWidgetTheme =
    asyncHandler(
        widgetController.getWidgetTheme.bind(widgetController)
    );
export const installWidget =
    asyncHandler(
        widgetController
            .installWidget
            .bind(widgetController)
    );

export const uninstallWidget =
    asyncHandler(
        widgetController
            .uninstallWidget
            .bind(widgetController)
    );

export const getInstallationStatus =
    asyncHandler(
        widgetController
            .getInstallationStatus
            .bind(widgetController)
    );

export const regenerateScriptTag =
    asyncHandler(
        widgetController
            .regenerateScriptTag
            .bind(widgetController)
    );
