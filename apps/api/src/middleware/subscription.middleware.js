/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Subscription from "../models/subscription.model.js";

import MerchantSettings from "../models/merchantSettings.model.js";


/*
|--------------------------------------------------------------------------
| Plan Constants
|--------------------------------------------------------------------------
*/
const TRIAL_DAYS = 5;

const GRACE_PERIOD_DAYS = 2;

const PLANS = {

    TRIAL: "trial",

    STARTER: "starter",

    GROWTH: "growth",

    PREMIUM: "premium",

    ENTERPRISE: "enterprise"

};


const PLAN_PRIORITY = {

    trial: 0,

    starter: 1,

    growth: 2,

    premium: 3,

    enterprise: 4

};


/*
|--------------------------------------------------------------------------
| Find Active Subscription
|--------------------------------------------------------------------------
*/

async function getActiveSubscription(

    merchantId

) {

    return Subscription.findOne({

        merchant: merchantId,

        status: "active"

    });

}


/*
|--------------------------------------------------------------------------
| Check Trial Expiration
|--------------------------------------------------------------------------
*/

function isTrialExpired(

    subscription

) {

    if (

        !subscription

    ) {

        return true;

    }

    if (

        subscription.plan !==

        PLANS.TRIAL

    ) {

        return false;

    }

    const expiryDate =

    new Date(

        subscription.createdAt

    );

expiryDate.setDate(

    expiryDate.getDate() +

    TRIAL_DAYS

);

return new Date() > expiryDate;
}


/*
|--------------------------------------------------------------------------
| Get Current Plan
|--------------------------------------------------------------------------
*/

function getCurrentPlan(

    subscription

) {

    if (

        !subscription

    ) {

        return PLANS.TRIAL;

    }

    return subscription.plan;

}


/*
|--------------------------------------------------------------------------
| Basic Subscription Check
|--------------------------------------------------------------------------
*/

async function checkSubscription(

    req,

    res,

    next

) {

    try {

        const merchantId =

            req.shop._id;

        const subscription =

            await getActiveSubscription(

                merchantId

            );

        if (

            !subscription

        ) {

            return res.status(403).json({

                success: false,

                code: "NO_SUBSCRIPTION",

                message: "No active subscription found."

            });

        }

        if (

            isTrialExpired(

                subscription

            )

        ) {

            return res.status(403).json({

                success: false,

                code: "TRIAL_EXPIRED",

                message: "Your free trial has expired. Please upgrade your plan."

            });

        }

        req.subscription =

            subscription;

        req.plan =

            getCurrentPlan(

                subscription

            );

        next();

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Check Required Plan
|--------------------------------------------------------------------------
*/

function hasRequiredPlan(

    currentPlan,

    requiredPlan

) {

    return (

        PLAN_PRIORITY[currentPlan] >=

        PLAN_PRIORITY[requiredPlan]

    );

}


/*
|--------------------------------------------------------------------------
| Require Specific Plan
|--------------------------------------------------------------------------
*/

function requirePlan(

    requiredPlan

) {

    return (

        req,

        res,

        next

    ) => {

        const currentPlan =

            req.plan;

        if (

            !hasRequiredPlan(

                currentPlan,

                requiredPlan

            )

        ) {

            return res.status(403).json({

                success: false,

                code: "PLAN_UPGRADE_REQUIRED",

                currentPlan,

                requiredPlan,

                message: `Your current plan does not include this feature. Please upgrade to ${requiredPlan}.`

            });

        }

        next();

    };

}


/*
|--------------------------------------------------------------------------
| Starter Plan
|--------------------------------------------------------------------------
*/

const requireStarter =

    requirePlan(

        PLANS.STARTER

    );


/*
|--------------------------------------------------------------------------
| Growth Plan
|--------------------------------------------------------------------------
*/

const requireGrowth =

    requirePlan(

        PLANS.GROWTH

    );


/*
|--------------------------------------------------------------------------
| Premium Plan
|--------------------------------------------------------------------------
*/

const requirePremium =

    requirePlan(

        PLANS.PREMIUM

    );


/*
|--------------------------------------------------------------------------
| Enterprise Plan
|--------------------------------------------------------------------------
*/

const requireEnterprise =

    requirePlan(

        PLANS.ENTERPRISE

    );
/*
|--------------------------------------------------------------------------
| Grace Period
|--------------------------------------------------------------------------
*/

function isGracePeriod(

    subscription

) {

    if (

        !subscription ||

        subscription.plan !== PLANS.TRIAL

    ) {

        return false;

    }

    const trialEnds =

        new Date(

            subscription.createdAt

        );

    trialEnds.setDate(

        trialEnds.getDate() +

        TRIAL_DAYS

    );

    const graceEnds =

        new Date(

            trialEnds

        );

    graceEnds.setDate(

        graceEnds.getDate() +

        GRACE_PERIOD_DAYS

    );

    const now =

        new Date();

    return (

        now >= trialEnds &&

        now < graceEnds

    );

}


/*
|--------------------------------------------------------------------------
| Subscription Expired
|--------------------------------------------------------------------------
*/

function isSubscriptionExpired(

    subscription

) {

    if (

        !subscription

    ) {

        return true;

    }

    if (

        subscription.plan !==

        PLANS.TRIAL

    ) {

        return false;

    }

    const graceEnds =

        new Date(

            subscription.createdAt

        );

    graceEnds.setDate(

        graceEnds.getDate() +

        TRIAL_DAYS +

        GRACE_PERIOD_DAYS

    );

    return (

        new Date() >

        graceEnds

    );

}


/*
|--------------------------------------------------------------------------
| Billing Required
|--------------------------------------------------------------------------
*/

async function requireBilling(

    req,

    res,

    next

) {

    const subscription =

        req.subscription;

    if (

        isGracePeriod(

            subscription

        )

    ) {

        return res.status(402).json({

            success: false,

            code: "PAYMENT_REQUIRED",

            status: "grace_period",

            graceDays:

                GRACE_PERIOD_DAYS,

            message:

                "Your 5-day trial has ended. Please subscribe to continue using Layboka AI."

        });

    }

    if (

        isSubscriptionExpired(

            subscription

        )

    ) {

        return res.status(403).json({

            success: false,

            code: "SUBSCRIPTION_EXPIRED",

            status: "expired",

            message:

                "Subscription expired. Please upgrade your plan."

        });

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Attach Subscription
|--------------------------------------------------------------------------
*/

async function attachSubscription(

    req,

    res,

    next

) {

    try {

        const subscription =

            await getActiveSubscription(

                req.shop._id

            );

        req.subscription =

            subscription;

        req.plan =

            subscription

                ? subscription.plan

                : PLANS.TRIAL;

        req.isTrial =

            req.plan ===

            PLANS.TRIAL;

        req.isGracePeriod =

            isGracePeriod(

                subscription

            );

        req.isExpired =

            isSubscriptionExpired(

                subscription

            );

        next();

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

      }
/*
|--------------------------------------------------------------------------
| Dashboard Access
|--------------------------------------------------------------------------
*/

function requireDashboardAccess(

    req,

    res,

    next

) {

    if (

        req.isExpired ||

        req.isGracePeriod

    ) {

        return res.status(403).json({

            success: false,

            code: "DASHBOARD_LOCKED",

            message: "Dashboard is locked. Please subscribe to continue.",

            redirect: "/pricing"

        });

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Chatbot Access
|--------------------------------------------------------------------------
*/

function requireChatbotAccess(

    req,

    res,

    next

) {

    if (

        req.isExpired ||

        req.isGracePeriod

    ) {

        return res.status(403).json({

            success: false,

            code: "CHATBOT_LOCKED",

            message: "Chatbot is disabled until subscription is activated.",

            chatbotEnabled: false

        });

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Upload Permission
|--------------------------------------------------------------------------
*/

function requireUploadAccess(

    req,

    res,

    next

) {

    if (

        req.isExpired ||

        req.isGracePeriod

    ) {

        return res.status(403).json({

            success: false,

            code: "UPLOAD_DISABLED",

            message: "Uploads are disabled. Please renew your subscription."

        });

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Trial Information
|--------------------------------------------------------------------------
*/

function attachTrialInformation(

    req,

    res,

    next

) {

    if (

        req.subscription &&

        req.plan === PLANS.TRIAL

    ) {

        const trialEnds =

            new Date(

                req.subscription.createdAt

            );

        trialEnds.setDate(

            trialEnds.getDate() +

            TRIAL_DAYS

        );

        req.trial = {

            startedAt:

                req.subscription.createdAt,

            expiresAt:

                trialEnds,

            remainingDays:

                Math.max(

                    0,

                    Math.ceil(

                        (

                            trialEnds -

                            new Date()

                        ) /

                        86400000

                    )

                )

        };

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Plan Information
|--------------------------------------------------------------------------
*/

function attachPlanInformation(

    req,

    res,

    next

) {

    req.planInformation = {

        plan:

            req.plan,

        isTrial:

            req.isTrial,

        isGracePeriod:

            req.isGracePeriod,

        isExpired:

            req.isExpired,

        subscriptionStatus:

            req.subscription?.status ||

            "none"

    };

    next();

}
/*
|--------------------------------------------------------------------------
| Feature Access
|--------------------------------------------------------------------------
*/

function checkFeatureAccess(

    feature

) {

    return (

        req,

        res,

        next

    ) => {

        const permissions = {

            trial: [

                "*"

            ],

            starter: [

                "basic-chat",

                "dashboard",

                "branding",

                "avatar",

                "upload-logo",

                "upload-avatar"

            ],

            growth: [

                "basic-chat",

                "dashboard",

                "branding",

                "avatar",

                "knowledge-base",

                "analytics",

                "automation"

            ],

            premium: [

                "*"

            ],

            enterprise: [

                "*"

            ]

        };

        const currentPlan =

            req.plan;

        const allowedFeatures =

            permissions[currentPlan] ||

            [];

        if (

            allowedFeatures.includes("*") ||

            allowedFeatures.includes(feature)

        ) {

            return next();

        }

        return res.status(403).json({

            success: false,

            code: "FEATURE_NOT_AVAILABLE",

            feature,

            plan: currentPlan,

            message: `The "${feature}" feature is not available on your ${currentPlan} plan.`

        });

    };

}


/*
|--------------------------------------------------------------------------
| Upload Limit
|--------------------------------------------------------------------------
*/

function checkUploadLimit(

    req,

    res,

    next

) {

    const limits = {

        trial: Infinity,

        starter: 50,

        growth: 200,

        premium: Infinity,

        enterprise: Infinity

    };

    req.uploadLimit =

        limits[req.plan] ??

        0;

    next();

}


/*
|--------------------------------------------------------------------------
| API Access
|--------------------------------------------------------------------------
*/

function checkApiAccess(

    req,

    res,

    next

) {

    if (

        req.isExpired

    ) {

        return res.status(403).json({

            success: false,

            code: "API_ACCESS_DENIED",

            message: "Your subscription has expired."

        });

    }

    if (

        req.isGracePeriod

    ) {

        return res.status(402).json({

            success: false,

            code: "PAYMENT_REQUIRED",

            message: "Please renew your subscription to continue using the API."

        });

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    checkSubscription,

    attachSubscription,

    requireStarter,

    requireGrowth,

    requirePremium,

    requireEnterprise,

    requirePlan,

    requireBilling,

    requireDashboardAccess,

    requireChatbotAccess,

    requireUploadAccess,

    attachTrialInformation,

    attachPlanInformation,

    checkFeatureAccess,

    checkUploadLimit,

    checkApiAccess

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    checkSubscription,

    attachSubscription,

    requireStarter,

    requireGrowth,

    requirePremium,

    requireEnterprise,

    requirePlan,

    requireBilling,

    requireDashboardAccess,

    requireChatbotAccess,

    requireUploadAccess,

    attachTrialInformation,

    attachPlanInformation,

    checkFeatureAccess,

    checkUploadLimit,

    checkApiAccess

};
