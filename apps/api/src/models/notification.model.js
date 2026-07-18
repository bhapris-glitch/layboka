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
| Notification Schema
|--------------------------------------------------------------------------
*/

const NotificationSchema = new Schema(

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
        | User Information
        |--------------------------------------------------------------------------
        */

        user: {

            type:

                Schema.Types.ObjectId,

            ref:

                "User",

            default:

                null,

            index:

                true

        },


        /*
        |--------------------------------------------------------------------------
        | Notification Basics
        |--------------------------------------------------------------------------
        */

        title: {

            type:

                String,

            required:

                true,

            trim:

                true,

            maxlength:

                150

        },


        message: {

            type:

                String,

            required:

                true,

            trim:

                true,

            maxlength:

                2000

        },


        type: {

            type:

                String,

            enum: [

                "info",

                "success",

                "warning",

                "error",

                "billing",

                "subscription",

                "system"

            ],

            default:

                "info",

            index:

                true

        },
        /*
        |--------------------------------------------------------------------------
        | Read Status
        |--------------------------------------------------------------------------
        */

        isRead: {

            type:

                Boolean,

            default:

                false,

            index:

                true

        },


        readAt: {

            type:

                Date,

            default:

                null

        },


        /*
        |--------------------------------------------------------------------------
        | Priority
        |--------------------------------------------------------------------------
        */

        priority: {

            type:

                String,

            enum: [

                "low",

                "normal",

                "high",

                "critical"

            ],

            default:

                "normal",

            index:

                true

        },


        /*
        |--------------------------------------------------------------------------
        | Notification Action
        |--------------------------------------------------------------------------
        */

        actionLabel: {

            type:

                String,

            trim:

                true,

            maxlength:

                100,

            default:

                null

        },


        actionUrl: {

            type:

                String,

            trim:

                true,

            maxlength:

                500,

            default:

                null

        },


        /*
        |--------------------------------------------------------------------------
        | Display Assets
        |--------------------------------------------------------------------------
        */

        icon: {

            type:

                String,

            trim:

                true,

            default:

                null

        },


        image: {

            type:

                String,

            trim:

                true,

            default:

                null

        },
      
              /*
        |--------------------------------------------------------------------------
        | Category
        |--------------------------------------------------------------------------
        */

        category: {

            type:

                String,

            enum: [

                "general",

                "billing",

                "subscription",

                "payment",

                "trial",

                "security",

                "system",

                "marketing"

            ],

            default:

                "general",

            index:

                true

        },


        /*
        |--------------------------------------------------------------------------
        | Delivery Channel
        |--------------------------------------------------------------------------
        */

        channel: {

            type:

                String,

            enum: [

                "dashboard",

                "email",

                "push",

                "all"

            ],

            default:

                "dashboard"

        },


        /*
        |--------------------------------------------------------------------------
        | Expiration
        |--------------------------------------------------------------------------
        */

        expiresAt: {

            type:

                Date,

            default:

                null,

            index:

                true

        },


        /*
        |--------------------------------------------------------------------------
        | Created By
        |--------------------------------------------------------------------------
        */

        createdBy: {

            type:

                Schema.Types.ObjectId,

            ref:

                "User",

            default:

                null

        },


        /*
        |--------------------------------------------------------------------------
        | Metadata
        |--------------------------------------------------------------------------
        */

        metadata: {

            type:

                Schema.Types.Mixed,

            default: {}

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

NotificationSchema.index({

    shop: 1,

    isRead: 1,

    createdAt: -1

});


NotificationSchema.index({

    user: 1,

    isRead: 1

});


NotificationSchema.index({

    category: 1,

    type: 1

});


NotificationSchema.index({

    priority: 1,

    createdAt: -1

});


NotificationSchema.index({

    expiresAt: 1

});


/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

NotificationSchema.virtual(

    "isExpired"

).get(function () {

    if (

        !this.expiresAt

    ) {

        return false;

    }

    return (

        new Date() >

        this.expiresAt

    );

});
/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

NotificationSchema.statics.findByShop = function (

    shopId

) {

    return this.find({

        shop: shopId

    })

    .sort({

        createdAt: -1

    });

};


NotificationSchema.statics.findUnread = function (

    shopId

) {

    return this.find({

        shop: shopId,

        isRead: false

    })

    .sort({

        createdAt: -1

    });

};


NotificationSchema.statics.findByCategory = function (

    shopId,

    category

) {

    return this.find({

        shop: shopId,

        category

    })

    .sort({

        createdAt: -1

    });

};


/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

NotificationSchema.methods.markAsRead = async function () {

    this.isRead = true;

    this.readAt = new Date();

    await this.save();

    return this;

};


NotificationSchema.methods.markAsUnread = async function () {

    this.isRead = false;

    this.readAt = null;

    await this.save();

    return this;

};


NotificationSchema.methods.toJSON = function () {

    return this.toObject({

        virtuals: true

    });

};


/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Notification = model(

    "Notification",

    NotificationSchema

);


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    Notification

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default Notification;
