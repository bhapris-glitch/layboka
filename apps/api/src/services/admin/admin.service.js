/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Admin Service
|--------------------------------------------------------------------------
|
| Central service layer for administrative operations across the
| Layboka AI SaaS platform.
|
| Responsibilities:
|
| - Platform overview
| - Dashboard statistics
| - Merchant management
| - Shop management
| - Subscription management
| - Revenue statistics
| - Order statistics
| - Product statistics
| - Customer statistics
| - Admin user management
| - Platform activity
|
|--------------------------------------------------------------------------
*/

import User from "../../models/User.js";

import Shop from "../../models/Shop.js";

import Subscription from "../../models/Subscription.js";

import Order from "../../models/Order.js";

import Product from "../../models/Product.js";

import Customer from "../../models/Customer.js";

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
| Pagination Configuration
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
| User Roles
|--------------------------------------------------------------------------
*/

export const USER_ROLES = Object.freeze({

    MERCHANT: "merchant",

    ADMIN: "admin",

    SUPER_ADMIN: "super_admin"

});


/*
|--------------------------------------------------------------------------
| Subscription Plans
|--------------------------------------------------------------------------
*/

export const SUBSCRIPTION_PLANS = Object.freeze({

    STARTER: "starter",

    GROWTH: "growth",

    PREMIUM: "premium",

    ENTERPRISE: "enterprise"

});


/*
|--------------------------------------------------------------------------
| Subscription Statuses
|--------------------------------------------------------------------------
*/

export const SUBSCRIPTION_STATUS = Object.freeze({

    TRIAL: "trial",

    ACTIVE: "active",

    PAST_DUE: "past_due",

    CANCELLED: "cancelled",

    EXPIRED: "expired",

    PAUSED: "paused"

});


/*
|--------------------------------------------------------------------------
| Trial Configuration
|--------------------------------------------------------------------------
|
| Layboka official free trial duration:
|
| 5 Days
|
|--------------------------------------------------------------------------
*/

export const TRIAL_DURATION_DAYS = 5;


/*
|--------------------------------------------------------------------------
| Plan Pricing
|--------------------------------------------------------------------------
|
| Monthly USD pricing.
|
| Enterprise is handled through Contact Sales.
|
|--------------------------------------------------------------------------
*/

export const PLAN_PRICING = Object.freeze({

    starter: 25,

    growth: 59,

    premium: 149,

    enterprise: 0

});


/*
|--------------------------------------------------------------------------
| AI Model Mapping
|--------------------------------------------------------------------------
*/

export const PLAN_AI_MODELS = Object.freeze({

    starter: "gpt-4o-mini",

    growth: "gpt-4o-mini",

    premium: "gpt-5",

    enterprise: "gpt-5"

});


/*
|--------------------------------------------------------------------------
| Admin Service Startup Logger
|--------------------------------------------------------------------------
*/

logger.info(

    `${ADMIN_SERVICE_NAME} initialized.`,

    {

        version:

            ADMIN_SERVICE_VERSION,

        trialDurationDays:

            TRIAL_DURATION_DAYS,

        plans:

            Object.values(

                SUBSCRIPTION_PLANS

            ),

        roles:

            Object.values(

                USER_ROLES

            )

    }

);
/*
|--------------------------------------------------------------------------
| Get Platform Overview
|--------------------------------------------------------------------------
|
| Returns a high-level summary of the entire Layboka platform.
|
|--------------------------------------------------------------------------
*/

export const getPlatformOverview = async () => {

    try {

        const [

            totalUsers,

            totalMerchants,

            totalAdmins,

            totalSuperAdmins,

            totalShops,

            installedShops,

            activeShops,

            totalSubscriptions,

            activeSubscriptions,

            trialSubscriptions,

            totalOrders,

            totalProducts,

            totalCustomers

        ] = await Promise.all([

            /*
            |--------------------------------------------------------------------------
            | Users
            |--------------------------------------------------------------------------
            */

            User.countDocuments(),

            User.countDocuments({

                role:

                    USER_ROLES.MERCHANT

            }),

            User.countDocuments({

                role:

                    USER_ROLES.ADMIN

            }),

            User.countDocuments({

                role:

                    USER_ROLES.SUPER_ADMIN

            }),


            /*
            |--------------------------------------------------------------------------
            | Shops
            |--------------------------------------------------------------------------
            */

            Shop.countDocuments(),

            Shop.countDocuments({

                isInstalled: true

            }),

            Shop.countDocuments({

                status: "active"

            }),


            /*
            |--------------------------------------------------------------------------
            | Subscriptions
            |--------------------------------------------------------------------------
            */

            Subscription.countDocuments(),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.ACTIVE

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.TRIAL

            }),


            /*
            |--------------------------------------------------------------------------
            | Commerce
            |--------------------------------------------------------------------------
            */

            Order.countDocuments(),

            Product.countDocuments(),

            Customer.countDocuments({

                deleted: false

            })

        ]);


        return {

            users: {

                total:

                    totalUsers,

                merchants:

                    totalMerchants,

                admins:

                    totalAdmins,

                superAdmins:

                    totalSuperAdmins

            },

            shops: {

                total:

                    totalShops,

                installed:

                    installedShops,

                active:

                    activeShops

            },

            subscriptions: {

                total:

                    totalSubscriptions,

                active:

                    activeSubscriptions,

                trial:

                    trialSubscriptions

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

            "Failed to generate platform overview.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Admin Dashboard Statistics
|--------------------------------------------------------------------------
|
| Provides the main statistics used by the Admin Dashboard.
|
|--------------------------------------------------------------------------
*/

export const getDashboardStatistics = async () => {

    try {

        const [

            totalUsers,

            activeUsers,

            inactiveUsers,

            totalMerchants,

            totalShops,

            installedShops,

            activeShops,

            inactiveShops,

            suspendedShops,

            totalSubscriptions,

            trialSubscriptions,

            activeSubscriptions,

            pastDueSubscriptions,

            cancelledSubscriptions,

            expiredSubscriptions,

            pausedSubscriptions,

            totalOrders,

            paidOrders,

            cancelledOrders,

            refundedOrders,

            totalProducts,

            activeProducts,

            draftProducts,

            archivedProducts,

            totalCustomers,

            activeCustomers,

            inactiveCustomers,

            marketingOptInCustomers,

            deletedCustomers

        ] = await Promise.all([


            /*
            |--------------------------------------------------------------------------
            | Users
            |--------------------------------------------------------------------------
            */

            User.countDocuments(),

            User.countDocuments({

                isActive: true

            }),

            User.countDocuments({

                isActive: false

            }),

            User.countDocuments({

                role:

                    USER_ROLES.MERCHANT

            }),


            /*
            |--------------------------------------------------------------------------
            | Shops
            |--------------------------------------------------------------------------
            */

            Shop.countDocuments(),

            Shop.countDocuments({

                isInstalled: true

            }),

            Shop.countDocuments({

                status: "active"

            }),

            Shop.countDocuments({

                status: "inactive"

            }),

            Shop.countDocuments({

                status: "suspended"

            }),


            /*
            |--------------------------------------------------------------------------
            | Subscriptions
            |--------------------------------------------------------------------------
            */

            Subscription.countDocuments(),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.TRIAL

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.ACTIVE

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.PAST_DUE

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.CANCELLED

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.EXPIRED

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.PAUSED

            }),


            /*
            |--------------------------------------------------------------------------
            | Orders
            |--------------------------------------------------------------------------
            */

            Order.countDocuments(),

            Order.countDocuments({

                orderStatus: "paid"

            }),

            Order.countDocuments({

                orderStatus: "cancelled"

            }),

            Order.countDocuments({

                orderStatus: "refunded"

            }),


            /*
            |--------------------------------------------------------------------------
            | Products
            |--------------------------------------------------------------------------
            */

            Product.countDocuments(),

            Product.countDocuments({

                status: "active"

            }),

            Product.countDocuments({

                status: "draft"

            }),

            Product.countDocuments({

                status: "archived"

            }),


            /*
            |--------------------------------------------------------------------------
            | Customers
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                deleted: false

            }),

            Customer.countDocuments({

                status: "active",

                deleted: false

            }),

            Customer.countDocuments({

                status: "inactive",

                deleted: false

            }),

            Customer.countDocuments({

                acceptsMarketing: true,

                deleted: false

            }),

            Customer.countDocuments({

                deleted: true

            })

        ]);


        return {

            users: {

                total:

                    totalUsers,

                active:

                    activeUsers,

                inactive:

                    inactiveUsers,

                merchants:

                    totalMerchants

            },

            shops: {

                total:

                    totalShops,

                installed:

                    installedShops,

                active:

                    activeShops,

                inactive:

                    inactiveShops,

                suspended:

                    suspendedShops

            },

            subscriptions: {

                total:

                    totalSubscriptions,

                trial:

                    trialSubscriptions,

                active:

                    activeSubscriptions,

                pastDue:

                    pastDueSubscriptions,

                cancelled:

                    cancelledSubscriptions,

                expired:

                    expiredSubscriptions,

                paused:

                    pausedSubscriptions

            },

            orders: {

                total:

                    totalOrders,

                paid:

                    paidOrders,

                cancelled:

                    cancelledOrders,

                refunded:

                    refundedOrders

            },

            products: {

                total:

                    totalProducts,

                active:

                    activeProducts,

                draft:

                    draftProducts,

                archived:

                    archivedProducts

            },

            customers: {

                total:

                    totalCustomers,

                active:

                    activeCustomers,

                inactive:

                    inactiveCustomers,

                marketingOptIn:

                    marketingOptInCustomers,

                deleted:

                    deletedCustomers

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

                    error.message,

                stack:

                    error.stack

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

            emailVerified,

            emailUnverified

        ] = await Promise.all([

            User.countDocuments({

                role:

                    USER_ROLES.MERCHANT

            }),

            User.countDocuments({

                role:

                    USER_ROLES.MERCHANT,

                isActive: true

            }),

            User.countDocuments({

                role:

                    USER_ROLES.MERCHANT,

                isActive: false

            }),

            User.countDocuments({

                role:

                    USER_ROLES.MERCHANT,

                isEmailVerified: true

            }),

            User.countDocuments({

                role:

                    USER_ROLES.MERCHANT,

                isEmailVerified: false

            })

        ]);


        return {

            total,

            active,

            inactive,

            emailVerified,

            emailUnverified

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate merchant statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Shop Statistics
|--------------------------------------------------------------------------
*/

export const getShopStatistics = async () => {

    try {

        const [

            total,

            installed,

            active,

            inactive,

            suspended

        ] = await Promise.all([

            Shop.countDocuments(),

            Shop.countDocuments({

                isInstalled: true

            }),

            Shop.countDocuments({

                status: "active"

            }),

            Shop.countDocuments({

                status: "inactive"

            }),

            Shop.countDocuments({

                status: "suspended"

            })

        ]);


        return {

            total,

            installed,

            notInstalled:

                total - installed,

            active,

            inactive,

            suspended

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate shop statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

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

            trial,

            active,

            pastDue,

            cancelled,

            expired,

            paused

        ] = await Promise.all([

            Subscription.countDocuments(),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.TRIAL

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.ACTIVE

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.PAST_DUE

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.CANCELLED

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.EXPIRED

            }),

            Subscription.countDocuments({

                status:

                    SUBSCRIPTION_STATUS.PAUSED

            })

        ]);


        return {

            total,

            trial,

            active,

            pastDue,

            cancelled,

            expired,

            paused

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate subscription statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};
/*
|--------------------------------------------------------------------------
| Get Revenue Statistics
|--------------------------------------------------------------------------
|
| Calculates platform-wide revenue from paid Shopify orders.
|
| Revenue source:
|
| Order.totalPrice
|
| Payment status:
|
| financialStatus
|
| Refunds are tracked separately using:
|
| Order.totalRefunded
|
|--------------------------------------------------------------------------
*/

export const getRevenueStatistics = async () => {

    try {

        const [

            revenueResult,

            refundedResult

        ] = await Promise.all([

            /*
            |--------------------------------------------------------------------------
            | Paid Revenue
            |--------------------------------------------------------------------------
            */

            Order.aggregate([

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

                        grossRevenue: {

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

                        },

                        totalRefunded: {

                            $sum: {

                                $ifNull: [

                                    "$totalRefunded",

                                    0

                                ]

                            }

                        }

                    }

                }

            ]),


            /*
            |--------------------------------------------------------------------------
            | Refunded Orders
            |--------------------------------------------------------------------------
            */

            Order.aggregate([

                {

                    $match: {

                        orderStatus:

                            "refunded"

                    }

                },

                {

                    $group: {

                        _id: null,

                        refundedOrders: {

                            $sum: 1

                        },

                        refundedAmount: {

                            $sum: {

                                $ifNull: [

                                    "$totalRefunded",

                                    0

                                ]

                            }

                        }

                    }

                }

            ])

        ]);


        const revenue =

            revenueResult[0] || {

                grossRevenue: 0,

                totalOrders: 0,

                averageOrderValue: 0,

                totalRefunded: 0

            };


        const refunds =

            refundedResult[0] || {

                refundedOrders: 0,

                refundedAmount: 0

            };


        const netRevenue =

            Math.max(

                Number(

                    revenue.grossRevenue || 0

                ) -

                Number(

                    revenue.totalRefunded || 0

                ),

                0

            );


        return {

            grossRevenue:

                Number(

                    revenue.grossRevenue || 0

                ),

            totalRefunded:

                Number(

                    revenue.totalRefunded || 0

                ),

            netRevenue,

            totalOrders:

                revenue.totalOrders || 0,

            averageOrderValue:

                Number(

                    revenue.averageOrderValue || 0

                ),

            refundedOrders:

                refunds.refundedOrders || 0,

            refundedAmount:

                Number(

                    refunds.refundedAmount || 0

                ),

            generatedAt:

                new Date()

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate revenue statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

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

            pending,

            authorized,

            paid,

            partiallyPaid,

            fulfilled,

            partiallyFulfilled,

            cancelled,

            refunded,

            aiInfluenced

        ] = await Promise.all([

            /*
            |--------------------------------------------------------------------------
            | Total
            |--------------------------------------------------------------------------
            */

            Order.countDocuments(),


            /*
            |--------------------------------------------------------------------------
            | Pending
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "pending"

            }),


            /*
            |--------------------------------------------------------------------------
            | Authorized
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "authorized"

            }),


            /*
            |--------------------------------------------------------------------------
            | Paid
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "paid"

            }),


            /*
            |--------------------------------------------------------------------------
            | Partially Paid
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "partially_paid"

            }),


            /*
            |--------------------------------------------------------------------------
            | Fulfilled
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "fulfilled"

            }),


            /*
            |--------------------------------------------------------------------------
            | Partially Fulfilled
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "partially_fulfilled"

            }),


            /*
            |--------------------------------------------------------------------------
            | Cancelled
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "cancelled"

            }),


            /*
            |--------------------------------------------------------------------------
            | Refunded
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                orderStatus:

                    "refunded"

            }),


            /*
            |--------------------------------------------------------------------------
            | AI Influenced
            |--------------------------------------------------------------------------
            */

            Order.countDocuments({

                aiInfluenced: true

            })

        ]);


        return {

            total,

            pending,

            authorized,

            paid,

            partiallyPaid,

            fulfilled,

            partiallyFulfilled,

            cancelled,

            refunded,

            aiInfluenced

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate order statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

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

            archived,

            availableForSale,

            outOfStock,

            embeddingGenerated

        ] = await Promise.all([

            /*
            |--------------------------------------------------------------------------
            | Total Products
            |--------------------------------------------------------------------------
            */

            Product.countDocuments(),


            /*
            |--------------------------------------------------------------------------
            | Active Products
            |--------------------------------------------------------------------------
            */

            Product.countDocuments({

                status:

                    "active"

            }),


            /*
            |--------------------------------------------------------------------------
            | Draft Products
            |--------------------------------------------------------------------------
            */

            Product.countDocuments({

                status:

                    "draft"

            }),


            /*
            |--------------------------------------------------------------------------
            | Archived Products
            |--------------------------------------------------------------------------
            */

            Product.countDocuments({

                status:

                    "archived"

            }),


            /*
            |--------------------------------------------------------------------------
            | Available For Sale
            |--------------------------------------------------------------------------
            */

            Product.countDocuments({

                availableForSale: true

            }),


            /*
            |--------------------------------------------------------------------------
            | Out Of Stock
            |--------------------------------------------------------------------------
            */

            Product.countDocuments({

                inventory: {

                    $lte: 0

                }

            }),


            /*
            |--------------------------------------------------------------------------
            | AI Embeddings
            |--------------------------------------------------------------------------
            */

            Product.countDocuments({

                embeddingGenerated: true

            })

        ]);


        return {

            total,

            active,

            draft,

            archived,

            availableForSale,

            outOfStock,

            embeddingGenerated

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate product statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

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

            inactive,

            enabled,

            disabled,

            invited,

            declined,

            marketingOptIn,

            marketingOptOut,

            deleted,

            aiOptIn,

            gdprConsent

        ] = await Promise.all([

            /*
            |--------------------------------------------------------------------------
            | Active Customers In Database
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Active Status
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                status:

                    "active",

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Inactive Status
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                status:

                    "inactive",

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Shopify Enabled State
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                state:

                    "enabled",

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Shopify Disabled State
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                state:

                    "disabled",

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Shopify Invited State
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                state:

                    "invited",

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Shopify Declined State
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                state:

                    "declined",

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Marketing Opt In
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                acceptsMarketing: true,

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Marketing Opt Out
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                acceptsMarketing: false,

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | Deleted Customers
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                deleted: true

            }),


            /*
            |--------------------------------------------------------------------------
            | AI Opt In
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                aiOptIn: true,

                deleted: false

            }),


            /*
            |--------------------------------------------------------------------------
            | GDPR Consent
            |--------------------------------------------------------------------------
            */

            Customer.countDocuments({

                gdprConsent: true,

                deleted: false

            })

        ]);


        return {

            total,

            active,

            inactive,

            state: {

                enabled,

                disabled,

                invited,

                declined

            },

            marketing: {

                optIn:

                    marketingOptIn,

                optOut:

                    marketingOptOut

            },

            privacy: {

                deleted,

                gdprConsent

            },

            ai: {

                optIn:

                    aiOptIn

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate customer statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};
//Part 4
/*
|--------------------------------------------------------------------------
| Get Merchants
|--------------------------------------------------------------------------
|
| Returns a paginated list of merchant users.
|
| User model fields:
|
| - firstName
| - lastName
| - email
| - role
| - isEmailVerified
| - isActive
| - lastLoginAt
| - loginCount
| - createdAt
|
|--------------------------------------------------------------------------
*/

export const getMerchants = async ({

    page = DEFAULT_PAGE,

    limit = DEFAULT_LIMIT,

    search = "",

    isActive,

    isEmailVerified

} = {}) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | Normalize Pagination
        |--------------------------------------------------------------------------
        */

        const currentPage = Math.max(

            Number(page) || DEFAULT_PAGE,

            1

        );


        const currentLimit = Math.min(

            Math.max(

                Number(limit) || DEFAULT_LIMIT,

                1

            ),

            MAX_LIMIT

        );


        const skip =

            (currentPage - 1) *

            currentLimit;


        /*
        |--------------------------------------------------------------------------
        | Build Filter
        |--------------------------------------------------------------------------
        */

        const filter = {

            role:

                USER_ROLES.MERCHANT

        };


        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if (

            search &&

            typeof search === "string"

        ) {

            const searchRegex = {

                $regex:

                    search.trim(),

                $options:

                    "i"

            };


            filter.$or = [

                {

                    firstName:

                        searchRegex

                },

                {

                    lastName:

                        searchRegex

                },

                {

                    email:

                        searchRegex

                }

            ];

        }


        /*
        |--------------------------------------------------------------------------
        | Active Filter
        |--------------------------------------------------------------------------
        */

        if (

            isActive !== undefined &&

            isActive !== null &&

            isActive !== ""

        ) {

            filter.isActive =

                isActive === true ||

                isActive === "true";

        }


        /*
        |--------------------------------------------------------------------------
        | Email Verification Filter
        |--------------------------------------------------------------------------
        */

        if (

            isEmailVerified !== undefined &&

            isEmailVerified !== null &&

            isEmailVerified !== ""

        ) {

            filter.isEmailVerified =

                isEmailVerified === true ||

                isEmailVerified === "true";

        }


        /*
        |--------------------------------------------------------------------------
        | Query Merchants
        |--------------------------------------------------------------------------
        */

        const [

            merchants,

            total

        ] = await Promise.all([

            User.find(filter)

                .select(

                    "firstName " +

                    "lastName " +

                    "email " +

                    "role " +

                    "isEmailVerified " +

                    "isActive " +

                    "lastLoginAt " +

                    "loginCount " +

                    "createdAt " +

                    "updatedAt"

                )

                .sort({

                    createdAt: -1

                })

                .skip(skip)

                .limit(currentLimit)

                .lean(),


            User.countDocuments(filter)

        ]);


        return {

            merchants,

            pagination: {

                page:

                    currentPage,

                limit:

                    currentLimit,

                total,

                totalPages:

                    Math.ceil(

                        total /

                        currentLimit

                    )

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve merchants.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Merchant By ID
|--------------------------------------------------------------------------
|
| Returns a merchant together with their shops and subscriptions.
|
|--------------------------------------------------------------------------
*/

export const getMerchantById = async (

    merchantId

) => {

    try {

        if (!merchantId) {

            throw new Error(

                "Merchant ID is required."

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Find Merchant
        |--------------------------------------------------------------------------
        */

        const merchant =

            await User.findOne({

                _id:

                    merchantId,

                role:

                    USER_ROLES.MERCHANT

            })

                .select(

                    "firstName " +

                    "lastName " +

                    "email " +

                    "role " +

                    "isEmailVerified " +

                    "isActive " +

                    "avatar " +

                    "phone " +

                    "timezone " +

                    "lastLoginAt " +

                    "lastLoginIp " +

                    "loginCount " +

                    "failedLoginAttempts " +

                    "passwordChangedAt " +

                    "createdAt " +

                    "updatedAt"

                )

                .lean();


        if (!merchant) {

            throw new Error(

                "Merchant not found."

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Find Merchant Shops
        |--------------------------------------------------------------------------
        |
        | Shop.owner → User
        |
        |--------------------------------------------------------------------------
        */

        const shops =

            await Shop.find({

                owner:

                    merchantId

            })

                .select(

                    "shop " +

                    "storeName " +

                    "owner " +

                    "isInstalled " +

                    "status " +

                    "planName " +

                    "subscriptionStatus " +

                    "trialStart " +

                    "trialEnd " +

                    "premiumLocked " +

                    "stripeCustomerId " +

                    "stripeSubscriptionId " +

                    "createdAt " +

                    "updatedAt"

                )

                .sort({

                    createdAt: -1

                })

                .lean();


        /*
        |--------------------------------------------------------------------------
        | Find Merchant Subscriptions
        |--------------------------------------------------------------------------
        |
        | Subscription.user → User
        |
        |--------------------------------------------------------------------------
        */

        const subscriptions =

            await Subscription.find({

                user:

                    merchantId

            })

                .select(

                    "shop " +

                    "plan " +

                    "amount " +

                    "currency " +

                    "status " +

                    "trialStart " +

                    "trialEnd " +

                    "trialUsed " +

                    "billingCycle " +

                    "currentPeriodStart " +

                    "currentPeriodEnd " +

                    "nextBillingDate " +

                    "cancelledAt " +

                    "expiresAt " +

                    "aiModel " +

                    "premiumFeaturesEnabled " +

                    "stripeCustomerId " +

                    "stripeSubscriptionId " +

                    "stripePriceId " +

                    "createdAt " +

                    "updatedAt"

                )

                .sort({

                    createdAt: -1

                })

                .lean();


        return {

            merchant,

            shops,

            subscriptions

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve merchant details.",

            {

                merchantId,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Update Merchant Status
|--------------------------------------------------------------------------
|
| Activates or deactivates a merchant account.
|
| This only changes User.isActive.
|
| It does not automatically cancel Shopify or Stripe subscriptions.
|
|--------------------------------------------------------------------------
*/

export const updateMerchantStatus = async (

    merchantId,

    isActive

) => {

    try {

        if (!merchantId) {

            throw new Error(

                "Merchant ID is required."

            );

        }


        if (

            typeof isActive !==

            "boolean"

        ) {

            throw new Error(

                "isActive must be a boolean."

            );

        }


        const merchant =

            await User.findOneAndUpdate(

                {

                    _id:

                        merchantId,

                    role:

                        USER_ROLES.MERCHANT

                },

                {

                    $set: {

                        isActive

                    }

                },

                {

                    new: true,

                    runValidators: true

                }

            )

                .select(

                    "firstName " +

                    "lastName " +

                    "email " +

                    "role " +

                    "isActive " +

                    "updatedAt"

                )

                .lean();


        if (!merchant) {

            throw new Error(

                "Merchant not found."

            );

        }


        logger.info(

            "Merchant status updated.",

            {

                merchantId,

                isActive

            }

        );


        return merchant;

    }

    catch (error) {

        logger.error(

            "Failed to update merchant status.",

            {

                merchantId,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Shops
|--------------------------------------------------------------------------
|
| Returns a paginated list of Shopify stores.
|
| Shop model fields used:
|
| - owner
| - shop
| - isInstalled
| - status
| - planName
| - subscriptionStatus
| - trialStart
| - trialEnd
| - premiumLocked
|
|--------------------------------------------------------------------------
*/

export const getShops = async ({

    page = DEFAULT_PAGE,

    limit = DEFAULT_LIMIT,

    search = "",

    status,

    isInstalled,

    subscriptionStatus,

    planName

} = {}) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | Normalize Pagination
        |--------------------------------------------------------------------------
        */

        const currentPage = Math.max(

            Number(page) || DEFAULT_PAGE,

            1

        );


        const currentLimit = Math.min(

            Math.max(

                Number(limit) || DEFAULT_LIMIT,

                1

            ),

            MAX_LIMIT

        );


        const skip =

            (currentPage - 1) *

            currentLimit;


        /*
        |--------------------------------------------------------------------------
        | Build Filter
        |--------------------------------------------------------------------------
        */

        const filter = {};


        /*
        |--------------------------------------------------------------------------
        | Shop Search
        |--------------------------------------------------------------------------
        */

        if (

            search &&

            typeof search === "string"

        ) {

            filter.shop = {

                $regex:

                    search.trim(),

                $options:

                    "i"

            };

        }


        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (

            status &&

            typeof status === "string"

        ) {

            filter.status =

                status;

        }


        /*
        |--------------------------------------------------------------------------
        | Installation Status
        |--------------------------------------------------------------------------
        */

        if (

            isInstalled !== undefined &&

            isInstalled !== null &&

            isInstalled !== ""

        ) {

            filter.isInstalled =

                isInstalled === true ||

                isInstalled === "true";

        }


        /*
        |--------------------------------------------------------------------------
        | Subscription Status
        |--------------------------------------------------------------------------
        */

        if (

            subscriptionStatus &&

            typeof subscriptionStatus === "string"

        ) {

            filter.subscriptionStatus =

                subscriptionStatus;

        }


        /*
        |--------------------------------------------------------------------------
        | Plan
        |--------------------------------------------------------------------------
        */

        if (

            planName &&

            typeof planName === "string"

        ) {

            filter.planName =

                planName;

        }


        /*
        |--------------------------------------------------------------------------
        | Query Shops
        |--------------------------------------------------------------------------
        */

        const [

            shops,

            total

        ] = await Promise.all([

            Shop.find(filter)

                .select(

                    "shop " +

                    "storeName " +

                    "owner " +

                    "isInstalled " +

                    "status " +

                    "planName " +

                    "subscriptionStatus " +

                    "trialStart " +

                    "trialEnd " +

                    "premiumLocked " +

                    "stripeCustomerId " +

                    "stripeSubscriptionId " +

                    "createdAt " +

                    "updatedAt"

                )

                .populate({

                    path:

                        "owner",

                    select:

                        "firstName " +

                        "lastName " +

                        "email " +

                        "isActive"

                })

                .sort({

                    createdAt: -1

                })

                .skip(skip)

                .limit(currentLimit)

                .lean(),


            Shop.countDocuments(filter)

        ]);


        return {

            shops,

            pagination: {

                page:

                    currentPage,

                limit:

                    currentLimit,

                total,

                totalPages:

                    Math.ceil(

                        total /

                        currentLimit

                    )

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve shops.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Shop By ID
|--------------------------------------------------------------------------
|
| Returns complete administrative information for one shop.
|
|--------------------------------------------------------------------------
*/

export const getShopById = async (

    shopId

) => {

    try {

        if (!shopId) {

            throw new Error(

                "Shop ID is required."

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Find Shop
        |--------------------------------------------------------------------------
        */

        const shop =

            await Shop.findById(

                shopId

            )

                .select(

                    "shop " +

                    "storeName " +

                    "owner " +

                    "isInstalled " +

                    "status " +

                    "planName " +

                    "subscriptionStatus " +

                    "trialStart " +

                    "trialEnd " +

                    "premiumLocked " +

                    "stripeCustomerId " +

                    "stripeSubscriptionId " +

                    "createdAt " +

                    "updatedAt"

                )

                .populate({

                    path:

                        "owner",

                    select:

                        "firstName " +

                        "lastName " +

                        "email " +

                        "role " +

                        "isActive " +

                        "isEmailVerified"

                })

                .lean();


        if (!shop) {

            throw new Error(

                "Shop not found."

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Shop Subscription
        |--------------------------------------------------------------------------
        */

        const subscription =

            await Subscription.findOne({

                shop:

                    shopId

            })

                .sort({

                    createdAt: -1

                })

                .select(

                    "user " +

                    "shop " +

                    "plan " +

                    "amount " +

                    "currency " +

                    "status " +

                    "trialStart " +

                    "trialEnd " +

                    "trialUsed " +

                    "billingCycle " +

                    "currentPeriodStart " +

                    "currentPeriodEnd " +

                    "nextBillingDate " +

                    "cancelledAt " +

                    "expiresAt " +

                    "aiModel " +

                    "premiumFeaturesEnabled " +

                    "stripeCustomerId " +

                    "stripeSubscriptionId " +

                    "stripePriceId " +

                    "stripeInvoiceId " +

                    "createdAt " +

                    "updatedAt"

                )

                .lean();


        /*
        |--------------------------------------------------------------------------
        | Shop Statistics
        |--------------------------------------------------------------------------
        */

        const [

            orderCount,

            productCount,

            customerCount

        ] = await Promise.all([

            Order.countDocuments({

                shop:

                    shopId

            }),

            Product.countDocuments({

                shop:

                    shopId

            }),

            Customer.countDocuments({

                shop:

                    shopId,

                deleted: false

            })

        ]);


        return {

            shop,

            subscription,

            statistics: {

                orders:

                    orderCount,

                products:

                    productCount,

                customers:

                    customerCount

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve shop details.",

            {

                shopId,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Update Shop Status
|--------------------------------------------------------------------------
|
| Updates the operational status of a Shopify store.
|
| Valid values from Shop model:
|
| - active
| - inactive
| - suspended
|
|--------------------------------------------------------------------------
*/

export const updateShopStatus = async (

    shopId,

    status

) => {

    try {

        if (!shopId) {

            throw new Error(

                "Shop ID is required."

            );

        }


        const allowedStatuses = [

            "active",

            "inactive",

            "suspended"

        ];


        if (

            !allowedStatuses.includes(

                status

            )

        ) {

            throw new Error(

                "Invalid shop status."

            );

        }


        const shop =

            await Shop.findByIdAndUpdate(

                shopId,

                {

                    $set: {

                        status

                    }

                },

                {

                    new: true,

                    runValidators: true

                }

            )

                .select(

                    "shop " +

                    "storeName " +

                    "owner " +

                    "isInstalled " +

                    "status " +

                    "planName " +

                    "subscriptionStatus " +

                    "premiumLocked " +

                    "updatedAt"

                )

                .lean();


        if (!shop) {

            throw new Error(

                "Shop not found."

            );

        }


        logger.info(

            "Shop status updated.",

            {

                shopId,

                status

            }

        );


        return shop;

    }

    catch (error) {

        logger.error(

            "Failed to update shop status.",

            {

                shopId,

                status,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};
// Part 5
//*"""""""""**********************
/*
|--------------------------------------------------------------------------
| Get Subscriptions
|--------------------------------------------------------------------------
|
| Returns a paginated list of platform subscriptions.
|
| Subscription relationships:
|
| Subscription.user
|     ↓
| User._id
|
| Subscription.shop
|     ↓
| Shop._id
|
|--------------------------------------------------------------------------
*/

export const getSubscriptions = async ({

    page = DEFAULT_PAGE,

    limit = DEFAULT_LIMIT,

    search = "",

    plan,

    status,

    billingCycle

} = {}) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | Normalize Pagination
        |--------------------------------------------------------------------------
        */

        const currentPage = Math.max(

            Number(page) || DEFAULT_PAGE,

            1

        );


        const currentLimit = Math.min(

            Math.max(

                Number(limit) || DEFAULT_LIMIT,

                1

            ),

            MAX_LIMIT

        );


        const skip =

            (currentPage - 1) *

            currentLimit;


        /*
        |--------------------------------------------------------------------------
        | Build Subscription Filter
        |--------------------------------------------------------------------------
        */

        const filter = {};


        /*
        |--------------------------------------------------------------------------
        | Plan Filter
        |--------------------------------------------------------------------------
        */

        if (

            plan &&

            typeof plan === "string"

        ) {

            if (

                !Object.values(

                    SUBSCRIPTION_PLANS

                ).includes(plan)

            ) {

                throw new Error(

                    "Invalid subscription plan."

                );

            }


            filter.plan =

                plan;

        }


        /*
        |--------------------------------------------------------------------------
        | Status Filter
        |--------------------------------------------------------------------------
        */

        if (

            status &&

            typeof status === "string"

        ) {

            if (

                !Object.values(

                    SUBSCRIPTION_STATUS

                ).includes(status)

            ) {

                throw new Error(

                    "Invalid subscription status."

                );

            }


            filter.status =

                status;

        }


        /*
        |--------------------------------------------------------------------------
        | Billing Cycle Filter
        |--------------------------------------------------------------------------
        */

        if (

            billingCycle &&

            typeof billingCycle === "string"

        ) {

            if (

                ![

                    "monthly",

                    "yearly"

                ].includes(

                    billingCycle

                )

            ) {

                throw new Error(

                    "Invalid billing cycle."

                );

            }


            filter.billingCycle =

                billingCycle;

        }


        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        |
        | Search is performed against related User and Shop records.
        |
        |--------------------------------------------------------------------------
        */

        let userIds = null;

        let shopIds = null;


        if (

            search &&

            typeof search === "string"

        ) {

            const searchRegex = {

                $regex:

                    search.trim(),

                $options:

                    "i"

            };


            const [

                matchingUsers,

                matchingShops

            ] = await Promise.all([

                User.find({

                    $or: [

                        {

                            firstName:

                                searchRegex

                        },

                        {

                            lastName:

                                searchRegex

                        },

                        {

                            email:

                                searchRegex

                        }

                    ]

                })

                    .select("_id")

                    .lean(),


                Shop.find({

                    $or: [

                        {

                            shop:

                                searchRegex

                        },

                        {

                            storeName:

                                searchRegex

                        }

                    ]

                })

                    .select("_id")

                    .lean()

            ]);


            userIds =

                matchingUsers.map(

                    user => user._id

                );


            shopIds =

                matchingShops.map(

                    shop => shop._id

                );


            filter.$or = [

                {

                    user: {

                        $in:

                            userIds

                    }

                },

                {

                    shop: {

                        $in:

                            shopIds

                    }

                }

            ];

        }


        /*
        |--------------------------------------------------------------------------
        | Query Subscriptions
        |--------------------------------------------------------------------------
        */

        const [

            subscriptions,

            total

        ] = await Promise.all([

            Subscription.find(filter)

                .populate({

                    path:

                        "user",

                    select:

                        "firstName " +

                        "lastName " +

                        "email " +

                        "isActive"

                })

                .populate({

                    path:

                        "shop",

                    select:

                        "shop " +

                        "storeName " +

                        "owner " +

                        "isInstalled " +

                        "status " +

                        "planName " +

                        "subscriptionStatus"

                })

                .sort({

                    createdAt: -1

                })

                .skip(skip)

                .limit(currentLimit)

                .lean(),


            Subscription.countDocuments(

                filter

            )

        ]);


        return {

            subscriptions,

            pagination: {

                page:

                    currentPage,

                limit:

                    currentLimit,

                total,

                totalPages:

                    Math.ceil(

                        total /

                        currentLimit

                    )

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve subscriptions.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Subscription By ID
|--------------------------------------------------------------------------
|
| Returns complete subscription details.
|
|--------------------------------------------------------------------------
*/

export const getSubscriptionById = async (

    subscriptionId

) => {

    try {

        if (!subscriptionId) {

            throw new Error(

                "Subscription ID is required."

            );

        }


        const subscription =

            await Subscription.findById(

                subscriptionId

            )

                .populate({

                    path:

                        "user",

                    select:

                        "firstName " +

                        "lastName " +

                        "email " +

                        "role " +

                        "isActive " +

                        "isEmailVerified " +

                        "lastLoginAt " +

                        "createdAt"

                })

                .populate({

                    path:

                        "shop",

                    select:

                        "shop " +

                        "storeName " +

                        "owner " +

                        "isInstalled " +

                        "status " +

                        "planName " +

                        "subscriptionStatus " +

                        "premiumLocked " +

                        "createdAt"

                })

                .lean();


        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }


        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to retrieve subscription details.",

            {

                subscriptionId,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Validate Subscription Plan
|--------------------------------------------------------------------------
*/

const validateSubscriptionPlan = (

    plan

) => {

    if (

        !Object.values(

            SUBSCRIPTION_PLANS

        ).includes(plan)

    ) {

        throw new Error(

            "Invalid subscription plan."

        );

    }


    return true;

};


/*
|--------------------------------------------------------------------------
| Get Plan Information
|--------------------------------------------------------------------------
*/

export const getPlanInformation = (

    plan

) => {

    validateSubscriptionPlan(

        plan

    );


    return {

        plan,

        amount:

            PLAN_PRICING[plan],

        currency:

            "USD",

        aiModel:

            PLAN_AI_MODELS[plan],

        isEnterprise:

            plan ===

            SUBSCRIPTION_PLANS.ENTERPRISE

    };

};


/*
|--------------------------------------------------------------------------
| Update Subscription Status
|--------------------------------------------------------------------------
|
| Administrative status update.
|
| IMPORTANT:
|
| This updates the local Subscription record only.
|
| Stripe synchronization must be handled through the
| subscription service / Stripe webhook flow.
|
|--------------------------------------------------------------------------
*/

export const updateSubscriptionStatus = async (

    subscriptionId,

    status

) => {

    try {

        if (!subscriptionId) {

            throw new Error(

                "Subscription ID is required."

            );

        }


        if (

            !Object.values(

                SUBSCRIPTION_STATUS

            ).includes(status)

        ) {

            throw new Error(

                "Invalid subscription status."

            );

        }


        const subscription =

            await Subscription.findByIdAndUpdate(

                subscriptionId,

                {

                    $set: {

                        status

                    }

                },

                {

                    new: true,

                    runValidators: true

                }

            )

                .populate({

                    path:

                        "user",

                    select:

                        "firstName " +

                        "lastName " +

                        "email"

                })

                .populate({

                    path:

                        "shop",

                    select:

                        "shop " +

                        "storeName " +

                        "planName " +

                        "subscriptionStatus"

                });


        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }


        logger.info(

            "Subscription status updated.",

            {

                subscriptionId,

                status

            }

        );


        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to update subscription status.",

            {

                subscriptionId,

                status,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Update Subscription Plan
|--------------------------------------------------------------------------
|
| Updates the local subscription plan.
|
| The Subscription model pre-save hook automatically updates:
|
| - amount
| - aiModel
| - premiumFeaturesEnabled
|
| IMPORTANT:
|
| This function does NOT directly change the Stripe subscription.
| Stripe billing synchronization should be performed by the
| subscription service.
|
|--------------------------------------------------------------------------
*/

export const updateSubscriptionPlan = async (

    subscriptionId,

    plan

) => {

    try {

        if (!subscriptionId) {

            throw new Error(

                "Subscription ID is required."

            );

        }


        validateSubscriptionPlan(

            plan

        );


        const subscription =

            await Subscription.findById(

                subscriptionId

            );


        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }


        subscription.plan =

            plan;


        /*
        |--------------------------------------------------------------------------
        | Save
        |--------------------------------------------------------------------------
        |
        | Subscription pre-save hook updates:
        |
        | amount
        | aiModel
        | premiumFeaturesEnabled
        |
        |--------------------------------------------------------------------------
        */

        await subscription.save();


        logger.info(

            "Subscription plan updated.",

            {

                subscriptionId,

                plan,

                amount:

                    subscription.amount,

                aiModel:

                    subscription.aiModel

            }

        );


        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to update subscription plan.",

            {

                subscriptionId,

                plan,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Extend Subscription Trial
|--------------------------------------------------------------------------
|
| Adds additional trial days to an existing subscription.
|
| This is an administrative action.
|
|--------------------------------------------------------------------------
*/

export const extendSubscriptionTrial = async (

    subscriptionId,

    additionalDays

) => {

    try {

        if (!subscriptionId) {

            throw new Error(

                "Subscription ID is required."

            );

        }


        const days =

            Number(

                additionalDays

            );


        if (

            !Number.isInteger(days) ||

            days <= 0

        ) {

            throw new Error(

                "Additional trial days must be a positive integer."

            );

        }


        const subscription =

            await Subscription.findById(

                subscriptionId

            );


        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Determine Trial Base Date
        |--------------------------------------------------------------------------
        */

        const now =

            new Date();


        const currentTrialEnd =

            subscription.trialEnd &&

            subscription.trialEnd >

            now

                ? subscription.trialEnd

                : now;


        const newTrialEnd =

            new Date(

                currentTrialEnd

            );


        newTrialEnd.setDate(

            newTrialEnd.getDate() +

            days

        );


        subscription.trialEnd =

            newTrialEnd;


        subscription.status =

            SUBSCRIPTION_STATUS.TRIAL;


        subscription.trialUsed =

            false;


        await subscription.save();


        logger.info(

            "Subscription trial extended.",

            {

                subscriptionId,

                additionalDays:

                    days,

                newTrialEnd

            }

        );


        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to extend subscription trial.",

            {

                subscriptionId,

                additionalDays,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Lock Subscription Premium Features
|--------------------------------------------------------------------------
|
| Administrative action used when a subscription expires,
| is cancelled, or requires manual locking.
|
|--------------------------------------------------------------------------
*/

export const lockSubscriptionFeatures = async (

    subscriptionId

) => {

    try {

        if (!subscriptionId) {

            throw new Error(

                "Subscription ID is required."

            );

        }


        const subscription =

            await Subscription.findByIdAndUpdate(

                subscriptionId,

                {

                    $set: {

                        premiumFeaturesEnabled:

                            false

                    }

                },

                {

                    new: true,

                    runValidators: true

                }

            );


        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }


        logger.info(

            "Subscription premium features locked.",

            {

                subscriptionId

            }

        );


        return subscription;

    }

    catch (error) {

        logger.error(

  "Failed to lock subscription features.",

            {

                subscriptionId,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};

/*
|--------------------------------------------------------------------------
| Unlock Subscription Premium Features
|--------------------------------------------------------------------------
*/

export const unlockSubscriptionFeatures = async (

    subscriptionId

) => {

    try {

        if (!subscriptionId) {

            throw new Error(

                "Subscription ID is required."
                
);

        }


        const subscription =

            await Subscription.findByIdAndUpdate(

                subscriptionId,

                {

                    $set: {

                        premiumFeaturesEnabled:

                            true

                    }

                },

                {
                    new: true,

                    runValidators: true

                }

            );


        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }


        logger.info(

            "Subscription premium features unlocked.",
            {

                subscriptionId

            }

        );


        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to unlock subscription features.",

            {
                {

                subscriptionId,

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};
//Part 6
// ***************************************
/*
|--------------------------------------------------------------------------
| Get Plan Statistics
|--------------------------------------------------------------------------
|
| Returns subscription statistics grouped by plan.
|
| Plans:
|
| - starter
| - growth
| - premium
| - enterprise
|
|--------------------------------------------------------------------------
*/

export const getPlanStatistics = async () => {

    try {

        const planStatistics =

            await Subscription.aggregate([

                {
                    $group: {

                        _id: "$plan",

                        total: {

                            $sum: 1

                        },

                        trial: {

                            $sum: {

                                $cond: [

                                    {
                                        $eq: [

                                            "$status",

                                            "trial"

                                        ]

                                    },

                                    1,

                                    0

                                ]

                            }

                        },

                        active: {

                            $sum: {

                                $cond: [

                                    {
                                        $eq: [

                                            "$status",

                                            "active"

                                        ]

                                    },

                                    1,

                                    0

                                ]

                            }

                        },

                        pastDue: {

                            $sum: {

                                $cond: [

                                    {
                                        $eq: [

                                            "$status",

                                            "past_due"

                                        ]

                                    },

                                    1,

                                    0

                                ]

                            }

                        },

                        cancelled: {

                            $sum: {

                                $cond: [

                                    {
                                        $eq: [

                                            "$status",

                                            "cancelled"

                                        ]

                                    },

                                    1,

                                    0

                                ]

                            }

                        },

                        expired: {

                            $sum: {

                                $cond: [

                                    {
                                        $eq: [

                                            "$status",

                                            "expired"

                                        ]

                                    },

                                    1,

                                    0

                                ]

                            }

                        },

                        paused: {

                            $sum: {

                                $cond: [

                                    {
                                        $eq: [

                                            "$status",

                                            "paused"

                                        ]

                                    },

                                    1,

                                    0

                                ]

                            }

                        },

                        monthlyRevenue: {

                            $sum: {

                                $cond: [

                                    {

                                        $eq: [

                                            "$status",

                                            "active"

                                        ]

                                    },

                                    {

                                        $ifNull: [

                                            "$amount",

                                            0

                                        ]

                                    },

                                    0

                                ]

                            }

                        }

                    }

                },

                {

                    $sort: {

                        _id: 1

                    }

                }

            ]);


        return planStatistics;

    }

    catch (error) {

        logger.error(

            "Failed to generate plan statistics.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Platform Revenue Summary
|--------------------------------------------------------------------------
|
| Combines:
|
| 1. SaaS subscription revenue
| 2. Shopify merchant order revenue
|
| These are intentionally returned separately.
|
|--------------------------------------------------------------------------
*/

export const getPlatformRevenueSummary = async () => {

    try {

        /*
        |--------------------------------------------------------------------------
        | SaaS Subscription Revenue
        |--------------------------------------------------------------------------
        |
        | Only active paid subscriptions are included.
        |
        | Enterprise amount is normally 0 because Enterprise uses
        | Contact Sales pricing.
        |
        |--------------------------------------------------------------------------
        */

        const [

            subscriptionRevenue,

            merchantRevenue

        ] = await Promise.all([


            /*
            |--------------------------------------------------------------------------
            | SaaS Revenue
            |--------------------------------------------------------------------------
            */

            Subscription.aggregate([

                {

                    $match: {

                        status:

                            SUBSCRIPTION_STATUS.ACTIVE

                    }

                },

                {

                    $group: {

                        _id: null,

                        monthlyRecurringRevenue: {

                            $sum: {

                                $ifNull: [

                                    "$amount",

                                    0

                                ]

                            }

                        },

                        activeSubscriptions: {

                            $sum: 1

                        }

                    }

                }

            ]),


            /*
            |--------------------------------------------------------------------------
            | Merchant Shopify Revenue
            |--------------------------------------------------------------------------
            */

            Order.aggregate([

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

                        grossRevenue: {

                            $sum: {

                                $ifNull: [

                                    "$totalPrice",

                                    0

                                ]

                            }

                        },

                        refunds: {

                            $sum: {

                                $ifNull: [

                                    "$totalRefunded",

                                    0

                                ]

                            }

                        },

                        paidOrders: {

                            $sum: 1

                        }

                    }

                }

            ])

        ]);


        const saas =

            subscriptionRevenue[0] || {

                monthlyRecurringRevenue: 0,

                activeSubscriptions: 0

            };


        const merchants =

            merchantRevenue[0] || {

                grossRevenue: 0,

                refunds: 0,

                paidOrders: 0

            };


        return {

            saas: {

                monthlyRecurringRevenue:

                    Number(

                        saas.monthlyRecurringRevenue ||

                        0

                    ),

                activeSubscriptions:

                    saas.activeSubscriptions ||

                    0

            },

            merchantSales: {

                grossRevenue:

                    Number(

                        merchants.grossRevenue ||

                        0

                    ),

                refunds:

                    Number(

                        merchants.refunds ||

                        0

                    ),

                netRevenue:

                    Math.max(

                        Number(

                            merchants.grossRevenue ||

                            0

                        ) -

                        Number(

                            merchants.refunds ||

                            0

                        ),

                        0

                    ),

                paidOrders:

                    merchants.paidOrders ||

                    0

            },

            currency:

                "USD",

            generatedAt:

                new Date()

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate platform revenue summary.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Recent Merchants
|--------------------------------------------------------------------------
|
| Returns the newest merchant registrations.
|
|--------------------------------------------------------------------------
*/

export const getRecentMerchants = async (

    limit = 10

) => {

    try {

        const safeLimit = Math.min(

            Math.max(

                Number(limit) || 10,

                1

            ),

            50

        );


        return await User.find({

            role:

                USER_ROLES.MERCHANT

        })

            .select(

                "firstName " +

                "lastName " +

                "email " +

                "isActive " +

                "isEmailVerified " +

                "createdAt"

            )

            .sort({

                createdAt: -1

            })

            .limit(safeLimit)

            .lean();

    }

    catch (error) {

        logger.error(

            "Failed to retrieve recent merchants.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Recent Subscriptions
|--------------------------------------------------------------------------
|
| Returns the latest subscription records.
|
|--------------------------------------------------------------------------
*/

export const getRecentSubscriptions = async (

    limit = 10

) => {

    try {

        const safeLimit = Math.min(

            Math.max(

                Number(limit) || 10,

                1

            ),

            50

        );


        return await Subscription.find()

            .populate({

                path:

                    "user",

                select:

                    "firstName " +

                    "lastName " +

                    "email"

            })

            .populate({

                path:

                    "shop",

                select:

                    "shop " +

                    "storeName " +

                    "isInstalled " +

                    "status"

            })

            .sort({

                createdAt: -1

            })

            .limit(safeLimit)

            .lean();

    }

    catch (error) {

        logger.error(

            "Failed to retrieve recent subscriptions.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Recent Orders
|--------------------------------------------------------------------------
|
| Returns the latest Shopify orders across the platform.
|
|--------------------------------------------------------------------------
*/

export const getRecentOrders = async (

    limit = 10

) => {

    try {

        const safeLimit = Math.min(

            Math.max(

                Number(limit) || 10,

                1

            ),

            50

        );


        return await Order.find()

            .populate({

                path:

                    "shop",

                select:

                    "shop " +

                    "storeName"

            })

            .sort({

                createdAt: -1

            })

            .limit(safeLimit)

            .lean();

    }

    catch (error) {

        logger.error(

            "Failed to retrieve recent orders.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Admin Dashboard Summary
|--------------------------------------------------------------------------
|
| Combines the most important dashboard information into
| one API-ready response.
|
|--------------------------------------------------------------------------
*/

export const getAdminDashboardSummary = async () => {

    try {

        const [

            overview,

            dashboard,

            revenue,

            subscriptions,

            plans,

            recentMerchants,

            recentSubscriptions,

            recentOrders

        ] = await Promise.all([

            getPlatformOverview(),

            getDashboardStatistics(),

            getRevenueStatistics(),

            getSubscriptionStatistics(),

            getPlanStatistics(),

            getRecentMerchants(10),

            getRecentSubscriptions(10),

            getRecentOrders(10)

        ]);


        return {

            overview,

            dashboard,

            revenue,

            subscriptions,

            plans,

            recent: {

                merchants:

                    recentMerchants,

                subscriptions:

                    recentSubscriptions,

                orders:

                    recentOrders

            },

            generatedAt:

                new Date()

        };

    }

    catch (error) {

        logger.error(

            "Failed to generate admin dashboard summary.",

            {

                error:

                    error.message,

                stack:

                    error.stack

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Validate Object ID
|--------------------------------------------------------------------------
|
| Shared helper for admin service operations.
|
|--------------------------------------------------------------------------
*/

export const isValidObjectId = (

    id

) => {

    return mongoose.Types.ObjectId.isValid(

        id

    );

};


/*
|--------------------------------------------------------------------------
| Final Service Export Summary
|--------------------------------------------------------------------------
|
| All functions are already exported using named exports above.
|
| This comment exists to make the public service API clear.
|
|--------------------------------------------------------------------------
|
| Dashboard:
|
| - getPlatformOverview
| - getDashboardStatistics
| - getAdminDashboardSummary
|
| Statistics:
|
| - getMerchantStatistics
| - getShopStatistics
| - getSubscriptionStatistics
| - getRevenueStatistics
| - getOrderStatistics
| - getProductStatistics
| - getCustomerStatistics
| - getPlanStatistics
| - getPlatformRevenueSummary
|
| Merchants:
|
| - getMerchants
| - getMerchantById
| - updateMerchantStatus
|
| Shops:
|
| - getShops
| - getShopById
| - updateShopStatus
|
| Subscriptions:
|
| - getSubscriptions
| - getSubscriptionById
| - getPlanInformation
| - updateSubscriptionStatus
| - updateSubscriptionPlan
| - extendSubscriptionTrial
| - lockSubscriptionFeatures
| - unlockSubscriptionFeatures
|
| Recent Data:
|
| - getRecentMerchants
| - getRecentSubscriptions
| - getRecentOrders
|
| Utility:
|
| - isValidObjectId
|
|--------------------------------------------------------------------------
*/
