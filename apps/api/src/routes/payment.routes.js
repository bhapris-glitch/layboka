/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import { Router } from "express";

import {

    PaymentController

} from "../controllers/payment.controller.js";

import authenticate from "../middleware/authenticate.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = Router();


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(

    authenticate

);


/*
|--------------------------------------------------------------------------
| Controller Alias
|--------------------------------------------------------------------------
*/

const {

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

} = PaymentController;
/*
|--------------------------------------------------------------------------
| Payment CRUD Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/",

    createPayment

);


router.get(

    "/:paymentId",

    getPayment

);


router.get(

    "/shop/:shopId",

    getPaymentsByShop

);


router.get(

    "/subscription/:subscriptionId",

    getPaymentsBySubscription

);


router.put(

    "/:paymentId",

    updatePayment

);


router.delete(

    "/:paymentId",

    deletePayment

);
/*
|--------------------------------------------------------------------------
| Payment Status Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/:paymentId/paid",

    markPaymentPaid

);


router.post(

    "/:paymentId/failed",

    markPaymentFailed

);


router.post(

    "/verify",

    verifyPayment

);


router.post(

    "/refund/:paymentId",

    refundPayment

);


router.post(

    "/cancel/:paymentId",

    cancelPayment

);
/*
|--------------------------------------------------------------------------
| Checkout Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/checkout",

    createCheckoutSession

);


router.post(

    "/checkout/subscription",

    createSubscriptionCheckout

);


router.post(

    "/checkout/recharge",

    createRechargeSession

);


/*
|--------------------------------------------------------------------------
| Subscription Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/subscription/activate",

    activateSubscriptionPayment

);


router.post(

    "/subscription/expire",

    expireTrialSubscription

);
/*
|--------------------------------------------------------------------------
| Stripe Webhook
|--------------------------------------------------------------------------
*/

router.post(

    "/webhook",

    handleStripeWebhook

);


/*
|--------------------------------------------------------------------------
| Plan Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/plan/:subscriptionId",

    getCurrentPlan

);


router.put(

    "/plan/:subscriptionId",

    changePlan

);


router.post(

    "/subscription/unlock",

    unlockSubscription

);


/*
|--------------------------------------------------------------------------
| Payment Reports
|--------------------------------------------------------------------------
*/

router.get(

    "/history/:shopId",

    getPaymentHistory

);


router.get(

    "/history/:shopId/success",

    getSuccessfulPayments

);


router.get(

    "/history/:shopId/failed",

    getFailedPayments

);


router.get(

    "/revenue/:shopId",

    getRevenueSummary

);


/*
|--------------------------------------------------------------------------
| Subscription Management
|--------------------------------------------------------------------------
*/

router.post(

    "/subscription/:subscriptionId/cancel",

    cancelSubscriptionPayment

);


router.post(

    "/subscription/:subscriptionId/restore",

    restoreExpiredSubscription

);


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
