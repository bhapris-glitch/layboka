import Shop from "../../models/Shop.js";
import Subscription from "../../models/Subscription.js";

/*
|--------------------------------------------------------------------------
| Widget Configuration
|--------------------------------------------------------------------------
*/

export const WIDGET_CONFIG = Object.freeze({

    VERSION: "1.0.0",

    DEFAULT_THEME: "light",

    DEFAULT_POSITION: "bottom-right",

    DEFAULT_LANGUAGE: "en",

    DEFAULT_PRIMARY_COLOR: "#FF3B30",

    DEFAULT_SECONDARY_COLOR: "#1E392A",

    DEFAULT_WELCOME_MESSAGE:
        "Hi 👋 I'm Layboka AI. How can I help you today?",

    DEFAULT_ASSISTANT_NAME: "Layboka AI",

    MAX_MESSAGE_LENGTH: 5000,

    SESSION_TIMEOUT: 30 * 60 * 1000

});

/*
|--------------------------------------------------------------------------
| Validate Widget Request
|--------------------------------------------------------------------------
*/

export async function validateWidget({

    shopDomain

}) {

    if (!shopDomain) {

        throw new Error(
            "Shop domain is required."
        );

    }

    const shop = await Shop.findOne({

        shopDomain,

        status: "active",

        deleted: false

    });

    if (!shop) {

        throw new Error(
            "Shop not found."
        );

    }

    return shop;

}

/*
|--------------------------------------------------------------------------
| Validate Subscription
|--------------------------------------------------------------------------
*/

export async function validateSubscription(

    shopId

) {

    const subscription =

        await Subscription.findOne({

            shop: shopId,

            status: "active"

        });

    if (!subscription) {

        throw new Error(

            "No active subscription found."

        );

    }

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Load Shop
|--------------------------------------------------------------------------
*/

export async function loadShop(

    shopDomain

) {

    return validateWidget({

        shopDomain

    });

}

/*
|--------------------------------------------------------------------------
| Load Widget Configuration
|--------------------------------------------------------------------------
*/

export async function loadWidgetConfiguration(

    shop

) {

    return {

        assistantName:

            shop.assistantName ||

            WIDGET_CONFIG.DEFAULT_ASSISTANT_NAME,

        welcomeMessage:

            shop.welcomeMessage ||

            WIDGET_CONFIG.DEFAULT_WELCOME_MESSAGE,

        language:

            shop.language ||

            WIDGET_CONFIG.DEFAULT_LANGUAGE,

        theme:

            shop.widgetTheme ||

            WIDGET_CONFIG.DEFAULT_THEME,

        position:

            shop.widgetPosition ||

            WIDGET_CONFIG.DEFAULT_POSITION,

        primaryColor:

            shop.primaryColor ||

            WIDGET_CONFIG.DEFAULT_PRIMARY_COLOR,

        secondaryColor:

            shop.secondaryColor ||

            WIDGET_CONFIG.DEFAULT_SECONDARY_COLOR,

        logo:

            shop.logo || "",

        avatar:

            shop.assistantAvatar || "",

        enabled:

            shop.widgetEnabled !== false

    };

}

/*
|--------------------------------------------------------------------------
| Initialize Widget
|--------------------------------------------------------------------------
*/

export async function initializeWidget({

    shopDomain

}) {

    const shop =

        await loadShop(

            shopDomain

        );

    const subscription =

        await validateSubscription(

            shop._id

        );

    const config =

        await loadWidgetConfiguration(

            shop

        );

    return {

        success: true,

        version:

            WIDGET_CONFIG.VERSION,

        shop,

        subscription,

        config

    };

}
