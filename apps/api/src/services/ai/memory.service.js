import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Visitor from "../../models/Visitor.js";

/*
|--------------------------------------------------------------------------
| Memory Configuration
|--------------------------------------------------------------------------
*/

export const MEMORY_LIMITS = Object.freeze({

    MAX_MEMORY_ITEMS: 100,

    MAX_HISTORY_MESSAGES: 20,

    MAX_SUMMARIES: 10,

    MAX_CONTEXT_CHARACTERS: 12000

});

/*
|--------------------------------------------------------------------------
| Create Memory Entry
|--------------------------------------------------------------------------
*/

export function createMemoryEntry({

    key,

    value,

    confidence = 100

}) {

    return {

        key,

        value,

        confidence,

        createdAt: new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Add Memory
|--------------------------------------------------------------------------
*/

export async function addMemory(

    conversation,

    key,

    value,

    confidence = 100

) {

    if (!conversation) {

        throw new Error(
            "Conversation is required."
        );

    }

    const existing = conversation.memory.find(

        item => item.key === key

    );

    if (existing) {

        existing.value = value;

        existing.confidence = confidence;

        existing.createdAt = new Date();

    } else {

        conversation.memory.push(

            createMemoryEntry({

                key,

                value,

                confidence

            })

        );

    }

    if (

        conversation.memory.length >

        MEMORY_LIMITS.MAX_MEMORY_ITEMS

    ) {

        conversation.memory =

            conversation.memory.slice(

                -MEMORY_LIMITS.MAX_MEMORY_ITEMS

            );

    }

    await conversation.save();

    return conversation.memory;

}

/*
|--------------------------------------------------------------------------
| Get Memory Value
|--------------------------------------------------------------------------
*/

export function getMemory(

    conversation,

    key

) {

    if (!conversation) {

        return null;

    }

    const item =

        conversation.memory.find(

            memory => memory.key === key

        );

    return item || null;

}

/*
|--------------------------------------------------------------------------
| Remove Memory
|--------------------------------------------------------------------------
*/

export async function removeMemory(

    conversation,

    key

) {

    if (!conversation) {

        return false;

    }

    conversation.memory =

        conversation.memory.filter(

            item => item.key !== key

        );

    await conversation.save();

    return true;

}

/*
|--------------------------------------------------------------------------
| Clear Memory
|--------------------------------------------------------------------------
*/

export async function clearMemory(

    conversation

) {

    conversation.memory = [];

    await conversation.save();

    return true;

}
/*
|--------------------------------------------------------------------------
| Get Conversation History
|--------------------------------------------------------------------------
*/

export async function getConversationHistory(

    conversationId,

    limit = MEMORY_LIMITS.MAX_HISTORY_MESSAGES

) {

    return Message.find({

        conversation: conversationId,

        deleted: false

    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

}

/*
|--------------------------------------------------------------------------
| Get Conversation Context
|--------------------------------------------------------------------------
*/

export async function getConversationContext(
    conversationId
) {

    const messages =
        await getConversationHistory(conversationId);

    return messages
        .reverse()
        .map(message => ({

            role: message.role,

            content: message.content

        }));

}

/*
|--------------------------------------------------------------------------
| Build Memory Context
|--------------------------------------------------------------------------
*/

export function buildMemoryContext(
    conversation
) {

    if (
        !conversation ||
        !Array.isArray(conversation.memory)
    ) {

        return [];

    }

    return conversation.memory.map(item => ({

        key: item.key,

        value: item.value,

        confidence: item.confidence

    }));

}

/*
|--------------------------------------------------------------------------
| Get Visitor Memory
|--------------------------------------------------------------------------
*/

export async function getVisitorMemory(
    visitorId
) {

    if (!visitorId) {

        return null;

    }

    return Visitor.findById(visitorId)
        .lean();

}

/*
|--------------------------------------------------------------------------
| Get Customer Preferences
|--------------------------------------------------------------------------
*/

export function extractCustomerPreferences(
    conversation
) {

    const preferences = {};

    if (
        !conversation ||
        !Array.isArray(conversation.memory)
    ) {

        return preferences;

    }

    for (const item of conversation.memory) {

        switch (item.key) {

            case "preferred_language":

                preferences.language =
                    item.value;

                break;

            case "preferred_currency":

                preferences.currency =
                    item.value;

                break;

            case "favorite_category":

                preferences.favoriteCategory =
                    item.value;

                break;

            case "favorite_brand":

                preferences.favoriteBrand =
                    item.value;

                break;

            case "budget":

                preferences.budget =
                    item.value;

                break;

            case "size":

                preferences.size =
                    item.value;

                break;

            case "color":

                preferences.color =
                    item.value;

                break;

            default:
                break;

        }

    }

    return preferences;

}

/*
|--------------------------------------------------------------------------
| Build AI Memory Payload
|--------------------------------------------------------------------------
*/

export async function buildAIMemory(
    conversation
) {

    return {

        memory:
            buildMemoryContext(conversation),

        preferences:
            extractCustomerPreferences(conversation),

        history:
            await getConversationContext(
                conversation._id
            )

    };

}
/*
|--------------------------------------------------------------------------
| Summarize Conversation Memory
|--------------------------------------------------------------------------
*/

export function summarizeMemory(conversation) {

    if (
        !conversation ||
        !Array.isArray(conversation.memory)
    ) {

        return "";
    }

    return conversation.memory
        .map(item => `${item.key}: ${item.value}`)
        .join("\n");

}

/*
|--------------------------------------------------------------------------
| Learn From Conversation
|--------------------------------------------------------------------------
|
| Stores useful customer preferences automatically.
|--------------------------------------------------------------------------
*/

export async function learnFromConversation(
    conversation,
    message = {}
) {

    if (!conversation || !message.content) {
        return;
    }

    const text = message.content.toLowerCase();

    if (text.includes("english")) {

        await addMemory(
            conversation,
            "preferred_language",
            "English"
        );

    }

    if (text.includes("hindi")) {

        await addMemory(
            conversation,
            "preferred_language",
            "Hindi"
        );

    }

    if (text.includes("usd")) {

        await addMemory(
            conversation,
            "preferred_currency",
            "USD"
        );

    }

    if (text.includes("inr")) {

        await addMemory(
            conversation,
            "preferred_currency",
            "INR"
        );

    }

}

/*
|--------------------------------------------------------------------------
| Remove Duplicate Memory
|--------------------------------------------------------------------------
*/

export async function deduplicateMemory(
    conversation
) {

    if (
        !conversation ||
        !Array.isArray(conversation.memory)
    ) {

        return;
    }

    const unique = new Map();

    for (const item of conversation.memory) {

        unique.set(item.key, item);

    }

    conversation.memory = [...unique.values()];

    await conversation.save();

}

/*
|--------------------------------------------------------------------------
| Cleanup Memory
|--------------------------------------------------------------------------
*/

export async function cleanupMemory(
    conversation
) {

    if (!conversation) {

        return;

    }

    await deduplicateMemory(
        conversation
    );

    if (
        conversation.memory.length >
        MEMORY_LIMITS.MAX_MEMORY_ITEMS
    ) {

        conversation.memory =
            conversation.memory.slice(
                -MEMORY_LIMITS.MAX_MEMORY_ITEMS
            );

        await conversation.save();

    }

}

/*
|--------------------------------------------------------------------------
| Conversation Statistics
|--------------------------------------------------------------------------
*/

export function getMemoryStatistics(
    conversation
) {

    if (!conversation) {

        return {

            totalItems: 0,

            averageConfidence: 0

        };

    }

    const totalItems =
        conversation.memory.length;

    const averageConfidence =
        totalItems === 0
            ? 0
            : conversation.memory.reduce(

                (sum, item) =>

                    sum +
                    (item.confidence || 0),

                0

            ) / totalItems;

    return {

        totalItems,

        averageConfidence:
            Number(
                averageConfidence.toFixed(2)
            )

    };

}

/*
|--------------------------------------------------------------------------
| Memory Service
|--------------------------------------------------------------------------
*/

export const MemoryService = {

    createMemoryEntry,

    addMemory,

    getMemory,

    removeMemory,

    clearMemory,

    getConversationHistory,

    getConversationContext,

    buildMemoryContext,

    getVisitorMemory,

    extractCustomerPreferences,

    buildAIMemory,

    summarizeMemory,

    learnFromConversation,

    deduplicateMemory,

    cleanupMemory,

    getMemoryStatistics

};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default MemoryService;
