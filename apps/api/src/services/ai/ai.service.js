/*
|--------------------------------------------------------------------------
| services/ai.service.js
|--------------------------------------------------------------------------
| Layboka AI - Main AI Business Logic Service
|--------------------------------------------------------------------------
|
| PART 1
|
| Includes:
|
| 1. Imports
| 2. AI Configuration
| 3. Plan / Model Resolver
| 4. Subscription Validation
| 5. Context Loading
| 6. Product Context
| 7. Memory Context
| 8. Intent Analysis
| 9. Product Recommendations
| 10. Prompt Generation
|
|--------------------------------------------------------------------------
*/

import crypto from "crypto";

import OpenAIService from "./openai.service.js";
import PromptService from "./prompt.service.js";
import MemoryService from "./memory.service.js";
import RecommendationService from "./recommendation.service.js";
import IntentService from "./intent.service.js";
import ResponseService from "./response.service.js";

import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Product from "../../models/Product.js";
import Visitor from "../../models/Visitor.js";
import Shop from "../../models/shop.js";
import Subscription from "../../models/Subscription.js";

import logger from "../../config/logger.js";

/*
|--------------------------------------------------------------------------
| AI Configuration
|--------------------------------------------------------------------------
*/

export const AI_CONFIG = Object.freeze({

    /*
    |--------------------------------------------------------------------------
    | Supported Plans
    |--------------------------------------------------------------------------
    */

    PLANS: Object.freeze({

        STARTER: "Starter",

        GROWTH: "Growth",

        PREMIUM: "Premium",

        ENTERPRISE: "Enterprise"

    }),

    /*
    |--------------------------------------------------------------------------
    | AI Models
    |--------------------------------------------------------------------------
    |
    | Starter  -> GPT-4o-mini
    | Growth   -> GPT-4o-mini
    | Premium  -> GPT-5
    | Enterprise -> GPT-5
    |
    | Actual model resolution is handled by OpenAIService.
    |
    */

    MODELS: Object.freeze({

        STARTER: "gpt-4o-mini",

        GROWTH: "gpt-4o-mini",

        PREMIUM: "gpt-5",

        ENTERPRISE: "gpt-5"

    }),

    /*
    |--------------------------------------------------------------------------
    | Maximum AI Output Tokens Per Response
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | These are NOT monthly usage limits.
    |
    | They control maximum response size for one AI request.
    |
    */

    RESPONSE_TOKEN_LIMITS: Object.freeze({

        STARTER: 300,

        GROWTH: 600,

        PREMIUM: 1200,

        ENTERPRISE: 2000

    }),

    /*
    |--------------------------------------------------------------------------
    | Conversation Configuration
    |--------------------------------------------------------------------------
    */

    HISTORY_MESSAGES: 20,

    MAX_RECOMMENDATIONS: 6,

    DEFAULT_TEMPERATURE: 0.7,

    MAX_RETRIES: 3,

    RETRY_DELAY: 1000

});

/*
|--------------------------------------------------------------------------
| AI Service
|--------------------------------------------------------------------------
*/

class AIService {

    constructor() {

        /*
        |--------------------------------------------------------------------------
        | External Services
        |--------------------------------------------------------------------------
        */

        this.openai = OpenAIService;

        this.prompt = PromptService;

        this.memory = MemoryService;

        this.recommendation =
            RecommendationService;

        this.intent =
            IntentService;

        this.response =
            ResponseService;

    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Plan
    |--------------------------------------------------------------------------
    */

    normalizePlan(plan = "Starter") {

        const normalized =
            String(plan || "Starter")
                .trim()
                .toLowerCase();

        switch (normalized) {

            case "starter":

                return "Starter";

            case "growth":

                return "Growth";

            case "premium":

                return "Premium";

            case "enterprise":

                return "Enterprise";

            default:

                return "Starter";

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Get Model For Plan
    |--------------------------------------------------------------------------
    */

    getModel(plan = "Starter") {

        const normalizedPlan =
            this.normalizePlan(plan);

        /*
        |--------------------------------------------------------------------------
        | Prefer OpenAIService Model Resolver
        |--------------------------------------------------------------------------
        */

        if (
            this.openai &&
            typeof this.openai.getModelByPlan === "function"
        ) {

            const config =
                this.openai.getModelByPlan(
                    normalizedPlan
                );

            if (config?.model) {

                return config.model;

            }

        }

        /*
        |--------------------------------------------------------------------------
        | Safe Fallback
        |--------------------------------------------------------------------------
        */

        switch (normalizedPlan) {

            case "Starter":

                return AI_CONFIG.MODELS.STARTER;

            case "Growth":

                return AI_CONFIG.MODELS.GROWTH;

            case "Premium":

                return AI_CONFIG.MODELS.PREMIUM;

            case "Enterprise":

                return AI_CONFIG.MODELS.ENTERPRISE;

            default:

                return AI_CONFIG.MODELS.STARTER;

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Get Response Token Limit
    |--------------------------------------------------------------------------
    */

    getTokenLimit(plan = "Starter") {

        const normalizedPlan =
            this.normalizePlan(plan);

        /*
        |--------------------------------------------------------------------------
        | Prefer OpenAIService Configuration
        |--------------------------------------------------------------------------
        */

        if (
            this.openai &&
            typeof this.openai.getModelByPlan === "function"
        ) {

            const config =
                this.openai.getModelByPlan(
                    normalizedPlan
                );

            if (
                Number.isFinite(
                    Number(config?.maxTokens)
                )
            ) {

                return Number(
                    config.maxTokens
                );

            }

        }

        /*
        |--------------------------------------------------------------------------
        | Safe Fallback
        |--------------------------------------------------------------------------
        */

        switch (normalizedPlan) {

            case "Starter":

                return AI_CONFIG
                    .RESPONSE_TOKEN_LIMITS
                    .STARTER;

            case "Growth":

                return AI_CONFIG
                    .RESPONSE_TOKEN_LIMITS
                    .GROWTH;

            case "Premium":

                return AI_CONFIG
                    .RESPONSE_TOKEN_LIMITS
                    .PREMIUM;

            case "Enterprise":

                return AI_CONFIG
                    .RESPONSE_TOKEN_LIMITS
                    .ENTERPRISE;

            default:

                return AI_CONFIG
                    .RESPONSE_TOKEN_LIMITS
                    .STARTER;

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Get Plan Configuration
    |--------------------------------------------------------------------------
    */

    getPlanConfig(plan = "Starter") {

        const normalizedPlan =
            this.normalizePlan(plan);

        return {

            plan: normalizedPlan,

            model:
                this.getModel(
                    normalizedPlan
                ),

            maxTokens:
                this.getTokenLimit(
                    normalizedPlan
                )

        };

    }

    /*
    |--------------------------------------------------------------------------
    | Validate Subscription
    |--------------------------------------------------------------------------
    */

    validateSubscription(subscription) {

        if (!subscription) {

            throw new Error(
                "Subscription not found."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Active Flag
        |--------------------------------------------------------------------------
        */

        if (
            subscription.isActive === false
        ) {

            throw new Error(
                "Subscription is inactive."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Subscription Status
        |--------------------------------------------------------------------------
        */

        if (
            subscription.status &&
            [
                "cancelled",
                "canceled",
                "expired",
                "inactive",
                "past_due",
                "unpaid"
            ].includes(
                String(
                    subscription.status
                ).toLowerCase()
            )
        ) {

            throw new Error(
                "Subscription is not active."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Trial Expiration
        |--------------------------------------------------------------------------
        */

        if (
            subscription.trialEndsAt &&
            new Date(
                subscription.trialEndsAt
            ).getTime() < Date.now()
        ) {

            /*
            |--------------------------------------------------------------------------
            | If subscription is not paid/active after trial
            |--------------------------------------------------------------------------
            */

            const status =
                String(
                    subscription.status || ""
                ).toLowerCase();

            const isPaidActive =
                subscription.isActive === true &&
                [
                    "active",
                    "trialing",
                    "paid",
                    "subscription_active"
                ].includes(status);

            if (!isPaidActive) {

                throw new Error(
                    "Free trial has expired."
                );

            }

        }

        /*
        |--------------------------------------------------------------------------
        | Plan Validation
        |--------------------------------------------------------------------------
        */

        const plan =
            this.normalizePlan(
                subscription.plan
            );

        return {

            valid: true,

            plan,

            model:
                this.getModel(plan),

            maxTokens:
                this.getTokenLimit(plan)

        };

    }

    /*
    |--------------------------------------------------------------------------
    | Check Monthly Token Availability
    |--------------------------------------------------------------------------
    |
    | This is separate from max response tokens.
    |
    | monthlyTokensUsed:
    |     Tokens consumed during billing period.
    |
    | monthlyTokenLimit:
    |     Subscription's monthly usage allowance.
    |
    |--------------------------------------------------------------------------
    */

    checkTokenAvailability(

        subscription,

        estimatedTokens

    ) {

        if (!subscription) {

            return {

                allowed: false,

                remaining: 0,

                limit: 0,

                used: 0

            };

        }

        const used =
            Number(
                subscription.monthlyTokensUsed || 0
            );

        /*
        |--------------------------------------------------------------------------
        | Use subscription-specific monthly limit
        |--------------------------------------------------------------------------
        */

        const limit =
            Number(
                subscription.monthlyTokenLimit ||
                subscription.tokenLimit ||
                0
            );

        /*
        |--------------------------------------------------------------------------
        | If no monthly limit is configured,
        | do not block here.
        |
        | This allows future plan-specific
        | usage limits to be added through
        | Subscription model.
        |--------------------------------------------------------------------------
        */

        if (limit <= 0) {

            return {

                allowed: true,

                remaining: Infinity,

                limit: null,

                used

            };

        }

        const requested =
            Math.max(
                0,
                Number(
                    estimatedTokens || 0
                )
            );

        return {

            allowed:
                used + requested <= limit,

            remaining:
                Math.max(
                    0,
                    limit - used
                ),

            limit,

            used

        };

    }

    /*
    |--------------------------------------------------------------------------
    | Get Subscription From Shop
    |--------------------------------------------------------------------------
    */

    async loadSubscriptionForShop(shop) {

        if (!shop) {

            return null;

        }

        /*
        |--------------------------------------------------------------------------
        | Subscription already populated
        |--------------------------------------------------------------------------
        */

        if (
            shop.subscription &&
            typeof shop.subscription === "object" &&
            shop.subscription._id
        ) {

            return shop.subscription;

        }

        /*
        |--------------------------------------------------------------------------
        | Subscription ID
        |--------------------------------------------------------------------------
        */

        const subscriptionId =
            shop.subscription;

        if (!subscriptionId) {

            return null;

        }

        return Subscription.findById(
            subscriptionId
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Validate Shop Subscription
    |--------------------------------------------------------------------------
    */

    async validateShopSubscription(shop) {

        const subscription =
            await this.loadSubscriptionForShop(
                shop
            );

        const validation =
            this.validateSubscription(
                subscription
            );

        return {

            subscription,

            ...validation

        };

    }

}

/*
|--------------------------------------------------------------------------
| Singleton Instance
|--------------------------------------------------------------------------
*/

const aiService =
    new AIService();

export default aiService;

/*
|--------------------------------------------------------------------------
| Load Conversation
|--------------------------------------------------------------------------
*/

export async function loadConversation(

    conversationId

) {

    if (!conversationId) {

        return null;

    }

    return Conversation.findById(

        conversationId

    )
        .populate("shop")
        .populate("visitor")
        .populate("merchant")
        .populate("subscription");

}

/*
|--------------------------------------------------------------------------
| Load Visitor
|--------------------------------------------------------------------------
*/

export async function loadVisitor(

    visitorId

) {

    if (!visitorId) {

        return null;

    }

    return Visitor.findById(

        visitorId

    );

}

/*
|--------------------------------------------------------------------------
| Load Shop
|--------------------------------------------------------------------------
*/

export async function loadShop(

    shopId

) {

    if (!shopId) {

        return null;

    }

    return Shop.findById(

        shopId

    );

}

/*
|--------------------------------------------------------------------------
| Load Subscription
|--------------------------------------------------------------------------
*/

export async function loadSubscription(

    subscriptionId

) {

    if (!subscriptionId) {

        return null;

    }

    return Subscription.findById(

        subscriptionId

    );

}

/*
|--------------------------------------------------------------------------
| Load Product Catalog
|--------------------------------------------------------------------------
*/

export async function loadProducts(

    shopId,

    limit = 100

) {

    if (!shopId) {

        return [];

    }

    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 100,
                1
            ),
            500
        );

    return Product.find({

        shop: shopId,

        status: "active",

        deleted: false

    })
        .sort({

            featured: -1,

            totalSales: -1,

            createdAt: -1

        })
        .limit(safeLimit)
        .lean();

}

/*
|--------------------------------------------------------------------------
| Build Product Context
|--------------------------------------------------------------------------
*/

export function buildProductContext(

    products = []

) {

    if (
        !Array.isArray(products)
    ) {

        return [];

    }

    return products.map(

        product => ({

            id:
                product._id,

            shopifyProductId:
                product.shopifyProductId,

            title:
                product.title || "",

            handle:
                product.handle || "",

            vendor:
                product.vendor || "",

            productType:
                product.productType || "",

            category:
                product.productType || "",

            tags:
                Array.isArray(
                    product.tags
                )
                    ? product.tags
                    : [],

            description:
                product.description || "",

            shortDescription:
                product.shortDescription || "",

            price:
                product.price ?? 0,

            compareAtPrice:
                product.compareAtPrice ?? null,

            currency:
                product.currency || "USD",

            inventory:
                product.inventoryQuantity ?? null,

            inventoryQuantity:
                product.inventoryQuantity ?? null,

            featured:
                Boolean(
                    product.featured
                ),

            available:
                product.inventoryQuantity == null
                    ? true
                    : product.inventoryQuantity > 0,

            image:
                product.featuredImage ||
                product.image ||
                ""

        })

    );

}

/*
|--------------------------------------------------------------------------
| Build Memory Context
|--------------------------------------------------------------------------
*/

export async function buildMemoryContext(

    conversation,

    visitor = null

) {

    if (!conversation) {

        return {

            memory: [],

            preferences: {},

            history: []

        };

    }

    try {

        if (
            typeof MemoryService
                .buildAIMemory !==
            "function"
        ) {

            return {

                memory: [],

                preferences: {},

                history: []

            };

        }

        const result =
            await MemoryService
                .buildAIMemory(

                    conversation,

                    visitor

                );

        return {

            memory:
                Array.isArray(
                    result?.memory
                )
                    ? result.memory
                    : [],

            preferences:
                result?.preferences || {},

            history:
                Array.isArray(
                    result?.history
                )
                    ? result.history
                    : []

        };

    } catch (error) {

        logger.error(

            "AI memory context failed",

            {

                message:
                    error.message,

                conversationId:
                    conversation?._id

            }

        );

        return {

            memory: [],

            preferences: {},

            history: []

        };

    }

}

/*
|--------------------------------------------------------------------------
| Build Complete AI Context
|--------------------------------------------------------------------------
*/

export async function buildAIContext({

    conversationId = null,

    visitorId = null,

    shopId = null

} = {}) {

    const conversation =
        await loadConversation(

            conversationId

        );

    const visitor =
        visitorId
            ? await loadVisitor(
                visitorId
            )
            : conversation?.visitor || null;

    const shop =
        shopId
            ? await loadShop(
                shopId
            )
            : conversation?.shop || null;

    const subscription =
        conversation?.subscription ||
        (
            shop
                ? await aiService
                    .loadSubscriptionForShop(
                        shop
                    )
                : null
        );

    const products =
        shop?._id
            ? await loadProducts(
                shop._id
            )
            : [];

    const memory =
        await buildMemoryContext(

            conversation,

            visitor

        );

    return {

        conversation,

        visitor,

        shop,

        subscription,

        products:
            buildProductContext(
                products
            ),

        memory

    };

}

/*
|--------------------------------------------------------------------------
| Analyze Customer Intent
|--------------------------------------------------------------------------
*/

export async function analyzeCustomerIntent({

    conversation = null,

    message = "",

    customer = null

} = {}) {

    if (
        !message ||
        !String(message).trim()
    ) {

        return {

            intent: "unknown",

            confidence: 0,

            sentiment: "neutral",

            sentimentScore: 50,

            customerStage: "visitor",

            entities: {}

        };

    }

    try {

        if (
            !IntentService ||
            typeof IntentService
                .analyzeConversation !==
            "function"
        ) {

            return {

                intent: "unknown",

                confidence: 0,

                sentiment: "neutral",

                sentimentScore: 50,

                customerStage: "visitor",

                entities: {}

            };

        }

        const analysis =
            await IntentService
                .analyzeConversation(

                    conversation,

                    message,

                    customer

                );

        return {

            intent:
                analysis?.intent ||
                "unknown",

            confidence:
                Number(
                    analysis?.confidence || 0
                ),

            sentiment:
                analysis?.sentiment ||
                "neutral",

            sentimentScore:
                Number(
                    analysis?.sentimentScore ?? 50
                ),

            customerStage:
                analysis?.customerStage ||
                "visitor",

            entities:
                analysis?.entities || {},

            ...analysis

        };

    } catch (error) {

        logger.error(

            "Intent analysis failed",

            {

                message:
                    error.message,

                conversationId:
                    conversation?._id

            }

        );

        return {

            intent: "unknown",

            confidence: 0,

            sentiment: "neutral",

            sentimentScore: 50,

            customerStage: "visitor",

            entities: {}

        };

    }

}

/*
|--------------------------------------------------------------------------
| Generate Product Recommendations
|--------------------------------------------------------------------------
*/

export async function generateRecommendations({

    conversation = null,

    shop = null,

    currentProduct = null,

    cartItems = [],

    customer = null

} = {}) {

    try {

        if (!shop?._id) {

            return [];

        }

        /*
        |--------------------------------------------------------------------------
        | Product Page Recommendations
        |--------------------------------------------------------------------------
        */

        if (currentProduct) {

            if (
                typeof RecommendationService
                    .recommendSimilarProducts ===
                "function"
            ) {

                const products =
                    await RecommendationService
                        .recommendSimilarProducts(

                            currentProduct

                        );

                return Array.isArray(products)

                    ? products.slice(
                        0,
                        AI_CONFIG
                            .MAX_RECOMMENDATIONS
                    )

                    : [];

            }

        }

        /*
        |--------------------------------------------------------------------------
        | Cart Recommendations
        |--------------------------------------------------------------------------
        */

        if (
            Array.isArray(cartItems) &&
            cartItems.length > 0
        ) {

            if (
                typeof RecommendationService
                    .recommendCartProducts ===
                "function"
            ) {

                const products =
                    await RecommendationService
                        .recommendCartProducts(

                            cartItems,

                            shop._id

                        );

                return Array.isArray(products)

                    ? products.slice(
                        0,
                        AI_CONFIG
                            .MAX_RECOMMENDATIONS
                    )

                    : [];

            }

        }

        /*
        |--------------------------------------------------------------------------
        | Personalized Recommendations
        |--------------------------------------------------------------------------
        */

        if (
            typeof RecommendationService
                .recommendForCustomer ===
            "function"
        ) {

            const products =
                await RecommendationService
                    .recommendForCustomer(

                        conversation,

                        shop._id,

                        customer

                    );

            return Array.isArray(products)

                ? products.slice(
                    0,
                    AI_CONFIG
                        .MAX_RECOMMENDATIONS
                )

                : [];

        }

        return [];

    } catch (error) {

        logger.error(

            "Recommendation generation failed",

            {

                message:
                    error.message,

                shopId:
                    shop?._id,

                conversationId:
                    conversation?._id

            }

        );

        return [];

    }

}

/*
|--------------------------------------------------------------------------
| Build AI Prompt
|--------------------------------------------------------------------------
*/

export async function buildPrompt({

    plan = "Starter",

    merchant = {},

    shop = {},

    policies = {},

    brand = {},

    customer = {},

    conversation = null,

    products = [],

    collection = {},

    currentPage = {},

    cart = {}

} = {}) {

    try {

        /*
        |--------------------------------------------------------------------------
        | Build Customer Memory
        |--------------------------------------------------------------------------
        */

        const memoryContext =
            await buildMemoryContext(

                conversation,

                customer

            );

        /*
        |--------------------------------------------------------------------------
        | Build Complete Prompt
        |--------------------------------------------------------------------------
        */

        if (
            !PromptService ||
            typeof PromptService
                .buildSystemPrompt !==
            "function"
        ) {

            throw new Error(

                "PromptService.buildSystemPrompt is unavailable."

            );

        }

        const systemPrompt =
            PromptService
                .buildSystemPrompt({

                    plan,

                    merchant,

                    store:
                        shop,

                    policies,

                    brand,

                    customer,

                    products,

                    collection,

                    page:
                        currentPage,

                    cart,

                    memory:
                        memoryContext.memory,

                    history:
                        memoryContext.history

                });

        return {

            systemPrompt,

            memory:
                memoryContext.memory,

            preferences:
                memoryContext.preferences,

            history:
                memoryContext.history

        };

    } catch (error) {

        logger.error(

            "AI prompt generation failed",

            {

                message:
                    error.message

            }

        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Load Conversation History
|--------------------------------------------------------------------------
*/

export async function loadConversationHistory(

    conversationId

) {

    if (!conversationId) {

        return [];

    }

    try {

        if (
            typeof MemoryService
                .getConversationContext !==
            "function"
        ) {

            return [];

        }

        const history =
            await MemoryService
                .getConversationContext(

                    conversationId

                );

        if (
            !Array.isArray(history)
        ) {

            return [];

        }

        return history.slice(

            -AI_CONFIG.HISTORY_MESSAGES

        );

    } catch (error) {

        logger.error(

            "Conversation history loading failed",

            {

                message:
                    error.message,

                conversationId

            }

        );

        return [];

    }

}

/*
|--------------------------------------------------------------------------
| Named Service Exports
|--------------------------------------------------------------------------
*/

export {

    AIService

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export {

    aiService as AIServiceInstance

};

export {

    aiService

};

