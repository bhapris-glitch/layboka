/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Admin Service
|--------------------------------------------------------------------------
|
| Provides administrative operations for the Layboka SaaS platform.
|
| Responsibilities include:
|
| • Admin dashboard data
| • Merchant management
| • Subscription monitoring
| • Revenue monitoring
| • System statistics
| • User management
| • Platform-level administration
|
|--------------------------------------------------------------------------
*/

import User from "../../models/User.js";

import Shop from "../../models/Shop.js";

import Subscription from "../../models/Subscription.js";

import Order from "../../models/Order.js";

import Product from "../../models/Product.js";

import Customer from "../../models/Customer.js";

import Analytics from "../../models/Analytics.js";

import Conversation from "../../models/Conversation.js";

import Invoice from "../../models/Invoice.js";

import EnterpriseLead from "../../models/EnterpriseLead.js";

import Notification from "../../models/notification.model.js";

import logger from "../../utils/logger.js";


/*
|--------------------------------------------------------------------------
| Admin Service Configuration
|--------------------------------------------------------------------------
*/

const ADMIN_SERVICE_NAME =

    "Layboka Admin Service";

const ADMIN_SERVICE_VERSION =

    "1.0.0";


/*
|--------------------------------------------------------------------------
| Pagination Defaults
|--------------------------------------------------------------------------
*/

const DEFAULT_PAGE = 1;

const DEFAULT_LIMIT = 20;

const MAX_LIMIT = 100;


/*
|--------------------------------------------------------------------------
| Admin Roles
|--------------------------------------------------------------------------
*/

export const ADMIN_ROLES = Object.freeze({

    ADMIN: "admin",

    SUPER_ADMIN: "super_admin"

});


/*
|--------------------------------------------------------------------------
| Admin Service Startup
|--------------------------------------------------------------------------
*/

logger.info(

    `${ADMIN_SERVICE_NAME} initialized.`,

    {

        version:

            ADMIN_SERVICE_VERSION

    }

);
/*
|--------------------------------------------------------------------------
| Get Platform Overview
|--------------------------------------------------------------------------
*/

export const getPlatformOverview = async () => {

    try {

        const [

            totalUsers,

            totalMerchants,

            totalShops,

            totalSubscriptions,

            activeSubscriptions,

            totalOrders,

            totalProducts,

            totalCustomers,

            totalConversations,

            totalEnterpriseLeads

        ] = await Promise.all([

            User.countDocuments(),

            User.countDocuments({

                role: "merchant"

            }),

            Shop.countDocuments(),

            Subscription.countDocuments(),

            Subscription.countDocuments({

                status: "active"

            }),

            Order.countDocuments(),

            Product.countDocuments(),

            Customer.countDocuments(),

            Conversation.countDocuments(),

            EnterpriseLead.countDocuments()

        ]);


        logger.info(

            "Admin platform overview generated.",

            {

                totalUsers,

                totalMerchants,

                totalShops,

                totalSubscriptions

            }

        );


        return {

            users: {

                total:

                    totalUsers,

                merchants:

                    totalMerchants

            },

            shops: {

                total:

                    totalShops

            },

            subscriptions: {

                total:

                    totalSubscriptions,

                active:

                    activeSubscriptions

            },

            commerce: {

                orders:

                    totalOrders,

                products:

                    totalProducts,

                customers:

                    totalCustomers

            },

            engagement: {

                conversations:

                    totalConversations

            },

            enterprise: {

                leads:

                    totalEnterpriseLeads

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate platform overview.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Admin Dashboard Statistics
|--------------------------------------------------------------------------
*/

export const getDashboardStatistics = async () => {

    try {

        const [

            totalUsers,

            activeUsers,

            totalMerchants,

            totalShops,

            activeShops,

            activeSubscriptions,

            trialSubscriptions,

            cancelledSubscriptions,

            expiredSubscriptions,

            totalOrders,

            totalProducts,

            totalCustomers

        ] = await Promise.all([

            User.countDocuments(),

            User.countDocuments({

                isActive: true

            }),

            User.countDocuments({

                role: "merchant"

            }),

            Shop.countDocuments(),

            Shop.countDocuments({

                installed: true

            }),

            Subscription.countDocuments({

                status: "active"

            }),

            Subscription.countDocuments({

                status: "trial"

            }),

            Subscription.countDocuments({

                status: "cancelled"

            }),

            Subscription.countDocuments({

                status: "expired"

            }),

            Order.countDocuments(),

            Product.countDocuments(),

            Customer.countDocuments()

        ]);


        return {

            users: {

                total:

                    totalUsers,

                active:

                    activeUsers,

                merchants:

                    totalMerchants

            },

            shops: {

                total:

                    totalShops,

                active:

                    activeShops

            },

            subscriptions: {

                active:

                    activeSubscriptions,

                trial:

                    trialSubscriptions,

                cancelled:

                    cancelledSubscriptions,

                expired:

                    expiredSubscriptions

            },

            commerce: {

                orders:

                    totalOrders,

                products:

                    totalProducts,

                customers:

                    totalCustomers

            },

            generatedAt:

                new Date()

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate admin dashboard statistics.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Merchant Statistics
|--------------------------------------------------------------------------
*/

export const getMerchantStatistics = async () => {

    try {

        const [

            total,

            active,

            inactive,

            admins,

            superAdmins

        ] = await Promise.all([

            User.countDocuments({

                role: "merchant"

            }),

            User.countDocuments({

                role: "merchant",

                isActive: true

            }),

            User.countDocuments({

                role: "merchant",

                isActive: false

            }),

            User.countDocuments({

                role: "admin"

            }),

            User.countDocuments({

                role: "super_admin"

            })

        ]);


        return {

            total,

            active,

            inactive,

            admins,

            superAdmins

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate merchant statistics.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Subscription Statistics
|--------------------------------------------------------------------------
*/

export const getSubscriptionStatistics = async () => {

    try {

        const [

            total,

            active,

            trial,

            cancelled,

            expired,

            pastDue

        ] = await Promise.all([

            Subscription.countDocuments(),

            Subscription.countDocuments({

                status: "active"

            }),

            Subscription.countDocuments({

                status: "trial"

            }),

            Subscription.countDocuments({

                status: "cancelled"

            }),

            Subscription.countDocuments({

                status: "expired"

            }),

            Subscription.countDocuments({

                status: "past_due"

            })

        ]);


        return {

            total,

            active,

            trial,

            cancelled,

            expired,

            pastDue

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate subscription statistics.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};
/*
|--------------------------------------------------------------------------
| Get Revenue Statistics
|--------------------------------------------------------------------------
*/

export const getRevenueStatistics = async () => {

    try {

        const revenueResult =

            await Order.aggregate([

                {
                    $match: {

                        financialStatus: {

                            $in: [

                                "paid",

                                "partially_paid"

                            ]

                        }

                    }

                },

                {

                    $group: {

                        _id: null,

                        totalRevenue: {

                            $sum: {

                                $ifNull: [

                                    "$totalPrice",

                                    0

                                ]

                            }

                        },

                        totalOrders: {

                            $sum: 1

                        },

                        averageOrderValue: {

                            $avg: {

                                $ifNull: [

                                    "$totalPrice",

                                    0

                                ]

                            }

                        }

                    }

                }

            ]);


        const result =

            revenueResult[0] ||

            {

                totalRevenue: 0,

                totalOrders: 0,

                averageOrderValue: 0

            };


        return {

            totalRevenue:

                result.totalRevenue,

            totalOrders:

                result.totalOrders,

            averageOrderValue:

                result.averageOrderValue

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate revenue statistics.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Order Statistics
|--------------------------------------------------------------------------
*/

export const getOrderStatistics = async () => {

    try {

        const [

            total,

            paid,

            pending,

            cancelled,

            refunded

        ] = await Promise.all([

            Order.countDocuments(),

            Order.countDocuments({

                financialStatus: "paid"

            }),

            Order.countDocuments({

                financialStatus: "pending"

            }),

            Order.countDocuments({

                cancelledAt: {

                    $ne: null

                }

            }),

            Order.countDocuments({

                financialStatus: "refunded"

            })

        ]);


        return {

            total,

            paid,

            pending,

            cancelled,

            refunded

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate order statistics.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Product Statistics
|--------------------------------------------------------------------------
*/

export const getProductStatistics = async () => {

    try {

        const [

            total,

            active,

            draft,

            archived

        ] = await Promise.all([

            Product.countDocuments(),

            Product.countDocuments({

                status: "active"

            }),

            Product.countDocuments({

                status: "draft"

            }),

            Product.countDocuments({

                status: "archived"

            })

        ]);


        return {

            total,

            active,

            draft,

            archived

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate product statistics.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Customer Statistics
|--------------------------------------------------------------------------
*/

export const getCustomerStatistics = async () => {

    try {

        const [

            total,

            active,

            subscribed,

            guests

        ] = await Promise.all([

            Customer.countDocuments(),

            Customer.countDocuments({

                isActive: true

            }),

            Customer.countDocuments({

                acceptsMarketing: true

            }),

            Customer.countDocuments({

                acceptsMarketing: false

            })

        ]);


        return {

            total,

            active,

            subscribed,

            guests

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate customer statistics.",

            {

                error:

                    error.message

            }

        );

        throw error;

    }

};
