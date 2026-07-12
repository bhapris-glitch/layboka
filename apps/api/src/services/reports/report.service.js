/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import mongoose from "mongoose";

import Shop from "../../models/Shop.js";
import User from "../../models/User.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Visitor from "../../models/Visitor.js";
import Subscription from "../../models/Subscription.js";
import Order from "../../models/Order.js";
import Analytics from "../../models/Analytics.js";
import Invoice from "../../models/Invoice.js";

const { Types } = mongoose;

/*
|--------------------------------------------------------------------------
| Report Configuration
|--------------------------------------------------------------------------
*/

export const REPORT_CONFIG = {

    DEFAULT_DAYS: 30,

    MAX_DAYS: 365,

    TOP_PRODUCTS_LIMIT: 10,

    TOP_COUNTRIES_LIMIT: 10,

    RECENT_CONVERSATIONS: 10,

    DEFAULT_CURRENCY: "USD"

};

/*
|--------------------------------------------------------------------------
| Dashboard Overview
|--------------------------------------------------------------------------
*/

export async function getDashboardOverview(

    shopId

) {

    const [

        visitors,

        conversations,

        orders,

        subscriptions

    ] = await Promise.all([

        Visitor.countDocuments({

            shop: shopId

        }),

        Conversation.countDocuments({

            shop: shopId,

            deleted: false

        }),

        Order.countDocuments({

            shop: shopId,

            deleted: false

        }),

        Subscription.countDocuments({

            shop: shopId,

            status: "active"

        })

    ]);

    return {

        visitors,

        conversations,

        orders,

        activeSubscriptions: subscriptions

    };

}

/*
|--------------------------------------------------------------------------
| Revenue Summary
|--------------------------------------------------------------------------
*/

export async function getRevenueSummary(

    shopId

) {

    const revenue = await Order.aggregate([

        {

            $match: {

                shop: new Types.ObjectId(

                    shopId

                ),

                deleted: false,

                financialStatus: "paid"

            }

        },

        {

            $group: {

                _id: null,

                totalRevenue: {

                    $sum: "$totalPrice"

                },

                averageOrderValue: {

                    $avg: "$totalPrice"

                },

                totalOrders: {

                    $sum: 1

                }

            }

        }

    ]);

    return revenue[0] || {

        totalRevenue: 0,

        averageOrderValue: 0,

        totalOrders: 0

    };

}

/*
|--------------------------------------------------------------------------
| Conversation Summary
|--------------------------------------------------------------------------
*/

export async function getConversationSummary(

    shopId

) {

    const summary = await Conversation.aggregate([

        {

            $match: {

                shop: new Types.ObjectId(

                    shopId

                ),

                deleted: false

            }

        },

        {

            $group: {

                _id: "$status",

                total: {

                    $sum: 1

                }

            }

        }

    ]);

    return summary;

}
