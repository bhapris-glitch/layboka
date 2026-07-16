/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import mongoose from "mongoose";

const {

    Schema,

    model

} = mongoose;


/*
|--------------------------------------------------------------------------
| Customer Schema
|--------------------------------------------------------------------------
*/

const CustomerSchema = new Schema(

{

    /*
    |--------------------------------------------------------------------------
    | Shop Reference
    |--------------------------------------------------------------------------
    */

    shop: {

        type: Schema.Types.ObjectId,

        ref: "Shop",

        required: true,

        index: true

    },

    /*
    |--------------------------------------------------------------------------
    | Shopify Information
    |--------------------------------------------------------------------------
    */

    shopifyCustomerId: {

        type: String,

        required: true,

        trim: true,

        index: true

    },

    /*
    |--------------------------------------------------------------------------
    | Basic Information
    |--------------------------------------------------------------------------
    */

    firstName: {

        type: String,

        default: "",

        trim: true

    },

    lastName: {

        type: String,

        default: "",

        trim: true

    },

    fullName: {

        type: String,

        default: "",

        trim: true

    },

    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    */

    email: {

        type: String,

        default: "",

        lowercase: true,

        trim: true,

        index: true

    },

    phone: {

        type: String,

        default: "",

        trim: true

    },

    acceptsMarketing: {

        type: Boolean,

        default: false

    },

    emailVerified: {

        type: Boolean,

        default: false

    },

    smsMarketing: {

        type: Boolean,

        default: false

    },
    /*
    |--------------------------------------------------------------------------
    | Address Information
    |--------------------------------------------------------------------------
    */

    defaultAddress: {

        firstName: {

            type: String,

            default: "",

            trim: true

        },

        lastName: {

            type: String,

            default: "",

            trim: true

        },

        company: {

            type: String,

            default: "",

            trim: true

        },

        address1: {

            type: String,

            default: "",

            trim: true

        },

        address2: {

            type: String,

            default: "",

            trim: true

        },

        city: {

            type: String,

            default: "",

            trim: true

        },

        province: {

            type: String,

            default: "",

            trim: true

        },

        country: {

            type: String,

            default: "",

            trim: true

        },

        zip: {

            type: String,

            default: "",

            trim: true

        },

        phone: {

            type: String,

            default: "",

            trim: true

        }

    },

    /*
    |--------------------------------------------------------------------------
    | Customer Statistics
    |--------------------------------------------------------------------------
    */

    totalOrders: {

        type: Number,

        default: 0,

        min: 0

    },

    totalSpent: {

        type: Number,

        default: 0,

        min: 0

    },

    averageOrderValue: {

        type: Number,

        default: 0,

        min: 0

    },

    lastOrderAt: {

        type: Date,

        default: null

    },

    /*
    |--------------------------------------------------------------------------
    | Customer Status
    |--------------------------------------------------------------------------
    */

    state: {

        type: String,

        enum: [

            "enabled",

            "disabled",

            "invited",

            "declined"

        ],

        default: "enabled",

        index: true

    },

    status: {

        type: String,

        enum: [

            "active",

            "inactive"

        ],

        default: "active",

        index: true

    },

    deleted: {

        type: Boolean,

        default: false,

        index: true

    },
       /*
    |--------------------------------------------------------------------------
    | Customer Preferences
    |--------------------------------------------------------------------------
    */

    preferredCurrency: {

        type: String,

        default: "USD",

        trim: true

    },

    preferredLanguage: {

        type: String,

        default: "en",

        trim: true

    },

    preferredLocale: {

        type: String,

        default: "en-US",

        trim: true

    },

    /*
    |--------------------------------------------------------------------------
    | Customer Tags
    |--------------------------------------------------------------------------
    */

    tags: [

        {

            type: String,

            trim: true

        }

    ],

    notes: {

        type: String,

        default: ""

    },

    /*
    |--------------------------------------------------------------------------
    | AI Customer Profile
    |--------------------------------------------------------------------------
    */

    customerSegment: {

        type: String,

        enum: [

            "new",

            "returning",

            "vip",

            "at_risk",

            "inactive"

        ],

        default: "new",

        index: true

    },

    customerScore: {

        type: Number,

        default: 0,

        min: 0

    },

    lifetimeValue: {

        type: Number,

        default: 0,

        min: 0

    },

    lastSeenAt: {

        type: Date,

        default: null

    },

    /*
    |--------------------------------------------------------------------------
    | Metadata
    |--------------------------------------------------------------------------
    */

    metadata: {

        type: Schema.Types.Mixed,

        default: {}

    },

    createdBy: {

        type: String,

        default: "shopify"

    },
        /*
    |--------------------------------------------------------------------------
    | AI & Marketing
    |--------------------------------------------------------------------------
    */

    aiOptIn: {

        type: Boolean,

        default: true

    },

    marketingConsentAt: {

        type: Date,

        default: null

    },

    lastContactedAt: {

        type: Date,

        default: null

    },

    emailCampaignCount: {

        type: Number,

        default: 0,

        min: 0

    },

    /*
    |--------------------------------------------------------------------------
    | Privacy
    |--------------------------------------------------------------------------
    */

    gdprConsent: {

        type: Boolean,

        default: false

    },

    gdprConsentAt: {

        type: Date,

        default: null

    },

    dataRedacted: {

        type: Boolean,

        default: false

    },

    /*
    |--------------------------------------------------------------------------
    | Synchronization
    |--------------------------------------------------------------------------
    */

    syncStatus: {

        type: String,

        enum: [

            "pending",

            "synced",

            "failed"

        ],

        default: "pending",

        index: true

    },

    lastSyncedAt: {

        type: Date,

        default: null

    },

    /*
    |--------------------------------------------------------------------------
    | Timestamps
    |--------------------------------------------------------------------------
    */
},
{

    timestamps: true,

    minimize: false

}

);
/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

CustomerSchema.virtual(

    "displayName"

).get(function () {

    if (

        this.fullName

    ) {

        return this.fullName;

    }

    return [

        this.firstName,

        this.lastName

    ]

        .filter(

            Boolean

        )

        .join(

            " "

        )

        .trim();

});


/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

CustomerSchema.methods.updateCustomerStatistics = async function (

    statistics = {}

) {

    if (

        statistics.totalOrders !== undefined

    ) {

        this.totalOrders =

            statistics.totalOrders;

    }

    if (

        statistics.totalSpent !== undefined

    ) {

        this.totalSpent =

            statistics.totalSpent;

    }

    if (

        statistics.averageOrderValue !== undefined

    ) {

        this.averageOrderValue =

            statistics.averageOrderValue;

    }

    if (

        statistics.lastOrderAt

    ) {

        this.lastOrderAt =

            statistics.lastOrderAt;

    }

    return this.save();

};


CustomerSchema.methods.markAsSynced = async function () {

    this.syncStatus =

        "synced";

    this.lastSyncedAt =

        new Date();

    return this.save();

};


CustomerSchema.methods.markAsDeleted = async function () {

    this.deleted = true;

    this.status = "inactive";

    return this.save();

};


/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

CustomerSchema.statics.findByShopifyCustomerId = function (

    shopId,

    shopifyCustomerId

) {

    return this.findOne({

        shop: shopId,

        shopifyCustomerId,

        deleted: false

    });

};


CustomerSchema.statics.findActiveCustomers = function (

    shopId

) {

    return this.find({

        shop: shopId,

        status: "active",

        deleted: false

    });

};


/*
|--------------------------------------------------------------------------
| JSON Transform
|--------------------------------------------------------------------------
*/

CustomerSchema.set(

    "toJSON",

    {

        virtuals: true,

        versionKey: false,

        transform(

            doc,

            ret

        ) {

            delete ret.__v;

            return ret;

        }

    }

);


/*
|--------------------------------------------------------------------------
| Model Export
|--------------------------------------------------------------------------
*/

const Customer = model(

    "Customer",

    CustomerSchema

);

export default Customer;
