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
| Merchant Settings Schema
|--------------------------------------------------------------------------
*/

const merchantSettingsSchema = new Schema(

{

    /*
    |--------------------------------------------------------------------------
    | Shop
    |--------------------------------------------------------------------------
    */

    shop: {

        type: Schema.Types.ObjectId,

        ref: "Shop",

        required: true,

        unique: true,

        index: true

    },


    /*
    |--------------------------------------------------------------------------
    | AI Sales Executive
    |--------------------------------------------------------------------------
    */

    salesExecutiveName: {

        type: String,

        default: "Emma",

        trim: true

    },

    avatar: {

        type: String,

        default: "/assets/avatars/emma.png"

    },

    avatarType: {

        type: String,

        enum: [

            "female",

            "male",

            "custom"

        ],

        default: "female"

    },

    onlineStatus: {

        type: Boolean,

        default: true

    },


    /*
    |--------------------------------------------------------------------------
    | Store Branding
    |--------------------------------------------------------------------------
    */

    storeName: {

        type: String,

        default: ""

    },

    chatbotHeader: {

        type: String,

        default: ""

    },

    companyName: {

        type: String,

        default: ""

    },

    logo: {

        type: String,

        default: ""

    },

    favicon: {

        type: String,

        default: ""

    }

},

{

    timestamps: true,

    versionKey: false

}

);
