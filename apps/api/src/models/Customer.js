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
