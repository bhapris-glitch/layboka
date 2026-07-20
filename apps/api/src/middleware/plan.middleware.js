/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Plan Authorization Middleware
|--------------------------------------------------------------------------
|
| Enforces subscription plans, trial access,
| feature availability and usage limits.
|
|--------------------------------------------------------------------------
*/

import AppError from "../utils/AppError.js";

import logger from "../utils/logger.js";

import Subscription from "../models/Subscription.js";

import {

    getSubscriptionByShop,

    checkTrialStatus,

    checkUsageLimit

} from "../services/subscription/subscription.service.js";


/*
|--------------------------------------------------------------------------
| Plan Constants
|--------------------------------------------------------------------------
*/

export const PLANS = Object.freeze({

    TRIAL: "trial",

    STARTER: "starter",

    GROWTH: "growth",

    PREMIUM: "premium",

    ENTERPRISE: "enterprise"

});


/*
|--------------------------------------------------------------------------
| Subscription Status
|--------------------------------------------------------------------------
*/

export const SUBSCRIPTION_STATUS = Object.freeze({

    TRIAL: "trial",

    ACTIVE: "active",

    EXPIRED: "expired",

    CANCELLED: "cancelled",

    PAST_DUE: "past_due"

});


/*
|--------------------------------------------------------------------------
| Feature Constants
|--------------------------------------------------------------------------
*/

export const FEATURES = Object.freeze({

    CHATBOT: "chatbot",

    AI_CHAT: "ai_chat",

    GPT5: "gpt5",

    PRODUCT_RECOMMENDATIONS: "product_recommendations",

    CART_RECOVERY: "cart_recovery",

    ANALYTICS: "analytics",

    EMAIL_AUTOMATION: "email_automation",

    FILE_UPLOADS: "file_uploads",

    API_ACCESS: "api_access",

    TEAM_MEMBERS: "team_members"

});


/*
|--------------------------------------------------------------------------
| Trial Configuration
|--------------------------------------------------------------------------
*/

export const TRIAL_DURATION_DAYS = 5;


/*
|--------------------------------------------------------------------------
| Startup Log
|--------------------------------------------------------------------------
*/

logger.info(

    "Plan middleware initialized."

);
/*
|--------------------------------------------------------------------------
| Load Shop Subscription
|--------------------------------------------------------------------------
*/

const loadSubscription = async (

    req

) => {

    const shop =

        req.user?.shop ||

        req.shop ||

        req.headers["x-shopify-shop-domain"];

    if (!shop) {

        throw AppError.badRequest(

            "Shop domain is required."

        );

    }

    const subscription =

        await getSubscriptionByShop(

            shop

        );

    if (!subscription) {

        throw AppError.notFound(

            "Subscription not found."

        );

    }

    req.subscription =

        subscription;

    return subscription;

};


/*
|--------------------------------------------------------------------------
| Trial Status
|--------------------------------------------------------------------------
*/

const isTrialActive = async (

    subscription

) => {

    if (!subscription) {

        return false;

    }

    const trialStatus =

        await checkTrialStatus(

            subscription

        );

    return Boolean(

        trialStatus?.active

    );

};


/*
|--------------------------------------------------------------------------
| Subscription Status
|--------------------------------------------------------------------------
*/

const isSubscriptionActive = (

    subscription

) => {

    if (!subscription) {

        return false;

    }

    return [

        SUBSCRIPTION_STATUS.ACTIVE,

        SUBSCRIPTION_STATUS.TRIAL

    ].includes(

        subscription.status

    );

};


/*
|--------------------------------------------------------------------------
| Usage Limit Validation
|--------------------------------------------------------------------------
*/

const validateUsageLimit = async (

    subscription,

    feature

) => {

    return await checkUsageLimit(

        subscription,

        feature

    );

};
/*
|--------------------------------------------------------------------------
| Require Active Subscription
|--------------------------------------------------------------------------
*/

export const requireActiveSubscription = (

    async (

        req,

        res,

        next

    ) => {

        try {

            const subscription =

                await loadSubscription(

                    req

                );

            if (

                !isSubscriptionActive(

                    subscription

                )

            ) {

                return next(

                    AppError.forbidden(

                        "An active subscription is required."

                    )

                );

            }

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

);


/*
|--------------------------------------------------------------------------
| Require Trial Or Paid Subscription
|--------------------------------------------------------------------------
*/

export const requireTrialOrPaid = (

    async (

        req,

        res,

        next

    ) => {

        try {

            const subscription =

                await loadSubscription(

                    req

                );

            const trialActive =

                await isTrialActive(

                    subscription

                );

            if (

                !trialActive &&

                !isSubscriptionActive(

                    subscription

                )

            ) {

                return next(

                    AppError.forbidden(

                        "Your trial has expired. Please subscribe to continue."

                    )

                );

            }

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

);


/*
|--------------------------------------------------------------------------
| Require Minimum Plan
|--------------------------------------------------------------------------
*/

export const requirePlan = (

    minimumPlan

) => {

    const PLAN_ORDER = {

        trial: 0,

        starter: 1,

        growth: 2,

        premium: 3,

        enterprise: 4

    };

    return async (

        req,

        res,

        next

    ) => {

        try {

            const subscription =

                await loadSubscription(

                    req

                );

            const currentPlan =

                subscription.plan ||

                PLANS.TRIAL;

            if (

                PLAN_ORDER[currentPlan] <

                PLAN_ORDER[minimumPlan]

            ) {

                return next(

                    AppError.forbidden(

                        `This feature requires the ${minimumPlan} plan or higher.`

                    )

                );

            }

            next();

        }

        catch (

            error

        ) {

            next(

                error

            );

        }

    };

};
/*
|--------------------------------------------------------------------------
| Require Feature Access
|--------------------------------------------------------------------------
*/

export const requireFeature = (

    feature

) => {

    return async (

        req,

        res,

        next

    ) => {

        try {

            const subscription =

                req.subscription ||

                await loadSubscription(

                    req

                );

            const hasAccess =

                await validateUsageLimit(

                    subscription,

                    feature

                );

            if (!hasAccess) {

                logger.warn(

                    `Feature "${feature}" denied for shop ${subscription.shop}`

                );

                return next(

                    AppError.forbidden(

                        `Your current subscription does not include "${feature}".`

                    )

                );

            }

            next();

        }

        catch (

            error

        ) {

            next(

                error

            );

        }

    };

};


/*
|--------------------------------------------------------------------------
| Require Usage Limit
|--------------------------------------------------------------------------
*/

export const requireUsageLimit = (

    feature

) => {

    return async (

        req,

        res,

        next

    ) => {

        try {

            const subscription =

                req.subscription ||

                await loadSubscription(

                    req

                );

            const allowed =

                await checkUsageLimit(

                    subscription,

                    feature

                );

            if (!allowed) {

                logger.warn(

                    `Usage limit exceeded for "${feature}" on shop ${subscription.shop}`

                );

                return next(

                    AppError.forbidden(

                        `Monthly usage limit reached for "${feature}".`

                    )

                );

            }

            next();

        }

        catch (

            error

        ) {

            next(

                error

            );

        }

    };

};


/*
|--------------------------------------------------------------------------
| Require GPT-5 Access
|--------------------------------------------------------------------------
*/

export const requireGPT5 =

    requirePlan(

        PLANS.PREMIUM

    );
/*
|--------------------------------------------------------------------------
| Require Analytics Access
|--------------------------------------------------------------------------
*/

export const requireAnalytics =

    requirePlan(

        PLANS.GROWTH

    );


/*
|--------------------------------------------------------------------------
| Require Enterprise Access
|--------------------------------------------------------------------------
*/

export const requireEnterprise =

    requirePlan(

        PLANS.ENTERPRISE

    );


/*
|--------------------------------------------------------------------------
| Require Billing Access
|--------------------------------------------------------------------------
*/

export const requireBillingAccess = (

    async (

        req,

        res,

        next

    ) => {

        try {

            const subscription =

                req.subscription ||

                await loadSubscription(

                    req

                );

            if (

                !isSubscriptionActive(

                    subscription

                )

            ) {

                return next(

                    AppError.forbidden(

                        "Your subscription is inactive. Billing access is unavailable."

                    )

                );

            }

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

);


/*
|--------------------------------------------------------------------------
| Require Upload Access
|--------------------------------------------------------------------------
*/

export const requireUploads = (

    async (

        req,

        res,

        next

    ) => {

        try {

            const subscription =

                req.subscription ||

                await loadSubscription(

                    req

                );

            const allowed =

                await validateUsageLimit(

                    subscription,

                    FEATURES.FILE_UPLOADS

                );

            if (!allowed) {

                logger.warn(

                    `File upload denied for shop ${subscription.shop}`

                );

                return next(

                    AppError.forbidden(

                        "Your current plan has reached its upload limit."

                    )

                );

            }

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

);
/*
|--------------------------------------------------------------------------
| Middleware Aliases
|--------------------------------------------------------------------------
*/

export const requirePremium =

    requireGPT5;


export const requirePaidPlan =

    requireActiveSubscription;


/*
|--------------------------------------------------------------------------
| Startup Validation
|--------------------------------------------------------------------------
*/

Object.freeze(

    PLANS

);

Object.freeze(

    FEATURES

);

Object.freeze(

    SUBSCRIPTION_STATUS

);


logger.info(

    "========================================"

);

logger.info(

    "Plan Authorization Middleware Ready"

);

logger.info(

    `Trial Duration : ${TRIAL_DURATION_DAYS} Days`

);

logger.info(

    `Supported Plans : ${Object.values(PLANS).join(", ")}`

);

logger.info(

    "Status          : Initialized"

);

logger.info(

    "========================================"

);


/*
|--------------------------------------------------------------------------
| Helper Exports
|--------------------------------------------------------------------------
*/

export {

    loadSubscription,

    isTrialActive,

    isSubscriptionActive,

    validateUsageLimit

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    requireActiveSubscription,

    requireTrialOrPaid,

    requirePlan,

    requireFeature,

    requireUsageLimit,

    requireGPT5,

    requireAnalytics,

    requireEnterprise,

    requireBillingAccess,

    requireUploads,

    requirePremium,

    requirePaidPlan,

    loadSubscription,

    isTrialActive,

    isSubscriptionActive,

    validateUsageLimit

};
