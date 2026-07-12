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
/*
|--------------------------------------------------------------------------
| Create Visitor Session
|--------------------------------------------------------------------------
*/

export async function createVisitorSession(

    shop,
    visitor,
    request

) {

    visitor.sessionId =
        visitor.sessionId ||
        crypto.randomUUID();

    visitor.ipAddress =
        request.ip || "";

    visitor.userAgent =
        request.headers["user-agent"] || "";

    visitor.lastActivityAt =
        new Date();

    visitor.sessionExpiresAt =
        new Date(

            Date.now() +

            WIDGET_CONFIG.SESSION_TIMEOUT

        );

    visitor.isOnline = true;

    visitor.totalVisits =
        (visitor.totalVisits || 0) + 1;

    await visitor.save();

    return {

        sessionId:
            visitor.sessionId,

        expiresAt:
            visitor.sessionExpiresAt

    };

}

/*
|--------------------------------------------------------------------------
| Update Visitor Activity
|--------------------------------------------------------------------------
*/

export async function updateVisitorActivity(

    visitor

) {

    visitor.lastActivityAt =
        new Date();

    visitor.lastSeenAt =
        new Date();

    visitor.sessionExpiresAt =
        new Date(

            Date.now() +

            WIDGET_CONFIG.SESSION_TIMEOUT

        );

    await visitor.save();

    return visitor;

}

/*
|--------------------------------------------------------------------------
| Get Active Conversation
|--------------------------------------------------------------------------
*/

export async function getActiveConversation(

    shopId,
    visitorId

) {

    return Conversation.findOne({

        shop: shopId,

        visitor: visitorId,

        status: "active",

        archived: false,

        deleted: false

    }).sort({

        updatedAt: -1

    });

}

/*
|--------------------------------------------------------------------------
| Resume Conversation
|--------------------------------------------------------------------------
*/

export async function resumeConversation(

    shop,
    visitor

) {

    let conversation =

        await getActiveConversation(

            shop._id,

            visitor._id

        );

    if (!conversation) {

        conversation =

            await createConversation({

                shop,

                visitor

            });

        visitor.conversationCount += 1;

        visitor.lastConversation =
            conversation._id;

        await visitor.save();

    }

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Build Widget State
|--------------------------------------------------------------------------
*/

export async function buildWidgetState(

    conversation,
    visitor

) {

    const messages =

        await Message.find({

            conversation:
                conversation._id,

            deleted: false

        })

        .sort({

            createdAt: 1

        })

        .limit(

            WIDGET_CONFIG.MESSAGE_LIMIT

        )

        .lean();

    return {

        visitor: {

            id: visitor._id,

            sessionId:
                visitor.sessionId,

            customerName:
                visitor.customerName,

            customerEmail:
                visitor.customerEmail,

            language:
                visitor.language,

            currency:
                visitor.preferences?.currency ||

                "USD"

        },

        conversation: {

            id:
                conversation.conversationId,

            status:
                conversation.status,

            startedAt:
                conversation.startedAt,

            lastMessageAt:
                conversation.lastMessageAt

        },

        widgetState:

            visitor.widgetState ||

            {

                isOpen: false,

                isMinimized: false

            },

        messages

    };

}

/*
|--------------------------------------------------------------------------
| Resume Widget Session
|--------------------------------------------------------------------------
*/

export async function resumeWidgetSession(

    shop,
    visitor,
    request

) {

    await createVisitorSession(

        shop,

        visitor,

        request

    );

    const conversation =

        await resumeConversation(

            shop,

            visitor

        );

    const widget =

        await buildWidgetState(

            conversation,

            visitor

        );

    return {

        success: true,

        visitor,

        conversation,

        widget

    };

    }
/*
|--------------------------------------------------------------------------
| Get Widget Configuration
|--------------------------------------------------------------------------
*/

export async function getWidgetConfiguration(shop) {

    if (!shop) {

        throw new Error("Shop is required.");

    }

    return {

        version: WIDGET_CONFIG.VERSION,

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
| Build Customer Profile
|--------------------------------------------------------------------------
*/

export async function buildCustomerProfile(visitor) {

    if (!visitor) {

        return null;

    }

    return {

        id: visitor._id,

        sessionId: visitor.sessionId,

        customerId: visitor.customerId,

        customerName: visitor.customerName,

        customerEmail: visitor.customerEmail,

        language: visitor.language,

        country: visitor.country,

        city: visitor.city,

        leadScore: visitor.leadScore,

        intent: visitor.intent,

        totalMessages: visitor.totalMessages,

        conversationCount: visitor.conversationCount,

        purchased: visitor.purchased,

        totalSpent: visitor.totalSpent,

        viewedProducts:

            visitor.viewedProducts || [],

        preferences:

            visitor.preferences || {},

        widgetState:

            visitor.widgetState || {}

    };

}

/*
|--------------------------------------------------------------------------
| Cart Recovery
|--------------------------------------------------------------------------
*/

export async function getCartRecovery(visitor) {

    if (!visitor) {

        return {

            enabled: false

        };

    }

    return {

        enabled:

            visitor.cartRecovery?.enabled ||

            false,

        abandonedCart:

            visitor.cartRecovery?.abandonedCart ||

            false,

        cartValue:

            visitor.cartRecovery?.cartValue ||

            visitor.cartValue ||

            0,

        currency:

            visitor.preferences?.currency ||

            "USD",

        checkoutUrl:

            visitor.cartRecovery?.checkoutUrl ||

            "",

        recovered:

            visitor.cartRecovery?.recovered ||

            false

    };

}

/*
|--------------------------------------------------------------------------
| Update Widget Analytics
|--------------------------------------------------------------------------
*/

export async function updateWidgetAnalytics(

    visitor,

    event

) {

    if (!visitor) {

        return;

    }

    visitor.analytics = visitor.analytics || {

        widgetLoads: 0,

        widgetOpens: 0,

        widgetCloses: 0,

        totalMessages: 0

    };

    switch (event) {

        case "load":

            visitor.analytics.widgetLoads++;

            break;

        case "open":

            visitor.analytics.widgetOpens++;

            break;

        case "close":

            visitor.analytics.widgetCloses++;

            break;

        case "message":

            visitor.analytics.totalMessages++;

            break;

    }

    visitor.lastSeenAt = new Date();

    await visitor.save();

}

/*
|--------------------------------------------------------------------------
| Build Widget Payload
|--------------------------------------------------------------------------
*/

export async function buildWidgetPayload(

    shop,

    visitor,

    conversation

) {

    return {

        configuration:

            await getWidgetConfiguration(

                shop

            ),

        profile:

            await buildCustomerProfile(

                visitor

            ),

        cartRecovery:

            await getCartRecovery(

                visitor

            ),

        state:

            await buildWidgetState(

                conversation,

                visitor

            )

    };

            }
/*
|--------------------------------------------------------------------------
| Initialize Widget Session
|--------------------------------------------------------------------------
*/

export async function initializeWidget(

    shop,

    visitor,

    request

) {

    const session = await resumeWidgetSession(

        shop,

        visitor,

        request

    );

    await updateWidgetAnalytics(

        visitor,

        "load"

    );

    return {

        success: true,

        initialized: true,

        version: WIDGET_CONFIG.VERSION,

        timestamp: new Date(),

        session,

        preferences: getVisitorPreferences(visitor),

        widgetState: getWidgetState(visitor)

    };

}

/*
|--------------------------------------------------------------------------
| Reset Widget
|--------------------------------------------------------------------------
*/

export async function resetWidget(

    conversation,

    visitor

) {

    if (conversation) {

        conversation.unreadMessages = 0;
        conversation.summary = "";
        conversation.detectedIntent = "unknown";
        conversation.sentiment = "neutral";
        conversation.customerStage = "visitor";
        conversation.lastMessageAt = new Date();

        await conversation.save();

    }

    await saveWidgetState(visitor, {

        isOpen: false,

        isMinimized: false,

        lastClosedAt: new Date()

    });

    return {

        success: true,

        resetAt: new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Open Widget
|--------------------------------------------------------------------------
*/

export async function openWidget(visitor) {

    return saveWidgetState(visitor, {

        ...getWidgetState(visitor),

        isOpen: true,

        isMinimized: false,

        lastOpenedAt: new Date()

    });

}

/*
|--------------------------------------------------------------------------
| Close Widget
|--------------------------------------------------------------------------
*/

export async function closeWidget(visitor) {

    return saveWidgetState(visitor, {

        ...getWidgetState(visitor),

        isOpen: false,

        lastClosedAt: new Date()

    });

}

/*
|--------------------------------------------------------------------------
| Minimize Widget
|--------------------------------------------------------------------------
*/

export async function minimizeWidget(visitor) {

    return saveWidgetState(visitor, {

        ...getWidgetState(visitor),

        isMinimized: true

    });

}

/*
|--------------------------------------------------------------------------
| Restore Widget
|--------------------------------------------------------------------------
*/

export async function restoreWidget(visitor) {

    return saveWidgetState(visitor, {

        ...getWidgetState(visitor),

        isOpen: true,

        isMinimized: false

    });

}
/*
|--------------------------------------------------------------------------
| Update Widget Analytics
|--------------------------------------------------------------------------
*/

export async function updateWidgetAnalytics(

    visitor,

    event = "load"

) {

    if (!visitor) {

        return null;

    }

    if (!visitor.analytics) {

        visitor.analytics = {};

    }

    visitor.analytics.widgetLoads ??= 0;
    visitor.analytics.widgetOpens ??= 0;
    visitor.analytics.widgetCloses ??= 0;
    visitor.analytics.messages ??= 0;
    visitor.analytics.totalSessions ??= 0;

    switch (event) {

        case "load":

            visitor.analytics.widgetLoads++;
            break;

        case "open":

            visitor.analytics.widgetOpens++;
            break;

        case "close":

            visitor.analytics.widgetCloses++;
            break;

        case "message":

            visitor.analytics.messages++;
            break;

        case "session":

            visitor.analytics.totalSessions++;
            break;

    }

    visitor.lastActivityAt = new Date();

    await visitor.save();

    return visitor.analytics;

}

/*
|--------------------------------------------------------------------------
| Widget Health
|--------------------------------------------------------------------------
*/

export async function getWidgetHealth(

    shop,

    subscription

) {

    return {

        healthy: true,

        widgetEnabled:

            shop.widgetEnabled !== false,

        subscriptionActive:

            subscription.status === "active",

        assistant:

            shop.assistantName ||

            "Layboka AI",

        checkedAt:

            new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Build Widget Payload
|--------------------------------------------------------------------------
*/

export async function buildWidgetPayload({

    shop,

    visitor,

    conversation,

    subscription

}) {

    return {

        success: true,

        version:

            WIDGET_CONFIG.VERSION,

        configuration:

            await loadWidgetConfiguration(shop),

        visitor: {

            id: visitor._id,

            language:

                visitor.language,

            currency:

                visitor.preferences?.currency ||

                "USD"

        },

        conversation: {

            id:

                conversation?.conversationId ||

                null,

            status:

                conversation?.status ||

                "active"

        },

        subscription: {

            plan:

                subscription.plan,

            status:

                subscription.status

        },

        health:

            await getWidgetHealth(

                shop,

                subscription

            )

    };

}

/*
|--------------------------------------------------------------------------
| Widget Service
|--------------------------------------------------------------------------
*/

export const WidgetService = {

    validateWidget,

    validateSubscription,

    loadShop,

    loadWidgetConfiguration,

    createVisitorSession,

    updateVisitorActivity,

    getActiveConversation,

    resumeConversation,

    buildWidgetState,

    resumeWidgetSession,

    initializeWidget,

    resetWidget,

    saveWidgetState,

    getWidgetState,

    saveVisitorPreferences,

    getVisitorPreferences,

    updateWidgetAnalytics,

    getWidgetHealth,

    buildWidgetPayload

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default WidgetService;
