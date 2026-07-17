/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import PaymentService from "../services/payment/payment.service.js";

import {

    successResponse,

    errorResponse

} from "../utils/apiResponse.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

function getPaymentId(

    req

) {

    return (

        req.params.paymentId ||

        req.body.paymentId

    );

}


function getSubscriptionId(

    req

) {

    return (

        req.params.subscriptionId ||

        req.body.subscriptionId

    );

}


function getShopId(

    req

) {

    return (

        req.params.shopId ||

        req.body.shopId ||

        req.user?.shop ||

        req.user?.shopId

    );

}


/*
|--------------------------------------------------------------------------
| Request Helpers
|--------------------------------------------------------------------------
*/

function getPagination(

    req

) {

    return {

        page:

            Number(

                req.query.page || 1

            ),

        limit:

            Number(

                req.query.limit || 20

            )

    };

}


function getCheckoutUrls(

    req

) {

    return {

        successUrl:

            req.body.successUrl,

        cancelUrl:

            req.body.cancelUrl

    };

}
/*
|--------------------------------------------------------------------------
| Create Payment
|--------------------------------------------------------------------------
*/

async function createPayment(

    req,

    res

) {

    try {

        const payment =

            await PaymentService.createPayment(

                req.body

            );

        return successResponse(

            res,

            payment,

            "Payment created successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Payment
|--------------------------------------------------------------------------
*/

async function getPayment(

    req,

    res

) {

    try {

        const payment =

            await PaymentService.getPayment(

                getPaymentId(

                    req

                )

            );

        return successResponse(

            res,

            payment,

            "Payment retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Payments By Shop
|--------------------------------------------------------------------------
*/

async function getPaymentsByShop(

    req,

    res

) {

    try {

        const payments =

            await PaymentService.getPaymentsByShop(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            payments,

            "Payments retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Payments By Subscription
|--------------------------------------------------------------------------
*/

async function getPaymentsBySubscription(

    req,

    res

) {

    try {

        const payments =

            await PaymentService.getPaymentsBySubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            payments,

            "Subscription payments retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Update Payment
|--------------------------------------------------------------------------
*/

async function updatePayment(

    req,

    res

) {

    try {

        const payment =

            await PaymentService.updatePayment(

                getPaymentId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            payment,

            "Payment updated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Delete Payment
|--------------------------------------------------------------------------
*/

async function deletePayment(

    req,

    res

) {

    try {

        const result =

            await PaymentService.deletePayment(

                getPaymentId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Payment deleted successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Mark Payment Paid
|--------------------------------------------------------------------------
*/

async function markPaymentPaid(

    req,

    res

) {

    try {

        const payment =

            await PaymentService.markPaymentPaid(

                getPaymentId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            payment,

            "Payment marked as paid."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Mark Payment Failed
|--------------------------------------------------------------------------
*/

async function markPaymentFailed(

    req,

    res

) {

    try {

        const payment =

            await PaymentService.markPaymentFailed(

                getPaymentId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            payment,

            "Payment marked as failed."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Create Checkout Session
|--------------------------------------------------------------------------
*/

async function createCheckoutSession(

    req,

    res

) {

    try {

        const {

            successUrl,

            cancelUrl

        } = getCheckoutUrls(

            req

        );

        const session =

            await PaymentService.createCheckoutSession(

                getPaymentId(

                    req

                ),

                req.body.priceId,

                successUrl,

                cancelUrl

            );

        return successResponse(

            res,

            session,

            "Checkout session created successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Create Subscription Checkout
|--------------------------------------------------------------------------
*/

async function createSubscriptionCheckout(

    req,

    res

) {

    try {

        const {

            successUrl,

            cancelUrl

        } = getCheckoutUrls(

            req

        );

        const session =

            await PaymentService.createSubscriptionCheckout(

                getPaymentId(

                    req

                ),

                req.body.priceId,

                successUrl,

                cancelUrl

            );

        return successResponse(

            res,

            session,

            "Subscription checkout created successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Create Recharge Session
|--------------------------------------------------------------------------
*/

async function createRechargeSession(

    req,

    res

) {

    try {

        const {

            successUrl,

            cancelUrl

        } = getCheckoutUrls(

            req

        );

        const session =

            await PaymentService.createRechargeSession(

                getPaymentId(

                    req

                ),

                req.body.plan,

                successUrl,

                cancelUrl

            );

        return successResponse(

            res,

            session,

            "Recharge session created successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Verify Payment
|--------------------------------------------------------------------------
*/

async function verifyPayment(

    req,

    res

) {

    try {

        const result =

            await PaymentService.verifyPayment(

                getPaymentId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Payment verified successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Activate Subscription Payment
|--------------------------------------------------------------------------
*/

async function activateSubscriptionPayment(

    req,

    res

) {

    try {

        const result =

            await PaymentService.activateSubscriptionPayment(

                getPaymentId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Subscription activated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Expire Trial Subscription
|--------------------------------------------------------------------------
*/

async function expireTrialSubscription(

    req,

    res

) {

    try {

        const result =

            await PaymentService.expireTrialSubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Trial expired successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Current Plan
|--------------------------------------------------------------------------
*/

async function getCurrentPlan(

    req,

    res

) {

    try {

        const plan =

            await PaymentService.getCurrentPlan(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            plan,

            "Current plan retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Change Plan
|--------------------------------------------------------------------------
*/

async function changePlan(

    req,

    res

) {

    try {

        const subscription =

            await PaymentService.changePlan(

                getSubscriptionId(

                    req

                ),

                req.body.plan

            );

        return successResponse(

            res,

            subscription,

            "Plan updated successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

              }
/*
|--------------------------------------------------------------------------
| Handle Stripe Webhook
|--------------------------------------------------------------------------
*/

async function handleStripeWebhook(

    req,

    res

) {

    try {

        const result =

            await PaymentService.handleStripeWebhook(

                req.stripeEvent ||

                req.body

            );

        return successResponse(

            res,

            result,

            "Stripe webhook processed successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Handle Payment Success
|--------------------------------------------------------------------------
*/

async function handlePaymentSuccess(

    req,

    res

) {

    try {

        const result =

            await PaymentService.handlePaymentSuccess(

                req.body

            );

        return successResponse(

            res,

            result,

            "Payment processed successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Handle Payment Failure
|--------------------------------------------------------------------------
*/

async function handlePaymentFailure(

    req,

    res

) {

    try {

        const result =

            await PaymentService.handlePaymentFailure(

                req.body

            );

        return successResponse(

            res,

            result,

            "Payment failure processed successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Unlock Subscription
|--------------------------------------------------------------------------
*/

async function unlockSubscription(

    req,

    res

) {

    try {

        const subscription =

            await PaymentService.unlockSubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription unlocked successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

              }
/*
|--------------------------------------------------------------------------
| Get Payment History
|--------------------------------------------------------------------------
*/

async function getPaymentHistory(

    req,

    res

) {

    try {

        const payments =

            await PaymentService.getPaymentHistory(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            payments,

            "Payment history retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Successful Payments
|--------------------------------------------------------------------------
*/

async function getSuccessfulPayments(

    req,

    res

) {

    try {

        const payments =

            await PaymentService.getSuccessfulPayments(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            payments,

            "Successful payments retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Failed Payments
|--------------------------------------------------------------------------
*/

async function getFailedPayments(

    req,

    res

) {

    try {

        const payments =

            await PaymentService.getFailedPayments(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            payments,

            "Failed payments retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Revenue Summary
|--------------------------------------------------------------------------
*/

async function getRevenueSummary(

    req,

    res

) {

    try {

        const summary =

            await PaymentService.getRevenueSummary(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            summary,

            "Revenue summary retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Refund Payment
|--------------------------------------------------------------------------
*/

async function refundPayment(

    req,

    res

) {

    try {

        const payment =

            await PaymentService.refundPayment(

                getPaymentId(

                    req

                ),

                req.body.reason

            );

        return successResponse(

            res,

            payment,

            "Payment refunded successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Cancel Payment
|--------------------------------------------------------------------------
*/

async function cancelPayment(

    req,

    res

) {

    try {

        const payment =

            await PaymentService.cancelPayment(

                getPaymentId(

                    req

                )

            );

        return successResponse(

            res,

            payment,

            "Payment cancelled successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Cancel Subscription Payment
|--------------------------------------------------------------------------
*/

async function cancelSubscriptionPayment(

    req,

    res

) {

    try {

        const subscription =

            await PaymentService.cancelSubscriptionPayment(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription cancelled successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Restore Expired Subscription
|--------------------------------------------------------------------------
*/

async function restoreExpiredSubscription(

    req,

    res

) {

    try {

        const subscription =

            await PaymentService.restoreExpiredSubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription restored successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Payment Controller
|--------------------------------------------------------------------------
*/

const PaymentController = {

    createPayment,

    getPayment,

    getPaymentsByShop,

    getPaymentsBySubscription,

    updatePayment,

    deletePayment,

    markPaymentPaid,

    markPaymentFailed,

    createCheckoutSession,

    createSubscriptionCheckout,

    createRechargeSession,

    verifyPayment,

    activateSubscriptionPayment,

    expireTrialSubscription,

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

    PaymentController,

    createPayment,

    getPayment,

    getPaymentsByShop,

    getPaymentsBySubscription,

    updatePayment,

    deletePayment,

    markPaymentPaid,

    markPaymentFailed,

    createCheckoutSession,

    createSubscriptionCheckout,

    createRechargeSession,

    verifyPayment,

    activateSubscriptionPayment,

    expireTrialSubscription,

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

export default PaymentController;
