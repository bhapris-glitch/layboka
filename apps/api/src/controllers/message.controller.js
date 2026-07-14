/*
|--------------------------------------------------------------------------
| File: src/controllers/message.controller.js
|--------------------------------------------------------------------------
*/
import mongoose from "mongoose";
import crypto from "crypto";

import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Shop from "../models/Shop.js";
import Visitor from "../models/Visitor.js";

import AIService from "../services/ai/ai.service.js";

import {
    successResponse,
    errorResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Message Controller
|--------------------------------------------------------------------------
*/

class MessageController {

    /*
    |--------------------------------------------------------------------------
    | Send Message
    |--------------------------------------------------------------------------
    */

    async sendMessage(req, res, next) {

        try {

            const {

                conversationId,

                visitorId,

                message,

                language = "en"

            } = req.body;

              /*
    |--------------------------------------------------------------------------
    | Get Conversation Messages
    |--------------------------------------------------------------------------
    */

    async getMessages(req, res, next) {

        try {

            const { conversationId } = req.params;

            const messages = await Message.find({

                conversation: conversationId,

                deleted: false

            })

            .sort({

                sequence: 1

            });

            return successResponse(

                res,

                "Messages fetched successfully.",

                messages

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Get Single Message
    |--------------------------------------------------------------------------
    */

    async getMessage(req, res, next) {

        try {

            const { id } = req.params;

            const message = await Message.findById(id);

            if (!message) {

                return errorResponse(

                    res,

                    "Message not found.",

                    404

                );

            }

            return successResponse(

                res,

                "Message fetched successfully.",

                message

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Update Message
    |--------------------------------------------------------------------------
    */

    async updateMessage(req, res, next) {

        try {

            const { id } = req.params;

            const {

                content,

                html,

                markdown

            } = req.body;

            const message = await Message.findById(id);

            if (!message) {

                return errorResponse(

                    res,

                    "Message not found.",

                    404

                );

            }

            if (content !== undefined) {

                message.content = content;

                message.plainText = content;

            }

            if (html !== undefined) {

                message.html = html;

            }

            if (markdown !== undefined) {

                message.markdown = markdown;

            }

            await message.save();

            return successResponse(

                res,

                "Message updated successfully.",

                message

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Soft Delete Message
    |--------------------------------------------------------------------------
    */

    async deleteMessage(req, res, next) {

        try {

            const { id } = req.params;

            const message = await Message.findById(id);

            if (!message) {

                return errorResponse(

                    res,

                    "Message not found.",

                    404

                );

            }

            message.deleted = true;

            message.deletedAt = new Date();

            await message.save();

            return successResponse(

                res,

                "Message deleted successfully."

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Restore Deleted Message
    |--------------------------------------------------------------------------
    */

    async restoreMessage(req, res, next) {

        try {

            const { id } = req.params;

            const message = await Message.findById(id);

            if (!message) {

                return errorResponse(

                    res,

                    "Message not found.",

                    404

                );

            }

            message.deleted = false;

            message.deletedAt = null;

            await message.save();

            return successResponse(

                res,

                "Message restored successfully.",

                message

            );

        } catch (error) {

            return next(error);

        }

          /*
    |--------------------------------------------------------------------------
    | Mark Message As Read
    |--------------------------------------------------------------------------
    */

    async markAsRead(req, res, next) {

        try {

            const { id } = req.params;

            const message = await Message.findById(id);

            if (!message) {

                return errorResponse(

                    res,

                    "Message not found.",

                    404

                );

            }

            message.read.isRead = true;

            message.read.readAt = new Date();

            if (req.user) {

                message.read.readBy = req.user._id;

            }

            await message.save();

            return successResponse(

                res,

                "Message marked as read.",

                message

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Archive Message
    |--------------------------------------------------------------------------
    */

    async archiveMessage(req, res, next) {

        try {

            const { id } = req.params;

            const message = await Message.findById(id);

            if (!message) {

                return errorResponse(

                    res,

                    "Message not found.",

                    404

                );

            }

            message.archived = true;

            message.archivedAt = new Date();

            await message.save();

            return successResponse(

                res,

                "Message archived successfully.",

                message

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Submit Customer Feedback
    |--------------------------------------------------------------------------
    */

    async feedback(req, res, next) {

        try {

            const { id } = req.params;

            const {

                liked,

                disliked,

                rating,

                comment

            } = req.body;

            const message = await Message.findById(id);

            if (!message) {

                return errorResponse(

                    res,

                    "Message not found.",

                    404

                );

            }

            message.feedback = {

                liked,

                disliked,

                rating,

                comment,

                submittedAt: new Date()

            };

            await message.save();

            return successResponse(

                res,

                "Feedback submitted successfully.",

                message.feedback

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Search Messages
    |--------------------------------------------------------------------------
    */

    async searchMessages(req, res, next) {

        try {

            const {

                q,

                conversationId

            } = req.query;

            const filter = {

                deleted: false

            };

            if (conversationId) {

                filter.conversation = conversationId;

            }

            if (q) {

                filter.$text = {

                    $search: q

                };

            }

            const messages = await Message.find(filter)

                .sort({

                    createdAt: -1

                })

                .limit(100);

            return successResponse(

                res,

                "Search completed.",

                messages

            );

        } catch (error) {

            return next(error);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Message Analytics
    |--------------------------------------------------------------------------
    */

    async analytics(req, res, next) {

        try {

            const { conversationId } = req.params;

            const stats = await Message.aggregate([

                {

                    $$match: {

    conversation: new mongoose.Types.ObjectId(

        conversationId

    ),

    deleted: false

}

                },

                {

                    $group: {

                        _id: "$role",

                        messages: {

                            $sum: 1

                        },

                        totalTokens: {

                            $sum: "$ai.totalTokens"

                        },

                        revenue: {

                            $sum: "$analytics.revenue"

                        }

                    }

                }

            ]);

            return successResponse(

                res,

                "Analytics fetched successfully.",

                stats

            );

        } catch (error) {

            return next(error);

        }

    }
      

            /*
            |--------------------------------------------------------------------------
            | Validation
            |--------------------------------------------------------------------------
            */

            if (!conversationId) {

                return errorResponse(

                    res,

                    "Conversation ID is required.",

                    400

                );

            }

            if (!visitorId) {

                return errorResponse(

                    res,

                    "Visitor ID is required.",

                    400

                );

            }

            if (

                !message ||

                !message.trim()

            ) {

                return errorResponse(

                    res,

                    "Message cannot be empty.",

                    400

                );

            }

            /*
            |--------------------------------------------------------------------------
            | Load Conversation
            |--------------------------------------------------------------------------
            */

            const conversation =

                await Conversation.findOne({

                    conversationId,

                    deleted: false

                })

                .populate("shop")

                .populate("visitor");

            if (!conversation) {

                return errorResponse(

                    res,

                    "Conversation not found.",

                    404

                );

            }

            /*
            |--------------------------------------------------------------------------
            | Load Visitor
            |--------------------------------------------------------------------------
            */

            const visitor =

                await Visitor.findById(

                    visitorId

                );

            if (!visitor) {

                return errorResponse(

                    res,

                    "Visitor not found.",

                    404

                );

            }

            /*
            |--------------------------------------------------------------------------
            | Load Shop
            |--------------------------------------------------------------------------
            */

            const shop =

                await Shop.findById(

                    conversation.shop

                );

            if (!shop) {

                return errorResponse(

                    res,

                    "Shop not found.",

                    404

                );

            }

            /*
            |--------------------------------------------------------------------------
            | Generate Message ID
            |--------------------------------------------------------------------------
            */

            const messageId =

                crypto.randomUUID();

            /*
            |--------------------------------------------------------------------------
            | Create Customer Message
            |--------------------------------------------------------------------------
            */

            const customerMessage =

                await Message.create({

                    conversation:

                        conversation._id,

                    shop:

                        shop._id,

                    visitor:

                        visitor._id,

                    messageId,

                    sequence:

                        conversation.totalMessages + 1,

                    role: "visitor",

                    messageType: "text",

                    content:

                        message.trim(),

                    plainText:

                        message.trim(),

                    language,

                    sender: {

                        senderType:

                            "Visitor",

                        senderId:

                            visitor._id,

                        name:

                            visitor.name ||

                            "Customer",

                        email:

                            visitor.email ||

                            "",

                        source:

                            "visitor"

                    },

                    delivery: {

                        status:

                            "delivered",

                        deliveredAt:

                            new Date()

                    }

                });

            /*
            |--------------------------------------------------------------------------
            | Continue In Part 2
            |--------------------------------------------------------------------------
            */
            /*
            |--------------------------------------------------------------------------
            | Generate AI Response
            |--------------------------------------------------------------------------
            */

            const aiResponse =

                await AIService.chat({

                    shop,

                    visitor,

                    conversation,

                    message:

                        customerMessage.content

                });

            /*
            |--------------------------------------------------------------------------
            | Generate AI Message ID
            |--------------------------------------------------------------------------
            */

            const aiMessageId =

                crypto.randomUUID();

            /*
            |--------------------------------------------------------------------------
            | Save Assistant Message
            |--------------------------------------------------------------------------
            */

            const assistantMessage =

                await Message.create({

                    conversation:

                        conversation._id,

                    shop:

                        shop._id,

                    visitor:

                        visitor._id,

                    messageId:

                        aiMessageId,

                    sequence:

                        conversation.totalMessages + 2,

                    role:

                        "assistant",

                    messageType:

                        aiResponse.messageType ||

                        "text",

                    content:

                        aiResponse.content,

                    plainText:

                        aiResponse.content,

                    language,

                    sender: {

                        senderType:

                            "AI",

                        name:

                            "Layboka AI",

                        source:

                            "ai"

                    },

                    ai: {

                        provider:

                            aiResponse.provider ||

                            "openai",

                        model:

                            aiResponse.model ||

                            "gpt-4o-mini",

                        promptTokens:

                            aiResponse.promptTokens || 0,

                        completionTokens:

                            aiResponse.completionTokens || 0,

                        totalTokens:

                            aiResponse.totalTokens || 0,

                        estimatedCost:

                            aiResponse.estimatedCost || 0,

                        responseTime:

                            aiResponse.responseTime || 0,

                        finishReason:

                            aiResponse.finishReason || ""

                    },

                    productCards:

                        aiResponse.productCards || [],

                    quickReplies:

                        aiResponse.quickReplies || [],

                    actions:

                        aiResponse.actions || [],

                    delivery: {

                        status:

                            "delivered",

                        deliveredAt:

                            new Date()

                    }

                });

            /*
            |--------------------------------------------------------------------------
            | Update Conversation
            |--------------------------------------------------------------------------
            */

            conversation.totalMessages += 2;

            conversation.userMessages += 1;

            conversation.aiMessages += 1;

            conversation.lastMessageAt =

                new Date();

            conversation.unreadMessages += 1;

            await conversation.save();

            /*
            |--------------------------------------------------------------------------
            | Recommendation Analytics
            |--------------------------------------------------------------------------
            */

            if (

                aiResponse.productCards &&

                aiResponse.productCards.length > 0

            ) {

                conversation.recommendationsGenerated +=

                    aiResponse.productCards.length;

                await conversation.save();

            }

            /*
            |--------------------------------------------------------------------------
            | Return Response
            |--------------------------------------------------------------------------
            */

            return successResponse(

                res,

                "Message sent successfully.",

                {

                    conversationId:

                        conversation.conversationId,

                    customerMessage,

                    assistantMessage,

                    aiResponse

                },

                201

            );

        } catch (error) {

            return next(error);

        }

              }
  /*
|--------------------------------------------------------------------------
| Message Controller Instance
|--------------------------------------------------------------------------
*/

const messageController = new MessageController();

/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    MessageController,

    messageController

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default messageController;
