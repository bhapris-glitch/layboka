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
| Payment Schema
|--------------------------------------------------------------------------
*/

const PaymentSchema = new Schema(

    {

        /*
        |--------------------------------------------------------------------------
        | Shop Information
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
        | Customer Information
        |--------------------------------------------------------------------------
        */

        customer: {

            type:

                Schema.Types.ObjectId,

            ref:

                "Customer",

            default:

                null,

            index:

                true

        },


        /*
        |--------------------------------------------------------------------------
        | Subscription Information
        |--------------------------------------------------------------------------
        */

        subscription: {

            type:

                Schema.Types.ObjectId,

            ref:

                "Subscription",

            required:

                true,

            index:

                true

        },
        /*
        |--------------------------------------------------------------------------
        | Payment Details
        |--------------------------------------------------------------------------
        */

        amount: {

            type:

                Number,

            required:

                true,

            min:

                0

        },


        currency: {

            type:

                String,

            default:

                "USD",

            uppercase:

                true,

            trim:

                true

        },


        status: {

            type:

                String,

            enum: [

                "pending",

                "processing",

                "paid",

                "failed",

                "cancelled",

                "refunded"

            ],

            default:

                "pending",

            index:

                true

        },


        paymentMethod: {

            type:

                String,

            enum: [

                "card",

                "bank_transfer",

                "wallet",

                "manual"

            ],

            default:

                "card"

        },


        /*
        |--------------------------------------------------------------------------
        | Payment Provider
        |--------------------------------------------------------------------------
        */

        provider: {

            type:

                String,

            enum: [

                "stripe"

            ],

            default:

                "stripe",

            index:

                true

        },


        providerPaymentId: {

            type:

                String,

            trim:

                true,

            default:

                null,

            index:

                true

        },


        providerCustomerId: {

            type:

                String,

            trim:

                true,

            default:

                null

        },


        providerSubscriptionId: {

            type:

                String,

            trim:

                true,

            default:

                null

        },
                /*
        |--------------------------------------------------------------------------
        | Invoice Information
        |--------------------------------------------------------------------------
        */

        invoiceNumber: {

            type:

                String,

            trim:

                true,

            default:

                null,

            index:

                true

        },


        description: {

            type:

                String,

            trim:

                true,

            maxlength:

                500,

            default:

                null

        },


        billingReason: {

            type:

                String,

            enum: [

                "trial",

                "subscription_create",

                "subscription_cycle",

                "subscription_upgrade",

                "subscription_downgrade",

                "manual",

                "refund"

            ],

            default:

                "subscription_cycle"

        },


        receiptUrl: {

            type:

                String,

            trim:

                true,

            default:

                null

        },


        invoiceUrl: {

            type:

                String,

            trim:

                true,

            default:

                null

        },


        /*
        |--------------------------------------------------------------------------
        | Failure Information
        |--------------------------------------------------------------------------
        */

        failureReason: {

            type:

                String,

            trim:

                true,

            default:

                null

        },


        failureCode: {

            type:

                String,

            trim:

                true,

            default:

                null

        },
                /*
        |--------------------------------------------------------------------------
        | Payment Lifecycle
        |--------------------------------------------------------------------------
        */

        paidAt: {

            type:

                Date,

            default:

                null

        },


        refundedAt: {

            type:

                Date,

            default:

                null

        },


        /*
        |--------------------------------------------------------------------------
        | Trial Information
        |--------------------------------------------------------------------------
        */

        trialStartedAt: {

            type:

                Date,

            default:

                null

        },


        trialEndsAt: {

            type:

                Date,

            default:

                null

        },


        /*
        |--------------------------------------------------------------------------
        | Additional Information
        |--------------------------------------------------------------------------
        */

        metadata: {

            type:

                Schema.Types.Mixed,

            default:

                {}

        },


        notes: {

            type:

                String,

            trim:

                true,

            maxlength:

                1000,

            default:

                null

        },
    },

    {

        timestamps: true,

        versionKey: false

    }

);


/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

PaymentSchema.index({

    shop: 1,

    createdAt: -1

});

PaymentSchema.index({

    subscription: 1,

    status: 1

});

PaymentSchema.index({

    providerPaymentId: 1

});

PaymentSchema.index({

    providerSubscriptionId: 1

});

PaymentSchema.index({

    invoiceNumber: 1

});

PaymentSchema.index({

    status: 1,

    paidAt: -1

});


/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

PaymentSchema.statics.findByShop = function (

    shopId

) {

    return this.find({

        shop: shopId

    });

};


PaymentSchema.statics.findBySubscription = function (

    subscriptionId

) {

    return this.find({

        subscription: subscriptionId

    });

};


PaymentSchema.statics.findSuccessfulPayments = function (

    shopId

) {

    return this.find({

        shop: shopId,

        status: "paid"

    });

};


/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

PaymentSchema.methods.isPaid = function () {

    return this.status === "paid";

};


PaymentSchema.methods.isTrial = function () {

    return this.billingReason === "trial";

};


PaymentSchema.methods.toJSON = function () {

    return this.toObject({

        virtuals: true

    });

};


/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Payment = model(

    "Payment",

    PaymentSchema

);


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {

    Payment

};

export default Payment;
