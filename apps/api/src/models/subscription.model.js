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

    },

    {

        timestamps: true,

        versionKey: false

    }

);
