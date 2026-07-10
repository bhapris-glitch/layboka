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

    STARTER: "gpt-4o-mini",

    GROWTH: "gpt-4o-mini",

    PREMIUM: "gpt-5",

    ENTERPRISE: "gpt-5"

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

    maxTokens: 1500,

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

export default openai;
