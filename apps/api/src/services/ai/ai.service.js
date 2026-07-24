/*
|--------------------------------------------------------------------------
| services/ai.service.js
|--------------------------------------------------------------------------
| Layboka AI - Main AI Orchestration Service
|--------------------------------------------------------------------------
|
| Part 1
|
| Includes:
|
| - Imports
| - AI Configuration
| - Plan / Model Resolver
| - Token Limit Resolver
| - Subscription Validation
| - Conversation Loading
| - Visitor Loading
| - Shop Loading
| - Product Loading
| - Product Context
| - Memory Context
| - Complete AI Context
| - Customer Intent Analysis
| - Product Recommendations
| - Prompt Generation
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
import Shop from "../../models/shop.js";
import Subscription from "../../models/Subscription.js";
import Visitor from "../../models/Visitor.js";

import logger from "../../config/logger.js";


/*
|--------------------------------------------------------------------------
| AI Configuration
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| maxTokens below means MAXIMUM OUTPUT TOKENS PER AI RESPONSE.
|
| It does NOT represent:
|
| - Monthly subscription quota
| - Monthly API usage
| - Monthly billing limit
|
| Monthly usage should be handled separately by the Subscription model
| and billing / usage system.
|
|--------------------------------------------------------------------------
*/

export const AI_CONFIG = Object.freeze({

    MODELS: Object.freeze({

        STARTER: "gpt-4o-mini",

        GROWTH: "gpt-4o-mini",

        PREMIUM: "gpt-5",

        ENTERPRISE: "gpt-5"

    }),

    MAX_OUTPUT_TOKENS: Object.freeze({

        STARTER: 300,

        GROWTH: 600,

        PREMIUM: 1200,

        ENTERPRISE: 2000

    }),

    HISTORY_MESSAGES: 20,

    MAX_RECOMMENDATIONS: 6,

    TEMPERATURE: 0.7,

    MAX_RETRIES: 3

});


/*
|--------------------------------------------------------------------------
| Plan Normalizer
|--------------------------------------------------------------------------
*/

export function normalizePlan(plan = "Starter") {

    const normalizedPlan = String(plan)
        .trim()
        .toLowerCase();

    switch (normalizedPlan) {

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
|
| The actual model definitions are maintained by OpenAIService.
|
| This function only provides a stable AIService-level resolver.
|
|--------------------------------------------------------------------------
*/

export function getModelForPlan(plan = "Starter") {

    const normalizedPlan =
        normalizePlan(plan);

    const modelConfig =
        OpenAIService.getModelByPlan(
            normalizedPlan
        );

    return modelConfig.model;

}


/*
|--------------------------------------------------------------------------
| Get Maximum Output Tokens For Plan
|--------------------------------------------------------------------------
*/

export function getMaxTokensForPlan(
    plan = "Starter"
) {

    const normalizedPlan =
        normalizePlan(plan);

    const modelConfig =
        OpenAIService.getModelByPlan(
            normalizedPlan
        );

    return modelConfig.maxTokens;

}


/*
|--------------------------------------------------------------------------
| Get AI Plan Configuration
|--------------------------------------------------------------------------
*/

export function getPlanConfiguration(
    plan = "Starter"
) {

    const normalizedPlan =
        normalizePlan(plan);

    const modelConfig =
        OpenAIService.getModelByPlan(
            normalizedPlan
        );

    return {

        plan: normalizedPlan,

        model:
            modelConfig.model,

        maxTokens:
            modelConfig.maxTokens

    };

}


/*
|--------------------------------------------------------------------------
| Validate Subscription
|--------------------------------------------------------------------------
|
| Validates whether the subscription is allowed to use AI.
|
| This function does not perform monthly token accounting.
| Usage accounting is handled separately.
|
|--------------------------------------------------------------------------
*/

export function validateSubscription(
    subscription
) {

    if (!subscription) {

        throw new Error(
            "Subscription not found."
        );

    }

    if (
        subscription.isActive === false
    ) {

        throw new Error(
            "Subscription is inactive."
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Optional Status Validation
    |--------------------------------------------------------------------------
    */

    if (
        subscription.status &&
        [
            "active",
            "trialing"
        ].includes(
            String(
                subscription.status
            ).toLowerCase()
        ) === false
    ) {

        throw new Error(
            "Subscription is not active."
        );

    }

    return true;

}


/*
|--------------------------------------------------------------------------
| Check Subscription Token Availability
|--------------------------------------------------------------------------
|
| This function is intentionally defensive because the exact Subscription
| schema has not been provided yet.
|
| It supports common fields if they exist.
|
| It does NOT assume that monthlyTokensUsed is the same as max output tokens.
|
|--------------------------------------------------------------------------
*/

export function checkTokenAvailability({

    subscription,

    estimatedTokens = 0,

    monthlyTokenLimit = null

} = {}) {

    validateSubscription(
        subscription
    );

    const usedTokens = Number(

        subscription.monthlyTokensUsed ||

        subscription.usage?.monthlyTokensUsed ||

        subscription.usage?.tokensUsed ||

        0

    );

    const configuredLimit =

        monthlyTokenLimit !== null

            ? Number(
                monthlyTokenLimit
            )

            : Number(

                subscription.monthlyTokenLimit ||

                subscription.usage?.monthlyTokenLimit ||

                subscription.tokenLimit ||

                0

            );

    /*
    |--------------------------------------------------------------------------
    | If no monthly limit is configured,
    | do not incorrectly block the request.
    |--------------------------------------------------------------------------
    */

    if (
        configuredLimit <= 0
    ) {

        return {

            allowed: true,

            used: usedTokens,

            estimated: Number(
                estimatedTokens
            ),

            remaining: null,

            limit: null

        };

    }

    const requestedTokens =
        Math.max(
            0,
            Number(
                estimatedTokens
            )
        );

    const remaining = Math.max(

        0,

        configuredLimit -
        usedTokens

    );

    return {

        allowed:

            usedTokens +
            requestedTokens <=
            configuredLimit,

        used:
            usedTokens,

        estimated:
            requestedTokens,

        remaining,

        limit:
            configuredLimit

    };

}


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

    const conversation =

        await Conversation.findById(
            conversationId
        )
            .populate("shop")
            .populate("visitor")
            .populate("subscription")
            .lean();

    return conversation || null;

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

    const visitor =

        await Visitor.findById(
            visitorId
        ).lean();

    return visitor || null;

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

    const shop =

        await Shop.findById(
            shopId
        ).lean();

    return shop || null;

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

    const subscription =

        await Subscription.findById(
            subscriptionId
        ).lean();

    return subscription || null;

}


/*
|--------------------------------------------------------------------------
| Load Product Catalog
|--------------------------------------------------------------------------
*/

export async function loadProducts({

    shopId,

    limit = 100

} = {}) {

    if (!shopId) {

        return [];

    }

    const safeLimit = Math.min(

        Math.max(
            Number(limit) || 100,
            1
        ),

        500

    );

    const products =

        await Product.find({

            shop: shopId,

            status: "active",

            deleted: false

        })
            .sort({

                featured: -1,

                totalSales: -1,

                createdAt: -1

            })
            .limit(
                safeLimit
            )
            .lean();

    return products || [];

}


/*
|--------------------------------------------------------------------------
| Build Product Context
|--------------------------------------------------------------------------
|
| Converts database product documents into the smaller product structure
| used by PromptService.
|
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

            /*
            | PromptService expects productType.
            | Keep this field name consistent with PromptService.
            */

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

            featuredImage:
                product.featuredImage ||
                product.image ||
                "",

            image:
                product.image ||
                product.featuredImage ||
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
    conversation
) {

    if (!conversation) {

        return {

            memory: [],

            preferences: {},

            history: []

        };

    }

    try {

        const memory =

            await MemoryService.buildAIMemory(
                conversation
            );

        return {

            memory:
                Array.isArray(
                    memory?.memory
                )
                    ? memory.memory
                    : [],

            preferences:
                memory?.preferences || {},

            history:
                Array.isArray(
                    memory?.history
                )
                    ? memory.history
                    : []

        };

    } catch (error) {

        logger.error(
            "AI memory context failed",
            {
                error:
                    error.message,

                conversationId:
                    conversation._id
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
|
| Loads all information required to construct an AI request.
|
|--------------------------------------------------------------------------
*/

export async function buildAIContext({

    conversationId,

    visitorId,

    shopId,

    productLimit = 100

} = {}) {

    const [

        conversation,

        visitor,

        shop,

        products

    ] = await Promise.all([

        loadConversation(
            conversationId
        ),

        loadVisitor(
            visitorId
        ),

        loadShop(
            shopId
        ),

        loadProducts({

            shopId,

            limit:
                productLimit

        })

    ]);

    /*
    |--------------------------------------------------------------------------
    | Prefer populated conversation objects
    | when available.
    |--------------------------------------------------------------------------
    */

    const resolvedVisitor =

        visitor ||
        conversation?.visitor ||
        null;

    const resolvedShop =

        shop ||
        conversation?.shop ||
        null;

    const resolvedSubscription =

        conversation?.subscription ||
        null;

    const memory =

        await buildMemoryContext(
            conversation
        );

    return {

        conversation,

        visitor:
            resolvedVisitor,

        shop:
            resolvedShop,

        subscription:
            resolvedSubscription,

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

    conversation,

    message

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

        /*
        |--------------------------------------------------------------------------
        | IntentService is the single owner of intent analysis.
        |--------------------------------------------------------------------------
        */

        const analysis =

            await IntentService
                .analyzeConversation(

                    conversation,

                    String(message).trim()

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
                    analysis?.sentimentScore ??
                    50
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

            "Customer intent analysis failed",

            {

                error:
                    error.message,

                conversationId:
                    conversation?._id

            }

        );

        /*
        |--------------------------------------------------------------------------
        | AI chat should continue even if optional intent analysis fails.
        |--------------------------------------------------------------------------
        */

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

    conversation,

    shop,

    currentProduct = null,

    cartItems = [],

    limit = AI_CONFIG.MAX_RECOMMENDATIONS

} = {}) {

    if (!shop?._id) {

        return [];

    }

    const safeLimit = Math.min(

        Math.max(
            Number(limit) ||
            AI_CONFIG.MAX_RECOMMENDATIONS,
            1
        ),

        AI_CONFIG.MAX_RECOMMENDATIONS

    );

    try {

        /*
        |--------------------------------------------------------------------------
        | Product Page Recommendations
        |--------------------------------------------------------------------------
        */

        if (currentProduct) {

            const recommendations =

                await RecommendationService
                    .recommendSimilarProducts(

                        currentProduct

                    );

            return Array.isArray(
                recommendations
            )

                ? recommendations
                    .slice(
                        0,
                        safeLimit
                    )

                : [];

        }


        /*
        |--------------------------------------------------------------------------
        | Cart Recommendations
        |--------------------------------------------------------------------------
        */

        if (
            Array.isArray(
                cartItems
            ) &&
            cartItems.length > 0
        ) {

            const recommendations =

                await RecommendationService
                    .recommendCartProducts(

                        cartItems,

                        shop._id

                    );

            return Array.isArray(
                recommendations
            )

                ? recommendations
                    .slice(
                        0,
                        safeLimit
                    )

                : [];

        }


        /*
        |--------------------------------------------------------------------------
        | Personalized Recommendations
        |--------------------------------------------------------------------------
        */

        if (!conversation) {

            return [];

        }

        const recommendations =

            await RecommendationService
                .recommendForCustomer(

                    conversation,

                    shop._id

                );

        return Array.isArray(
            recommendations
        )

            ? recommendations
                .slice(
                    0,
                    safeLimit
                )

            : [];

    } catch (error) {

        logger.error(

            "Product recommendation generation failed",

            {

                error:
                    error.message,

                shopId:
                    shop?._id,

                conversationId:
                    conversation?._id

            }

        );

        /*
        |--------------------------------------------------------------------------
        | Recommendation failure must not break AI chat.
        |--------------------------------------------------------------------------
        */

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

    products = [],

    collection = {},

    currentPage = {},

    cart = {},

    conversation = null

} = {}) {

    try {

        /*
        |--------------------------------------------------------------------------
        | Build memory from the actual conversation.
        |--------------------------------------------------------------------------
        */

        const memoryContext =

            await buildMemoryContext(
                conversation
            );


        /*
        |--------------------------------------------------------------------------
        | Respect the configured conversation history limit.
        |--------------------------------------------------------------------------
        */

        const history =

            Array.isArray(
                memoryContext.history
            )

                ? memoryContext.history.slice(

                    -AI_CONFIG.HISTORY_MESSAGES

                )

                : [];


        /*
        |--------------------------------------------------------------------------
        | Normalize products before passing to PromptService.
        |--------------------------------------------------------------------------
        */

        const productContext =

            buildProductContext(
                products
            );


        /*
        |--------------------------------------------------------------------------
        | PromptService owns the actual system-prompt construction.
        |--------------------------------------------------------------------------
        */

        return PromptService
            .buildSystemPrompt({

                plan,

                merchant,

                store:
                    shop,

                policies,

                brand,

                customer,

                products:
                    productContext,

                collection,

                page:
                    currentPage,

                cart,

                memory:
                    memoryContext.memory,

                history

            });

    } catch (error) {

        logger.error(

            "AI prompt generation failed",

            {

                error:
                    error.message

            }

        );

        throw error;

    }

}


/*
|--------------------------------------------------------------------------
| Part 1 Exports
|--------------------------------------------------------------------------
|
| The final AIService object will be assembled in Part 4.
| Do not create the default export here because the remaining parts
| still need to attach the orchestration functions.
|
|--------------------------------------------------------------------------
*/

export default {

    normalizePlan,

    getModelForPlan,

    getMaxTokensForPlan,

    getPlanConfiguration,

    validateSubscription,

    checkTokenAvailability,

    loadConversation,

    loadVisitor,

    loadShop,

    loadSubscription,

    loadProducts,

    buildProductContext,

    buildMemoryContext,

    buildAIContext,

    analyzeCustomerIntent,

    generateRecommendations,

    buildPrompt

};
/*
|--------------------------------------------------------------------------
| ai.service.js
|--------------------------------------------------------------------------
| Part 2
|--------------------------------------------------------------------------
|
| Includes:
|
| - Conversation History
| - OpenAI Chat Request
| - Retry Logic
| - Response Parsing
| - AI Request Wrapper
| - AI Error Handling
| - Save Assistant Message
| - Update Conversation
| - Update Conversation Analytics
| - Update Customer Memory
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Load Conversation History
|--------------------------------------------------------------------------
*/

export async function loadConversationHistory(

    conversationId,

    limit = AI_CONFIG.HISTORY_MESSAGES

) {

    if (!conversationId) {

        return [];

    }

    try {

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

        /*
        |--------------------------------------------------------------------------
        | Return only the latest configured number of messages.
        |--------------------------------------------------------------------------
        */

        return history.slice(

            -Math.max(

                1,

                Number(limit) ||
                AI_CONFIG.HISTORY_MESSAGES

            )

        );

    } catch (error) {

        logger.error(

            "Conversation history loading failed",

            {

                error:
                    error.message,

                conversationId

            }

        );

        return [];

    }

}


/*
|--------------------------------------------------------------------------
| Generate OpenAI Response
|--------------------------------------------------------------------------
|
| This is the only AI request entry point used by ai.service.js.
|
| The actual OpenAI SDK call is handled by OpenAIService.
|
|--------------------------------------------------------------------------
*/

export async function generateAIResponse({

    plan = "Starter",

    input,

    systemPrompt = "",

    temperature = AI_CONFIG.TEMPERATURE,

    maxTokens = null,

    tools = [],

    metadata = {}

} = {}) {

    if (
        !input
    ) {

        throw new Error(

            "AI input is required."

        );

    }

    const normalizedPlan =

        normalizePlan(

            plan

        );

    const configuredMaxTokens =

        maxTokens ||

        getMaxTokensForPlan(

            normalizedPlan

        );

    /*
    |--------------------------------------------------------------------------
    | Prevent callers from exceeding the plan's configured output limit.
    |--------------------------------------------------------------------------
    */

    const safeMaxTokens = Math.min(

        Number(
            configuredMaxTokens
        ),

        getMaxTokensForPlan(

            normalizedPlan

        )

    );

    try {

        const result =

            await OpenAIService
                .safeGenerateResponse({

                    plan:
                        normalizedPlan,

                    input,

                    systemPrompt,

                    temperature,

                    maxTokens:
                        safeMaxTokens,

                    tools,

                    metadata

                });

        return result;

    } catch (error) {

        throw handleAIError(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Generate Streaming AI Response
|--------------------------------------------------------------------------
|
| Returns the OpenAI Responses API stream.
|
| The caller is responsible for consuming and sending stream events
| to the client.
|
|--------------------------------------------------------------------------
*/

export async function generateStreamingAIResponse({

    plan = "Starter",

    input,

    systemPrompt = "",

    temperature = AI_CONFIG.TEMPERATURE,

    maxTokens = null,

    tools = [],

    metadata = {}

} = {}) {

    if (
        !input
    ) {

        throw new Error(

            "AI input is required."

        );

    }

    const normalizedPlan =

        normalizePlan(

            plan

        );

    const configuredMaxTokens =

        maxTokens ||

        getMaxTokensForPlan(

            normalizedPlan

        );

    const safeMaxTokens =

        Math.min(

            Number(
                configuredMaxTokens
            ),

            getMaxTokensForPlan(

                normalizedPlan

            )

        );

    try {

        return await OpenAIService
            .streamResponse({

                plan:
                    normalizedPlan,

                input,

                systemPrompt,

                temperature,

                maxTokens:
                    safeMaxTokens,

                tools,

                metadata

            });

    } catch (error) {

        throw handleAIError(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Retry Logic
|--------------------------------------------------------------------------
|
| Uses OpenAIService.retryRequest().
|
| This avoids duplicating retry logic in multiple places.
|
|--------------------------------------------------------------------------
*/

export async function executeWithRetry(

    operation,

    retries = AI_CONFIG.MAX_RETRIES

) {

    if (
        typeof operation !==
        "function"
    ) {

        throw new TypeError(

            "AI operation must be a function."

        );

    }

    return OpenAIService
        .retryRequest(

            operation,

            retries

        );

}


/*
|--------------------------------------------------------------------------
| Parse OpenAI Response
|--------------------------------------------------------------------------
|
| Converts the OpenAIService response into a stable internal structure.
|
|--------------------------------------------------------------------------
*/

export function parseAIResponse(

    result = {}

) {

    const response =

        result.response ||

        result;

    const outputText =

        result.outputText ||

        response?.output_text ||

        "";

    const usage =

        result.usage ||

        OpenAIService
            .extractUsage(

                response

            );

    return {

        success:
            result.success !== false,

        id:
            response?.id ||
            null,

        model:
            result.model ||
            response?.model ||
            null,

        provider:
            "openai",

        content:
            outputText,

        finishReason:
            response?.status ||
            "completed",

        usage: {

            inputTokens:
                usage?.inputTokens ||
                0,

            outputTokens:
                usage?.outputTokens ||
                0,

            totalTokens:
                usage?.totalTokens ||
                0

        },

        cost:
            result.cost ||

            OpenAIService
                .calculateEstimatedCost(

                    result.model ||
                    response?.model,

                    usage

                ),

        raw:
            response

    };

}


/*
|--------------------------------------------------------------------------
| AI Request
|--------------------------------------------------------------------------
|
| High-level AI request wrapper.
|
|--------------------------------------------------------------------------
*/

export async function requestAI({

    plan = "Starter",

    input,

    systemPrompt = "",

    temperature = AI_CONFIG.TEMPERATURE,

    maxTokens = null,

    tools = [],

    metadata = {}

} = {}) {

    const result =

        await generateAIResponse({

            plan,

            input,

            systemPrompt,

            temperature,

            maxTokens,

            tools,

            metadata

        });

    return parseAIResponse(

        result

    );

}


/*
|--------------------------------------------------------------------------
| AI Error Handler
|--------------------------------------------------------------------------
|
| Converts provider errors into safe application-level errors.
|
| Original provider details are logged but are not exposed to customers.
|
|--------------------------------------------------------------------------
*/

export function handleAIError(

    error

) {

    if (!error) {

        return new Error(

            "AI request failed."

        );

    }

    logger.error(

        "AI request failed",

        {

            message:
                error.message,

            code:
                error.code,

            status:
                error.status,

            type:
                error.type,

            requestId:
                error.requestID ||

                error.request_id ||

                null

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Rate Limit
    |--------------------------------------------------------------------------
    */

    if (

        error.status === 429 ||

        error.code ===
            "rate_limit_exceeded"

    ) {

        return new Error(

            "AI service is temporarily busy. Please try again shortly."

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Authentication / API Key
    |--------------------------------------------------------------------------
    */

    if (

        error.status === 401 ||

        error.status === 403

    ) {

        return new Error(

            "AI service configuration error."

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Server / Provider Failure
    |--------------------------------------------------------------------------
    */

    if (

        error.status >= 500

    ) {

        return new Error(

            "AI service is temporarily unavailable."

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Timeout
    |--------------------------------------------------------------------------
    */

    if (

        error.code ===
            "ETIMEDOUT" ||

        error.code ===
            "ECONNRESET" ||

        error.code ===
            "TIMEOUT"

    ) {

        return new Error(

            "AI request timed out. Please try again."

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Generic Error
    |--------------------------------------------------------------------------
    */

    return new Error(

        error.message ||

        "AI request failed."

    );

}


/*
|--------------------------------------------------------------------------
| Save Assistant Message
|--------------------------------------------------------------------------
*/

export async function saveAssistantMessage({

    conversation,

    shop,

    visitor,

    content,

    ai = {},

    recommendations = [],

    actions = [],

    quickReplies = []

} = {}) {

    if (
        !conversation?._id
    ) {

        throw new Error(

            "Conversation is required to save assistant message."

        );

    }

    if (
        !shop?._id
    ) {

        throw new Error(

            "Shop is required to save assistant message."

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Visitor may be optional for guest sessions depending on schema.
    |--------------------------------------------------------------------------
    */

    const messageData = {

        conversation:
            conversation._id,

        shop:
            shop._id,

        role:
            "assistant",

        messageType:
            "text",

        messageId:
            crypto.randomUUID(),

        sequence:
            Number(
                conversation.totalMessages || 0
            ) + 1,

        content:
            String(
                content || ""
            ),

        sender: {

            senderType:
                "AI",

            name:
                "Layboka AI",

            source:
                "ai"

        },

        ai,

        productCards:
            Array.isArray(
                recommendations
            )
                ? recommendations
                : [],

        actions:
            Array.isArray(
                actions
            )
                ? actions
                : [],

        quickReplies:
            Array.isArray(
                quickReplies
            )
                ? quickReplies
                : [],

        delivery: {

            status:
                "sent",

            deliveredAt:
                new Date()

        }

    };

    /*
    |--------------------------------------------------------------------------
    | Only attach visitor when available.
    |--------------------------------------------------------------------------
    */

    if (
        visitor?._id
    ) {

        messageData.visitor =
            visitor._id;

    }

    const message =

        await Message.create(

            messageData

        );

    return message;

}


/*
|--------------------------------------------------------------------------
| Update Conversation After AI Response
|--------------------------------------------------------------------------
*/

export async function updateConversationAfterResponse({

    conversation,

    aiUsage = {}

} = {}) {

    if (
        !conversation
    ) {

        throw new Error(

            "Conversation is required."

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Normalize numeric usage values.
    |--------------------------------------------------------------------------
    */

    const promptTokens =

        Number(

            aiUsage.promptTokens ||

            aiUsage.inputTokens ||

            0

        );

    const completionTokens =

        Number(

            aiUsage.completionTokens ||

            aiUsage.outputTokens ||

            0

        );

    const totalTokens =

        Number(

            aiUsage.totalTokens ||

            promptTokens +
            completionTokens

        );

    const responseTime =

        Number(

            aiUsage.responseTime ||

            0

        );

    const estimatedCost =

        Number(

            aiUsage.estimatedCost ||

            aiUsage.totalCost ||

            0

        );


    /*
    |--------------------------------------------------------------------------
    | Conversation Counters
    |--------------------------------------------------------------------------
    */

    conversation.totalMessages =

        Number(

            conversation.totalMessages ||

            0

        ) + 1;

    conversation.aiMessages =

        Number(

            conversation.aiMessages ||

            0

        ) + 1;


    /*
    |--------------------------------------------------------------------------
    | Activity
    |--------------------------------------------------------------------------
    */

    conversation.lastMessageAt =

        new Date();

    conversation.status =

        "active";


    /*
    |--------------------------------------------------------------------------
    | Token Usage
    |--------------------------------------------------------------------------
    */

    conversation.promptTokens =

        Number(

            conversation.promptTokens ||

            0

        ) + promptTokens;

    conversation.completionTokens =

        Number(

            conversation.completionTokens ||

            0

        ) + completionTokens;

    conversation.totalTokens =

        Number(

            conversation.totalTokens ||

            0

        ) + totalTokens;


    /*
    |--------------------------------------------------------------------------
    | Cost
    |--------------------------------------------------------------------------
    */

    conversation.estimatedCost =

        Number(

            conversation.estimatedCost ||

            0

        ) + estimatedCost;


    /*
    |--------------------------------------------------------------------------
    | API Calls
    |--------------------------------------------------------------------------
    */

    conversation.apiCalls =

        Number(

            conversation.apiCalls ||

            0

        ) + 1;


    /*
    |--------------------------------------------------------------------------
    | Response Time
    |--------------------------------------------------------------------------
    */

    conversation.averageResponseTime =

        responseTime;


    await conversation.save();


    return conversation;

}


/*
|--------------------------------------------------------------------------
| Update Conversation Analytics
|--------------------------------------------------------------------------
*/

export async function updateConversationAnalytics({

    conversation,

    recommendations = []

} = {}) {

    if (
        !conversation
    ) {

        return null;

    }

    /*
    |--------------------------------------------------------------------------
    | Ensure analytics object exists.
    |--------------------------------------------------------------------------
    */

    if (
        !conversation.analytics
    ) {

        conversation.analytics = {};

    }

    /*
    |--------------------------------------------------------------------------
    | Recommended Products
    |--------------------------------------------------------------------------
    */

    conversation.analytics
        .productsRecommended =

        Number(

            conversation.analytics
                .productsRecommended ||

            0

        ) +

        (
            Array.isArray(
                recommendations
            )

                ? recommendations.length

                : 0
        );


    /*
    |--------------------------------------------------------------------------
    | Engagement Score
    |--------------------------------------------------------------------------
    */

    conversation.analytics
        .engagementScore =

        Number(

            conversation.analytics
                .engagementScore ||

            0

        ) + 1;


    await conversation.save();


    return conversation;

}


/*
|--------------------------------------------------------------------------
| Update Customer Memory
|--------------------------------------------------------------------------
|
| Stores both visitor and assistant messages in the memory system.
|
|--------------------------------------------------------------------------
*/

export async function updateCustomerMemory({

    conversation,

    visitor,

    userMessage,

    assistantMessage

} = {}) {

    if (
        !conversation
    ) {

        return {

            memory: [],

            preferences: {},

            history: []

        };

    }

    try {

        /*
        |--------------------------------------------------------------------------
        | Learn visitor message.
        |--------------------------------------------------------------------------
        */

        if (
            userMessage &&
            String(
                userMessage
            ).trim()
        ) {

            await MemoryService
                .learnFromConversation(

                    conversation,

                    {

                        role:
                            "visitor",

                        content:
                            String(
                                userMessage
                            ).trim()

                    }

                );

        }


        /*
        |--------------------------------------------------------------------------
        | Learn assistant message.
        |--------------------------------------------------------------------------
        */

        if (
            assistantMessage &&
            String(
                assistantMessage
            ).trim()
        ) {

            await MemoryService
                .learnFromConversation(

                    conversation,

                    {

                        role:
                            "assistant",

                        content:
                            String(
                                assistantMessage
                            ).trim()

                    }

                );

        }


        /*
        |--------------------------------------------------------------------------
        | Rebuild AI memory after learning.
        |--------------------------------------------------------------------------
        */

        const updatedMemory =

            await MemoryService
                .buildAIMemory(

                    conversation,

                    visitor

                );

        return {

            memory:
                updatedMemory?.memory ||
                [],

            preferences:
                updatedMemory?.preferences ||
                {},

            history:
                updatedMemory?.history ||
                []

        };

    } catch (error) {

        logger.error(

            "Customer memory update failed",

            {

                error:
                    error.message,

                conversationId:
                    conversation?._id

            }

        );

        /*
        |--------------------------------------------------------------------------
        | Memory is an enhancement.
        | Do not fail the completed AI response because memory failed.
        |--------------------------------------------------------------------------
        */

        return {

            memory: [],

            preferences: {},

            history: []

        };

    }

}
