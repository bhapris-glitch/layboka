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

    const session = {

        sessionId: crypto.randomUUID(),

        shop: shop._id,

        visitor: visitor._id,

        ipAddress: request.ip,

        userAgent: request.headers["user-agent"],

        startedAt: new Date(),

        lastActivityAt: new Date(),

        expiresAt: new Date(

            Date.now() +

            WIDGET_CONFIG.SESSION_TIMEOUT

        )

    };

    return session;

}

/*
|--------------------------------------------------------------------------
| Update Visitor Activity
|--------------------------------------------------------------------------
*/

export function updateVisitorActivity(

    session

) {

    session.lastActivityAt =

        new Date();

    session.expiresAt =

        new Date(

            Date.now() +

            WIDGET_CONFIG.SESSION_TIMEOUT

        );

    return session;

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

    })

    .sort({

        updatedAt: -1

    });

}

/*
|--------------------------------------------------------------------------
| Resume Existing Conversation
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

    }

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Load Widget State
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

        );

    return {

        visitor: {

            id: visitor._id,

            name:

                visitor.firstName ||

                "",

            language:

                visitor.language ||

                "en"

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

    const session =

        createVisitorSession(

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

        session,

        widget

    };

}
/*
|--------------------------------------------------------------------------
| Get Widget Configuration
|--------------------------------------------------------------------------
*/

export async function getWidgetConfiguration(shop) {

    return {

        assistantName:
            shop.ai?.assistantName || "Layboka AI",

        theme:
            shop.widget?.theme || "light",

        primaryColor:
            shop.widget?.primaryColor || "#FF3B2F",

        position:
            shop.widget?.position || "bottom-right",

        welcomeMessage:
            shop.widget?.welcomeMessage ||
            "Hi 👋 I'm Layboka AI. How can I help you today?",

        placeholder:
            shop.widget?.placeholder ||
            "Ask me anything...",

        suggestions:
            shop.widget?.suggestions || [],

        showBranding:
            shop.widget?.showBranding ?? true,

        enableVoice:
            shop.widget?.enableVoice ?? false,

        enableTypingIndicator:
            shop.widget?.enableTypingIndicator ?? true

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

        firstName: visitor.firstName,

        lastName: visitor.lastName,

        email: visitor.email,

        phone: visitor.phone,

        language: visitor.language,

        currency: visitor.currency,

        totalVisits: visitor.totalVisits,

        totalOrders: visitor.totalOrders,

        totalSpent: visitor.totalSpent,

        tags: visitor.tags || [],

        preferences: visitor.preferences || {}

    };

}

/*
|--------------------------------------------------------------------------
| Cart Recovery Information
|--------------------------------------------------------------------------
*/

export async function getCartRecovery(visitor) {

    if (!visitor) {

        return null;

    }

    return {

        enabled:
            visitor.cartRecovery?.enabled || false,

        abandonedCart:
            visitor.cartRecovery?.abandonedCart || false,

        cartValue:
            visitor.cartRecovery?.cartValue || 0,

        currency:
            visitor.currency || "USD",

        checkoutUrl:
            visitor.cartRecovery?.checkoutUrl || "",

        recovered:
            visitor.cartRecovery?.recovered || false

    };

}

/*
|--------------------------------------------------------------------------
| Widget Analytics
|--------------------------------------------------------------------------
*/

export async function updateWidgetAnalytics(

    visitor,

    event

) {

    if (!visitor) {

        return;

    }

    visitor.analytics = visitor.analytics || {};

    visitor.analytics.widgetLoads =
        (visitor.analytics.widgetLoads || 0);

    visitor.analytics.widgetOpens =
        (visitor.analytics.widgetOpens || 0);

    visitor.analytics.messages =
        (visitor.analytics.messages || 0);

    switch (event) {

        case "load":

            visitor.analytics.widgetLoads++;

            break;

        case "open":

            visitor.analytics.widgetOpens++;

            break;

        case "message":

            visitor.analytics.messages++;

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

            await getWidgetConfiguration(shop),

        profile:

            await buildCustomerProfile(visitor),

        cartRecovery:

            await getCartRecovery(visitor),

        widget:

            await buildWidgetState(

                conversation,

                visitor

            )

    };

        }
/*
|--------------------------------------------------------------------------
| Initialize Widget
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

    return {

        initialized: true,

        timestamp: new Date(),

        session

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

    return {

        success: true,

        resetAt: new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Save Widget State
|--------------------------------------------------------------------------
*/

export async function saveWidgetState(

    visitor,

    state = {}

) {

    visitor.widgetState = {

        isOpen: state.isOpen ?? false,

        isMinimized: state.isMinimized ?? false,

        lastOpenedAt:

            state.lastOpenedAt ||

            null,

        lastClosedAt:

            state.lastClosedAt ||

            null,

        updatedAt: new Date()

    };

    await visitor.save();

    return visitor.widgetState;

}

/*
|--------------------------------------------------------------------------
| Load Widget State
|--------------------------------------------------------------------------
*/

export function getWidgetState(

    visitor

) {

    return visitor.widgetState || {

        isOpen: false,

        isMinimized: false,

        lastOpenedAt: null,

        lastClosedAt: null,

        updatedAt: null

    };

}

/*
|--------------------------------------------------------------------------
| Save Visitor Preferences
|--------------------------------------------------------------------------
*/

export async function saveVisitorPreferences(

    visitor,

    preferences = {}

) {

    visitor.preferences = {

        language:

            preferences.language ||

            visitor.preferences?.language ||

            "en",

        currency:

            preferences.currency ||

            visitor.preferences?.currency ||

            "USD",

        theme:

            preferences.theme ||

            visitor.preferences?.theme ||

            "light",

        sound:

            preferences.sound ??

            visitor.preferences?.sound ??

            true,

        notifications:

            preferences.notifications ??

            visitor.preferences?.notifications ??

            true

    };

    await visitor.save();

    return visitor.preferences;

}

/*
|--------------------------------------------------------------------------
| Load Visitor Preferences
|--------------------------------------------------------------------------
*/

export function getVisitorPreferences(

    visitor

) {

    return visitor.preferences || {

        language: "en",

        currency: "USD",

        theme: "light",

        sound: true,

        notifications: true

    };

}

/*
|--------------------------------------------------------------------------
| Widget Service
|--------------------------------------------------------------------------
*/

export const WidgetService = {

    initializeWidget,

    createVisitorSession,

    updateVisitorActivity,

    getActiveConversation,

    resumeConversation,

    buildWidgetState,

    resumeWidgetSession,

    resetWidget,

    saveWidgetState,

    getWidgetState,

    saveVisitorPreferences,

    getVisitorPreferences

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default WidgetService;
