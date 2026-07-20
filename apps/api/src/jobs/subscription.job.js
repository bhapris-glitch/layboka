/*
|--------------------------------------------------------------------------
| Subscription Job
|--------------------------------------------------------------------------
| Responsible for:
| - Syncing subscriptions with Stripe
| - Processing renewals
| - Checking failed payments
| - Resetting monthly usage
|--------------------------------------------------------------------------
*/

import cron from "node-cron";

import logger from "../utils/logger.js";

import {
    processSubscriptionRenewals,
    processFailedPayments,
    resetMonthlyUsage
} from "../services/subscription/subscription.service.js";


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const JOB_NAME = "subscription-job";

/*
|--------------------------------------------------------------------------
| Every 6 Hours
|--------------------------------------------------------------------------
|
| Minute Hour Day Month Weekday
|   0   */6   *    *      *
|
*/

const CRON_EXPRESSION = "0 */6 * * *";


/*
|--------------------------------------------------------------------------
| Execute Job
|--------------------------------------------------------------------------
*/

async function runSubscriptionJob() {

    const startedAt = Date.now();

    logger.info(

        `[${JOB_NAME}] Started`

    );

    try {

        const renewalResult =

            await processSubscriptionRenewals();

        const paymentResult =

            await processFailedPayments();

        const usageResult =

            await resetMonthlyUsage();

        const duration =

            Date.now() - startedAt;

        logger.info(

            `[${JOB_NAME}] Completed in ${duration} ms`

        );

        return {

            success: true,

            duration,

            renewals:

                renewalResult?.processed ?? 0,

            failedPayments:

                paymentResult?.processed ?? 0,

            usageReset:

                usageResult?.processed ?? 0

        };

    }

    catch (error) {

        logger.error(

            `[${JOB_NAME}] Failed`,

            {

                message: error.message,

                stack: error.stack

            }

        );

        return {

            success: false,

            error: error.message

        };

    }

}


/*
|--------------------------------------------------------------------------
| Start Scheduler
|--------------------------------------------------------------------------
*/

function startSubscriptionJob() {

    logger.info(

        `[${JOB_NAME}] Scheduled (${CRON_EXPRESSION})`

    );

    return cron.schedule(

        CRON_EXPRESSION,

        async () => {

            await runSubscriptionJob();

        },

        {

            scheduled: true,

            timezone: "UTC"

        }

    );

}


/*
|--------------------------------------------------------------------------
| Manual Execution
|--------------------------------------------------------------------------
*/

async function executeNow() {

    return runSubscriptionJob();

}
