/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Subscription from "../../models/subscription.model.js";

import Shop from "../../models/shop.model.js";

import stripe from "../payments/stripe.service.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

async function findSubscription(

    subscriptionId

) {

    const subscription =

        await Subscription.findById(

            subscriptionId

        );

    if (

        !subscription

    ) {

        throw new Error(

            "Subscription not found."

        );

    }

    return subscription;

}


async function findSubscriptionByShop(

    shopId

) {

    const subscription =

        await Subscription.findByShop(

            shopId

        );

    if (

        !subscription

    ) {

        throw new Error(

            "Subscription not found."

        );

    }

    return subscription;

}


/*
|--------------------------------------------------------------------------
| Response Mapper
|--------------------------------------------------------------------------
*/

function mapSubscription(

    subscription

) {

    return {

        id:

            subscription._id,

        shop:

            subscription.shop,

        plan:

            subscription.plan,

        planName:

            subscription.planName,

        status:

            subscription.status,

        billingCycle:

            subscription.billingCycle,

        currency:

            subscription.currency,

        stripeCustomerId:

            subscription.stripeCustomerId,

        stripeSubscriptionId:

            subscription.stripeSubscriptionId,

        stripePriceId:

            subscription.stripePriceId,

        trialStart:

            subscription.trialStart,

        trialEnd:

            subscription.trialEnd,

        currentPeriodStart:

            subscription.currentPeriodStart,

        currentPeriodEnd:

            subscription.currentPeriodEnd,

        cancelAtPeriodEnd:

            subscription.cancelAtPeriodEnd,

        aiModel:

            subscription.aiModel,

        monthlyMessageLimit:

            subscription.monthlyMessageLimit,

        monthlyMessageUsed:

            subscription.monthlyMessageUsed,

        monthlyTokenLimit:

            subscription.monthlyTokenLimit,

        monthlyTokenUsed:

            subscription.monthlyTokenUsed,

        usageResetAt:

            subscription.usageResetAt,

        lastUsageAt:

            subscription.lastUsageAt,

        createdAt:

            subscription.createdAt,

        updatedAt:

            subscription.updatedAt

    };

}
/*
|--------------------------------------------------------------------------
| Create Subscription
|--------------------------------------------------------------------------
*/

async function createSubscription(

    data

) {

    const existingSubscription =

        await Subscription.findOne({

            shop: data.shop

        });


    if (

        existingSubscription

    ) {

        return mapSubscription(

            existingSubscription

        );

    }


    const subscription =

        await Subscription.create({

            shop:

                data.shop,

            plan:

                data.plan || "starter",

            planName:

                data.planName || "Starter",

            status:

                data.status || "trial",

            currency:

                data.currency || "USD",

            billingCycle:

                data.billingCycle || "monthly",

            trialStart:

                data.trialStart || new Date(),

            trialEnd:

    data.trialEnd ||

    new Date(

        Date.now() +

        5 *

        24 *

        60 *

        60 *

        1000

    )

        });


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Get Subscription
|--------------------------------------------------------------------------
*/

async function getSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Get Subscription By Shop
|--------------------------------------------------------------------------
*/

async function getSubscriptionByShop(

    shopId

) {

    const subscription =

        await findSubscriptionByShop(

            shopId

        );


    return mapSubscription(

        subscription

    );

      }
/*
|--------------------------------------------------------------------------
| Check Trial Status
|--------------------------------------------------------------------------
*/

async function checkTrialStatus(

    shopId

) {

    const subscription =

        await findSubscriptionByShop(

            shopId

        );


    const trialActive =

        subscription.isTrialActive();


    if (

        !trialActive &&

        subscription.status === "trial"

    ) {

        subscription.status =

            "expired";

        await subscription.save();

    }


    return {

        active:

            trialActive,

        status:

            subscription.status,

        trialEnd:

            subscription.trialEnd

    };

}


/*
|--------------------------------------------------------------------------
| Activate Trial
|--------------------------------------------------------------------------
*/

async function activateTrial(

    shopId

) {

    const subscription =

        await findSubscriptionByShop(

            shopId

        );


    const now =

        new Date();

const trialEnd =

    new Date(

        Date.now() +

        5 *

        24 *

        60 *

        60 *

        1000

    );


    subscription.status =

        "trial";


    subscription.trialStart =

        now;


    subscription.trialEnd =

        trialEnd;


    await subscription.save();


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Extend Trial
|--------------------------------------------------------------------------
*/

async function extendTrial(

    shopId,

    extraDays = 5

) {

    const subscription =

        await findSubscriptionByShop(

            shopId

        );


    const currentEnd =

        subscription.trialEnd ||

        new Date();


    subscription.trialEnd =

        new Date(

            currentEnd.getTime() +

            extraDays *

            24 *

            60 *

            60 *

            1000

        );


    subscription.status =

        "trial";


    await subscription.save();


    return mapSubscription(

        subscription

    );

      }
/*
|--------------------------------------------------------------------------
| Create Stripe Customer
|--------------------------------------------------------------------------
*/

async function createStripeCustomer(

    subscriptionId,

    customerData

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );

    const customer =

        await stripe.customers.create({

            name:

                customerData.name,

            email:

                customerData.email,

            metadata: {

                shopId:

                    String(

                        subscription.shop

                    )

            }

        });

    subscription.stripeCustomerId =

        customer.id;

    await subscription.save();

    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Create Stripe Subscription
|--------------------------------------------------------------------------
*/

async function createStripeSubscription(

    subscriptionId,

    priceId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );

    const stripeSubscription =

        await stripe.subscriptions.create({

            customer:

                subscription.stripeCustomerId,

            items: [

                {

                    price:

                        priceId

                }

            ],

            payment_behavior:

                "default_incomplete",

            expand: [

                "latest_invoice.payment_intent"

            ]

        });

    subscription.stripeSubscriptionId =

        stripeSubscription.id;

    subscription.stripePriceId =

        priceId;

    subscription.status =

        "active";

    subscription.currentPeriodStart =

        new Date(

            stripeSubscription.current_period_start *

            1000

        );

    subscription.currentPeriodEnd =

        new Date(

            stripeSubscription.current_period_end *

            1000

        );

    await subscription.save();

    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Cancel Stripe Subscription
|--------------------------------------------------------------------------
*/

async function cancelStripeSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );

    await stripe.subscriptions.update(

        subscription.stripeSubscriptionId,

        {

            cancel_at_period_end:

                true

        }

    );

    subscription.cancelAtPeriodEnd =

        true;

    await subscription.save();

    return mapSubscription(

        subscription

    );

          }
/*
|--------------------------------------------------------------------------
| Change Plan
|--------------------------------------------------------------------------
*/

async function changePlan(

    subscriptionId,

    planData

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.plan =

        planData.plan;


    subscription.planName =

        planData.planName;


    subscription.stripePriceId =

        planData.priceId || subscription.stripePriceId;


    subscription.aiModel =

        planData.aiModel || subscription.aiModel;


    subscription.monthlyMessageLimit =

        planData.monthlyMessageLimit ||

        subscription.monthlyMessageLimit;


    switch (

    planData.plan

) {

    case "starter":

        subscription.monthlyTokenLimit =

            50000;

        subscription.aiModel =

            "gpt-4o-mini";

        break;

    case "growth":

        subscription.monthlyTokenLimit =

            100000;

        subscription.aiModel =

            "gpt-4o-mini";

        break;

    case "premium":

        subscription.monthlyTokenLimit =

            200000;

        subscription.aiModel =

            "gpt-5";

        break;

    case "enterprise":

        subscription.monthlyTokenLimit =

            Number.MAX_SAFE_INTEGER;

        subscription.aiModel =

            "gpt-5";

        break;

}

    await subscription.save();


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Upgrade Plan
|--------------------------------------------------------------------------
*/

async function upgradePlan(

    subscriptionId,

    planData

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    if (

        subscription.plan === planData.plan

    ) {

        return mapSubscription(

            subscription

        );

    }


    return changePlan(

        subscriptionId,

        {

            ...planData,

            status:

                "active"

        }

    );

}


/*
|--------------------------------------------------------------------------
| Downgrade Plan
|--------------------------------------------------------------------------
*/

async function downgradePlan(

    subscriptionId,

    planData

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    return changePlan(

        subscriptionId,

        {

            ...planData,

            status:

                subscription.status

        }

    );

}
/*
|--------------------------------------------------------------------------
| Track Usage
|--------------------------------------------------------------------------
*/

async function trackUsage(

    subscriptionId,

    tokensUsed,

    messagesUsed = 1

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.monthlyTokenUsed +=

        tokensUsed;


    subscription.monthlyMessageUsed +=

        messagesUsed;


    subscription.lastUsageAt =

        new Date();


    await subscription.save();


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Check Usage Limit
|--------------------------------------------------------------------------
*/

async function checkUsageLimit(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    return {

        hasTokensRemaining:

            subscription.monthlyTokenUsed <

            subscription.monthlyTokenLimit,

        hasMessagesRemaining:

            subscription.monthlyMessageUsed <

            subscription.monthlyMessageLimit,

        tokensUsed:

            subscription.monthlyTokenUsed,

        tokenLimit:

            subscription.monthlyTokenLimit,

        messagesUsed:

            subscription.monthlyMessageUsed,

        messageLimit:

            subscription.monthlyMessageLimit,

        remainingTokens:

            Math.max(

                0,

                subscription.monthlyTokenLimit -

                subscription.monthlyTokenUsed

            ),

        remainingMessages:

            Math.max(

                0,

                subscription.monthlyMessageLimit -

                subscription.monthlyMessageUsed

            )

    };

}


/*
|--------------------------------------------------------------------------
| Reset Monthly Usage
|--------------------------------------------------------------------------
*/

async function resetMonthlyUsage(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.monthlyTokenUsed =

        0;


    subscription.monthlyMessageUsed =

        0;


    subscription.usageResetAt =

        new Date();


    await subscription.save();


    return mapSubscription(

        subscription

    );

      }
/*
|--------------------------------------------------------------------------
| Renew Subscription
|--------------------------------------------------------------------------
*/

async function renewSubscription(

    subscriptionId,

    renewalData = {}

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    const now =

        new Date();


    subscription.status =

        "active";


    subscription.currentPeriodStart =

        now;


    subscription.currentPeriodEnd =

        new Date(

            now.getTime() +

            30 *

            24 *

            60 *

            60 *

            1000

        );


    subscription.monthlyTokenUsed =

        0;


    subscription.monthlyMessageUsed =

        0;


    subscription.usageResetAt =

        now;


    if (

        renewalData.stripeSubscriptionId

    ) {

        subscription.stripeSubscriptionId =

            renewalData.stripeSubscriptionId;

    }


    await subscription.save();


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Handle Payment Success
|--------------------------------------------------------------------------
*/

async function handlePaymentSuccess(

    subscriptionId,

    paymentData = {}

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.status =

        "active";


    subscription.currentPeriodStart =

        new Date();


    subscription.currentPeriodEnd =

        new Date(

            Date.now() +

            30 *

            24 *

            60 *

            60 *

            1000

        );


    subscription.cancelAtPeriodEnd =

        false;


    if (

        paymentData.stripeSubscriptionId

    ) {

        subscription.stripeSubscriptionId =

            paymentData.stripeSubscriptionId;

    }


    await subscription.save();


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Handle Payment Failure
|--------------------------------------------------------------------------
*/

async function handlePaymentFailure(

    subscriptionId,

    failureData = {}

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.status =

        "past_due";


    if (

        failureData.cancelAtPeriodEnd === true

    ) {

        subscription.cancelAtPeriodEnd =

            true;

    }


    await subscription.save();


    return mapSubscription(

        subscription

    );

          }
/*
|--------------------------------------------------------------------------
| Cancel Subscription
|--------------------------------------------------------------------------
*/

async function cancelSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.cancelAtPeriodEnd =

        true;


    await subscription.save();


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Expire Subscription
|--------------------------------------------------------------------------
*/

async function expireSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.status =

        "expired";


    subscription.cancelAtPeriodEnd =

        true;


    await subscription.save();


    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Reactivate Subscription
|--------------------------------------------------------------------------
*/

async function reactivateSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.status =

        "active";


    subscription.cancelAtPeriodEnd =

        false;


    if (

        !subscription.currentPeriodStart

    ) {

        subscription.currentPeriodStart =

            new Date();

    }


    if (

        !subscription.currentPeriodEnd

    ) {

        subscription.currentPeriodEnd =

            new Date(

                Date.now() +

                30 *

                24 *

                60 *

                60 *

                1000

            );

    }


    await subscription.save();


    return mapSubscription(

        subscription

    );

}
/*
|--------------------------------------------------------------------------
| Handle Stripe Webhook
|--------------------------------------------------------------------------
*/

async function handleStripeWebhook(

    event

) {

    switch (

        event.type

    ) {

        case "customer.subscription.created":

            return handleSubscriptionCreated(

                event.data.object

            );

        case "customer.subscription.updated":

            return handleSubscriptionUpdated(

                event.data.object

            );

        case "customer.subscription.deleted":

            return handleSubscriptionDeleted(

                event.data.object

            );

        default:

            return null;

    }

}


/*
|--------------------------------------------------------------------------
| Handle Subscription Created
|--------------------------------------------------------------------------
*/

async function handleSubscriptionCreated(

    stripeSubscription

) {

    const subscription =

        await Subscription.findOne({

            stripeSubscriptionId:

                stripeSubscription.id

        });

    if (

        !subscription

    ) {

        return null;

    }

    subscription.status =

        "active";

    subscription.currentPeriodStart =

        new Date(

            stripeSubscription.current_period_start *

            1000

        );

    subscription.currentPeriodEnd =

        new Date(

            stripeSubscription.current_period_end *

            1000

        );

    await subscription.save();

    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Handle Subscription Updated
|--------------------------------------------------------------------------
*/

async function handleSubscriptionUpdated(

    stripeSubscription

) {

    const subscription =

        await Subscription.findOne({

            stripeSubscriptionId:

                stripeSubscription.id

        });

    if (

        !subscription

    ) {

        return null;

    }

    subscription.status =

        stripeSubscription.status === "active"

            ? "active"

            : "past_due";

    subscription.currentPeriodStart =

        new Date(

            stripeSubscription.current_period_start *

            1000

        );

    subscription.currentPeriodEnd =

        new Date(

            stripeSubscription.current_period_end *

            1000

        );

    subscription.cancelAtPeriodEnd =

        stripeSubscription.cancel_at_period_end;

    await subscription.save();

    return mapSubscription(

        subscription

    );

}


/*
|--------------------------------------------------------------------------
| Handle Subscription Deleted
|--------------------------------------------------------------------------
*/

async function handleSubscriptionDeleted(

    stripeSubscription

) {

    const subscription =

        await Subscription.findOne({

            stripeSubscriptionId:

                stripeSubscription.id

        });

    if (

        !subscription

    ) {

        return null;

    }

    subscription.status =

        "cancelled";

    subscription.cancelAtPeriodEnd =

        true;

    await subscription.save();

    return mapSubscription(

        subscription

    );

              }
/*
|--------------------------------------------------------------------------
| Subscription Service
|--------------------------------------------------------------------------
*/

const SubscriptionService = {

    createSubscription,

    getSubscription,

    getSubscriptionByShop,

    checkTrialStatus,

    activateTrial,

    extendTrial,

    createStripeCustomer,

    createStripeSubscription,

    cancelStripeSubscription,

    changePlan,

    upgradePlan,

    downgradePlan,

    trackUsage,

    checkUsageLimit,

    resetMonthlyUsage,

    renewSubscription,

    handlePaymentSuccess,

    handlePaymentFailure,

    cancelSubscription,

    expireSubscription,

    reactivateSubscription,

    handleStripeWebhook,

    handleSubscriptionCreated,

    handleSubscriptionUpdated,

    handleSubscriptionDeleted

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    createSubscription,

    getSubscription,

    getSubscriptionByShop,

    checkTrialStatus,

    activateTrial,

    extendTrial,

    createStripeCustomer,

    createStripeSubscription,

    cancelStripeSubscription,

    changePlan,

    upgradePlan,

    downgradePlan,

    trackUsage,

    checkUsageLimit,

    resetMonthlyUsage,

    renewSubscription,

    handlePaymentSuccess,

    handlePaymentFailure,

    cancelSubscription,

    expireSubscription,

    reactivateSubscription,

    handleStripeWebhook,

    handleSubscriptionCreated,

    handleSubscriptionUpdated,

    handleSubscriptionDeleted

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default SubscriptionService;
