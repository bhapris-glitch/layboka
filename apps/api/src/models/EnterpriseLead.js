import mongoose from "mongoose";

const { Schema } = mongoose;

const enterpriseLeadSchema = new Schema(
{
    /*
    |--------------------------------------------------------------------------
    | Lead Identity
    |--------------------------------------------------------------------------
    */

    leadId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },

    /*
    |--------------------------------------------------------------------------
    | Company Information
    |--------------------------------------------------------------------------
    */

    companyName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    website: {
        type: String,
        required: true,
        trim: true
    },

    shopifyStore: {
        type: String,
        default: "",
        trim: true
    },

    industry: {
        type: String,
        default: ""
    },

    companySize: {
        type: String,
        enum: [
            "1-10",
            "11-50",
            "51-200",
            "201-500",
            "500+"
        ],
        default: "1-10"
    },

    annualRevenue: {
        type: String,
        default: ""
    },

    /*
    |--------------------------------------------------------------------------
    | Primary Contact
    |--------------------------------------------------------------------------
    */

    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    fullName: {
        type: String,
        default: ""
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },

    phone: {
        type: String,
        default: ""
    },

    jobTitle: {
        type: String,
        default: ""
    },

    country: {
        type: String,
        default: ""
    },

    timezone: {
        type: String,
        default: "UTC"
    },

    /*
    |--------------------------------------------------------------------------
    | Business Requirements
    |--------------------------------------------------------------------------
    */

    requirements: {
        type: String,
        required: true,
        maxlength: 10000
    },

    expectedMonthlyVisitors: {
        type: Number,
        default: 0
    },

    expectedMonthlyOrders: {
        type: Number,
        default: 0
    },

    expectedMonthlyChats: {
        type: Number,
        default: 0
    },

    currentChallenges: [{
        type: String,
        trim: true
    }],

    requestedFeatures: [{
        type: String,
        trim: true
    }],
      /*
    |--------------------------------------------------------------------------
    | Lead Status
    |--------------------------------------------------------------------------
    */

    status: {
        type: String,
        enum: [
            "new",
            "qualified",
            "contacted",
            "meeting-scheduled",
            "proposal-sent",
            "negotiation",
            "won",
            "lost",
            "closed"
        ],
        default: "new",
        index: true
    },

    leadSource: {
        type: String,
        enum: [
            "website",
            "pricing-page",
            "contact-form",
            "referral",
            "email",
            "linkedin",
            "partner",
            "manual"
        ],
        default: "pricing-page"
    },

    priority: {
        type: String,
        enum: [
            "low",
            "medium",
            "high",
            "urgent"
        ],
        default: "medium"
    },

    /*
    |--------------------------------------------------------------------------
    | Sales Pipeline
    |--------------------------------------------------------------------------
    */

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    lastContactAt: {
        type: Date,
        default: null
    },

    nextFollowUpAt: {
        type: Date,
        default: null
    },

    followUpCount: {
        type: Number,
        default: 0
    },

    contacted: {
        type: Boolean,
        default: false
    },

    /*
    |--------------------------------------------------------------------------
    | Demo Scheduling
    |--------------------------------------------------------------------------
    */

    demo: {

        requested: {
            type: Boolean,
            default: false
        },

        scheduled: {
            type: Boolean,
            default: false
        },

        scheduledAt: {
            type: Date,
            default: null
        },

        meetingLink: {
            type: String,
            default: ""
        },

        meetingPlatform: {
            type: String,
            enum: [
                "",
                "google-meet",
                "zoom",
                "teams"
            ],
            default: ""
        },

        completed: {
            type: Boolean,
            default: false
        },

        completedAt: {
            type: Date,
            default: null
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Enterprise Pricing
    |--------------------------------------------------------------------------
    */

    pricing: {

        estimatedMonthlyPrice: {
            type: Number,
            default: 0
        },

        currency: {
            type: String,
            default: "USD"
        },

        contractLengthMonths: {
            type: Number,
            default: 12
        },

        discountPercentage: {
            type: Number,
            default: 0
        },

        proposalSent: {
            type: Boolean,
            default: false
        },

        proposalSentAt: {
            type: Date,
            default: null
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Internal Notes
    |--------------------------------------------------------------------------
    */

    notes: [{
        message: {
            type: String,
            required: true
        },

        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    /*
    |--------------------------------------------------------------------------
    | AI Lead Qualification
    |--------------------------------------------------------------------------
    */

    aiQualification: {

        score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        intent: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "enterprise"
            ],
            default: "medium"
        },

        estimatedMRR: {
            type: Number,
            default: 0
        },

        estimatedAnnualValue: {
            type: Number,
            default: 0
        },

        recommendedPlan: {
            type: String,
            enum: [
                "Starter",
                "Growth",
                "Premium",
                "Enterprise"
            ],
            default: "Enterprise"
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Metadata
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

        referrer: {
            type: String,
            default: ""
        },

        utmSource: {
            type: String,
            default: ""
        },

        utmMedium: {
            type: String,
            default: ""
        },

        utmCampaign: {
            type: String,
            default: ""
        },

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
    }

},
{
    timestamps: true,
    versionKey: false
});

/*
|--------------------------------------------------------------------------
| Database Indexes
|--------------------------------------------------------------------------
*/

enterpriseLeadSchema.index({
    companyName: 1
});

enterpriseLeadSchema.index({
    website: 1
});

enterpriseLeadSchema.index({
    email: 1
});

enterpriseLeadSchema.index({
    shopifyStore: 1
});

enterpriseLeadSchema.index({
    status: 1,
    priority: 1
});

enterpriseLeadSchema.index({
    assignedTo: 1
});

enterpriseLeadSchema.index({
    nextFollowUpAt: 1
});

enterpriseLeadSchema.index({
    createdAt: -1
});

enterpriseLeadSchema.index({
    deleted: 1,
    archived: 1
});

/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

enterpriseLeadSchema.virtual("isOpen").get(function () {

    return ![
        "won",
        "lost",
        "closed"
    ].includes(this.status);

});

enterpriseLeadSchema.virtual("contactName").get(function () {

    return `${this.firstName} ${this.lastName}`.trim();

});

enterpriseLeadSchema.virtual("estimatedContractValue").get(function () {

    return (
        (this.pricing.estimatedMonthlyPrice || 0) *
        (this.pricing.contractLengthMonths || 12)
    );

});

/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

enterpriseLeadSchema.methods.archive = async function () {

    this.archived = true;
    this.archivedAt = new Date();

    return this.save();

};

enterpriseLeadSchema.methods.restore = async function () {

    this.archived = false;
    this.archivedAt = null;

    return this.save();

};

enterpriseLeadSchema.methods.softDelete = async function () {

    this.deleted = true;
    this.deletedAt = new Date();

    return this.save();

};

enterpriseLeadSchema.methods.restoreDeleted = async function () {

    this.deleted = false;
    this.deletedAt = null;

    return this.save();

};

enterpriseLeadSchema.methods.markContacted = async function () {

    this.contacted = true;
    this.lastContactAt = new Date();
    this.followUpCount += 1;

    return this.save();

};

enterpriseLeadSchema.methods.markWon = async function () {

    this.status = "won";

    return this.save();

};

enterpriseLeadSchema.methods.markLost = async function () {

    this.status = "lost";

    return this.save();

};

/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

enterpriseLeadSchema.statics.findOpenLeads = function () {

    return this.find({

        status: {
            $nin: [
                "won",
                "lost",
                "closed"
            ]
        },

        deleted: false

    });

};

enterpriseLeadSchema.statics.findAssignedTo = function (userId) {

    return this.find({

        assignedTo: userId,
        deleted: false

    });

};

enterpriseLeadSchema.statics.findFollowUps = function () {

    return this.find({

        nextFollowUpAt: {
            $lte: new Date()
        },

        deleted: false

    });

};

/*
|--------------------------------------------------------------------------
| Pre Save Middleware
|--------------------------------------------------------------------------
*/

enterpriseLeadSchema.pre("save", function (next) {

    this.fullName =
        `${this.firstName} ${this.lastName}`.trim();

    next();

});

/*
|--------------------------------------------------------------------------
| JSON Transform
|--------------------------------------------------------------------------
*/

enterpriseLeadSchema.set("toJSON", {

    virtuals: true,

    transform(doc, ret) {

        delete ret.__v;

        return ret;

    }

});

enterpriseLeadSchema.set("toObject", {
    virtuals: true
});

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

const EnterpriseLead =
    mongoose.models.EnterpriseLead ||
    mongoose.model(
        "EnterpriseLead",
        enterpriseLeadSchema
    );

export default EnterpriseLead;
