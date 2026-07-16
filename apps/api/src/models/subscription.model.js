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
| Subscription Schema
|--------------------------------------------------------------------------
*/

const subscriptionSchema = new Schema(

    {

        /*
        |--------------------------------------------------------------------------
        | Shop
        |--------------------------------------------------------------------------
        */

        shop: {

            type:

                Schema.Types.ObjectId,

            ref:

                "Shop",

            required:

                true,

            index:

                true

        },


        /*
        |--------------------------------------------------------------------------
        | Plan Information
        |--------------------------------------------------------------------------
        */

        plan: {

            type:

                String,

            enum: [

                "starter",

                "growth",

                "premium",

                "enterprise"

            ],

            default:

                "starter",

            index:

                true

        },

        planName: {

            type:

                String,

            default:

                "Starter"

        },


        /*
        |--------------------------------------------------------------------------
        | Subscription Status
        |--------------------------------------------------------------------------
        */

        status: {

            type:

                String,

            enum: [

                "trial",

                "active",

                "past_due",

                "cancelled",

                "expired",

                "inactive"

            ],

            default:

                "trial",

            index:

                true

        }

    
/*
|--------------------------------------------------------------------------
| Stripe Billing Information
|--------------------------------------------------------------------------
*/
        
stripeCustomerId: {

    type:

        String,

    default:

        null,

    index:

        true

},


stripeSubscriptionId: {

    type:

        String,

    default:

        null,

    index:

        true

},


stripePriceId: {

    type:

        String,

    default:

        null

},


/*
|--------------------------------------------------------------------------
| Billing Cycle
|--------------------------------------------------------------------------
*/

billingCycle: {

    type:

        String,

    enum: [

        "monthly",

        "yearly"

    ],

    default:

        "monthly"

},


/*
|--------------------------------------------------------------------------
| Currency
|--------------------------------------------------------------------------
*/

currency: {

    type:

        String,

    enum: [

        "USD",

        "INR"

    ],

    default:

        "USD"

},

/*
|--------------------------------------------------------------------------
| Trial Management
|--------------------------------------------------------------------------
*/

trialStart: {

    type:

        Date,

    default:

        Date.now

},


trialEnd: {

    type:

        Date,

    default:

        function() {

            const date = new Date();

            date.setDate(

                date.getDate() + 5

            );

            return date;

        }

},


trialDays: {

    type:

        Number,

    default:

        5

},


/*
|--------------------------------------------------------------------------
| Subscription Period
|--------------------------------------------------------------------------
*/

currentPeriodStart: {

    type:

        Date,

    default:

        null

},


currentPeriodEnd: {

    type:

        Date,

    default:

        null

},


/*
|--------------------------------------------------------------------------
| Cancellation
|--------------------------------------------------------------------------
*/

cancelAtPeriodEnd: {

    type:

        Boolean,

    default:

        false

},


cancelledAt: {

    type:

        Date,

    default:

        null

},


/*
|--------------------------------------------------------------------------
| Usage Limits
|--------------------------------------------------------------------------
*/

monthlyMessageLimit: {

    type:

        Number,

    default:

        500

},


monthlyMessageUsed: {

    type:

        Number,

    default:

        0

},


monthlyTokenLimit: {

    type:

        Number,

    default:

        10000

},


monthlyTokenUsed: {

    type:

        Number,

    default:

        0

}
},

    {

        timestamps: true,

        versionKey: false

    }

);

/*
|--------------------------------------------------------------------------
| Stripe Billing Information
|--------------------------------------------------------------------------
*/

stripeCustomerId: {

    type:

        String,

    default:

        null,

    index:

        true

},


stripeSubscriptionId: {

    type:

        String,

    default:

        null,

    index:

        true

},


stripePriceId: {

    type:

        String,

    default:

        null

},


/*
|--------------------------------------------------------------------------
| Billing Cycle
|--------------------------------------------------------------------------
*/

billingCycle: {

    type:

        String,

    enum: [

        "monthly",

        "yearly"

    ],

    default:

        "monthly"

},


/*
|--------------------------------------------------------------------------
| Currency
|--------------------------------------------------------------------------
*/

currency: {

    type:

        String,

    enum: [

        "USD",

        "INR"

    ],

    default:

        "USD"

},
/*
|--------------------------------------------------------------------------
| Schema Indexes
|--------------------------------------------------------------------------
*/

subscriptionSchema.index({

    shop: 1,

    status: 1

});

subscriptionSchema.index({

    stripeCustomerId: 1

});

subscriptionSchema.index({

    stripeSubscriptionId: 1

});


/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

subscriptionSchema.methods.isTrialActive = function () {

    return (

        this.status === "trial" &&

        this.trialEnd &&

        this.trialEnd > new Date()

    );

};


subscriptionSchema.methods.isActive = function () {

    return (

        this.status === "active" ||

        this.isTrialActive()

    );

};


subscriptionSchema.methods.hasUsageRemaining = function () {

    return (

        this.monthlyMessageUsed <

        this.monthlyMessageLimit

    );

};


subscriptionSchema.methods.incrementUsage = async function (

    messages = 1,

    tokens = 0

) {

    this.monthlyMessageUsed +=

        messages;

    this.monthlyTokenUsed +=

        tokens;

    this.lastUsageAt =

        new Date();

    return this.save();

};


subscriptionSchema.methods.resetUsage = async function () {

    this.monthlyMessageUsed = 0;

    this.monthlyTokenUsed = 0;

    this.usageResetAt = new Date();

    return this.save();

};


/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

subscriptionSchema.statics.findByShop = function (

    shopId

) {

    return this.findOne({

        shop: shopId

    });

};


subscriptionSchema.statics.findActive = function () {

    return this.find({

        status: {

            $in: [

                "trial",

                "active"

            ]

        }

    });

};


/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Subscription = model(

    "Subscription",

    subscriptionSchema

);


/*
|--------------------------------------------------------------------------
| Named Export
|--------------------------------------------------------------------------
*/

export {

    Subscription

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default Subscription;
