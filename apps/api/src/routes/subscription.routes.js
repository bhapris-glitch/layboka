/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import { Router } from "express";

import {

    SubscriptionController

} from "../controllers/subscription.controller.js";

import authenticate from "../middleware/authenticate.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = Router();


/*
|--------------------------------------------------------------------------
| Authentication Middleware
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

} = SubscriptionController;
/*
|--------------------------------------------------------------------------
| Subscription & Trial Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/",

    createSubscription

);


router.get(

    "/:subscriptionId",

    getSubscription

);


router.get(

    "/shop/:shopId",

    getSubscriptionByShop

);


router.get(

    "/trial/status",

    checkTrialStatus

);


router.post(

    "/trial/activate",

    activateTrial

);


router.patch(

    "/trial/extend",

    extendTrial

);
/*
|--------------------------------------------------------------------------
| Stripe Billing Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/stripe/customer",

    createStripeCustomer

);


router.post(

    "/stripe/subscription",

    createStripeSubscription

);


router.patch(

    "/stripe/cancel",

    cancelStripeSubscription

);


/*
|--------------------------------------------------------------------------
| Plan Management Routes
|--------------------------------------------------------------------------
*/

router.patch(

    "/plan",

    changePlan

);


router.patch(

    "/plan/upgrade",

    upgradePlan

);


router.patch(

    "/plan/downgrade",

    downgradePlan

);
/*
|--------------------------------------------------------------------------
| Usage Management Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/usage/track",

    trackUsage

);


router.get(

    "/usage",

    checkUsageLimit

);


router.post(

    "/usage/reset",

    resetMonthlyUsage

);


/*
|--------------------------------------------------------------------------
| Renewal & Payment Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/renew",

    renewSubscription

);


router.post(

    "/payment/success",

    handlePaymentSuccess

);


router.post(

    "/payment/failure",

    handlePaymentFailure

);
/*
|--------------------------------------------------------------------------
| Subscription Lifecycle Routes
|--------------------------------------------------------------------------
*/

router.patch(

    "/cancel",

    cancelSubscription

);


router.patch(

    "/expire",

    expireSubscription

);


router.patch(

    "/reactivate",

    reactivateSubscription

);
/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.use(

    authenticate

);

/*
|--------------------------------------------------------------------------
| Stripe Webhook Route
|--------------------------------------------------------------------------
*/

router.post(

    "/webhook/stripe",

    handleStripeWebhook

);


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
