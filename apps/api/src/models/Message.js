import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
{
    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    conversation: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },

    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true
    },

    visitor: {
        type: Schema.Types.ObjectId,
        ref: "Visitor",
        required: true,
        index: true
    },

    merchant: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Message Identity
    |--------------------------------------------------------------------------
    */

    messageId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },

    sequence: {
        type: Number,
        default: 1,
        min: 1
    },

    parentMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Message Content
    |--------------------------------------------------------------------------
    */

    role: {
        type: String,
        enum: [
            "visitor",
            "assistant",
            "human",
            "system",
            "tool"
        ],
        required: true,
        index: true
    },

    messageType: {
        type: String,
        enum: [
            "text",
            "image",
            "file",
            "audio",
            "video",
            "product-card",
            "carousel",
            "quick-replies",
            "button",
            "system",
            "tool-call",
            "tool-result"
        ],
        default: "text"
    },

    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50000
    },

    plainText: {
        type: String,
        default: ""
    },

    html: {
        type: String,
        default: ""
    },

    markdown: {
        type: String,
        default: ""
    },

    language: {
        type: String,
        default: "en"
    },

    translated: {
        type: Boolean,
        default: false
    },

    /*
    |--------------------------------------------------------------------------
    | Sender Information
    |--------------------------------------------------------------------------
    */

    sender: {

        id: {
            type: Schema.Types.ObjectId,
            default: null
        },

        name: {
            type: String,
            default: ""
        },

        email: {
            type: String,
            default: ""
        },

        avatar: {
            type: String,
            default: ""
        },

        source: {
            type: String,
            enum: [
                "visitor",
                "ai",
                "merchant",
                "system"
            ],
            default: "visitor"
        }

    },

    /*
    |--------------------------------------------------------------------------
    | AI Metadata
    |--------------------------------------------------------------------------
    */

    ai: {

        provider: {
            type: String,
            enum: [
                "openai"
            ],
            default: "openai"
        },

        model: {
            type: String,
            enum: [
                "gpt-4o-mini",
                "gpt-5"
            ],
            default: "gpt-4o-mini"
        },

        promptTokens: {
            type: Number,
            default: 0,
            min: 0
        },

        completionTokens: {
            type: Number,
            default: 0,
            min: 0
        },

        totalTokens: {
            type: Number,
            default: 0,
            min: 0
        },

        estimatedCost: {
            type: Number,
            default: 0,
            min: 0
        },

        responseTime: {
            type: Number,
            default: 0
        },

        temperature: {
            type: Number,
            default: 0.7
        },

        finishReason: {
            type: String,
            default: ""
        },

        cached: {
            type: Boolean,
            default: false
        }

    },
