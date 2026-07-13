import Stripe from "stripe";

import Subscription from "../../models/Subscription.js";
import Shop from "../../models/Shop.js";
import User from "../../models/User.js";

/*
|--------------------------------------------------------------------------
| Stripe Client
|--------------------------------------------------------------------------
*/

export const stripe = new Stripe(

    process.env.STRIPE_SECRET_KEY,

    {
        apiVersion: "2025-06-30.basil"
    }

);

/*
|--------------------------------------------------------------------------
| Subscription Plans
|--------------------------------------------------------------------------
*/

export const STRIPE_PLANS = Object.freeze({

    STARTER: {

        name: "Starter",

        price: 25,

        currency: "usd",

        trialDays: 7,

        monthlyTokens: 300,

        stripePriceId:

            process.env.STRIPE_STARTER_PRICE_ID

    },

    GROWTH: {

        name: "Growth",

        price: 59,

        currency: "usd",

        trialDays: 7,

        monthlyTokens: 500,

        stripePriceId:

            process.env.STRIPE_GROWTH_PRICE_ID

    },

    PREMIUM: {

        name: "Premium",

        price: 149,

        currency: "usd",

        trialDays: 7,

        monthlyTokens: 1000,

        stripePriceId:

            process.env.STRIPE_PREMIUM_PRICE_ID

    }

});

/*
|--------------------------------------------------------------------------
| Validate Plan
|--------------------------------------------------------------------------
*/

export function getPlan(planName) {

    switch ((planName || "").toLowerCase()) {

        case "starter":

            return STRIPE_PLANS.STARTER;

        case "growth":

            return STRIPE_PLANS.GROWTH;

        case "premium":

            return STRIPE_PLANS.PREMIUM;

        default:

            throw new Error(

                "Invalid subscription plan."

            );

    }

}

/*
|--------------------------------------------------------------------------
| Stripe Customer
|--------------------------------------------------------------------------
*/

export async function createStripeCustomer({

    email,

    name,

    shopId,

    userId

}) {

    return stripe.customers.create({

        email,

        name,

        metadata: {

            shopId:

                shopId.toString(),

            userId:

                userId.toString()

        }

    });

}
/*
|--------------------- PART- 2 -----------------------------------------------------
| Create Stripe Checkout Session
|--------------------------------------------------------------------------
*/

export async function createCheckoutSession({

    user,

    shop,

    plan,

    successUrl,

    cancelUrl

}) {

    try {

        let customerId = shop?.stripeCustomerId;

        /*
        |--------------------------------------------------------------------------
        | Create Customer (If Needed)
        |--------------------------------------------------------------------------
        */

        if (!customerId) {

            const customer = await stripe.customers.create({

                name: shop.name,

                email: user.email,

                metadata: {

                    userId: String(user._id),

                    shopId: String(shop._id),

                    shopDomain: shop.shopDomain

                }

            });

            customerId = customer.id;

        }

        /*
        |--------------------------------------------------------------------------
        | Create Checkout Session
        |--------------------------------------------------------------------------
        */

        const session = await stripe.checkout.sessions.create({

            mode: "subscription",

            customer: customerId,

            payment_method_types: [

                "card"

            ],

            line_items: [

                {

                    price: getStripePriceId(plan),

                    quantity: 1

                }

            ],

            success_url:

                successUrl ||

                `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url:

                cancelUrl ||

                `${process.env.APP_URL}/billing/cancel`,

            allow_promotion_codes: true,

            billing_address_collection: "required",

            client_reference_id:

                String(shop._id),

            metadata: {

                userId: String(user._id),

                shopId: String(shop._id),

                shopDomain: shop.shopDomain,

                plan,

                platform: "Layboka AI"

            }

        });

        return session;

    } catch (error) {

        throw new Error(

            `Stripe Checkout Error: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Create Subscription Record
|--------------------------------------------------------------------------
*/

export async function createSubscriptionRecord({

    shop,

    stripeSubscription,

    plan

}) {

    return Subscription.create({

        user: shop.owner,

        shop: shop._id,

        provider: "stripe",

        stripeCustomerId:

            stripeSubscription.customer,

        stripeSubscriptionId:

            stripeSubscription.id,

        stripePriceId:

            stripeSubscription.items.data[0].price.id,

        status:

            stripeSubscription.status,

        currentPlan: plan,

        billingCycle: "monthly",

        currentPeriodStart:

            new Date(

                stripeSubscription.current_period_start * 1000

            ),

        currentPeriodEnd:

            new Date(

                stripeSubscription.current_period_end * 1000

            ),

        cancelAtPeriodEnd:

            stripeSubscription.cancel_at_period_end

    });

}

/*
|--------------------------------------------------------------------------
| Create Billing Portal
|--------------------------------------------------------------------------
*/

export async function createCustomerPortal({

    customerId,

    returnUrl

}) {

    return stripe.billingPortal.sessions.create({

        customer: customerId,

        return_url:

            returnUrl ||

            `${process.env.APP_URL}/dashboard/billing`

    });

}

/*
|--------------------------------------------------------------------------
| Build Billing Metadata
|--------------------------------------------------------------------------
*/

export function buildBillingMetadata({

    user,

    shop,

    plan

}) {

    return {

        platform: "Layboka AI",

        version: process.env.APP_VERSION || "1.0.0",

        userId: String(user._id),

        shopId: String(shop._id),

        shopDomain: shop.shopDomain,

        plan,

        country: shop.country || "",

        currency: shop.currency || "USD"

    };

}
/*
|---------------------- PART- 3----------------------------------------------------
| Get Stripe Price ID
|--------------------------------------------------------------------------
|
| Maps Layboka subscription plans to Stripe Price IDs.
| Replace the placeholder values with your actual Stripe Price IDs.
|--------------------------------------------------------------------------
*/

export function getStripePriceId(plan) {

    const priceIds = {

        starter: process.env.STRIPE_PRICE_STARTER,

        growth: process.env.STRIPE_PRICE_GROWTH,

        premium: process.env.STRIPE_PRICE_PREMIUM,

        enterprise: null

    };

    return priceIds[
        String(plan).toLowerCase()
    ] || null;

}

/*
|--------------------------------------------------------------------------
| Verify Stripe Webhook
|--------------------------------------------------------------------------
*/

export function verifyWebhookSignature(

    payload,

    signature

) {

    return stripe.webhooks.constructEvent(

        payload,

        signature,

        process.env.STRIPE_WEBHOOK_SECRET

    );

}

/*
|--------------------------------------------------------------------------
| Handle Stripe Webhook
|--------------------------------------------------------------------------
*/

export async function handleWebhook(

    payload,

    signature

) {

    const event = verifyWebhookSignature(

        payload,

        signature

    );

    switch (event.type) {

        case "checkout.session.completed":

            await handleCheckoutCompleted(

                event.data.object

            );

            break;

        case "invoice.paid":

            await handleInvoicePaid(

                event.data.object

            );

            break;

        case "invoice.payment_failed":

            await handlePaymentFailed(

                event.data.object

            );

            break;

        case "customer.subscription.updated":

            await handleSubscriptionUpdated(

                event.data.object

            );

            break;

        case "customer.subscription.deleted":

            await handleSubscriptionCancelled(

                event.data.object

            );

            break;

        default:

            console.log(

                `Unhandled Stripe Event: ${event.type}`

            );

    }

    return {

        received: true

    };

}

/*
|--------------------------------------------------------------------------
| Checkout Completed
|--------------------------------------------------------------------------
*/

export async function handleCheckoutCompleted(

    session

) {

    const subscription = await Subscription.findOne({

        stripeCustomerId: session.customer

    });

    if (!subscription) {

        return;

    }

    subscription.status = "active";

    subscription.stripeSubscriptionId =
        session.subscription;

    subscription.activatedAt = new Date();

    await subscription.save();

}

/*
|--------------------------------------------------------------------------
| Invoice Paid
|--------------------------------------------------------------------------
*/

export async function handleInvoicePaid(

    invoice

) {

    const subscription = await Subscription.findOne({

        stripeCustomerId: invoice.customer

    });

    if (!subscription) {

        return;

    }

    subscription.status = "active";

    subscription.lastPaymentAt = new Date();

    subscription.paymentFailures = 0;

    await subscription.save();

}

/*
|--------------------------------------------------------------------------
| Payment Failed
|--------------------------------------------------------------------------
*/

export async function handlePaymentFailed(

    invoice

) {

    const subscription = await Subscription.findOne({

        stripeCustomerId: invoice.customer

    });

    if (!subscription) {

        return;

    }

    subscription.status = "past_due";

    subscription.paymentFailures += 1;

    await subscription.save();

}

/*
|--------------------------------------------------------------------------
| Subscription Updated
|--------------------------------------------------------------------------
*/

export async function handleSubscriptionUpdated(

    stripeSubscription

) {

    const subscription = await Subscription.findOne({

        stripeSubscriptionId:

            stripeSubscription.id

    });

    if (!subscription) {

        return;

    }

    subscription.status =
        stripeSubscription.status;

    subscription.currentPeriodStart =
        new Date(

            stripeSubscription.current_period_start * 1000

        );

    subscription.currentPeriodEnd =
        new Date(

            stripeSubscription.current_period_end * 1000

        );

    await subscription.save();

}

/*
|--------------------------------------------------------------------------
| Subscription Cancelled
|--------------------------------------------------------------------------
*/

export async function handleSubscriptionCancelled(

    stripeSubscription

) {

    const subscription = await Subscription.findOne({

        stripeSubscriptionId:

            stripeSubscription.id

    });

    if (!subscription) {

        return;

    }

    subscription.status = "cancelled";

    subscription.cancelledAt = new Date();

    await subscription.save();

}
/*
|--------------------------------------------------------------------------
| Cancel Subscription
|--------------------------------------------------------------------------
*/

export async function cancelSubscription(

    subscriptionId,

    cancelAtPeriodEnd = true

) {

    try {

        return await stripe.subscriptions.update(

            subscriptionId,

            {

                cancel_at_period_end:

                    cancelAtPeriodEnd

            }

        );

    } catch (error) {

        throw new Error(

            `Stripe Cancel Subscription Failed: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Resume Subscription
|--------------------------------------------------------------------------
*/

export async function resumeSubscription(

    subscriptionId

) {

    try {

        return await stripe.subscriptions.update(

            subscriptionId,

            {

                cancel_at_period_end: false

            }

        );

    } catch (error) {

        throw new Error(

            `Stripe Resume Subscription Failed: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Create Billing Portal Session
|--------------------------------------------------------------------------
*/

export async function createBillingPortal(

    customerId,

    returnUrl

) {

    try {

        return await stripe.billingPortal.sessions.create({

            customer: customerId,

            return_url: returnUrl

        });

    } catch (error) {

        throw new Error(

            `Stripe Billing Portal Failed: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Refund Payment
|--------------------------------------------------------------------------
*/

export async function refundPayment(

    paymentIntentId,

    amount = null

) {

    try {

        const payload = {

            payment_intent: paymentIntentId

        };

        if (amount) {

            payload.amount = amount;

        }

        return await stripe.refunds.create(payload);

    } catch (error) {

        throw new Error(

            `Stripe Refund Failed: ${error.message}`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Get Invoice
|--------------------------------------------------------------------------
*/

export async function getInvoice(

    invoiceId

) {

    return stripe.invoices.retrieve(

        invoiceId

    );

}

/*
|--------------------------------------------------------------------------
| Stripe Service
|--------------------------------------------------------------------------
*/

export const StripeService = {

    createCustomer,

    getCustomer,

    createCheckoutSession,

    createSubscription,

    getSubscription,

    updateSubscription,

    cancelSubscription,

    resumeSubscription,

    createBillingPortal,

    refundPayment,

    createWebhookEvent,

    createPaymentIntent,

    getInvoice

};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default StripeService;
