import Subscription from "../../models/Subscription.js";
import Shop from "../../models/Shop.js";
import User from "../../models/User.js";

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
| Billing Interval
|--------------------------------------------------------------------------
*/

export const BILLING_INTERVAL = Object.freeze({

    MONTHLY: "monthly",

    YEARLY: "yearly"

});

/*
|--------------------------------------------------------------------------
| Trial Configuration
|--------------------------------------------------------------------------
*/

export const TRIAL_CONFIG = Object.freeze({

    DAYS: 7,

    ENABLED: true

});

/*
|--------------------------------------------------------------------------
| Plan Configuration
|--------------------------------------------------------------------------
*/

export const PLAN_CONFIG = Object.freeze({

    starter: {

        name: "Starter",

        price: 25,

        currency: "USD",

        aiModel: "gpt-4o-mini",

        dailyMessages: 300,

        maxProducts: 500,

        maxConversations: 10000

    },

    growth: {

        name: "Growth",

        price: 59,

        currency: "USD",

        aiModel: "gpt-4o-mini",

        dailyMessages: 800,

        maxProducts: 3000,

        maxConversations: 50000

    },

    premium: {

        name: "Premium",

        price: 149,

        currency: "USD",

        aiModel: "gpt-5",

        dailyMessages: 2500,

        maxProducts: 10000,

        maxConversations: 250000

    },

    enterprise: {

        name: "Enterprise",

        price: 0,

        currency: "USD",

        aiModel: "gpt-5",

        dailyMessages: Number.MAX_SAFE_INTEGER,

        maxProducts: Number.MAX_SAFE_INTEGER,

        maxConversations: Number.MAX_SAFE_INTEGER

    }

});

/*
|--------------------------------------------------------------------------
| Get Plan
|--------------------------------------------------------------------------
*/

export function getPlan(plan) {

    return PLAN_CONFIG[
        String(plan).toLowerCase()
    ] || PLAN_CONFIG.starter;

}

/*
|--------------------------------------------------------------------------
| Check Enterprise
|--------------------------------------------------------------------------
*/

export function isEnterprise(plan) {

    return (

        String(plan).toLowerCase() ===

        SUBSCRIPTION_PLANS.ENTERPRISE

    );

}

/*
|--------------------------------------------------------------------------
| Check Trial Active
|--------------------------------------------------------------------------
*/

export function isTrialActive(subscription) {

    if (!subscription) {

        return false;

    }

    if (!subscription.trialEndsAt) {

        return false;

    }

    return (

        new Date() <

        new Date(subscription.trialEndsAt)

    );

}
/*
|--------------------PART- 2------------------------------------------------------
| Create Subscription
|--------------------------------------------------------------------------
*/

export async function createSubscription({

    shop,

    plan,

    billingCycle = "monthly",

    currency = "USD",

    trial = true

}) {

    const subscription = new Subscription({

        shop: shop._id,

        merchant: shop.owner,

        plan,

        billingCycle,

        currency,

        status: trial ? "trial" : "active",

        paymentStatus: trial ? "pending" : "paid"

    });

    if (trial) {

        subscription.trialStartedAt = new Date();

        subscription.trialEndsAt = addDays(

            new Date(),

            plan.trialDays || 7

        );

    } else {

        subscription.startedAt = new Date();

        subscription.currentPeriodStart = new Date();

        subscription.currentPeriodEnd = addMonths(

            new Date(),

            1

        );

    }

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Start Free Trial
|--------------------------------------------------------------------------
*/

export async function startFreeTrial(

    subscription

) {

    if (!subscription) {

        throw new Error(

            "Subscription not found."

        );

    }

    subscription.status = "trial";

    subscription.paymentStatus = "pending";

    subscription.trialStartedAt = new Date();

    subscription.trialEndsAt = addDays(

        new Date(),

        subscription.plan.trialDays || 7

    );

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Activate Paid Subscription
|--------------------------------------------------------------------------
*/

export async function activateSubscription(

    subscription

) {

    subscription.status = "active";

    subscription.paymentStatus = "paid";

    subscription.startedAt = new Date();

    subscription.currentPeriodStart = new Date();

    subscription.currentPeriodEnd = addMonths(

        new Date(),

        1

    );

    subscription.cancelAtPeriodEnd = false;

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Cancel Subscription
|--------------------------------------------------------------------------
*/

export async function cancelSubscription(

    subscription,

    immediate = false

) {

    if (immediate) {

        subscription.status = "cancelled";

        subscription.cancelledAt = new Date();

    } else {

        subscription.cancelAtPeriodEnd = true;

    }

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Renew Subscription
|--------------------------------------------------------------------------
*/

export async function renewSubscription(

    subscription

) {

    subscription.currentPeriodStart =
        new Date();

    subscription.currentPeriodEnd =
        addMonths(

            new Date(),

            1

        );

    subscription.status = "active";

    subscription.paymentStatus = "paid";

    subscription.lastRenewedAt =
        new Date();

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Upgrade / Downgrade Plan
|--------------------------------------------------------------------------
*/

export async function changePlan(

    subscription,

    newPlan

) {

    subscription.plan = newPlan;

    subscription.updatedAt = new Date();

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Update Subscription Status
|--------------------------------------------------------------------------
*/

export async function updateSubscriptionStatus(

    subscription

) {

    const now = new Date();

    if (

        subscription.status === "trial" &&

        subscription.trialEndsAt &&

        subscription.trialEndsAt < now

    ) {

        subscription.status = "expired";

    }

    if (

        subscription.status === "active" &&

        subscription.currentPeriodEnd &&

        subscription.currentPeriodEnd < now

    ) {

        subscription.status = "expired";

    }

    await subscription.save();

    return subscription;

}
/*
|----------------------PART- 3 ----------------------------------------------------
| Validate Subscription Status
|--------------------------------------------------------------------------
*/

export function validateSubscription(subscription) {

    if (!subscription) {

        return {

            valid: false,

            reason: "Subscription not found."

        };

    }

    if (subscription.status !== "active") {

        return {

            valid: false,

            reason: "Subscription is not active."

        };

    }

    if (

        subscription.currentPeriodEnd &&

        new Date(subscription.currentPeriodEnd) < new Date()

    ) {

        return {

            valid: false,

            reason: "Subscription has expired."

        };

    }

    return {

        valid: true,

        reason: null

    };

}

/*
|--------------------------------------------------------------------------
| Check AI Token Limit
|--------------------------------------------------------------------------
*/

export function hasAvailableTokens(

    subscription,

    requestedTokens = 0

) {

    if (!subscription) {

        return false;

    }

    const used = subscription.usage?.tokens || 0;

    const limit = subscription.limits?.monthlyTokens || 0;

    return (

        used + requestedTokens <= limit

    );

}

/*
|--------------------------------------------------------------------------
| Check Message Limit
|--------------------------------------------------------------------------
*/

export function hasAvailableMessages(

    subscription,

    requestedMessages = 1

) {

    if (!subscription) {

        return false;

    }

    const used = subscription.usage?.messages || 0;

    const limit = subscription.limits?.monthlyMessages || 0;

    return (

        used + requestedMessages <= limit

    );

}

/*
|--------------------------------------------------------------------------
| Check Product Limit
|--------------------------------------------------------------------------
*/

export function hasAvailableProducts(

    subscription,

    currentProducts

) {

    if (!subscription) {

        return false;

    }

    return (

        currentProducts <

        subscription.limits.maxProducts

    );

}

/*
|--------------------------------------------------------------------------
| Check Team Member Limit
|--------------------------------------------------------------------------
*/

export function hasAvailableUsers(

    subscription,

    currentUsers

) {

    if (!subscription) {

        return false;

    }

    return (

        currentUsers <

        subscription.limits.maxUsers

    );

}

/*
|--------------------------------------------------------------------------
| Subscription Summary
|--------------------------------------------------------------------------
*/

export function getSubscriptionSummary(

    subscription

) {

    if (!subscription) {

        return null;

    }

    return {

        plan: subscription.plan,

        status: subscription.status,

        currentPeriodStart:

            subscription.currentPeriodStart,

        currentPeriodEnd:

            subscription.currentPeriodEnd,

        trialEndsAt:

            subscription.trialEndsAt,

        usage:

            subscription.usage,

        limits:

            subscription.limits

    };

}

/*
|--------------------------------------------------------------------------
| Subscription Service
|--------------------------------------------------------------------------
*/

export const SubscriptionService = {

    createSubscription,

    getSubscription,

    updateSubscription,

    cancelSubscription,

    activateSubscription,

    incrementUsage,

    resetMonthlyUsage,

    validateSubscription,

    hasAvailableTokens,

    hasAvailableMessages,

    hasAvailableProducts,

    hasAvailableUsers,

    getSubscriptionSummary

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default SubscriptionService;
