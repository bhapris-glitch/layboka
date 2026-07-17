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
| Analytics Schema
|--------------------------------------------------------------------------
*/

const AnalyticsSchema = new Schema(

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
        | Time Period
        |--------------------------------------------------------------------------
        */

        date: {

            type:

                Date,

            required:

                true,

            index:

                true

        },


        period: {

            type:

                String,

            enum: [

                "daily",

                "weekly",

                "monthly",

                "yearly"

            ],

            default:

                "daily",

            index:

                true

        },
              /*
        |--------------------------------------------------------------------------
        | Sales Metrics
        |--------------------------------------------------------------------------
        */

        orders: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        revenue: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        averageOrderValue: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        refunds: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        refundAmount: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        /*
        |--------------------------------------------------------------------------
        | Conversion Metrics
        |--------------------------------------------------------------------------
        */

        visitors: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        productsViewed: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        productsPurchased: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        cartsCreated: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        checkoutsStarted: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        conversionRate: {

            type:

                Number,

            default:

                0,

            min:

                0

        },
              /*
        |--------------------------------------------------------------------------
        | AI Analytics
        |--------------------------------------------------------------------------
        */

        aiConversations: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        messagesSent: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        tokensUsed: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        productsRecommended: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        cartRecoveries: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        revenueGeneratedByAI: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        /*
        |--------------------------------------------------------------------------
        | Customer Experience
        |--------------------------------------------------------------------------
        */

        customerSatisfaction: {

            type:

                Number,

            default:

                0,

            min:

                0,

            max:

                5

        },


        positiveFeedback: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        negativeFeedback: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        averageResponseTime: {

            type:

                Number,

            default:

                0,

            min:

                0

        },


        resolvedChats: {

            type:

                Number,

            default:

                0,

            min:

                0

        },
              /*
        |--------------------------------------------------------------------------
        | Top Performance
        |--------------------------------------------------------------------------
        */

        topProducts: [

            {

                productId: {

                    type:

                        Schema.Types.ObjectId,

                    ref:

                        "Product"

                },

                title: {

                    type:

                        String,

                    trim:

                        true

                },

                views: {

                    type:

                        Number,

                    default:

                        0

                },

                purchases: {

                    type:

                        Number,

                    default:

                        0

                },

                revenue: {

                    type:

                        Number,

                    default:

                        0

                }

            }

        ],


        topPages: [

            {

                path: {

                    type:

                        String,

                    trim:

                        true

                },

                views: {

                    type:

                        Number,

                    default:

                        0

                }

            }

        ],


        topReferrers: [

            {

                source: {

                    type:

                        String,

                    trim:

                        true

                },

                visits: {

                    type:

                        Number,

                    default:

                        0

                }

            }

        ],


        /*
        |--------------------------------------------------------------------------
        | Geographic Analytics
        |--------------------------------------------------------------------------
        */

        countryStats: [

            {

                country: {

                    type:

                        String,

                    trim:

                        true

                },

                visitors: {

                    type:

                        Number,

                    default:

                        0

                },

                orders: {

                    type:

                        Number,

                    default:

                        0

                },

                revenue: {

                    type:

                        Number,

                    default:

                        0

                }

            }

        ],


        /*
        |--------------------------------------------------------------------------
        | Device Analytics
        |--------------------------------------------------------------------------
        */

        deviceStats: [

            {

                device: {

                    type:

                        String,

                    enum: [

                        "desktop",

                        "tablet",

                        "mobile",

                        "other"

                    ]

                },

                visitors: {

                    type:

                        Number,

                    default:

                        0

                },

                conversions: {

                    type:

                        Number,

                    default:

                        0

                }

            }

        ],


        /*
        |--------------------------------------------------------------------------
        | Metadata
        |--------------------------------------------------------------------------
        */

        metadata: {

            type:

                Schema.Types.Mixed,

            default:

                {}

          }
      },

{
    timestamps: true,

    versionKey: false
}


/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

AnalyticsSchema.index({

    shop: 1,

    date: -1

});

AnalyticsSchema.index({

    shop: 1,

    period: 1

});

AnalyticsSchema.index({

    period: 1,

    date: -1

});


/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

AnalyticsSchema.statics.findByShop = function (

    shopId

) {

    return this.find({

        shop: shopId

    });

};


AnalyticsSchema.statics.findByPeriod = function (

    period

) {

    return this.find({

        period

    });

};


/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

AnalyticsSchema.methods.toJSON = function () {

    return this.toObject({

        virtuals: true

    });

};


/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Analytics = model(

    "Analytics",

    AnalyticsSchema

);


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {

    Analytics

};

export default Analytics;
