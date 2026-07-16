// layboka/apps/api/src/services/customer/customer.service.js
import Visitor from "../../models/Visitor.js";
import Conversation from "../../models/Conversation.js";
import Order from "../../models/Order.js";
import Analytics from "../../models/Analytics.js";

/*
|--------------------------------------------------------------------------
| Customer Configuration
|--------------------------------------------------------------------------
*/

export const CUSTOMER_CONFIG = Object.freeze({

    VIP_SPENDING: 1000,

    VIP_ORDERS: 10,

    RECENT_DAYS: 30

});

/*
|--------------------------------------------------------------------------
| Find Customer
|--------------------------------------------------------------------------
*/

export async function findCustomer(visitorId) {

    return Visitor.findById(visitorId);

}

/*
|--------------------------------------------------------------------------
| Find Customer By Email
|--------------------------------------------------------------------------
*/

export async function findCustomerByEmail(email) {

    if (!email) {

        return null;

    }

    return Visitor.findOne({

        email: email.toLowerCase()

    });

}

/*
|--------------------------------------------------------------------------
| Create Customer
|--------------------------------------------------------------------------
*/

export async function createCustomer(data = {}) {

    const visitor = new Visitor({

        firstName: data.firstName || "",

        lastName: data.lastName || "",

        email: data.email || "",

        phone: data.phone || "",

        preferredLanguage: data.preferredLanguage || "en",

        preferredCurrency: data.preferredCurrency || "USD"

    });

    await visitor.save();

    return visitor;

}

/*
|--------------------------------------------------------------------------
| Update Customer
|--------------------------------------------------------------------------
*/

export async function updateCustomer(

    visitorId,

    updates = {}

) {

    return Visitor.findByIdAndUpdate(

        visitorId,

        {

            $set: updates

        },

        {

            new: true,

            runValidators: true

        }

    );

}

/*
|--------------------------------------------------------------------------
| Update Preferences
|--------------------------------------------------------------------------
*/

export async function updatePreferences(

    visitorId,

    preferences = {}

) {

    return updateCustomer(

        visitorId,

        {

            preferredLanguage:

                preferences.language,

            preferredCurrency:

                preferences.currency,

            favoriteCategory:

                preferences.favoriteCategory,

            favoriteBrand:

                preferences.favoriteBrand

        }

    );

}

/*
|--------------------------------------------------------------------------
| Get Customer Profile
|--------------------------------------------------------------------------
*/

export async function getCustomerProfile(

    visitorId

) {

    return Visitor.findById(visitorId)

        .lean();

}
/*
|--------------------------------------------------------------------------
| Customer Purchase History
|--------------------------------------------------------------------------
*/

export async function getCustomerPurchaseHistory(

    visitorId,

    limit = 20

) {

    return Order.find({

        visitor: visitorId,

        deleted: false

    })
        .sort({

            createdAt: -1

        })
        .limit(limit)
        .lean();

}

/*
|--------------------------------------------------------------------------
| Customer Conversation History
|--------------------------------------------------------------------------
*/

export async function getCustomerConversationHistory(

    visitorId,

    limit = 20

) {

    return Conversation.find({

        visitor: visitorId,

        deleted: false

    })
        .sort({

            lastMessageAt: -1

        })
        .limit(limit)
        .lean();

}

/*
|--------------------------------------------------------------------------
| Customer Statistics
|--------------------------------------------------------------------------
*/

export async function getCustomerStatistics(

    visitorId

) {

    const orders = await Order.find({

        visitor: visitorId,

        deleted: false

    }).lean();

    const conversations = await Conversation.find({

        visitor: visitorId,

        deleted: false

    }).lean();

    const totalOrders = orders.length;

    const totalSpent = orders.reduce(

        (total, order) =>

            total + Number(order.total || 0),

        0

    );

    const completedOrders = orders.filter(

        order => order.financialStatus === "paid"

    ).length;

    const averageOrderValue =

        totalOrders > 0

            ? totalSpent / totalOrders

            : 0;

    return {

        totalOrders,

        completedOrders,

        totalSpent,

        averageOrderValue,

        totalConversations:

            conversations.length

    };

}

/*
|--------------------------------------------------------------------------
| Customer Lifetime Value (CLV)
|--------------------------------------------------------------------------
*/

export async function calculateCustomerLifetimeValue(

    visitorId

) {

    const stats =

        await getCustomerStatistics(

            visitorId

        );

    return {

        lifetimeValue:

            Number(

                stats.totalSpent.toFixed(2)

            ),

        currency: "USD"

    };

}

/*
|--------------------------------------------------------------------------
| Average Order Value (AOV)
|--------------------------------------------------------------------------
*/

export async function calculateAverageOrderValue(

    visitorId

) {

    const stats =

        await getCustomerStatistics(

            visitorId

        );

    return Number(

        stats.averageOrderValue.toFixed(2)

    );

}

/*
|--------------------------------------------------------------------------
| Recent Customer Activity
|--------------------------------------------------------------------------
*/

export async function getRecentCustomerActivity(

    visitorId,

    limit = 10

) {

    const conversations =

        await getCustomerConversationHistory(

            visitorId,

            limit

        );

    const orders =

        await getCustomerPurchaseHistory(

            visitorId,

            limit

        );

    return {

        conversations,

        orders

    };

}

/*
|--------------------------------------------------------------------------
| Customer Dashboard Data
|--------------------------------------------------------------------------
*/

export async function getCustomerDashboard(

    visitorId

) {

    const [

        customer,

        statistics,

        lifetimeValue,

        activity

    ] = await Promise.all([

        Visitor.findById(visitorId).lean(),

        getCustomerStatistics(visitorId),

        calculateCustomerLifetimeValue(visitorId),

        getRecentCustomerActivity(visitorId)

    ]);

    return {

        customer,

        statistics,

        lifetimeValue,

        recentActivity: activity

    };

}
/*
|--------------------------------------------------------------------------
| Customer Segmentation
|--------------------------------------------------------------------------
*/

export function getCustomerSegment(customerStats = {}) {

    const {

        totalOrders = 0,

        totalSpent = 0,

        lastOrderDays = 9999

    } = customerStats;

    if (totalSpent >= 5000 || totalOrders >= 50) {

        return "vip";

    }

    if (totalSpent >= 2000 || totalOrders >= 20) {

        return "loyal";

    }

    if (totalOrders >= 5) {

        return "returning";

    }

    if (lastOrderDays <= 30) {

        return "active";

    }

    return "new";

}

/*
|--------------------------------------------------------------------------
| Customer Loyalty Score
|--------------------------------------------------------------------------
*/

export function calculateLoyaltyScore(customerStats = {}) {

    let score = 0;

    score += Math.min(

        customerStats.totalOrders || 0,

        50

    );

    score += Math.min(

        Math.floor(

            (customerStats.totalSpent || 0) / 100

        ),

        30

    );

    score += Math.min(

        customerStats.totalConversations || 0,

        10

    );

    if ((customerStats.lastOrderDays || 9999) <= 30) {

        score += 10;

    }

    return Math.min(score, 100);

}

/*
|--------------------------------------------------------------------------
| Customer Insights
|--------------------------------------------------------------------------
*/

export function generateCustomerInsights(customer = {}) {

    const stats = customer.statistics || {};

    return {

        segment: getCustomerSegment({

            totalOrders: stats.totalOrders,

            totalSpent: stats.totalSpent,

            lastOrderDays: stats.lastOrderDays

        }),

        loyaltyScore: calculateLoyaltyScore({

            totalOrders: stats.totalOrders,

            totalSpent: stats.totalSpent,

            totalConversations: stats.totalConversations,

            lastOrderDays: stats.lastOrderDays

        }),

        averageOrderValue:

            stats.averageOrderValue || 0,

        lifetimeValue:

            stats.customerLifetimeValue || 0,

        favoriteCategory:

            customer.favoriteCategory || null,

        favoriteBrand:

            customer.favoriteBrand || null,

        preferredLanguage:

            customer.preferredLanguage || "en",

        preferredCurrency:

            customer.preferredCurrency || "USD"

    };

}

/*
|--------------------------------------------------------------------------
| Customer Health Score
|--------------------------------------------------------------------------
*/

export function calculateHealthScore(customer = {}) {

    const stats = customer.statistics || {};

    let score = 50;

    if ((stats.totalOrders || 0) >= 5) {

        score += 10;

    }

    if ((stats.totalSpent || 0) >= 1000) {

        score += 10;

    }

    if ((stats.totalConversations || 0) >= 5) {

        score += 10;

    }

    if ((stats.lastOrderDays || 9999) <= 30) {

        score += 20;

    }

    return Math.min(score, 100);

}

/*
|--------------------------------------------------------------------------
| Customer Summary
|--------------------------------------------------------------------------
*/

export function buildCustomerSummary(customer = {}) {

    return {

        id: customer._id,

        name: customer.name,

        email: customer.email,

        statistics: customer.statistics || {},

        insights: generateCustomerInsights(customer),

        healthScore: calculateHealthScore(customer)

    };

}

/*
|--------------------------------------------------------------------------
| Helper - Days Since Date
|--------------------------------------------------------------------------
*/

export function daysSince(date) {

    if (!date) {

        return null;

    }

    const oneDay = 1000 * 60 * 60 * 24;

    return Math.floor(

        (Date.now() - new Date(date).getTime()) /

        oneDay

    );

}

/*
|--------------------------------------------------------------------------
| Helper - Currency Formatter
|--------------------------------------------------------------------------
*/

export function formatCurrency(

    amount = 0,

    currency = "USD"

) {

    return new Intl.NumberFormat(

        "en-US",

        {

            style: "currency",

            currency

        }

    ).format(amount);

}
/*
|--------------------------------------------------------------------------
| Customer Service
|--------------------------------------------------------------------------
*/

export const CustomerService = {

    /*
    |--------------------------------------------------------------------------
    | Customer Lookup
    |--------------------------------------------------------------------------
    */

    findCustomer,

    findCustomerById,

    findCustomerByEmail,

    createCustomer,

    updateCustomer,

    deleteCustomer,

    /*
    |--------------------------------------------------------------------------
    | Customer Analytics
    |--------------------------------------------------------------------------
    */

    getPurchaseHistory,

    getConversationHistory,

    getCustomerStatistics,

    calculateLifetimeValue,

    calculateAverageOrderValue,

    getRecentActivity,

    getCustomerDashboardData,

    /*
    |--------------------------------------------------------------------------
    | Customer Intelligence
    |--------------------------------------------------------------------------
    */

    calculateLoyaltyScore,

    getCustomerSegment,

    generateCustomerInsights,

    getFavoriteProducts,

    getFavoriteCategories,

    getFavoriteBrands,

    getRecommendedProducts,

    getCustomerTimeline,

    getCustomerSummary

};

/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    findCustomer,

    findCustomerById,

    findCustomerByEmail,

    createCustomer,

    updateCustomer,

    deleteCustomer,

    getPurchaseHistory,

    getConversationHistory,

    getCustomerStatistics,

    calculateLifetimeValue,

    calculateAverageOrderValue,

    getRecentActivity,

    getCustomerDashboardData,

    calculateLoyaltyScore,

    getCustomerSegment,

    generateCustomerInsights,

    getFavoriteProducts,

    getFavoriteCategories,

    getFavoriteBrands,

    getRecommendedProducts,

    getCustomerTimeline,

    getCustomerSummary

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default CustomerService;
