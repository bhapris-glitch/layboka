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
    senderType: {
        type: String,
        enum: [
    "visitor",
    "user",
    "ai",
    "system"
]
        required: true
    },

    senderId: {
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

        requestId: {
    type: String,
    default: ""
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
    /*
    |--------------------------------------------------------------------------
    | Product Recommendation Cards
    |--------------------------------------------------------------------------
    */

    productCards: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                default: null
            },

            shopifyProductId: {
                type: String,
                default: ""
            },

            title: {
                type: String,
                default: ""
            },

            handle: {
                type: String,
                default: ""
            },

            image: {
                type: String,
                default: ""
            },

            price: {
                type: Number,
                default: 0
            },

            compareAtPrice: {
                type: Number,
                default: 0
            },

            currency: {
                type: String,
                default: "USD"
            },

            score: {
                type: Number,
                default: 0
            },

            variantId: {
    type: String,
    default: ""
},

            reason: {
                type: String,
                default: ""
            },

            clicked: {
                type: Boolean,
                default: false
            },

            clickedAt: {
                type: Date,
                default: null
            },

            addedToCart: {
                type: Boolean,
                default: false
            },

            addedToCartAt: {
                type: Date,
                default: null
            },

            purchased: {
                type: Boolean,
                default: false
            },

            purchasedAt: {
                type: Date,
                default: null
            }
        }
    ],

    /*
    |--------------------------------------------------------------------------
    | Attachments
    |--------------------------------------------------------------------------
    */

    attachments: [
        {
            type: {
                type: String,
                enum: [
                    "image",
                    "video",
                    "audio",
                    "document",
                    "pdf",
                    "csv",
                    "zip",
                    "other"
                ],
                default: "image"
            },

            fileName: {
                type: String,
                default: ""
            },

            originalName: {
                type: String,
                default: ""
            },

            mimeType: {
                type: String,
                default: ""
            },

            url: {
                type: String,
                default: ""
            },

            size: {
                type: Number,
                default: 0
            },

            width: {
                type: Number,
                default: 0
            },

            height: {
                type: Number,
                default: 0
            },

            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    /*
    |--------------------------------------------------------------------------
    | Tool Calls
    |--------------------------------------------------------------------------
    */

    toolCall: {

        enabled: {
            type: Boolean,
            default: false
        },

        toolName: {
            type: String,
            default: ""
        },

        toolId: {
            type: String,
            default: ""
        },

        arguments: {
            type: Schema.Types.Mixed,
            default: {}
        },

        result: {
            type: Schema.Types.Mixed,
            default: {}
        },

        success: {
            type: Boolean,
            default: true
        },

        executedAt: {
            type: Date,
            default: null
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Quick Replies
    |--------------------------------------------------------------------------
    */

    quickReplies: [
        {
            id: {
                type: String,
                default: ""
            },

            title: {
                type: String,
                default: ""
            },

            value: {
                type: String,
                default: ""
            },

            payload: {
                type: String,
                default: ""
            }
        }
    ],

    /*
    |--------------------------------------------------------------------------
    | Interactive Actions
    |--------------------------------------------------------------------------
    */

    actions: [
        {
            type: {
                type: String,
                enum: [
                    "button",
                    "link",
                    "product",
                    "checkout",
                    "cart",
                    "collection",
                    "discount",
                    "custom"
                ],
                default: "button"
            },

            title: {
                type: String,
                default: ""
            },

            label: {
                type: String,
                default: ""
            },

            value: {
                type: String,
                default: ""
            },

            url: {
                type: String,
                default: ""
            },

            style: {
                type: String,
                enum: [
                    "primary",
                    "secondary",
                    "danger",
                    "success"
                ],
                default: "primary"
            },

            opened: {
                type: Boolean,
                default: false
            },

            clickedAt: {
                type: Date,
                default: null
            }
        }
    ],

    /*
    |--------------------------------------------------------------------------
    | Customer Feedback
    |--------------------------------------------------------------------------
    */

    feedback: {

        liked: {
            type: Boolean,
            default: null
        },

        disliked: {
            type: Boolean,
            default: null
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        comment: {
            type: String,
            default: "",
            maxlength: 2000
        },

        reported: {
            type: Boolean,
            default: false
        },

        reportReason: {
            type: String,
            default: ""
        },

        submittedAt: {
            type: Date,
            default: null
        }

    },
        /*
    |--------------------------------------------------------------------------
    | Delivery Status
    |--------------------------------------------------------------------------
    */

    delivery: {

        status: {
            type: String,
            enum: [
                "pending",
                "sending",
                "sent",
                "delivered",
                "failed"
            ],
            default: "pending",
            index: true
        },

        deliveredAt: {
            type: Date,
            default: null
        },

        failureReason: {
            type: String,
            default: ""
        },

        attempts: {
    type: Number,
    default: 1
        },

        retryCount: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Read Status
    |--------------------------------------------------------------------------
    */

    read: {

        isRead: {
            type: Boolean,
            default: false,
            index: true
        },

        readAt: {
            type: Date,
            default: null
        },

        readBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Message Analytics
    |--------------------------------------------------------------------------
    */

    analytics: {

        impressions: {
            type: Number,
            default: 0
        },

        clicks: {
            type: Number,
            default: 0
        },

        productClicks: {
            type: Number,
            default: 0
        },

        linkClicks: {
            type: Number,
            default: 0
        },

        shares: {
    type: Number,
    default: 0
        },

        addToCartClicks: {
            type: Number,
            default: 0
        },

        checkoutClicks: {
            type: Number,
            default: 0
        },

        purchases: {
            type: Number,
            default: 0
        },

        revenue: {
            type: Number,
            default: 0
        },

        engagementScore: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | AI Performance
    |--------------------------------------------------------------------------
    */

    performance: {

        confidence: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        latency: {
            type: Number,
            default: 0
        },

        successful: {
            type: Boolean,
            default: true
        },

        fallback: {
            type: Boolean,
            default: false
        },

        hallucinationFlag: {
            type: Boolean,
            default: false
        },

        escalatedToHuman: {
            type: Boolean,
            default: false
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Internal Metadata
    |--------------------------------------------------------------------------
    */

    metadata: {

        ipAddress: {
            type: String,
            default: ""
        },

        userAgent: {
            type: String,
            default: ""
        },

        sourcePage: {
            type: String,
            default: ""
        },

        locale: {
            type: String,
            default: "en"
        },

        tags: [{
            type: String,
            trim: true
        }],

        custom: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {}
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Soft Delete
    |--------------------------------------------------------------------------
    */

    archived: {
        type: Boolean,
        default: false,
        index: true
    },

    archivedAt: {
        type: Date,
        default: null
    },

    deleted: {
        type: Boolean,
        default: false,
        index: true
    },

    deletedAt: {
        type: Date,
        default: null
    },

/*
|--------------------------------------------------------------------------
| Database Indexes
|--------------------------------------------------------------------------
*/

messageSchema.index({
    conversation: 1,
    sequence: 1
});

messageSchema.index({
    conversation: 1,
    createdAt: 1
});

messageSchema.index({
    shop: 1,
    createdAt: -1
});

messageSchema.index({
    visitor: 1,
    createdAt: -1
});

messageSchema.index({
    role: 1,
    createdAt: -1
});

messageSchema.index({
    "delivery.status": 1
});

messageSchema.index({
    "read.isRead": 1
});

messageSchema.index({
    deleted: 1,
    archived: 1
});

messageSchema.index({
    content: "text",
    plainText: "text",
    markdown: "text"
});
},
{
    timestamps: true,
    versionKey: false
});
/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

messageSchema.virtual("isAI").get(function () {
    return this.role === "assistant";
});

messageSchema.virtual("isVisitor").get(function () {
    return this.role === "visitor";
});

messageSchema.virtual("isHuman").get(function () {
    return this.role === "human";
});

messageSchema.virtual("isSystem").get(function () {
    return this.role === "system";
});

messageSchema.virtual("hasAttachments").get(function () {
    return this.attachments && this.attachments.length > 0;
});

messageSchema.virtual("hasProducts").get(function () {
    return this.productCards && this.productCards.length > 0;
});

messageSchema.virtual("readingTime").get(function () {
    if (!this.content) return 0;

    const words = this.content.trim().split(/\s+/).length;

    return Math.ceil(words / 200);
});

/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

messageSchema.methods.markAsRead = async function (userId = null) {

    this.read.isRead = true;
    this.read.readAt = new Date();

    if (userId) {
        this.read.readBy = userId;
    }

    return this.save();
};

messageSchema.methods.archive = async function () {

    this.archived = true;
    this.archivedAt = new Date();

    return this.save();
};

messageSchema.methods.softDelete = async function () {

    this.deleted = true;
    this.deletedAt = new Date();

    return this.save();
};

messageSchema.methods.incrementClicks = async function () {

    this.analytics.clicks += 1;

    return this.save();
};

messageSchema.methods.incrementProductClick = async function () {

    this.analytics.productClicks += 1;

    return this.save();
};

messageSchema.methods.incrementAddToCart = async function () {

    this.analytics.addToCartClicks += 1;

    return this.save();
};

messageSchema.methods.incrementCheckout = async function () {

    this.analytics.checkoutClicks += 1;

    return this.save();
};

messageSchema.methods.incrementPurchase = async function (amount = 0) {

    this.analytics.purchases += 1;
    this.analytics.revenue += amount;

    return this.save();
};

/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

messageSchema.statics.getConversationMessages = function (
    conversationId,
    options = {}
) {

    const limit = options.limit || 100;

    return this.find({
        conversation: conversationId,
        deleted: false
    })
        .sort({ sequence: 1 })
        .limit(limit);
};

messageSchema.statics.getUnreadMessages = function (
    conversationId
) {

    return this.find({
        conversation: conversationId,
        "read.isRead": false,
        deleted: false
    });
};

messageSchema.statics.getConversationCount = function (
    conversationId
) {

    return this.countDocuments({
        conversation: conversationId,
        deleted: false
    });
};

/*
|--------------------------------------------------------------------------
| Pre Save Middleware
|--------------------------------------------------------------------------
*/

messageSchema.pre("save", function (next) {

    if (!this.messageId) {

        this.messageId =
            new mongoose.Types.ObjectId().toString();

    }

    if (!this.ai.totalTokens) {

        this.ai.totalTokens =
            (this.ai.promptTokens || 0) +
            (this.ai.completionTokens || 0);

    }

    next();

});

/*
|--------------------------------------------------------------------------
| JSON Transform
|--------------------------------------------------------------------------
*/

messageSchema.set("toJSON", {

    virtuals: true,

    transform(doc, ret) {

        delete ret.__v;

        return ret;

    }

});

messageSchema.set("toObject", {
    virtuals: true
});

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

const Message =
    mongoose.models.Message ||
    mongoose.model("Message", messageSchema);

export default Message;
