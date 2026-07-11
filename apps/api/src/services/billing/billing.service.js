import StripeService from "./stripe.service.js";

import Subscription from "../../models/Subscription.js";
import Invoice from "../../models/Invoice.js";
import Shop from "../../models/Shop.js";
import User from "../../models/User.js";

/*
|--------------------------------------------------------------------------
| Billing Configuration
|--------------------------------------------------------------------------
*/

export const BILLING_CONFIG = Object.freeze({

    CURRENCY: "USD",

    TRIAL_DAYS: 7,

    GRACE_PERIOD_DAYS: 3,

    AUTO_CANCEL_AFTER_DAYS: 14,

    TAX_PERCENTAGE: 0,

    PAYMENT_TIMEOUT_MINUTES: 30

});

/*
|--------------------------------------------------------------------------
| Billing Plans
|--------------------------------------------------------------------------
*/

export const BILLING_PLANS = Object.freeze({

    STARTER: {

        name: "Starter",

        monthlyPrice: 25,

        currency: "USD"

    },

    GROWTH: {

        name: "Growth",

        monthlyPrice: 59,

        currency: "USD"

    },

    PREMIUM: {

        name: "Premium",

        monthlyPrice: 149,

        currency: "USD"

    },

    ENTERPRISE: {

        name: "Enterprise",

        monthlyPrice: null,

        currency: "USD"

    }

});

/*
|--------------------------------------------------------------------------
| Calculate Tax
|--------------------------------------------------------------------------
*/

export function calculateTax(amount = 0) {

    return Number(

        (

            amount *

            BILLING_CONFIG.TAX_PERCENTAGE /

            100

        ).toFixed(2)

    );

}

/*
|--------------------------------------------------------------------------
| Calculate Total Amount
|--------------------------------------------------------------------------
*/

export function calculateTotal(amount = 0) {

    const tax = calculateTax(amount);

    return {

        subtotal: amount,

        tax,

        total: Number(

            (amount + tax).toFixed(2)

        )

    };

}

/*
|--------------------------------------------------------------------------
| Get Billing Plan
|--------------------------------------------------------------------------
*/

export function getBillingPlan(plan) {

    return (

        BILLING_PLANS[plan?.toUpperCase()] ||

        BILLING_PLANS.STARTER

    );

}
/*
|----------------------PART- 2 ----------------------------------------------------
| Create Stripe Checkout Session
|--------------------------------------------------------------------------
*/

export async function createCheckoutSession({

    customerId,

    priceId,

    plan,

    shop,

    successUrl,

    cancelUrl

}) {

    const session = await stripe.checkout.sessions.create({

        mode: "subscription",

        customer: customerId,

        payment_method_types: ["card"],

        line_items: [

            {

                price: priceId,

                quantity: 1

            }

        ],

        success_url: successUrl,

        cancel_url: cancelUrl,

        allow_promotion_codes: true,

        billing_address_collection: "auto",

        customer_update: {

            address: "auto",

            name: "auto"

        },

        metadata: {

            shopId: shop._id.toString(),

            plan,

            platform: "Layboka AI"

        }

    });

    return session;

}

/*
|--------------------------------------------------------------------------
| Start 7-Day Free Trial
|--------------------------------------------------------------------------
*/

export async function startTrial(subscription) {

    subscription.status = "trial";

    subscription.trialStartedAt = new Date();

    subscription.trialEndsAt = new Date(

        Date.now() +

        (7 * 24 * 60 * 60 * 1000)

    );

    subscription.currentPeriodStart =

        subscription.trialStartedAt;

    subscription.currentPeriodEnd =

        subscription.trialEndsAt;

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Upgrade Subscription Plan
|--------------------------------------------------------------------------
*/

export async function upgradePlan(

    subscription,

    newPlan,

    stripePriceId

) {

    if (!subscription.stripeSubscriptionId) {

        throw new Error(

            "Stripe subscription not found."

        );

    }

    const stripeSubscription =

        await stripe.subscriptions.retrieve(

            subscription.stripeSubscriptionId

        );

    await stripe.subscriptions.update(

        subscription.stripeSubscriptionId,

        {

            items: [

                {

                    id: stripeSubscription.items.data[0].id,

                    price: stripePriceId

                }

            ],

            proration_behavior: "create_prorations"

        }

    );

    subscription.plan = newPlan;

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Downgrade Subscription
|--------------------------------------------------------------------------
*/

export async function downgradePlan(

    subscription,

    newPlan,

    stripePriceId

) {

    const stripeSubscription =

        await stripe.subscriptions.retrieve(

            subscription.stripeSubscriptionId

        );

    await stripe.subscriptions.update(

        subscription.stripeSubscriptionId,

        {

            items: [

                {

                    id: stripeSubscription.items.data[0].id,

                    price: stripePriceId

                }

            ],

            proration_behavior: "none"

        }

    );

    subscription.plan = newPlan;

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Cancel Subscription
|--------------------------------------------------------------------------
*/

export async function cancelSubscription(

    subscription

) {

    await stripe.subscriptions.update(

        subscription.stripeSubscriptionId,

        {

            cancel_at_period_end: true

        }

    );

    subscription.cancelAtPeriodEnd = true;

    subscription.status = "canceling";

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Resume Subscription
|--------------------------------------------------------------------------
*/

export async function resumeSubscription(

    subscription

) {

    await stripe.subscriptions.update(

        subscription.stripeSubscriptionId,

        {

            cancel_at_period_end: false

        }

    );

    subscription.cancelAtPeriodEnd = false;

    subscription.status = "active";

    await subscription.save();

    return subscription;

}

/*
|--------------------------------------------------------------------------
| Validate Stripe Payment
|--------------------------------------------------------------------------
*/

export async function validatePayment(sessionId) {

    const session =

        await stripe.checkout.sessions.retrieve(

            sessionId

        );

    if (

        session.payment_status !== "paid"

    ) {

        throw new Error(

            "Payment validation failed."

        );

    }

    return session;
}
/*
|----------------------- PART- 3---------------------------------------------------
| Validate Subscription Access
|--------------------------------------------------------------------------
*/

export async function validateSubscriptionAccess(

    shopId

) {

    const subscription = await Subscription
        .findOne({
            shop: shopId
        })
        .sort({
            createdAt: -1
        });

    if (!subscription) {

        return {

            valid: false,

            reason: "No active subscription"

        };

    }

    if (
        subscription.status !== "active"
    ) {

        return {

            valid: false,

            reason: "Subscription inactive"

        };

    }

    if (
        subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd <
        new Date()
    ) {

        return {

            valid: false,

            reason: "Subscription expired"

        };

    }

    return {

        valid: true,

        subscription

    };

}

/*
|--------------------------------------------------------------------------
| Calculate Monthly Revenue
|--------------------------------------------------------------------------
*/

export async function calculateMonthlyRevenue() {

    const subscriptions =
        await Subscription.find({

            status: "active"

        });

    let revenue = 0;

    for (const subscription of subscriptions) {

        revenue += Number(

            subscription.amount || 0

        );

    }

    return {

        monthlyRevenue: revenue,

        activeSubscriptions:
            subscriptions.length

    };

}

/*
|--------------------------------------------------------------------------
| Calculate Revenue By Plan
|--------------------------------------------------------------------------
*/

export async function calculateRevenueByPlan() {

    const plans = [

        "starter",

        "growth",

        "premium",

        "enterprise"

    ];

    const result = {};

    for (const plan of plans) {

        const subscriptions =
            await Subscription.find({

                plan,

                status: "active"

            });

        result[plan] = {

            subscribers:
                subscriptions.length,

            revenue:
                subscriptions.reduce(

                    (sum, item) =>

                        sum +

                        Number(

                            item.amount || 0

                        ),

                    0

                )

        };

    }

    return result;

}

/*
|--------------------------------------------------------------------------
| Billing Health Metrics
|--------------------------------------------------------------------------
*/

export async function getBillingMetrics() {

    const active =
        await Subscription.countDocuments({

            status: "active"

        });

    const cancelled =
        await Subscription.countDocuments({

            status: "cancelled"

        });

    const trialing =
        await Subscription.countDocuments({

            status: "trialing"

        });

    return {

        active,

        cancelled,

        trialing,

        total:

            active +

            cancelled +

            trialing

    };

}

/*
|--------------------------------------------------------------------------
| Billing Service
|--------------------------------------------------------------------------
*/

export const BillingService = {

    createSubscription,

    activateSubscription,

    cancelSubscription,

    renewSubscription,

    validateSubscriptionAccess,

    calculateMonthlyRevenue,

    calculateRevenueByPlan,

    getBillingMetrics

};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default BillingService;
