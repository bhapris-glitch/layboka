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
/*
|--------------------------------------------------------------------------
| Chatbot Appearance
|--------------------------------------------------------------------------
*/

themeColor: {

    type: String,

    default: "#FF3B2F"

},

headerColor: {

    type: String,

    default: "#1E3928"

},

backgroundColor: {

    type: String,

    default: "#FFFFFF"

},

textColor: {

    type: String,

    default: "#222222"

},

secondaryTextColor: {

    type: String,

    default: "#666666"

},

accentColor: {

    type: String,

    default: "#FFD54F"

},

fontFamily: {

    type: String,

    default: "Inter"

},

fontSize: {

    type: Number,

    default: 14

},

borderRadius: {

    type: Number,

    default: 16

},

shadowEnabled: {

    type: Boolean,

    default: true

},

animationEnabled: {

    type: Boolean,

    default: true

},


/*
|--------------------------------------------------------------------------
| Chat Widget Layout
|--------------------------------------------------------------------------
*/

chatPosition: {

    type: String,

    enum: [

        "left",

        "right"

    ],

    default: "right"

},

widgetWidth: {

    type: Number,

    default: 380

},

widgetHeight: {

    type: Number,

    default: 650

},

chatIcon: {

    type: String,

    default: "/assets/chatbot/chat-icon.png"

},

minimizeOnMobile: {

    type: Boolean,

    default: true

},

showBranding: {

    type: Boolean,

    default: true

},

darkMode: {

    type: Boolean,

    default: false

}
/*
|--------------------------------------------------------------------------
| Welcome Screen
|--------------------------------------------------------------------------
*/

welcomeEnabled: {

    type: Boolean,

    default: true

},

welcomeTitle: {

    type: String,

    default: "👋 Welcome!"

},

welcomeMessage: {

    type: String,

    default: "Hi! I'm your AI Sales Executive. How can I help you today?"

},

welcomeButton: {

    type: String,

    default: "Start Shopping"

},

showWelcomeOnlyOnce: {

    type: Boolean,

    default: true

},

autoOpenChat: {

    type: Boolean,

    default: false

},

autoOpenDelay: {

    type: Number,

    default: 5

},

couponCode: {

    type: String,

    default: ""

},

discountLabel: {

    type: String,

    default: ""

},

discountMessage: {

    type: String,

    default: ""

},


/*
|--------------------------------------------------------------------------
| AI Behavior
|--------------------------------------------------------------------------
*/

language: {

    type: String,

    default: "en"

},

aiTone: {

    type: String,

    enum: [

        "friendly",

        "professional",

        "sales",

        "luxury",

        "casual"

    ],

    default: "professional"

},

typingSpeed: {

    type: String,

    enum: [

        "slow",

        "normal",

        "fast",

        "instant"

    ],

    default: "normal"

},

typingIndicator: {

    type: Boolean,

    default: true

},

showOnlineStatus: {

    type: Boolean,

    default: true

},

showSeenStatus: {

    type: Boolean,

    default: true

},

enableSmartReplies: {

    type: Boolean,

    default: true

},

enableProductRecommendations: {

    type: Boolean,

    default: true

},

enableUpselling: {

    type: Boolean,

    default: true

},

enableCrossSelling: {

    type: Boolean,

    default: true

},


/*
|--------------------------------------------------------------------------
| Customer Experience
|--------------------------------------------------------------------------
*/

collectCustomerName: {

    type: Boolean,

    default: true

},

collectCustomerEmail: {

    type: Boolean,

    default: true

},

collectCustomerPhone: {

    type: Boolean,

    default: false

},

requireConsent: {

    type: Boolean,

    default: true

        }
