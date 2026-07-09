import OpenAI from "openai";

const supportedModels = {
  starter: process.env.OPENAI_STARTER_MODEL || "gpt-4o-mini",
  growth: process.env.OPENAI_GROWTH_MODEL || "gpt-4o-mini",
  premium: process.env.OPENAI_PREMIUM_MODEL || "gpt-5",
  enterprise: process.env.OPENAI_ENTERPRISE_MODEL || "gpt-5"
};

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is not configured.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Return the AI model for the merchant's subscription plan.
 *
 * Supported plans:
 * starter
 * growth
 * premium
 * enterprise
 */
export const getModelByPlan = (plan = "starter") => {
  const normalizedPlan = String(plan).toLowerCase();

  return supportedModels[normalizedPlan] || supportedModels.starter;
};

/**
 * OpenAI client
 */
export default openai;

/**
 * Generate a chat completion.
 *
 * @param {Object} options
 * @param {string} options.plan
 * @param {Array} options.messages
 * @param {number} [options.temperature]
 * @param {number} [options.maxTokens]
 */
export const createChatCompletion = async ({
  plan = "starter",
  messages = [],
  temperature = 0.7,
  maxTokens = 1200
}) => {
  const model = getModelByPlan(plan);

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_completion_tokens: maxTokens
    });

    return {
      success: true,
      model,
      content:
        response.choices?.[0]?.message?.content || "",
      usage: response.usage
    };
  } catch (error) {
    console.error("OpenAI Error:", error);

    return {
      success: false,
      model,
      error: error.message
    };
  }
};

/**
 * Simple health check.
 */
export const checkOpenAIConnection = async () => {
  try {
    await openai.models.list();

    return {
      success: true,
      message: "OpenAI connection established."
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

export { supportedModels };
