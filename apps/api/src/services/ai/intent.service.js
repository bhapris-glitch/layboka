import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";

/*
|--------------------------------------------------------------------------
| Intent Configuration
|--------------------------------------------------------------------------
*/

export const INTENT_TYPES = Object.freeze({

    UNKNOWN: "unknown",

    GREETING: "greeting",

    PRODUCT_SEARCH: "product_search",

    PRODUCT_QUESTION: "product_question",

    PRODUCT_COMPARISON: "product_comparison",

    PRICING: "pricing",

    SHIPPING: "shipping",

    DELIVERY: "delivery",

    RETURN: "return_exchange",

    REFUND: "refund",

    PAYMENT: "payment",

    INVENTORY: "inventory",

    DISCOUNT: "discount",

    COUPON: "coupon",

    CART: "cart",

    CHECKOUT: "checkout_help",

    CART_RECOVERY: "cart_recovery",

    ORDER_TRACKING: "order_tracking",

    ACCOUNT: "account",

    SUPPORT: "support",

    COMPLAINT: "complaint",

    UPSELL: "upsell",

    CROSS_SELL: "cross_sell",

    PURCHASE: "purchase",

    THANK_YOU: "thank_you"

});

/*
|--------------------------------------------------------------------------
| Intent Keywords
|--------------------------------------------------------------------------
*/

const KEYWORDS = {

    greeting: [

        "hi",
        "hello",
        "hey",
        "good morning",
        "good evening"

    ],

    pricing: [

        "price",
        "cost",
        "pricing",
        "cheap",
        "expensive"

    ],

    shipping: [

        "shipping",
        "delivery",
        "ship",
        "courier",
        "dispatch"

    ],

    refund: [

        "refund",
        "money back",
        "return",
        "exchange"

    ],

    cart: [

        "cart",
        "checkout",
        "basket"

    ],

    order: [

        "track",
        "tracking",
        "order",
        "where is my order"

    ],

    discount: [

        "discount",
        "coupon",
        "offer",
        "promo",
        "voucher"

    ],

    product: [

        "product",
        "item",
        "buy",
        "purchase",
        "recommend"

    ]

};

/*
|--------------------------------------------------------------------------
| Normalize Text
|--------------------------------------------------------------------------
*/

export function normalizeText(text = "") {

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}

/*
|--------------------------------------------------------------------------
| Detect Intent Using Keywords
|--------------------------------------------------------------------------
*/

export function detectIntent(text = "") {

    const message = normalizeText(text);

    for (const keyword of KEYWORDS.greeting) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.GREETING;

        }

    }

    for (const keyword of KEYWORDS.pricing) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.PRICING;

        }

    }

    for (const keyword of KEYWORDS.shipping) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.SHIPPING;

        }

    }

    for (const keyword of KEYWORDS.refund) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.REFUND;

        }

    }

    for (const keyword of KEYWORDS.cart) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.CART;

        }

    }

    for (const keyword of KEYWORDS.order) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.ORDER_TRACKING;

        }

    }

    for (const keyword of KEYWORDS.discount) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.DISCOUNT;

        }

    }

    for (const keyword of KEYWORDS.product) {

        if (message.includes(keyword)) {

            return INTENT_TYPES.PRODUCT_SEARCH;

        }

    }

    return INTENT_TYPES.UNKNOWN;

}
/*
|--------------------------------------------------------------------------
| Calculate Intent Confidence
|--------------------------------------------------------------------------
*/

export function calculateConfidence(

    detectedIntent,

    message = ""

) {

    if (!message) {

        return 0;

    }

    const text = normalizeText(message);

    let confidence = 25;

    switch (detectedIntent) {

        case INTENT_TYPES.GREETING:
            confidence = 98;
            break;

        case INTENT_TYPES.PRODUCT_SEARCH:
            confidence = 90;
            break;

        case INTENT_TYPES.PRODUCT_QUESTION:
            confidence = 88;
            break;

        case INTENT_TYPES.PRICING:
            confidence = 95;
            break;

        case INTENT_TYPES.SHIPPING:
            confidence = 95;
            break;

        case INTENT_TYPES.ORDER_TRACKING:
            confidence = 98;
            break;

        case INTENT_TYPES.CART:
            confidence = 92;
            break;

        case INTENT_TYPES.CHECKOUT:
            confidence = 94;
            break;

        case INTENT_TYPES.PURCHASE:
            confidence = 97;
            break;

        default:
            confidence = 40;

    }

    if (text.length < 4) {

        confidence -= 15;

    }

    return Math.max(
        0,
        Math.min(confidence, 100)
    );

}

/*
|--------------------------------------------------------------------------
| Detect Customer Sentiment
|--------------------------------------------------------------------------
*/

export function detectSentiment(message = "") {

    const text = normalizeText(message);

    const positive = [

        "good",

        "great",

        "awesome",

        "perfect",

        "love",

        "excellent",

        "thanks",

        "thank you",

        "amazing"

    ];

    const negative = [

        "bad",

        "worst",

        "hate",

        "broken",

        "problem",

        "refund",

        "complaint",

        "cancel",

        "angry"

    ];

    for (const word of positive) {

        if (text.includes(word)) {

            return {

                sentiment: "positive",

                score: 85

            };

        }

    }

    for (const word of negative) {

        if (text.includes(word)) {

            return {

                sentiment: "negative",

                score: 85

            };

        }

    }

    return {

        sentiment: "neutral",

        score: 50

    };

}

/*
|--------------------------------------------------------------------------
| Detect Customer Purchase Stage
|--------------------------------------------------------------------------
*/

export function detectCustomerStage(

    intent

) {

    switch (intent) {

        case INTENT_TYPES.GREETING:

            return "visitor";

        case INTENT_TYPES.PRODUCT_SEARCH:

        case INTENT_TYPES.PRODUCT_QUESTION:

            return "interested";

        case INTENT_TYPES.PRICING:

        case INTENT_TYPES.SHIPPING:

        case INTENT_TYPES.DISCOUNT:

            return "considering";

        case INTENT_TYPES.CART:

        case INTENT_TYPES.CHECKOUT:

            return "ready_to_buy";

        case INTENT_TYPES.PURCHASE:

            return "purchased";

        default:

            return "visitor";

    }

}

/*
|--------------------------------------------------------------------------
| Analyze Message
|--------------------------------------------------------------------------
*/

export function analyzeIntent(

    message

) {

    const intent =

        detectIntent(message);

    const confidence =

        calculateConfidence(

            intent,

            message

        );

    const sentiment =

        detectSentiment(message);

    const customerStage =

        detectCustomerStage(intent);

    return {

        intent,

        confidence,

        sentiment:

            sentiment.sentiment,

        sentimentScore:

            sentiment.score,

        customerStage

    };

        }
/*
|--------------------------------------------------------------------------
| Extract Customer Entities
|--------------------------------------------------------------------------
|
| Extracts structured information from the customer's message.
| (Rule-based version. AI extraction will be added later.)
|--------------------------------------------------------------------------
*/

export function extractEntities(message = "") {

    const text = normalizeText(message);

    const entities = {

        brand: null,

        category: null,

        color: null,

        size: null,

        budget: null

    };

    /*
    |--------------------------------------------------------------------------
    | Budget
    |--------------------------------------------------------------------------
    */

    const budgetMatch = text.match(/\$?(\d+)/);

    if (budgetMatch) {

        entities.budget = Number(budgetMatch[1]);

    }

    /*
    |--------------------------------------------------------------------------
    | Colors
    |--------------------------------------------------------------------------
    */

    const colors = [

        "black",
        "white",
        "blue",
        "red",
        "green",
        "yellow",
        "pink",
        "grey",
        "gray",
        "brown",
        "orange",
        "purple"

    ];

    for (const color of colors) {

        if (text.includes(color)) {

            entities.color = color;

            break;

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Sizes
    |--------------------------------------------------------------------------
    */

    const sizes = [

        "xs",
        "s",
        "m",
        "l",
        "xl",
        "xxl"

    ];

    for (const size of sizes) {

        if (text.includes(` ${size} `)) {

            entities.size = size.toUpperCase();

            break;

        }

    }

    return entities;

}

/*
|--------------------------------------------------------------------------
| Update Conversation Intent
|--------------------------------------------------------------------------
*/

export async function updateConversationIntent(

    conversation,

    analysis

) {

    if (!conversation || !analysis) {

        return conversation;

    }

    conversation.detectedIntent =

        analysis.intent;

    conversation.confidenceScore =

        analysis.confidence;

    conversation.sentiment =

        analysis.sentiment;

    conversation.sentimentScore =

        analysis.sentimentScore;

    conversation.customerStage =

        analysis.customerStage;

    conversation.lastMessageAt =

        new Date();

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Analyze & Update Conversation
|--------------------------------------------------------------------------
*/

export async function analyzeConversation(

    conversation,

    message

) {

    const analysis =

        analyzeIntent(message);

    analysis.entities =

        extractEntities(message);

    await updateConversationIntent(

        conversation,

        analysis

    );

    return analysis;

}

/*
|--------------------------------------------------------------------------
| Intent Service
|--------------------------------------------------------------------------
*/

export const IntentService = {

    normalizeText,

    detectIntent,

    calculateConfidence,

    detectSentiment,

    detectCustomerStage,

    analyzeIntent,

    extractEntities,

    updateConversationIntent,

    analyzeConversation

};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default IntentService;
