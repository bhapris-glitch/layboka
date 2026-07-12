import crypto from "crypto"; 
import Shop from "../../models/Shop.js";
import Visitor from "../../models/Visitor.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Subscription from "../../models/Subscription.js";

import {
    createConversation
} from "../conversation/conversation.service.js";

/*
|--------------------------------------------------------------------------
| Widget Configuration
|--------------------------------------------------------------------------
*/

export const WIDGET_CONFIG = Object.freeze({

    VERSION: "2.0.0",

    DEFAULT_LANGUAGE: "en",

    DEFAULT_THEME: "light",

    DEFAULT_POSITION: "bottom-right",

    DEFAULT_ASSISTANT_NAME: "Layboka AI",

    DEFAULT_WELCOME_MESSAGE:
        "Hi 👋 I'm Layboka AI. How can I help you today?",

    DEFAULT_PLACEHOLDER:
        "Ask anything...",

    DEFAULT_PRIMARY_COLOR: "#FF3B2F",

    DEFAULT_SECONDARY_COLOR: "#1E3928",

    SESSION_TIMEOUT:
        30 * 60 * 1000,

    MESSAGE_LIMIT: 50,

    MAX_MESSAGE_LENGTH: 5000,

    MAX_CONVERSATION_HISTORY: 100

});

/*
|--------------------------------------------------------------------------
| Validate Shop
|--------------------------------------------------------------------------
*/

export async function validateShop(
    shopDomain
) {

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
            "Active subscription not found."
        );

    }

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Load Shop Configuration
|--------------------------------------------------------------------------
*/

export async function loadShopConfiguration(
    shop
) {

    return {

        assistantName:

            shop.assistantName ||

            WIDGET_CONFIG.DEFAULT_ASSISTANT_NAME,

        welcomeMessage:

            shop.welcomeMessage ||

            WIDGET_CONFIG.DEFAULT_WELCOME_MESSAGE,

        placeholder:

            shop.placeholder ||

            WIDGET_CONFIG.DEFAULT_PLACEHOLDER,

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

            shop.logo ||

            "",

        assistantAvatar:

            shop.assistantAvatar ||

            "",

        enableVoice:

            shop.enableVoice ??

            false,

        enableTypingIndicator:

            shop.enableTypingIndicator ??

            true,

        enableRecommendations:

            shop.enableRecommendations ??

            true,

        enableCartRecovery:

            shop.enableCartRecovery ??

            true,

        enableBranding:

            shop.enableBranding ??

            true

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
        await validateShop(
            shopDomain
        );

    const subscription =
        await validateSubscription(
            shop._id
        );

    const configuration =
        await loadShopConfiguration(
            shop
        );

    return {

        success: true,

        version:
            WIDGET_CONFIG.VERSION,

        shop,

        subscription,

        configuration

    };

}
