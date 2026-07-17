/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import SubscriptionService from "../services/subscription/subscription.service.js";

import {

    successResponse,

    errorResponse

} from "../utils/response.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

function getSubscriptionId(

    req

) {

    return (

        req.params.subscriptionId ||

        req.body.subscriptionId ||

        req.query.subscriptionId

    );

}


function getShopId(

    req

) {

    return (

        req.shop?._id ||

        req.user?.shop ||

        req.body.shop ||

        req.params.shopId ||

        req.query.shopId

    );

}
/*
|--------------------------------------------------------------------------
| Create Subscription
|--------------------------------------------------------------------------
*/

async function createSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.createSubscription(

                req.body

            );

        return successResponse(

            res,

            subscription,

            "Subscription created successfully."

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
| Get Subscription
|--------------------------------------------------------------------------
*/

async function getSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.getSubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription retrieved successfully."

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
| Get Subscription By Shop
|--------------------------------------------------------------------------
*/

async function getSubscriptionByShop(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.getSubscriptionByShop(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Shop subscription retrieved successfully."

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
| Check Trial Status
|--------------------------------------------------------------------------
*/

async function checkTrialStatus(

    req,

    res

) {

    try {

        const result =

            await SubscriptionService.checkTrialStatus(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Trial status retrieved successfully."

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
| Activate Trial
|--------------------------------------------------------------------------
*/

async function activateTrial(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.activateTrial(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "5-day trial activated successfully."

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
| Extend Trial
|--------------------------------------------------------------------------
*/

async function extendTrial(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.extendTrial(

                getShopId(

                    req

                ),

                req.body.extraDays

            );

        return successResponse(

            res,

            subscription,

            "Trial extended successfully."

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
| Create Stripe Customer
|--------------------------------------------------------------------------
*/

async function createStripeCustomer(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.createStripeCustomer(

                getSubscriptionId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            subscription,

            "Stripe customer created successfully."

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
| Create Stripe Subscription
|--------------------------------------------------------------------------
*/

async function createStripeSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.createStripeSubscription(

                getSubscriptionId(

                    req

                ),

                req.body.priceId

            );

        return successResponse(

            res,

            subscription,

            "Stripe subscription created successfully."

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
| Cancel Stripe Subscription
|--------------------------------------------------------------------------
*/

async function cancelStripeSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.cancelStripeSubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Stripe subscription scheduled for cancellation."

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

            await SubscriptionService.changePlan(

                getSubscriptionId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            subscription,

            "Subscription plan changed successfully."

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
| Upgrade Plan
|--------------------------------------------------------------------------
*/

async function upgradePlan(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.upgradePlan(

                getSubscriptionId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            subscription,

            "Subscription upgraded successfully."

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
| Downgrade Plan
|--------------------------------------------------------------------------
*/

async function downgradePlan(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.downgradePlan(

                getSubscriptionId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            subscription,

            "Subscription downgraded successfully."

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
| Track Usage
|--------------------------------------------------------------------------
*/

async function trackUsage(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.trackUsage(

                getSubscriptionId(

                    req

                ),

                req.body.tokensUsed,

                req.body.messagesUsed

            );

        return successResponse(

            res,

            subscription,

            "Usage tracked successfully."

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
| Check Usage Limit
|--------------------------------------------------------------------------
*/

async function checkUsageLimit(

    req,

    res

) {

    try {

        const usage =

            await SubscriptionService.checkUsageLimit(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            usage,

            "Usage limit retrieved successfully."

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
| Reset Monthly Usage
|--------------------------------------------------------------------------
*/

async function resetMonthlyUsage(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.resetMonthlyUsage(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Monthly usage reset successfully."

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
| Renew Subscription
|--------------------------------------------------------------------------
*/

async function renewSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.renewSubscription(

                getSubscriptionId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            subscription,

            "Subscription renewed successfully."

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

        const subscription =

            await SubscriptionService.handlePaymentSuccess(

                getSubscriptionId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            subscription,

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

        const subscription =

            await SubscriptionService.handlePaymentFailure(

                getSubscriptionId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            subscription,

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
| Cancel Subscription
|--------------------------------------------------------------------------
*/

async function cancelSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.cancelSubscription(

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
| Expire Subscription
|--------------------------------------------------------------------------
*/

async function expireSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.expireSubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription expired successfully."

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
| Reactivate Subscription
|--------------------------------------------------------------------------
*/

async function reactivateSubscription(

    req,

    res

) {

    try {

        const subscription =

            await SubscriptionService.reactivateSubscription(

                getSubscriptionId(

                    req

                )

            );

        return successResponse(

            res,

            subscription,

            "Subscription reactivated successfully."

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

            await SubscriptionService.handleStripeWebhook(

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
| Subscription Controller
|--------------------------------------------------------------------------
*/

const SubscriptionController = {

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

    handleStripeWebhook

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

    handleStripeWebhook

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default SubscriptionController;
