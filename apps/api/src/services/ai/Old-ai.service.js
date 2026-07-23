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

/*
|--------------------------------------------------------------------------
| AI Configuration
|--------------------------------------------------------------------------
*/

export const AI_CONFIG = Object.freeze({

    MODELS: {

        STARTER: "gpt-4o-mini",

        GROWTH: "gpt-4o-mini",

        PREMIUM: "gpt-5",

        ENTERPRISE: "gpt-5"

    },

    TOKEN_LIMITS: {

        STARTER: 300,

        GROWTH: 600,

        PREMIUM: 1200,

        ENTERPRISE: 2500

    },

    HISTORY_MESSAGES: 20,

    MAX_RECOMMENDATIONS: 6,

    TEMPERATURE: 0.7,

    MAX_RETRIES: 2

});

/*
|--------------------------------------------------------------------------
| AI Service
|--------------------------------------------------------------------------
*/

class AIService {

    constructor() {

        this.openai = OpenAIService;

        this.prompt = PromptService;

        this.memory = MemoryService;

        this.recommendation = RecommendationService;

        this.intent = IntentService;

        this.response = ResponseService;

    }

    /*
    |--------------------------------------------------------------------------
    | Select AI Model
    |--------------------------------------------------------------------------
    */

    getModel(plan = "Starter") {

        switch (String(plan).toLowerCase()) {

            case "starter":
                return AI_CONFIG.MODELS.STARTER;

            case "growth":
                return AI_CONFIG.MODELS.GROWTH;

            case "premium":
                return AI_CONFIG.MODELS.PREMIUM;

            case "enterprise":
                return AI_CONFIG.MODELS.ENTERPRISE;

            default:
                return AI_CONFIG.MODELS.STARTER;

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Get Token Limit
    |--------------------------------------------------------------------------
    */

    getTokenLimit(plan = "Starter") {

        switch (String(plan).toLowerCase()) {

            case "starter":
                return AI_CONFIG.TOKEN_LIMITS.STARTER;

            case "growth":
                return AI_CONFIG.TOKEN_LIMITS.GROWTH;

            case "premium":
                return AI_CONFIG.TOKEN_LIMITS.PREMIUM;

            case "enterprise":
                return AI_CONFIG.TOKEN_LIMITS.ENTERPRISE;

            default:
                return AI_CONFIG.TOKEN_LIMITS.STARTER;

        }

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

        if (!subscription.isActive) {

            throw new Error(
                "Subscription is inactive."
            );

        }

        return true;

    }

    /*
    |--------------------------------------------------------------------------
    | Check Token Availability
    |--------------------------------------------------------------------------
    */

    checkTokenAvailability(

        subscription,

        estimatedTokens

    ) {

        const limit = this.getTokenLimit(

            subscription.plan

        );

        const used =

            subscription.monthlyTokensUsed || 0;

        return {

            allowed:

                used + estimatedTokens <= limit,

            remaining:

                Math.max(0, limit - used),

            limit

        };

    }

}

export default new AIService();
/*
|--------------------------------------------------------------------------
| Load Conversation
|--------------------------------------------------------------------------
*/

export async function loadConversation(conversationId) {

    if (!conversationId) {
        return null;
    }

    return Conversation.findById(conversationId)
        .populate("shop")
        .populate("visitor")
        .populate("subscription")
        .lean();

}

/*
|--------------------------------------------------------------------------
| Load Visitor
|--------------------------------------------------------------------------
*/

export async function loadVisitor(visitorId) {

    if (!visitorId) {
        return null;
    }

    return Visitor.findById(visitorId).lean();

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
        .limit(limit)
        .lean();

}

/*
|--------------------------------------------------------------------------
| Build Product Context
|--------------------------------------------------------------------------
*/

export function buildProductContext(products = []) {

    return products.map(product => ({

        id: product._id,

        shopifyProductId: product.shopifyProductId,

        title: product.title,

        handle: product.handle,

        vendor: product.vendor,

        category: product.productType,

        description: product.description,

        price: product.price,

        compareAtPrice: product.compareAtPrice,

        currency: product.currency,

        inventory: product.inventoryQuantity,

        featured: product.featured

    }));

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

    return MemoryService.buildAIMemory(
        conversation
    );

}

/*
|--------------------------------------------------------------------------
| Build Complete AI Context
|--------------------------------------------------------------------------
*/

export async function buildAIContext({

    conversationId,

    visitorId,

    shopId

}) {

    const conversation =
        await loadConversation(
            conversationId
        );

    const visitor =
        await loadVisitor(
            visitorId
        );

    const products =
        await loadProducts(
            shopId
        );

    const memory =
        await buildMemoryContext(
            conversation
        );

    return {

        conversation,

        visitor,

        products:
            buildProductContext(products),

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

}) {

    try {

        const analysis = await IntentService.analyzeConversation(

            conversation,

            message

        );

        return analysis;

    } catch (error) {

        logger.error(

            "Intent analysis failed",

            error

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

    conversation,

    shop,

    currentProduct = null,

    cartItems = []

}) {

    try {

        /*
        ------------------------------------------------------------
        | Product Page
        ------------------------------------------------------------
        */

        if (currentProduct) {

            return await RecommendationService
                .recommendSimilarProducts(

                    currentProduct

                );

        }

        /*
        ------------------------------------------------------------
        | Cart
        ------------------------------------------------------------
        */

        if (cartItems.length > 0) {

            return await RecommendationService
                .recommendCartProducts(

                    cartItems,

                    shop._id

                );

        }

        /*
        ------------------------------------------------------------
        | Personalized
        ------------------------------------------------------------
        */

        return await RecommendationService
            .recommendForCustomer(

                conversation,

                shop._id

            );

    } catch (error) {

        logger.error(

            "Recommendation generation failed",

            error

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

    plan,

    merchant,

    shop,

    customer,

    conversation,

    products,

    currentPage,

    cart

}) {

    try {

        const memory =

            await MemoryService.buildAIMemory(

                conversation

            );

        return PromptService.buildSystemPrompt({

            plan,

            merchant,

            store: shop,

            customer,

            products,

            page: currentPage,

            cart,

            memory: memory.memory,

            history: memory.history

        });

    } catch (error) {

        logger.error(

            "Prompt generation failed",

            error

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

    try {

        return await MemoryService
            .getConversationContext(

                conversationId

            );

    } catch (error) {

        logger.error(

            "Conversation history failed",

            error

        );

        return [];

    }

          }
/*
|--------------------------------------------------------------------------
| OpenAI Chat Completion
|--------------------------------------------------------------------------
*/

export async function generateChatCompletion({

    messages,

    shop,

    user,

    maxTokens = null,

    temperature = 0.7,

    responseFormat = null

}) {

    const model = getModelForPlan(

        shop?.subscription?.plan || "Starter"

    );

    const tokenLimit =

        maxTokens ||

        getMaxTokensForPlan(

            shop?.subscription?.plan || "Starter"

        );

    const payload = {

        model,

        messages,

        temperature,

        max_completion_tokens: tokenLimit

    };

    if (responseFormat) {

        payload.response_format = responseFormat;

    }

    return executeWithRetry(

        () => openai.chat.completions.create(payload)

    );

}

/*
|--------------------------------------------------------------------------
| Retry Logic
|--------------------------------------------------------------------------
*/

export async function executeWithRetry(

    operation,

    retries = 3,

    delay = 1000

) {

    let lastError;

    for (

        let attempt = 1;

        attempt <= retries;

        attempt++

    ) {

        try {

            return await operation();

        }

        catch (error) {

            lastError = error;

            logger.warn(

                `OpenAI Retry ${attempt}/${retries}`,

                {

                    error: error.message

                }

            );

            if (attempt === retries) {

                break;

            }

            await new Promise(

                resolve =>

                    setTimeout(

                        resolve,

                        delay * attempt

                    )

            );

        }

    }

    throw lastError;

}

/*
|--------------------------------------------------------------------------
| Parse OpenAI Response
|--------------------------------------------------------------------------
*/

export function parseCompletion(response) {

    return {

        id: response.id,

        model: response.model,

        finishReason:

            response.choices?.[0]

                ?.finish_reason ||

            "stop",

        content:

            response.choices?.[0]

                ?.message?.content ||

            "",

        usage: {

            promptTokens:

                response.usage?.prompt_tokens ||

                0,

            completionTokens:

                response.usage?.completion_tokens ||

                0,

            totalTokens:

                response.usage?.total_tokens ||

                0

        }

    };

}

/*
|--------------------------------------------------------------------------
| AI Request
|--------------------------------------------------------------------------
*/

export async function requestAI({

    shop,

    user,

    messages,

    temperature,

    maxTokens,

    responseFormat

}) {

    const response =

        await generateChatCompletion({

            shop,

            user,

            messages,

            temperature,

            maxTokens,

            responseFormat

        });

    return parseCompletion(response);

}

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

export function handleAIError(error) {

    logger.error(

        "OpenAI Error",

        {

            message: error.message,

            code: error.code,

            status: error.status

        }

    );

    if (

        error.status === 429

    ) {

        throw new Error(

            "OpenAI rate limit exceeded."

        );

    }

    if (

        error.status >= 500

    ) {

        throw new Error(

            "OpenAI service unavailable."

        );

    }

    throw new Error(

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

    ai,

    recommendations = [],

    actions = [],

    quickReplies = []

}) {

    const message = await Message.create({

        conversation: conversation._id,

        shop: shop._id,

        visitor: visitor._id,

        role: "assistant",

        messageType: "text",

        messageId: crypto.randomUUID(),

        sequence: conversation.totalMessages + 1,

        content,

        sender: {

            senderType: "AI",

            name: "Layboka AI",

            source: "ai"

        },

        ai,

        productCards: recommendations,

        actions,

        quickReplies,

        delivery: {

            status: "sent",

            deliveredAt: new Date()

        }

    });

    return message;

}

/*
|--------------------------------------------------------------------------
| Update Conversation
|--------------------------------------------------------------------------
*/

export async function updateConversationAfterResponse({

    conversation,

    assistantMessage,

    aiUsage = {}

}) {

    conversation.totalMessages += 1;

    conversation.aiMessages += 1;

    conversation.lastMessageAt = new Date();

    conversation.status = "active";

    conversation.promptTokens += aiUsage.promptTokens || 0;

    conversation.completionTokens += aiUsage.completionTokens || 0;

    conversation.totalTokens += aiUsage.totalTokens || 0;

    conversation.estimatedCost += aiUsage.estimatedCost || 0;

    conversation.apiCalls += 1;

    conversation.averageResponseTime = aiUsage.responseTime || 0;

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Update Analytics
|--------------------------------------------------------------------------
*/

export async function updateConversationAnalytics({

    conversation,

    recommendations = []

}) {

    conversation.analytics.productsRecommended +=
        recommendations.length;

    conversation.analytics.engagementScore += 1;

    await conversation.save();

}

/*
|--------------------------------------------------------------------------
| Update AI Memory
|--------------------------------------------------------------------------
*/

export async function updateCustomerMemory({

    conversation,

    visitor,

    userMessage,

    assistantMessage

}) {

    await MemoryService.learnFromConversation(

        conversation,

        {

            role: "visitor",

            content: userMessage

        }

    );

    await MemoryService.learnFromConversation(

        conversation,

        {

            role: "assistant",

            content: assistantMessage

        }

    );

    return MemoryService.buildAIMemory(

        conversation,

        visitor

    );

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

        description: product.shortDescription ||

            product.description ||

            "",

        handle: product.handle,

        image: product.featuredImage ||

            product.image ||

            "",

        price: product.price,

        compareAtPrice: product.compareAtPrice,

        currency: product.currency || "USD",

        vendor: product.vendor,

        available: product.inventoryQuantity > 0,

        inventory: product.inventoryQuantity,

        url: `/products/${product.handle}`,

        recommendationReason:

            product.recommendationReason ||

            "",

        recommendationScore:

            product.recommendationScore ||

            0

    }));

}

/*
|--------------------------------------------------------------------------
| Build Quick Replies
|--------------------------------------------------------------------------
*/

export function buildQuickReplies(intent) {

    switch (intent) {

        case "product_search":

            return [

                "Best Sellers",

                "New Arrivals",

                "Today's Deals",

                "Browse Categories"

            ];

        case "pricing":

            return [

                "Budget Products",

                "Premium Products",

                "Show Discounts"

            ];

        case "shipping":

            return [

                "Shipping Charges",

                "Delivery Time",

                "Track Order"

            ];

        case "return_exchange":

            return [

                "Return Policy",

                "Exchange Policy",

                "Refund Status"

            ];

        default:

            return [

                "Browse Products",

                "Contact Support",

                "Track Order"

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

        title: product.title,

        label: "View Product",

        url: `/products/${product.handle}`,

        value: product._id

    }));

}

/*
|--------------------------------------------------------------------------
| Build Cart Recovery Response
|--------------------------------------------------------------------------
*/

export function buildCartRecovery(cart = {}) {

    return {

        enabled: !!cart.items?.length,

        message:

            cart.items?.length

                ? `You still have ${cart.items.length} item(s) waiting in your cart.`

                : "",

        checkoutUrl:

            cart.checkoutUrl || "",

        cartValue:

            cart.total || 0,

        currency:

            cart.currency || "USD"

    };

}

/*
|--------------------------------------------------------------------------
| Build Upsell Response
|--------------------------------------------------------------------------
*/

export function buildUpsellResponse(products = []) {

    return {

        type: "upsell",

        title:

            "Upgrade Your Purchase",

        message:

            "Customers often choose these premium options.",

        products:

            buildProductCards(products)

    };

}

/*
|--------------------------------------------------------------------------
| Build Cross Sell Response
|--------------------------------------------------------------------------
*/

export function buildCrossSellResponse(products = []) {

    return {

        type: "cross_sell",

        title:

            "Complete Your Purchase",

        message:

            "These products pair perfectly with your selection.",

        products:

            buildProductCards(products)

    };

      }
/*
|--------------------------------------------------------------------------
| Format AI Response
|--------------------------------------------------------------------------
*/

export function formatResponse(result = {}) {

    return {

        success: true,

        message: result.content || "",

        model: result.model || "",

        provider: result.provider || "openai",

        finishReason: result.finishReason || "stop",

        createdAt: new Date(),

        usage: result.usage || {},

        recommendations: result.recommendations || [],

        actions: result.actions || [],

        quickReplies: result.quickReplies || [],

        metadata: result.metadata || {}

    };

}

/*
|--------------------------------------------------------------------------
| Token Accounting
|--------------------------------------------------------------------------
*/

export function calculateTokenUsage(usage = {}) {

    const promptTokens = Number(

        usage.prompt_tokens || 0

    );

    const completionTokens = Number(

        usage.completion_tokens || 0

    );

    const totalTokens = Number(

        usage.total_tokens ||

        promptTokens + completionTokens

    );

    return {

        promptTokens,

        completionTokens,

        totalTokens

    };

}

/*
|--------------------------------------------------------------------------
| Cost Calculation
|--------------------------------------------------------------------------
|
| Prices should be updated whenever OpenAI pricing changes.
|--------------------------------------------------------------------------
*/

export function calculateCost(

    model,

    usage

) {

    const {

        promptTokens,

        completionTokens

    } = calculateTokenUsage(usage);

    let inputRate = 0;

    let outputRate = 0;

    switch (model) {

        case "gpt-5":

            inputRate = 1.25;

            outputRate = 10.00;

            break;

        case "gpt-4o-mini":

        default:

            inputRate = 0.15;

            outputRate = 0.60;

            break;

    }

    const inputCost =

        (promptTokens / 1000000) *

        inputRate;

    const outputCost =

        (completionTokens / 1000000) *

        outputRate;

    const totalCost =

        inputCost + outputCost;

    return {

        inputCost,

        outputCost,

        totalCost

    };

}

/*
|--------------------------------------------------------------------------
| AI Request Logger
|--------------------------------------------------------------------------
*/

export function logAIRequest({

    shopId,

    conversationId,

    visitorId,

    model,

    usage,

    cost,

    responseTime

}) {

    console.info({

        event: "AI_REQUEST",

        timestamp: new Date(),

        shopId,

        conversationId,

        visitorId,

        model,

        usage,

        cost,

        responseTime

    });

}

/*
|--------------------------------------------------------------------------
| Build Performance Metrics
|--------------------------------------------------------------------------
*/

export function buildPerformanceMetrics({

    startedAt,

    finishedAt,

    usage,

    model

}) {

    const responseTime =

        finishedAt - startedAt;

    const tokens =

        calculateTokenUsage(usage);

    const cost =

        calculateCost(

            model,

            usage

        );

    return {

        responseTime,

        promptTokens:

            tokens.promptTokens,

        completionTokens:

            tokens.completionTokens,

        totalTokens:

            tokens.totalTokens,

        inputCost:

            cost.inputCost,

        outputCost:

            cost.outputCost,

        totalCost:

            cost.totalCost

    };

      }
/*
|--------------------------------------------------------------------------
| Main Chat Function
|--------------------------------------------------------------------------
*/

export async function chat({

    shop,

    visitor,

    conversation,

    message,

    stream = false

}) {

    try {

        /*
        |--------------------------------------------------------------------------
        | Analyze Customer Intent
        |--------------------------------------------------------------------------
        */

        const intent = await analyzeConversation(

            conversation,

            message

        );

        /*
        |--------------------------------------------------------------------------
        | Build AI Memory
        |--------------------------------------------------------------------------
        */

        const memory = await buildAIMemory(

            conversation

        );

        /*
        |--------------------------------------------------------------------------
        | Generate Product Recommendations
        |--------------------------------------------------------------------------
        */

        const recommendations =

            await recommendForCustomer(

                conversation,

                shop._id

            );

        /*
        |--------------------------------------------------------------------------
        | Generate AI Response
        |--------------------------------------------------------------------------
        */

        const aiResponse = await generateResponse({

            shop,

            visitor,

            conversation,

            message,

            intent,

            memory,

            recommendations,

            stream

        });

        /*
        |--------------------------------------------------------------------------
        | Save Recommendation Analytics
        |--------------------------------------------------------------------------
        */

        if (recommendations.length) {

            await saveRecommendationAnalytics(

                conversation,

                recommendations

            );

        }

        /*
        |--------------------------------------------------------------------------
        | Learn Customer Memory
        |--------------------------------------------------------------------------
        */

        await learnFromConversation(

            conversation,

            {

                content: message

            }

        );

        return aiResponse;

    } catch (error) {

        console.error(

            "AI Chat Error:",

            error

        );

        return buildErrorResponse();

    }

}

/*
|--------------------------------------------------------------------------
| Public APIs
|--------------------------------------------------------------------------
*/

export async function generateReply(data) {

    return chat(data);

}

export async function generateStreamingReply(data) {

    return chat({

        ...data,

        stream: true

    });

}

export async function detectCustomerIntent(message) {

    return analyzeIntent(message);

}

export async function buildConversationMemory(

    conversation

) {

    return buildAIMemory(

        conversation

    );

}

export async function recommendProducts(

    conversation,

    shopId

) {

    return recommendForCustomer(

        conversation,

        shopId

    );

}

/*
|--------------------------------------------------------------------------
| AI Service
|--------------------------------------------------------------------------
*/

export const AIService = {

    chat,

    generateReply,

    generateStreamingReply,

    detectCustomerIntent,

    buildConversationMemory,

    recommendProducts,

    analyzeConversation,

    buildAIMemory,

    recommendForCustomer,

    generateResponse,

    streamResponse

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default AIService;
