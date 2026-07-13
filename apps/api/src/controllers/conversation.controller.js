/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import asyncHandler from "express-async-handler";

import Conversation from "../models/Conversation.js";

import Message from "../models/Message.js";

import ConversationService from "../services/conversation.service.js";

/*
|--------------------------------------------------------------------------
| Get All Conversations
|--------------------------------------------------------------------------
| GET /api/conversations
|--------------------------------------------------------------------------
*/

export const getConversations = asyncHandler(

    async (req, res) => {

        const {

            page = 1,

            limit = 20,

            status,

            search,

            visitor,

            shop

        } = req.query;

        const result = await ConversationService.getConversations({

            page: Number(page),

            limit: Number(limit),

            status,

            search,

            visitor,

            shop

        });

        return res.status(200).json({

            success: true,

            message: "Conversations fetched successfully.",

            ...result

        });

    }

);

/*
|--------------------------------------------------------------------------
| Get Single Conversation
|--------------------------------------------------------------------------
| GET /api/conversations/:id
|--------------------------------------------------------------------------
*/

export const getConversation = asyncHandler(

    async (req, res) => {

        const conversation = await Conversation.findById(

            req.params.id

        )

        .populate("visitor")

        .populate("shop")

        .populate("assignedTo")

        .lean();

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        const messages = await Message.find({

            conversation: conversation._id,

            deleted: false

        })

        .sort({

            sequence: 1

        })

        .lean();

        return res.status(200).json({

            success: true,

            conversation,

            messages

        });

    }

);
/*
|--------------------------------------------------------------------------
| Create Conversation
|--------------------------------------------------------------------------
| POST /api/conversations
|--------------------------------------------------------------------------
*/

export const createConversation = asyncHandler(

    async (req, res) => {

        const conversation =
            await ConversationService.createConversation(

                req.body

            );

        return res.status(201).json({

            success: true,

            message: "Conversation created successfully.",

            conversation

        });

    }

);

/*
|--------------------------------------------------------------------------
| Update Conversation
|--------------------------------------------------------------------------
| PUT /api/conversations/:id
|--------------------------------------------------------------------------
*/

export const updateConversation = asyncHandler(

    async (req, res) => {

        const conversation =
            await ConversationService.updateConversation(

                req.params.id,

                req.body

            );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        return res.status(200).json({

            success: true,

            message: "Conversation updated successfully.",

            conversation

        });

    }

);

/*
|--------------------------------------------------------------------------
| Archive Conversation
|--------------------------------------------------------------------------
| PATCH /api/conversations/:id/archive
|--------------------------------------------------------------------------
*/

export const archiveConversation = asyncHandler(

    async (req, res) => {

        const conversation =
            await Conversation.findById(

                req.params.id

            );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        conversation.archived = true;

        conversation.status = "archived";

        await conversation.save();

        return res.status(200).json({

            success: true,

            message: "Conversation archived successfully.",

            conversation

        });

    }

);

/*
|--------------------------------------------------------------------------
| Delete Conversation (Soft Delete)
|--------------------------------------------------------------------------
| DELETE /api/conversations/:id
|--------------------------------------------------------------------------
*/

export const deleteConversation = asyncHandler(

    async (req, res) => {

        const conversation =
            await Conversation.findById(

                req.params.id

            );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        conversation.deleted = true;

        await conversation.save();

        return res.status(200).json({

            success: true,

            message: "Conversation deleted successfully."

        });

    }

);
/*
|--------------------------------------------------------------------------
| Close Conversation
|--------------------------------------------------------------------------
| PATCH /api/conversations/:id/close
|--------------------------------------------------------------------------
*/

export const closeConversation = asyncHandler(

    async (req, res) => {

        const conversation = await Conversation.findById(

            req.params.id

        );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        conversation.status = "closed";

        conversation.endedAt = new Date();

        await conversation.save();

        return res.status(200).json({

            success: true,

            message: "Conversation closed successfully.",

            conversation

        });

    }

);

/*
|--------------------------------------------------------------------------
| Assign Conversation
|--------------------------------------------------------------------------
| PATCH /api/conversations/:id/assign
|--------------------------------------------------------------------------
*/

export const assignConversation = asyncHandler(

    async (req, res) => {

        const { userId } = req.body;

        const conversation = await Conversation.findById(

            req.params.id

        );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        conversation.assignedTo = userId;

        await conversation.save();

        return res.status(200).json({

            success: true,

            message: "Conversation assigned successfully.",

            conversation

        });

    }

);

/*
|--------------------------------------------------------------------------
| Request Human Handoff
|--------------------------------------------------------------------------
| PATCH /api/conversations/:id/handoff
|--------------------------------------------------------------------------
*/

export const requestHumanHandoff = asyncHandler(

    async (req, res) => {

        const conversation = await Conversation.findById(

            req.params.id

        );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        conversation.humanHandoff = true;

        conversation.handoffRequestedAt = new Date();

        conversation.status = "waiting";

        await conversation.save();

        return res.status(200).json({

            success: true,

            message: "Human handoff requested successfully.",

            conversation

        });

    }

);

/*
|--------------------------------------------------------------------------
| Resolve Conversation
|--------------------------------------------------------------------------
| PATCH /api/conversations/:id/resolve
|--------------------------------------------------------------------------
*/

export const resolveConversation = asyncHandler(

    async (req, res) => {

        const {

            resolution = "answered"

        } = req.body;

        const conversation = await Conversation.findById(

            req.params.id

        );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        conversation.status = "resolved";

        conversation.resolution = resolution;

        conversation.endedAt = new Date();

        await conversation.save();

        return res.status(200).json({

            success: true,

            message: "Conversation resolved successfully.",

            conversation

        });

    }

);
/*
|--------------------------------------------------------------------------
| Conversation Analytics
|--------------------------------------------------------------------------
| GET /api/conversations/analytics
|--------------------------------------------------------------------------
*/

export const analytics = asyncHandler(

    async (req, res) => {

        const data = await ConversationService.getAnalytics(

            req.query

        );

        return res.status(200).json({

            success: true,

            analytics: data

        });

    }

);

/*
|--------------------------------------------------------------------------
| Search Conversations
|--------------------------------------------------------------------------
| GET /api/conversations/search
|--------------------------------------------------------------------------
*/

export const searchConversations = asyncHandler(

    async (req, res) => {

        const {

            q = "",

            page = 1,

            limit = 20

        } = req.query;

        const conversations =

            await ConversationService.searchConversations({

                query: q,

                page: Number(page),

                limit: Number(limit)

            });

        return res.status(200).json({

            success: true,

            ...conversations

        });

    }

);

/*
|--------------------------------------------------------------------------
| Get Visitor Conversations
|--------------------------------------------------------------------------
| GET /api/conversations/visitor/:visitorId
|--------------------------------------------------------------------------
*/

export const getVisitorConversations = asyncHandler(

    async (req, res) => {

        const conversations = await Conversation.find({

            visitor: req.params.visitorId,

            deleted: false

        })

        .sort({

            lastMessageAt: -1

        })

        .populate("shop")

        .populate("assignedTo")

        .lean();

        return res.status(200).json({

            success: true,

            count: conversations.length,

            conversations

        });

    }

);

/*
|--------------------------------------------------------------------------
| Export Conversation
|--------------------------------------------------------------------------
| GET /api/conversations/:id/export
|--------------------------------------------------------------------------
*/

export const exportConversation = asyncHandler(

    async (req, res) => {

        const conversation = await Conversation.findById(

            req.params.id

        )

        .populate("visitor")

        .populate("shop")

        .lean();

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message: "Conversation not found."

            });

        }

        const messages = await Message.find({

            conversation: conversation._id,

            deleted: false

        })

        .sort({

            sequence: 1

        })

        .lean();

        return res.status(200).json({

            success: true,

            exportedAt: new Date(),

            conversation,

            messages

        });

    }

);
/*
|--------------------------------------------------------------------------
| Conversation Controller
|--------------------------------------------------------------------------
*/

export const ConversationController = {

    getConversations,

    getConversation,

    createConversation,

    updateConversation,

    archiveConversation,

    deleteConversation,

    closeConversation,

    assignConversation,

    requestHumanHandoff,

    resolveConversation,

    analytics,

    searchConversations,

    getVisitorConversations,

    exportConversation

};

/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    getConversations,

    getConversation,

    createConversation,

    updateConversation,

    archiveConversation,

    deleteConversation,

    closeConversation,

    assignConversation,

    requestHumanHandoff,

    resolveConversation,

    analytics,

    searchConversations,

    getVisitorConversations,

    exportConversation

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ConversationController;
