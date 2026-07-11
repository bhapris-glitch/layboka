import { randomUUID } from "crypto";

/*
|--------------------------------------------------------------------------
| Response Configuration
|--------------------------------------------------------------------------
*/

export const RESPONSE_CONFIG = Object.freeze({

    DEFAULT_LANGUAGE: "en",

    DEFAULT_TYPE: "text",

    MAX_QUICK_REPLIES: 6,

    MAX_ACTIONS: 5,

    MAX_PRODUCT_CARDS: 6

});

/*
|--------------------------------------------------------------------------
| Response Types
|--------------------------------------------------------------------------
*/

export const RESPONSE_TYPES = Object.freeze({

    TEXT: "text",

    PRODUCT_CARDS: "product_cards",

    QUICK_REPLIES: "quick_replies",

    ACTIONS: "actions",

    ERROR: "error",

    HANDOFF: "handoff",

    SYSTEM: "system"

});

/*
|--------------------------------------------------------------------------
| Create Base Response
|--------------------------------------------------------------------------
*/

export function createResponse({

    type = RESPONSE_TYPES.TEXT,

    content = "",

    language = RESPONSE_CONFIG.DEFAULT_LANGUAGE

} = {}) {

    return {

        id: randomUUID(),

        type,

        language,

        content,

        createdAt: new Date().toISOString()

    };

}

/*
|--------------------------------------------------------------------------
| Text Response
|--------------------------------------------------------------------------
*/

export function createTextResponse(

    content,

    language = "en"

) {

    return createResponse({

        type: RESPONSE_TYPES.TEXT,

        content,

        language

    });

}

/*
|--------------------------------------------------------------------------
| Error Response
|--------------------------------------------------------------------------
*/

export function createErrorResponse(

    message =

        "Something went wrong. Please try again."

) {

    return createResponse({

        type: RESPONSE_TYPES.ERROR,

        content: message

    });

}

/*
|--------------------------------------------------------------------------
| System Response
|--------------------------------------------------------------------------
*/

export function createSystemResponse(

    message

) {

    return createResponse({

        type: RESPONSE_TYPES.SYSTEM,

        content: message

    });

}

/*
|--------------------------------------------------------------------------
| Human Handoff Response
|--------------------------------------------------------------------------
*/

export function createHandoffResponse() {

    return createResponse({

        type: RESPONSE_TYPES.HANDOFF,

        content:
            "A human support representative will assist you shortly."

    });

}
/*
|--------------------------------------------------------------------------
| Build Product Cards
|--------------------------------------------------------------------------
*/

export function buildProductCards(products = []) {

    return products.map(product => ({

        id: product._id,

        shopifyProductId: product.shopifyProductId,

        title: product.title,

        handle: product.handle,

        description: product.description || "",

        image: product.featuredImage || product.image || "",

        price: product.price,

        compareAtPrice: product.compareAtPrice,

        currency: product.currency || "USD",

        available: product.inventoryQuantity > 0,

        inventoryQuantity: product.inventoryQuantity,

        vendor: product.vendor,

        productType: product.productType,

        score: product.recommendationScore || 0,

        reason: product.recommendationReason || ""

    }));

}

/*
|--------------------------------------------------------------------------
| Build Quick Replies
|--------------------------------------------------------------------------
*/

export function buildQuickReplies(intent = "unknown") {

    switch (intent) {

        case "product_search":

            return [

                {
                    id: "best_sellers",
                    title: "Best Sellers",
                    value: "Show best sellers"
                },

                {
                    id: "new_arrivals",
                    title: "New Arrivals",
                    value: "Show new arrivals"
                },

                {
                    id: "discounts",
                    title: "Offers",
                    value: "Show discounts"
                }

            ];

        case "cart":

            return [

                {
                    id: "checkout",
                    title: "Checkout",
                    value: "Proceed to checkout"
                },

                {
                    id: "continue",
                    title: "Continue Shopping",
                    value: "Continue shopping"
                }

            ];

        default:

            return [

                {
                    id: "products",
                    title: "Browse Products",
                    value: "Show products"
                }

            ];

    }

}

/*
|--------------------------------------------------------------------------
| Build Actions
|--------------------------------------------------------------------------
*/

export function buildActions(products = []) {

    return products.map(product => ({

        type: "product",

        title: "View Product",

        label: product.title,

        value: product._id,

        url: `/products/${product.handle}`,

        style: "primary"

    }));

}

/*
|--------------------------------------------------------------------------
| Cart Recovery Response
|--------------------------------------------------------------------------
*/

export function buildCartRecoveryResponse(cart = {}) {

    return {

        success: true,

        type: "cart_recovery",

        message:

            "You still have items waiting in your cart. Complete your purchase before they sell out.",

        cart,

        actions: [

            {

                type: "checkout",

                title: "Resume Checkout",

                value: "checkout",

                style: "primary"

            }

        ]

    };

}

/*
|--------------------------------------------------------------------------
| Upsell Response
|--------------------------------------------------------------------------
*/

export function buildUpsellResponse(products = []) {

    return {

        success: true,

        type: "upsell",

        message:

            "Customers often purchase these together.",

        productCards:

            buildProductCards(products),

        actions:

            buildActions(products)

    };

}

/*
|--------------------------------------------------------------------------
| Cross Sell Response
|--------------------------------------------------------------------------
*/

export function buildCrossSellResponse(products = []) {

    return {

        success: true,

        type: "cross_sell",

        message:

            "You may also like these products.",

        productCards:

            buildProductCards(products),

        actions:

            buildActions(products)

    };

                }
/*
|--------------------------------------------------------------------------
| Build Cart Recovery Response
|--------------------------------------------------------------------------
*/

export function buildCartRecoveryResponse({

    customerName = "",

    recoveryUrl = "",

    cartValue = 0,

    currency = "USD"

} = {}) {

    const message = customerName

        ? `Hi ${customerName}, you left some great products in your cart.`

        : "You left some great products in your cart.";

    return {

        type: "cart-recovery",

        success: true,

        message,

        recoveryUrl,

        cartValue,

        currency,

        quickReplies: [

            "Resume Checkout",

            "Continue Shopping"

        ]

    };

}

/*
|--------------------------------------------------------------------------
| Build Human Handoff Response
|--------------------------------------------------------------------------
*/

export function buildHumanHandoffResponse({

    agentName = "",

    queuePosition = null

} = {}) {

    return {

        type: "human-handoff",

        success: true,

        message: agentName

            ? `You are now connected with ${agentName}.`

            : "A support specialist will assist you shortly.",

        queuePosition

    };

}

/*
|--------------------------------------------------------------------------
| Build Error Response
|--------------------------------------------------------------------------
*/

export function buildErrorResponse(

    error = "Something went wrong."

) {

    return {

        success: false,

        type: "error",

        message: error

    };

}

/*
|--------------------------------------------------------------------------
| Build Fallback Response
|--------------------------------------------------------------------------
*/

export function buildFallbackResponse() {

    return {

        success: true,

        type: "fallback",

        message:
            "I'm sorry, I couldn't fully understand your request. Could you please rephrase it?",

        quickReplies: [

            "Browse Products",

            "Track Order",

            "Contact Support"

        ]

    };

}

/*
|--------------------------------------------------------------------------
| Final Response Builder
|--------------------------------------------------------------------------
*/

export function buildResponse({

    success = true,

    message = "",

    type = "text",

    products = [],

    quickReplies = [],

    actions = [],

    metadata = {}

} = {}) {

    return {

        success,

        type,

        message,

        products,

        quickReplies,

        actions,

        metadata,

        timestamp: new Date().toISOString()

    };

}

/*
|--------------------------------------------------------------------------
| Response Service
|--------------------------------------------------------------------------
*/

export const ResponseService = {

    buildTextResponse,

    buildProductResponse,

    buildQuickReplyResponse,

    buildActionResponse,

    buildCartRecoveryResponse,

    buildHumanHandoffResponse,

    buildErrorResponse,

    buildFallbackResponse,

    buildResponse

};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default ResponseService;
