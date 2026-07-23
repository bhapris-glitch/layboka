import crypto from "crypto";

import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Visitor from "../../models/Visitor.js";
import Shop from "../../models/shop.js";
import Subscription from "../../models/Subscription.js";

/*
|--------------------------------------------------------------------------
| Conversation Configuration
|--------------------------------------------------------------------------
*/

export const CONVERSATION_CONFIG = Object.freeze({

    DEFAULT_LANGUAGE: "en",

    DEFAULT_CHANNEL: "shopify-widget",

    DEFAULT_AI_PROVIDER: "openai",

    DEFAULT_AI_MODEL: "gpt-4o-mini",

    DEFAULT_STATUS: "active",

    DEFAULT_PRIORITY: "normal",

    DEFAULT_SOURCE: "homepage",

    MAX_TITLE_LENGTH: 200,

    MAX_SUMMARY_LENGTH: 5000

});

/*
|--------------------------------------------------------------------------
| Generate Conversation ID
|--------------------------------------------------------------------------
*/

export function generateConversationId() {

    return `conv_${Date.now()}_${crypto
        .randomBytes(8)
        .toString("hex")}`;

}

/*
|--------------------------------------------------------------------------
| Validate Conversation Data
|--------------------------------------------------------------------------
*/

export async function validateConversation({

    shopId,

    visitorId

}) {

    if (!shopId) {

        throw new Error("Shop ID is required.");

    }

    if (!visitorId) {

        throw new Error("Visitor ID is required.");

    }

    const [shop, visitor] = await Promise.all([

        Shop.findById(shopId),

        Visitor.findById(visitorId)

    ]);

    if (!shop) {

        throw new Error("Shop not found.");

    }

    if (!visitor) {

        throw new Error("Visitor not found.");

    }

    return {

        shop,

        visitor

    };

}

/*
|--------------------------------------------------------------------------
| Create Conversation
|--------------------------------------------------------------------------
*/

export async function createConversation({

    shopId,

    visitorId,

    merchantId = null,

    subscriptionId = null,

    language = CONVERSATION_CONFIG.DEFAULT_LANGUAGE,

    channel = CONVERSATION_CONFIG.DEFAULT_CHANNEL,

    source = CONVERSATION_CONFIG.DEFAULT_SOURCE

}) {

    await validateConversation({

        shopId,

        visitorId

    });

    const conversation = await Conversation.create({

        shop: shopId,

        visitor: visitorId,

        merchant: merchantId,

        subscription: subscriptionId,

        conversationId: generateConversationId(),

        language,

        preferredLanguage: language,

        channel,

        source,

        aiProvider:
            CONVERSATION_CONFIG.DEFAULT_AI_PROVIDER,

        aiModel:
            CONVERSATION_CONFIG.DEFAULT_AI_MODEL,

        status:
            CONVERSATION_CONFIG.DEFAULT_STATUS,

        priority:
            CONVERSATION_CONFIG.DEFAULT_PRIORITY,

        startedAt: new Date(),

        lastMessageAt: new Date()

    });

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Get Conversation By Mongo ID
|--------------------------------------------------------------------------
*/

export async function getConversation(id) {

    return Conversation.findById(id)

        .populate("shop")

        .populate("visitor")

        .populate("merchant")

        .populate("subscription");

}

/*
|--------------------------------------------------------------------------
| Get Conversation By Conversation ID
|--------------------------------------------------------------------------
*/

export async function getConversationByConversationId(

    conversationId

) {

    return Conversation.findOne({

        conversationId,

        deleted: false

    });

}

/*
|--------------------------------------------------------------------------
| Find Active Conversation
|--------------------------------------------------------------------------
*/

export async function findActiveConversation({

    shopId,

    visitorId

}) {

    return Conversation.findOne({

        shop: shopId,

        visitor: visitorId,

        status: "active",

        archived: false,

        deleted: false

    }).sort({

        createdAt: -1

    });

}
/*
|--------------------------------------------------------------------------
| Update Conversation
|--------------------------------------------------------------------------
*/

export async function updateConversation(

    conversationId,

    updates = {}

) {

    const conversation = await Conversation.findById(

        conversationId

    );

    if (!conversation) {

        throw new Error(

            "Conversation not found."

        );

    }

    Object.keys(updates).forEach(key => {

        conversation[key] = updates[key];

    });

    conversation.updatedAt = new Date();

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Close Conversation
|--------------------------------------------------------------------------
*/

export async function closeConversation(

    conversationId,

    resolution = "answered"

) {

    const conversation = await Conversation.findById(

        conversationId

    );

    if (!conversation) {

        throw new Error(

            "Conversation not found."

        );

    }

    conversation.status = "closed";

    conversation.resolution = resolution;

    conversation.endedAt = new Date();

    conversation.lastMessageAt = new Date();

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Archive Conversation
|--------------------------------------------------------------------------
*/

export async function archiveConversation(

    conversationId

) {

    const conversation = await Conversation.findById(

        conversationId

    );

    if (!conversation) {

        throw new Error(

            "Conversation not found."

        );

    }

    conversation.archived = true;

    if ("status" in conversation) {

        conversation.status = "archived";

    }

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Restore Archived Conversation
|--------------------------------------------------------------------------
*/

export async function restoreConversation(

    conversationId

) {

    const conversation = await Conversation.findById(

        conversationId

    );

    if (!conversation) {

        throw new Error(

            "Conversation not found."

        );

    }

    conversation.archived = false;

    if (conversation.status === "archived") {

        conversation.status = "active";

    }

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Soft Delete Conversation
|--------------------------------------------------------------------------
*/

export async function deleteConversation(

    conversationId

) {

    const conversation = await Conversation.findById(

        conversationId

    );

    if (!conversation) {

        throw new Error(

            "Conversation not found."

        );

    }

    conversation.deleted = true;

    conversation.status = "closed";

    conversation.endedAt = new Date();

    await conversation.save();

    return conversation;

      }
/*
|----------------------PART- 3 ----------------------------------------------------
| Add Message
|--------------------------------------------------------------------------
*/

export async function addMessage({

    conversation,

    message

}) {

    const newMessage = await Message.create({

        ...message,

        conversation: conversation._id,

        shop: conversation.shop,

        visitor: conversation.visitor

    });

    conversation.totalMessages += 1;

    switch (newMessage.role) {

        case "visitor":

            conversation.userMessages += 1;
            break;

        case "assistant":

            conversation.aiMessages += 1;
            break;

        case "human":

            conversation.humanMessages += 1;
            break;

    }

    conversation.lastMessageAt = new Date();

    await conversation.save();

    return newMessage;

}

/*
|--------------------------------------------------------------------------
| Get Messages
|--------------------------------------------------------------------------
*/

export async function getMessages(

    conversationId

) {

    return Message.find({

        conversation: conversationId,

        deleted: false

    })
        .sort({

            sequence: 1

        })
        .lean();

}

/*
|--------------------------------------------------------------------------
| Get Paginated Messages
|--------------------------------------------------------------------------
*/

export async function getPaginatedMessages({

    conversationId,

    page = 1,

    limit = 50

}) {

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([

        Message.find({

            conversation: conversationId,

            deleted: false

        })
            .sort({

                sequence: 1

            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Message.countDocuments({

            conversation: conversationId,

            deleted: false

        })

    ]);

    return {

        page,

        limit,

        total,

        totalPages:

            Math.ceil(total / limit),

        hasNext:

            page * limit < total,

        hasPrevious:

            page > 1,

        messages

    };

}

/*
|--------------------------------------------------------------------------
| Update Conversation Statistics
|--------------------------------------------------------------------------
*/

export async function updateStatistics(

    conversation

) {

    const stats = await Message.aggregate([

        {

            $match: {

                conversation:

                    conversation._id,

                deleted: false

            }

        },

        {

            $group: {

                _id: "$role",

                count: {

                    $sum: 1

                }

            }

        }

    ]);

    conversation.totalMessages = 0;
    conversation.userMessages = 0;
    conversation.aiMessages = 0;
    conversation.humanMessages = 0;

    for (const row of stats) {

        conversation.totalMessages += row.count;

        switch (row._id) {

            case "visitor":

                conversation.userMessages = row.count;
                break;

            case "assistant":

                conversation.aiMessages = row.count;
                break;

            case "human":

                conversation.humanMessages = row.count;
                break;

        }

    }

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Update Conversation Summary
|--------------------------------------------------------------------------
*/

export async function updateSummary(

    conversation

) {

    const messages = await Message.find({

        conversation: conversation._id,

        deleted: false

    })
        .sort({

            createdAt: -1

        })
        .limit(10)
        .lean();

    conversation.summary = messages
        .reverse()
        .map(message => {

            const role =
                message.role === "assistant"
                    ? "AI"
                    : message.role === "visitor"
                    ? "Customer"
                    : "Agent";

            return `${role}: ${message.content}`;

        })
        .join("\n");

    await conversation.save();

    return conversation.summary;

            }
/*
|--------------------------------------------------------------------------
| AI Chat Integration
|--------------------------------------------------------------------------
*/

export async function chat(

    conversation,

    {

        shop,

        visitor,

        message,

        stream = false

    }

) {

    const aiResponse = await AIService.chat({

        shop,

        visitor,

        conversation,

        message,

        stream

    });

    return aiResponse;

}

/*
|--------------------------------------------------------------------------
| Human Handoff
|--------------------------------------------------------------------------
*/

export async function requestHumanHandoff(

    conversation

) {

    conversation.humanHandoff = true;

    conversation.handoffRequestedAt = new Date();

    conversation.status = "waiting";

    await conversation.save();

    return conversation;

}

export async function acceptHumanHandoff(

    conversation,

    userId

) {

    conversation.humanHandoff = true;

    conversation.assignedTo = userId;

    conversation.handoffAcceptedAt = new Date();

    conversation.status = "active";

    await conversation.save();

    return conversation;

}

export async function closeHumanHandoff(

    conversation

) {

    conversation.humanHandoff = false;

    conversation.assignedTo = null;

    conversation.status = "active";

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Revenue Attribution
|--------------------------------------------------------------------------
*/

export async function attributeRevenue(

    conversation,

    order

) {

    if (!conversation || !order) {

        return conversation;

    }

    conversation.order = {

        orderId: order._id,

        shopifyOrderId: order.shopifyOrderId,

        orderNumber: order.orderNumber,

        subtotal: order.subtotal,

        tax: order.tax,

        shipping: order.shipping,

        discount: order.discount,

        total: order.total,

        currency: order.currency,

        purchased: true,

        purchasedAt: new Date()

    };

    conversation.aiRevenue.directRevenue +=

        order.total || 0;

    conversation.aiRevenue.totalRevenue +=

        order.total || 0;

    conversation.resolution = "purchase";

    conversation.customerStage = "purchased";

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Conversation Analytics
|--------------------------------------------------------------------------
*/

export async function updateAnalytics(

    conversation,

    analytics = {}

) {

    if (!conversation) {

        return null;

    }

    Object.keys(analytics).forEach(key => {

        if (

            key in conversation.analytics

        ) {

            conversation.analytics[key] =

                analytics[key];

        }

    });

    await conversation.save();

    return conversation;

}

export async function updateResponseMetrics(

    conversation,

    {

        responseTime = 0,

        promptTokens = 0,

        completionTokens = 0,

        estimatedCost = 0

    }

) {

    conversation.apiCalls += 1;

    conversation.promptTokens += promptTokens;

    conversation.completionTokens += completionTokens;

    conversation.totalTokens +=

        promptTokens +

        completionTokens;

    conversation.estimatedCost +=

        estimatedCost;

    conversation.lastResponseTime =

        responseTime;

    if (

        conversation.firstResponseTime === 0

    ) {

        conversation.firstResponseTime =

            responseTime;

    }

    const totalCalls =

        conversation.apiCalls || 1;

    conversation.averageResponseTime =

        (

            (

                conversation.averageResponseTime *

                (totalCalls - 1)

            ) +

            responseTime

        ) / totalCalls;

    await conversation.save();

    return conversation;

}

/*
|--------------------------------------------------------------------------
| Conversation Service
|--------------------------------------------------------------------------
*/

export const ConversationService = {

    createConversation,

    getConversation,

    getActiveConversation,

    validateConversation,

    updateConversation,

    closeConversation,

    archiveConversation,

    restoreConversation,

    deleteConversation,

    addMessage,

    getMessages,

    getPaginatedMessages,

    updateMessageStatistics,

    updateConversationSummary,

    chat,

    requestHumanHandoff,

    acceptHumanHandoff,

    closeHumanHandoff,

    attributeRevenue,

    updateAnalytics,

    updateResponseMetrics

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ConversationService;
