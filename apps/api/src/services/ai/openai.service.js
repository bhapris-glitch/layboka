import OpenAI from "openai";

import env from "../../config/env.js";
import logger from "../../config/logger.js";

/*
|--------------------------------------------------------------------------
| Supported AI Models
|--------------------------------------------------------------------------
|
| Starter & Growth  -> GPT-4o-mini
| Premium & Enterprise -> GPT-5
|
*/

export const AI_MODELS = Object.freeze({

    STARTER: {
        model: "gpt-4o-mini",
        maxTokens: 300
    },

    GROWTH: {
        model: "gpt-4o-mini",
        maxTokens: 600
    },

    PREMIUM: {
        model: "gpt-5",
        maxTokens: 1200
    },

    ENTERPRISE: {
        model: "gpt-5",
        maxTokens: 2000
    }

});

/*
|--------------------------------------------------------------------------
| OpenAI Client
|--------------------------------------------------------------------------
*/

const openai = new OpenAI({

    apiKey: env.OPENAI_API_KEY,

    organization: env.OPENAI_ORGANIZATION || undefined,

    project: env.OPENAI_PROJECT || undefined,

    timeout: Number(env.OPENAI_TIMEOUT || 60000),

    maxRetries: Number(env.OPENAI_MAX_RETRIES || 3)

});

/*
|--------------------------------------------------------------------------
| Model Resolver
|--------------------------------------------------------------------------
*/

export function getModelByPlan(plan = "Starter") {

    switch (plan.toLowerCase()) {

        case "starter":
            return AI_MODELS.STARTER;

        case "growth":
            return AI_MODELS.GROWTH;

        case "premium":
            return AI_MODELS.PREMIUM;

        case "enterprise":
            return AI_MODELS.ENTERPRISE;

        default:
            return AI_MODELS.STARTER;

    }

}

/*
|--------------------------------------------------------------------------
| Validate OpenAI Configuration
|--------------------------------------------------------------------------
*/

export function validateOpenAIConfig() {

    if (!env.OPENAI_API_KEY) {

        throw new Error(
            "OPENAI_API_KEY is missing from environment variables."
        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Default Completion Options
|--------------------------------------------------------------------------
*/

export const DEFAULT_OPTIONS = Object.freeze({

    temperature: 0.7,

    maxTokens: 300,

    topP: 1,

    frequencyPenalty: 0,

    presencePenalty: 0,

    stream: false

});

/*
|--------------------------------------------------------------------------
| Service Health Check
|--------------------------------------------------------------------------
*/

export async function healthCheck() {

    try {

        validateOpenAIConfig();

        return {

            success: true,

            provider: "OpenAI",

            status: "connected",

            timestamp: new Date()

        };

    } catch (error) {

        logger.error("OpenAI Health Check Failed", error);

        return {

            success: false,

            provider: "OpenAI",

            status: "disconnected",

            error: error.message

        };

    }

}

/*
|--------------------------------------------------------------------------
| Export Client
|--------------------------------------------------------------------------
*/

export default OpenAIService;

export {
    openai
};
/*
|--------------------------------------------------------------------------
| Build Request Options
|--------------------------------------------------------------------------
*/

function buildRequestOptions({

    model,

    input,

    systemPrompt = "",

    temperature = DEFAULT_OPTIONS.temperature,

    maxTokens = DEFAULT_OPTIONS.maxTokens,

    stream = false,

    tools = [],

    metadata = {}

}) {

    const instructions =
        systemPrompt && systemPrompt.trim().length > 0
            ? systemPrompt
            : "You are Layboka AI Sales Executive.";

    const options = {

        model,

        input,

        instructions,

        temperature,

        max_output_tokens: maxTokens,

        stream,

        metadata

    };

    if (Array.isArray(tools) && tools.length > 0) {

        options.tools = tools;

    }

    return options;

}

/*
|--------------------------------------------------------------------------
| Generate AI Response
|--------------------------------------------------------------------------
*/

export async function generateResponse({

    plan = "Starter",

    input,

    systemPrompt = "",

    temperature,

    maxTokens,

    tools = [],

    metadata = {}

}) {

    try {

        validateOpenAIConfig();

        const model = getModelByPlan(plan);

        const request = buildRequestOptions({

            model,

            input,

            systemPrompt,

            temperature,

            maxTokens,

            stream: false,

            tools,

            metadata

        });

        const response =
            await openai.responses.create(request);

        return {

            success: true,

            model,

            response,

            outputText: response.output_text || "",

            usage: response.usage || {}

        };

    } catch (error) {

        logger.error("OpenAI Response Error", {

            message: error.message,

            stack: error.stack

        });

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Stream AI Response
|--------------------------------------------------------------------------
*/

export async function streamResponse({

    plan = "Starter",

    input,

    systemPrompt = "",

    temperature,

    maxTokens,

    tools = [],

    metadata = {}

}) {

    validateOpenAIConfig();

    const model = getModelByPlan(plan);

    const request = buildRequestOptions({

        model,

        input,

        systemPrompt,

        temperature,

        maxTokens,

        stream: true,

        tools,

        metadata

    });

    return openai.responses.stream(request);

}

/*
|--------------------------------------------------------------------------
| Structured JSON Response
|--------------------------------------------------------------------------
*/

export async function generateJSON({

    plan = "Starter",

    input,

    systemPrompt,

    schema,

    metadata = {}

}) {

    const model = getModelByPlan(plan);

    return openai.responses.create({

        model,

        input,

        instructions: systemPrompt,

        text: {

            format: {

                type: "json_schema",

                name: "structured_response",

                schema

            }

        },

        metadata

    });

    }
/*
|--------------------------------------------------------------------------
| Usage Extraction
|--------------------------------------------------------------------------
*/

export function extractUsage(response = {}) {

    const usage = response.usage || {};

    return {

        inputTokens:
            usage.input_tokens || 0,

        outputTokens:
            usage.output_tokens || 0,

        totalTokens:
            usage.total_tokens || 0

    };

}

/*
|--------------------------------------------------------------------------
| Estimated Cost Calculator
|--------------------------------------------------------------------------
|
| Prices should be updated whenever OpenAI pricing changes.
|--------------------------------------------------------------------------
*/

export function calculateEstimatedCost(
    model,
    usage = {}
) {

    const pricing = {

        "gpt-4o-mini": {
            input: 0.15,
            output: 0.60
        },

        "gpt-5": {
            input: 1.25,
            output: 10.00
        }

    };

    const modelPricing =
        pricing[model] || pricing["gpt-4o-mini"];

    const inputCost =

        ((usage.inputTokens || 0) / 1000000) *
        modelPricing.input;

    const outputCost =

        ((usage.outputTokens || 0) / 1000000) *
        modelPricing.output;

    return {

        inputCost,

        outputCost,

        totalCost:
            inputCost + outputCost

    };

}

/*
|--------------------------------------------------------------------------
| Retry Helper
|--------------------------------------------------------------------------
*/

export async function retryRequest(
    callback,
    retries = 3
) {

    let lastError;

    for (let i = 0; i < retries; i++) {

        try {

            return await callback();

        } catch (error) {

            lastError = error;

            logger.warn(
                `Retry ${i + 1}/${retries}`,
                error.message
            );

            await new Promise(resolve =>
                setTimeout(
                    resolve,
                    (i + 1) * 1000
                )
            );

        }

    }

    throw lastError;

}

/*
|--------------------------------------------------------------------------
| Safe AI Request
|--------------------------------------------------------------------------
*/

export async function safeGenerateResponse(
    options
) {

    return retryRequest(async () => {

        const result =
            await generateResponse(options);

        const usage =
            extractUsage(result.response);

        const cost =
            calculateEstimatedCost(
                result.model,
                usage
            );

        return {

            ...result,

            usage,

            cost

        };

    });

}

/*
|--------------------------------------------------------------------------
| Model Information
|--------------------------------------------------------------------------
*/

export function getAvailableModels() {

    return {

        Starter: AI_MODELS.STARTER,

        Growth: AI_MODELS.GROWTH,

        Premium: AI_MODELS.PREMIUM,

        Enterprise: AI_MODELS.ENTERPRISE

    };

}

/*
|--------------------------------------------------------------------------
| Token Validation
|--------------------------------------------------------------------------
*/

export function validateTokenLimit(
    plan,
    requestedTokens
) {

    const config =
        getModelByPlan(plan);

    return requestedTokens <=
        config.maxTokens;

}

/*
|--------------------------------------------------------------------------
| Export Service
|--------------------------------------------------------------------------
*/

export const OpenAIService = {

    healthCheck,

    getModelByPlan,

    getAvailableModels,

    generateResponse,

    streamResponse,

    generateJSON,

    safeGenerateResponse,

    extractUsage,

    calculateEstimatedCost,

    validateTokenLimit

};

export {
    openai
};
