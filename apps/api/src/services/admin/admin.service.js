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
/*
|--------------------------------------------------------------------------
| Get Merchants
|--------------------------------------------------------------------------
*/

export const getMerchants = async (

    options = {}

) => {

    try {

        const page = Math.max(

            Number(

                options.page

            ) || DEFAULT_PAGE,

            1

        );

        const limit = Math.min(

            Math.max(

                Number(

                    options.limit

                ) || DEFAULT_LIMIT,

                1

            ),

            MAX_LIMIT

        );

        const skip =

            (page - 1) *

            limit;

        const search =

            options.search?.trim();

        const filter = {

            role: "merchant"

        };

        if (search) {

            filter.$or = [

                {

                    email: {

                        $regex:

                            search,

                        $options:

                            "i"

                    }

                },

                {

                    name: {

                        $regex:

                            search,

                        $options:

                            "i"

                    }

                }

            ];

        }

        const [

            merchants,

            total

        ] = await Promise.all([

            User.find(

                filter

            )

                .select(

                    "-password -refreshToken"

                )

                .sort({

                    createdAt: -1

                })

                .skip(

                    skip

                )

                .limit(

                    limit

                )

                .lean(),

            User.countDocuments(

                filter

            )

        ]);

        return {

            merchants,

            pagination: {

                page,

                limit,

                total,

                totalPages:

                    Math.ceil(

                        total /

                        limit

                    )

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve merchants.",

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
| Get Merchant By ID
|--------------------------------------------------------------------------
*/

export const getMerchantById = async (

    merchantId

) => {

    try {

        const merchant =

            await User.findOne({

                _id:

                    merchantId,

                role:

                    "merchant"

            })

                .select(

                    "-password -refreshToken"

                )

                .lean();

        if (!merchant) {

            throw new Error(

                "Merchant not found."

            );

        }

        return merchant;

    }

    catch (error) {

        logger.error(

            "Failed to retrieve merchant.",

            {

                merchantId,

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Merchant Shops
|--------------------------------------------------------------------------
*/

export const getMerchantShops = async (

    merchantId

) => {

    try {

        const shops =

            await Shop.find({

                user:

                    merchantId

            })

                .sort({

                    createdAt: -1

                })

                .lean();

        return shops;

    }

    catch (error) {

        logger.error(

            "Failed to retrieve merchant shops.",

            {

                merchantId,

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Update Merchant Status
|--------------------------------------------------------------------------
*/

export const updateMerchantStatus = async (

    merchantId,

    isActive

) => {

    try {

        const merchant =

            await User.findOneAndUpdate(

                {

                    _id:

                        merchantId,

                    role:

                        "merchant"

                },

                {

                    $set: {

                        isActive:

                            Boolean(

                                isActive

                            ),

                        updatedAt:

                            new Date()

                    }

                },

                {

                    new: true

                }

            )

                .select(

                    "-password -refreshToken"

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

                isActive:

                    Boolean(

                        isActive

                    )

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

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Shop By ID
|--------------------------------------------------------------------------
*/

export const getShopById = async (

    shopId

) => {

    try {

        const shop =

            await Shop.findById(

                shopId

            )

                .lean();

        if (!shop) {

            throw new Error(

                "Shop not found."

            );

        }

        return shop;

    }

    catch (error) {

        logger.error(

            "Failed to retrieve shop.",

            {

                shopId,

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Update Shop Status
|--------------------------------------------------------------------------
*/

export const updateShopStatus = async (

    shopId,

    installed

) => {

    try {

        const shop =

            await Shop.findByIdAndUpdate(

                shopId,

                {

                    $set: {

                        installed:

                            Boolean(

                                installed

                            ),

                        updatedAt:

                            new Date()

                    }

                },

                {

                    new: true

                }

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

                installed:

                    Boolean(

                        installed

                    )

            }

        );

        return shop;

    }

    catch (error) {

        logger.error(

            "Failed to update shop status.",

            {

                shopId,

                error:

                    error.message

            }

        );

        throw error;

    }

};
/*
|--------------------------------------------------------------------------
| Get All Admin Users
|--------------------------------------------------------------------------
*/

export const getAdminUsers = async (

    options = {}

) => {

    try {

        const page = Math.max(

            Number(

                options.page

            ) || DEFAULT_PAGE,

            1

        );

        const limit = Math.min(

            Math.max(

                Number(

                    options.limit

                ) || DEFAULT_LIMIT,

                1

            ),

            MAX_LIMIT

        );

        const skip =

            (page - 1) *

            limit;

        const filter = {

            role: {

                $in: [

                    ADMIN_ROLES.ADMIN,

                    ADMIN_ROLES.SUPER_ADMIN

                ]

            }

        };

        const [

            admins,

            total

        ] = await Promise.all([

            User.find(

                filter

            )

                .select(

                    "-password -refreshToken"

                )

                .sort({

                    createdAt: -1

                })

                .skip(

                    skip

                )

                .limit(

                    limit

                )

                .lean(),

            User.countDocuments(

                filter

            )

        ]);

        return {

            admins,

            pagination: {

                page,

                limit,

                total,

                totalPages:

                    Math.ceil(

                        total /

                        limit

                    )

            }

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve admin users.",

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
| Update User Role
|--------------------------------------------------------------------------
*/

export const updateUserRole = async (

    userId,

    role

) => {

    try {

        if (

            !Object.values(

                ADMIN_ROLES

            ).includes(

                role

            ) &&

            role !== "merchant"

        ) {

            throw new Error(

                "Invalid user role."

            );

        }

        const user =

            await User.findByIdAndUpdate(

                userId,

                {

                    $set: {

                        role,

                        updatedAt:

                            new Date()

                    }

                },

                {

                    new: true

                }

            )

                .select(

                    "-password -refreshToken"

                )

                .lean();

        if (!user) {

            throw new Error(

                "User not found."

            );

        }

        logger.info(

            "User role updated.",

            {

                userId,

                role

            }

        );

        return user;

    }

    catch (error) {

        logger.error(

            "Failed to update user role.",

            {

                userId,

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Get Subscription By Shop
|--------------------------------------------------------------------------
*/

export const getShopSubscription = async (

    shop

) => {

    try {

        const subscription =

            await Subscription.findOne({

                shop

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

            "Failed to retrieve shop subscription.",

            {

                shop,

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Update Subscription Status
|--------------------------------------------------------------------------
*/

export const updateSubscriptionStatus = async (

    subscriptionId,

    status

) => {

    try {

        const allowedStatuses = [

            "trial",

            "active",

            "past_due",

            "cancelled",

            "expired"

        ];

        if (

            !allowedStatuses.includes(

                status

            )

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

                        status,

                        updatedAt:

                            new Date()

                    }

                },

                {

                    new: true

                }

            )

                .lean();

        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }

        logger.info(

            "Subscription status updated by admin.",

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

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Change Subscription Plan
|--------------------------------------------------------------------------
*/

export const updateSubscriptionPlan = async (

    subscriptionId,

    plan

) => {

    try {

        const allowedPlans = [

            "starter",

            "growth",

            "premium",

            "enterprise"

        ];

        if (

            !allowedPlans.includes(

                plan

            )

        ) {

            throw new Error(

                "Invalid subscription plan."

            );

        }

        const subscription =

            await Subscription.findByIdAndUpdate(

                subscriptionId,

                {

                    $set: {

                        plan,

                        updatedAt:

                            new Date()

                    }

                },

                {

                    new: true

                }

            )

                .lean();

        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }

        logger.info(

            "Subscription plan updated by admin.",

            {

                subscriptionId,

                plan

            }

        );

        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to update subscription plan.",

            {

                subscriptionId,

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Cancel Subscription
|--------------------------------------------------------------------------
*/

export const cancelShopSubscription = async (

    subscriptionId

) => {

    try {

        const subscription =

            await Subscription.findByIdAndUpdate(

                subscriptionId,

                {

                    $set: {

                        status:

                            "cancelled",

                        cancelledAt:

                            new Date(),

                        updatedAt:

                            new Date()

                    }

                },

                {

                    new: true

                }

            )

                .lean();

        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }

        logger.info(

            "Subscription cancelled by admin.",

            {

                subscriptionId

            }

        );

        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to cancel subscription.",

            {

                subscriptionId,

                error:

                    error.message

            }

        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| Activate Subscription
|--------------------------------------------------------------------------
*/

export const activateShopSubscription = async (

    subscriptionId

) => {

    try {

        const subscription =

            await Subscription.findByIdAndUpdate(

                subscriptionId,

                {

                    $set: {

                        status:

                            "active",

                        activatedAt:

                            new Date(),

                        updatedAt:

                            new Date()

                    },

                    $unset: {

                        cancelledAt: 1

                    }

                },

                {

                    new: true

                }

            )

                .lean();

        if (!subscription) {

            throw new Error(

                "Subscription not found."

            );

        }

        logger.info(

            "Subscription activated by admin.",

            {

                subscriptionId

            }

        );

        return subscription;

    }

    catch (error) {

        logger.error(

            "Failed to activate subscription.",

            {

                subscriptionId,

                error:

                    error.message

            }

        );

        throw error;

    }

};
/*
|--------------------------------------------------------------------------
| Get Recent Platform Activity
|--------------------------------------------------------------------------
*/

export const getRecentPlatformActivity = async (

    options = {}

) => {

    try {

        const limit = Math.min(

            Math.max(

                Number(

                    options.limit

                ) || 10,

                1

            ),

            50

        );

        const [

            recentUsers,

            recentShops,

            recentSubscriptions,

            recentOrders

        ] = await Promise.all([

            User.find()

                .select(

                    "name email role createdAt"

                )

                .sort({

                    createdAt: -1

                })

                .limit(

                    limit

                )

                .lean(),

            Shop.find()

                .select(

                    "shopifyDomain installed createdAt"

                )

                .sort({

                    createdAt: -1

                })

                .limit(

                    limit

                )

                .lean(),

            Subscription.find()

                .select(

                    "shop plan status createdAt updatedAt"

                )

                .sort({

                    updatedAt: -1

                })

                .limit(

                    limit

                )

                .lean(),

            Order.find()

                .select(

                    "shopifyOrderId shop totalPrice financialStatus createdAt"

                )

                .sort({

                    createdAt: -1

                })

                .limit(

                    limit

                )

                .lean()

        ]);

        return {

            users:

                recentUsers,

            shops:

                recentShops,

            subscriptions:

                recentSubscriptions,

            orders:

                recentOrders,

            generatedAt:

                new Date()

        };

    }

    catch (error) {

        logger.error(

            "Failed to retrieve recent platform activity.",

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
| Get Admin Service Health
|--------------------------------------------------------------------------
*/

export const getAdminServiceHealth = async () => {

    try {

        const [

            users,

            shops,

            subscriptions

        ] = await Promise.all([

            User.estimatedDocumentCount(),

            Shop.estimatedDocumentCount(),

            Subscription.estimatedDocumentCount()

        ]);

        return {

            service:

                ADMIN_SERVICE_NAME,

            version:

                ADMIN_SERVICE_VERSION,

            status:

                "healthy",

            database: {

                users,

                shops,

                subscriptions

            },

            timestamp:

                new Date()

        };

    }

    catch (error) {

        logger.error(

            "Admin service health check failed.",

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
| Get Admin Service Information
|--------------------------------------------------------------------------
*/

export const getAdminServiceInfo = () => {

    return {

        service:

            ADMIN_SERVICE_NAME,

        version:

            ADMIN_SERVICE_VERSION,

        roles:

            Object.values(

                ADMIN_ROLES

            ),

        pagination: {

            defaultPage:

                DEFAULT_PAGE,

            defaultLimit:

                DEFAULT_LIMIT,

            maxLimit:

                MAX_LIMIT

        }

    };

};


/*
|--------------------------------------------------------------------------
| Service Startup Validation
|--------------------------------------------------------------------------
*/

logger.info(

    "========================================"

);

logger.info(

    "Layboka Admin Service Ready"

);

logger.info(

    `Version : ${ADMIN_SERVICE_VERSION}`

);

logger.info(

    "Status  : Initialized"

);

logger.info(

    "========================================"

);


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    ADMIN_SERVICE_NAME,

    ADMIN_SERVICE_VERSION,

    DEFAULT_PAGE,

    DEFAULT_LIMIT,

    MAX_LIMIT

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    getPlatformOverview,

    getDashboardStatistics,

    getMerchantStatistics,

    getSubscriptionStatistics,

    getRevenueStatistics,

    getOrderStatistics,

    getProductStatistics,

    getCustomerStatistics,

    getMerchants,

    getMerchantById,

    getMerchantShops,

    updateMerchantStatus,

    getShopById,

    updateShopStatus,

    getAdminUsers,

    updateUserRole,

    getShopSubscription,

    updateSubscriptionStatus,

    updateSubscriptionPlan,

    cancelShopSubscription,

    activateShopSubscription,

    getRecentPlatformActivity,

    getAdminServiceHealth,

    getAdminServiceInfo

};
