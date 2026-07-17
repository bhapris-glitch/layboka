/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Stripe from "stripe";

import Payment from "../../models/payment.model.js";

import Subscription from "../../models/subscription.model.js";

import Shop from "../../models/shop.model.js";


/*
|--------------------------------------------------------------------------
| Stripe
|--------------------------------------------------------------------------
*/

const stripe = new Stripe(

    process.env.STRIPE_SECRET_KEY,

    {

        apiVersion:

            "2025-06-30.basil"

    }

);


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

async function findPayment(

    paymentId

) {

    const payment =

        await Payment.findById(

            paymentId

        );

    if (

        !payment

    ) {

        throw new Error(

            "Payment not found."

        );

    }

    return payment;

}


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


async function findShop(

    shopId

) {

    const shop =

        await Shop.findById(

            shopId

        );

    if (

        !shop

    ) {

        throw new Error(

            "Shop not found."

        );

    }

    return shop;

}


/*
|--------------------------------------------------------------------------
| Payment Mapper
|--------------------------------------------------------------------------
*/

function mapPayment(

    payment

) {

    return payment.toJSON();

}
/*
|--------------------------------------------------------------------------
| Create Payment
|--------------------------------------------------------------------------
*/

async function createPayment(

    paymentData

) {

    await findShop(

        paymentData.shop

    );


    await findSubscription(

        paymentData.subscription

    );


    const payment =

        await Payment.create(

            paymentData

        );


    return mapPayment(

        payment

    );

}


/*
|--------------------------------------------------------------------------
| Get Payment
|--------------------------------------------------------------------------
*/

async function getPayment(

    paymentId

) {

    const payment =

        await findPayment(

            paymentId

        );


    return mapPayment(

        payment

    );

}


/*
|--------------------------------------------------------------------------
| Get Payments By Shop
|--------------------------------------------------------------------------
*/

async function getPaymentsByShop(

    shopId

) {

    await findShop(

        shopId

    );


    const payments =

        await Payment.find({

            shop: shopId

        })

        .sort({

            createdAt: -1

        });


    return payments.map(

        mapPayment

    );

}


/*
|--------------------------------------------------------------------------
| Get Payments By Subscription
|--------------------------------------------------------------------------
*/

async function getPaymentsBySubscription(

    subscriptionId

) {

    await findSubscription(

        subscriptionId

    );


    const payments =

        await Payment.find({

            subscription:

                subscriptionId

        })

        .sort({

            createdAt: -1

        });


    return payments.map(

        mapPayment

    );

}
/*
|--------------------------------------------------------------------------
| Update Payment
|--------------------------------------------------------------------------
*/

async function updatePayment(

    paymentId,

    updateData

) {

    const payment =

        await findPayment(

            paymentId

        );


    Object.assign(

        payment,

        updateData

    );


    await payment.save();


    return mapPayment(

        payment

    );

}


/*
|--------------------------------------------------------------------------
| Delete Payment
|--------------------------------------------------------------------------
*/

async function deletePayment(

    paymentId

) {

    const payment =

        await findPayment(

            paymentId

        );


    await payment.deleteOne();


    return {

        success: true

    };

}


/*
|--------------------------------------------------------------------------
| Mark Payment Paid
|--------------------------------------------------------------------------
*/

async function markPaymentPaid(

    paymentId,

    paymentDetails = {}

) {

    const payment =

        await findPayment(

            paymentId

        );


    payment.status =

        "paid";


    payment.paidAt =

        new Date();


    payment.providerPaymentId =

        paymentDetails.providerPaymentId ||

        payment.providerPaymentId;


    payment.receiptUrl =

        paymentDetails.receiptUrl ||

        payment.receiptUrl;


    payment.invoiceUrl =

        paymentDetails.invoiceUrl ||

        payment.invoiceUrl;


    payment.failureReason =

        null;


    payment.failureCode =

        null;


    await payment.save();


    return mapPayment(

        payment

    );

}


/*
|--------------------------------------------------------------------------
| Mark Payment Failed
|--------------------------------------------------------------------------
*/

async function markPaymentFailed(

    paymentId,

    failure = {}

) {

    const payment =

        await findPayment(

            paymentId

        );


    payment.status =

        "failed";


    payment.failureReason =

        failure.reason ||

        "Unknown payment failure";


    payment.failureCode =

        failure.code ||

        null;


    await payment.save();


    return mapPayment(

        payment

    );

}
/*
|--------------------------------------------------------------------------
| Create Stripe Customer
|--------------------------------------------------------------------------
*/

async function createStripeCustomer(

    shopId

) {

    const shop =

        await findShop(

            shopId

        );


    const customer =

        await stripe.customers.create({

            name:

                shop.name,

            email:

                shop.email,

            metadata: {

                shopId:

                    String(

                        shop._id

                    )

            }

        });


    return customer;

}


/*
|--------------------------------------------------------------------------
| Create Checkout Session
|--------------------------------------------------------------------------
*/

async function createCheckoutSession(

    paymentId,

    priceId,

    successUrl,

    cancelUrl

) {

    const payment =

        await findPayment(

            paymentId

        );


    const customer =

        await createStripeCustomer(

            payment.shop

        );


    const session =

        await stripe.checkout.sessions.create({

            mode:

                "subscription",

            customer:

                customer.id,

            payment_method_types: [

                "card"

            ],

            line_items: [

                {

                    price:

                        priceId,

                    quantity:

                        1

                }

            ],

            success_url:

                successUrl,

            cancel_url:

                cancelUrl,

            metadata: {

                paymentId:

                    String(

                        payment._id

                    ),

                subscriptionId:

                    String(

                        payment.subscription

                    ),

                shopId:

                    String(

                        payment.shop

                    )

            }

        });


    payment.providerCustomerId =

        customer.id;

    await payment.save();


    return session;

}


/*
|--------------------------------------------------------------------------
| Create Subscription Checkout
|--------------------------------------------------------------------------
*/

async function createSubscriptionCheckout(

    paymentId,

    priceId,

    successUrl,

    cancelUrl

) {

    return createCheckoutSession(

        paymentId,

        priceId,

        successUrl,

        cancelUrl

    );

          }
/*
|--------------------------------------------------------------------------
| Verify Payment
|--------------------------------------------------------------------------
*/

async function verifyPayment(

    paymentId

) {

    const payment =

        await findPayment(

            paymentId

        );

    return {

        verified:

            payment.status ===

            "paid",

        payment:

            mapPayment(

                payment

            )

    };

}


/*
|--------------------------------------------------------------------------
| Activate Subscription
|--------------------------------------------------------------------------
*/

async function activateSubscriptionPayment(

    paymentId

) {

    const payment =

        await findPayment(

            paymentId

        );


    const subscription =

        await findSubscription(

            payment.subscription

        );


    subscription.status =

        "active";


    subscription.isTrial =

        false;


    subscription.trialEnded =

        true;


    subscription.activatedAt =

        new Date();


    await subscription.save();


    payment.status =

        "paid";


    payment.paidAt =

        new Date();


    await payment.save();


    return {

        payment:

            mapPayment(

                payment

            ),

        subscription

    };

}


/*
|--------------------------------------------------------------------------
| Expire Trial
|--------------------------------------------------------------------------
*/

async function expireTrialSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.status =

        "expired";


    subscription.isTrial =

        false;


    subscription.trialEnded =

        true;


    subscription.locked =

        true;


    await subscription.save();


    return subscription;

}
/*
|--------------------------------------------------------------------------
| Create Recharge Session
|--------------------------------------------------------------------------
*/

async function createRechargeSession(

    paymentId,

    plan,

    successUrl,

    cancelUrl

) {

    const payment =

        await findPayment(

            paymentId

        );


    const subscription =

        await findSubscription(

            payment.subscription

        );


    const shop =

        await findShop(

            payment.shop

        );


    const session =

        await stripe.checkout.sessions.create({

            mode:

                "payment",

            customer:

                payment.providerCustomerId ||

                undefined,

            payment_method_types: [

                "card"

            ],

            line_items: [

                {

                    price:

                        plan.stripePriceId,

                    quantity:

                        1

                }

            ],

            success_url:

                successUrl,

            cancel_url:

                cancelUrl,

            metadata: {

                paymentId:

                    String(

                        payment._id

                    ),

                subscriptionId:

                    String(

                        subscription._id

                    ),

                shopId:

                    String(

                        shop._id

                    ),

                selectedPlan:

                    plan.name

            }

        });


    return session;

}


/*
|--------------------------------------------------------------------------
| Get Current Plan
|--------------------------------------------------------------------------
*/

async function getCurrentPlan(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    return {

        plan:

            subscription.plan,

        status:

            subscription.status,

        isTrial:

            subscription.isTrial,

        locked:

            subscription.locked

    };

}


/*
|--------------------------------------------------------------------------
| Change Plan
|--------------------------------------------------------------------------
*/

async function changePlan(

    subscriptionId,

    newPlan

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.plan =

        newPlan;


    subscription.updatedAt =

        new Date();


    await subscription.save();


    return subscription;

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

        case "checkout.session.completed":

            return handlePaymentSuccess(

                event.data.object

            );

        case "payment_intent.payment_failed":

            return handlePaymentFailure(

                event.data.object

            );

        default:

            return {

                received: true

            };

    }

}


/*
|--------------------------------------------------------------------------
| Handle Payment Success
|--------------------------------------------------------------------------
*/

async function handlePaymentSuccess(

    session

) {

    const payment =

        await findPayment(

            session.metadata.paymentId

        );


    const subscription =

        await findSubscription(

            session.metadata.subscriptionId

        );


    payment.status =

        "paid";

    payment.paidAt =

        new Date();

    payment.providerPaymentId =

        session.payment_intent ||

        payment.providerPaymentId;

    payment.providerCustomerId =

        session.customer ||

        payment.providerCustomerId;


    await payment.save();


    subscription.plan =

        session.metadata.selectedPlan;

    subscription.status =

        "active";

    subscription.locked =

        false;

    subscription.isTrial =

        false;

    subscription.trialEnded =

        true;

    subscription.activatedAt =

        new Date();

    subscription.expiresAt =

        null;


    await subscription.save();


    return {

        success: true,

        payment,

        subscription

    };

}


/*
|--------------------------------------------------------------------------
| Handle Payment Failure
|--------------------------------------------------------------------------
*/

async function handlePaymentFailure(

    paymentIntent

) {

    const payment =

        await Payment.findOne({

            providerPaymentId:

                paymentIntent.id

        });


    if (

        !payment

    ) {

        return {

            success: false

        };

    }


    payment.status =

        "failed";

    payment.failureReason =

        paymentIntent.last_payment_error?.message ||

        "Payment failed";

    payment.failureCode =

        paymentIntent.last_payment_error?.code ||

        null;


    await payment.save();


    return {

        success: true

    };

}


/*
|--------------------------------------------------------------------------
| Unlock Subscription
|--------------------------------------------------------------------------
*/

async function unlockSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.locked =

        false;

    subscription.status =

        "active";


    await subscription.save();


    return subscription;

}
/*
|--------------------------------------------------------------------------
| Get Payment History
|--------------------------------------------------------------------------
*/

async function getPaymentHistory(

    shopId

) {

    await findShop(

        shopId

    );


    const payments =

        await Payment.find({

            shop: shopId

        })

        .sort({

            createdAt: -1

        });


    return payments.map(

        mapPayment

    );

}


/*
|--------------------------------------------------------------------------
| Get Successful Payments
|--------------------------------------------------------------------------
*/

async function getSuccessfulPayments(

    shopId

) {

    await findShop(

        shopId

    );


    const payments =

        await Payment.find({

            shop: shopId,

            status: "paid"

        })

        .sort({

            paidAt: -1

        });


    return payments.map(

        mapPayment

    );

}


/*
|--------------------------------------------------------------------------
| Get Failed Payments
|--------------------------------------------------------------------------
*/

async function getFailedPayments(

    shopId

) {

    await findShop(

        shopId

    );


    const payments =

        await Payment.find({

            shop: shopId,

            status: "failed"

        })

        .sort({

            updatedAt: -1

        });


    return payments.map(

        mapPayment

    );

}


/*
|--------------------------------------------------------------------------
| Revenue Summary
|--------------------------------------------------------------------------
*/

async function getRevenueSummary(

    shopId

) {

    await findShop(

        shopId

    );


    const result = await Payment.aggregate([

    {

        $match: {

            shop: shopId,

            status: "paid"

        }

    },

    {

        $group: {

            _id: null,

            totalRevenue: {

                $sum: "$amount"

            },

            totalPayments: {

                $sum: 1

            },

            averagePayment: {

                $avg: "$amount"

            }

        }

    }

]);

    return result[0] || {

        totalRevenue: 0,

        totalPayments: 0,

        averagePayment: 0

    };

}
/*
|--------------------------------------------------------------------------
| Refund Payment
|--------------------------------------------------------------------------
*/

async function refundPayment(

    paymentId,

    reason = "requested_by_customer"

) {

    const payment =

        await findPayment(

            paymentId

        );


    if (

        payment.providerPaymentId

    ) {

        await stripe.refunds.create({

            payment_intent:

                payment.providerPaymentId,

            reason

        });

    }


    payment.status =

        "refunded";

    payment.refundedAt =

        new Date();


    await payment.save();


    return mapPayment(

        payment

    );

}


/*
|--------------------------------------------------------------------------
| Cancel Payment
|--------------------------------------------------------------------------
*/

async function cancelPayment(

    paymentId

) {

    const payment =

        await findPayment(

            paymentId

        );


    payment.status =

        "cancelled";


    await payment.save();


    return mapPayment(

        payment

    );

}


/*
|--------------------------------------------------------------------------
| Cancel Subscription Payment
|--------------------------------------------------------------------------
*/

async function cancelSubscriptionPayment(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    subscription.status =

        "cancelled";

    subscription.locked =

        true;


    await subscription.save();


    return subscription;

}


/*
|--------------------------------------------------------------------------
| Restore Expired Subscription
|--------------------------------------------------------------------------
*/

async function restoreExpiredSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscription(

            subscriptionId

        );


    if (

        subscription.status !==

        "expired"

    ) {

        return subscription;

    }


    subscription.status =

        "active";

    subscription.locked =

        false;

    subscription.activatedAt =

        new Date();


    await subscription.save();


    return subscription;

  }
/*
|--------------------------------------------------------------------------
| Payment Service
|--------------------------------------------------------------------------
*/

const PaymentService = {

    createPayment,

    getPayment,

    getPaymentsByShop,

    getPaymentsBySubscription,

    updatePayment,

    deletePayment,

    markPaymentPaid,

    markPaymentFailed,

    createStripeCustomer,

    createCheckoutSession,

    createSubscriptionCheckout,

    verifyPayment,

    activateSubscriptionPayment,

    expireTrialSubscription,

    createRechargeSession,

    getCurrentPlan,

    changePlan,

    handleStripeWebhook,

    handlePaymentSuccess,

    handlePaymentFailure,

    unlockSubscription,

    getPaymentHistory,

    getSuccessfulPayments,

    getFailedPayments,

    getRevenueSummary,

    refundPayment,

    cancelPayment,

    cancelSubscriptionPayment,

    restoreExpiredSubscription

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    createPayment,

    getPayment,

    getPaymentsByShop,

    getPaymentsBySubscription,

    updatePayment,

    deletePayment,

    markPaymentPaid,

    markPaymentFailed,

    createStripeCustomer,

    createCheckoutSession,

    createSubscriptionCheckout,

    verifyPayment,

    activateSubscriptionPayment,

    expireTrialSubscription,

    createRechargeSession,

    getCurrentPlan,

    changePlan,

    handleStripeWebhook,

    handlePaymentSuccess,

    handlePaymentFailure,

    unlockSubscription,

    getPaymentHistory,

    getSuccessfulPayments,

    getFailedPayments,

    getRevenueSummary,

    refundPayment,

    cancelPayment,

    cancelSubscriptionPayment,

    restoreExpiredSubscription

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default PaymentService;
