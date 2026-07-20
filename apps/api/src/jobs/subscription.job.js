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
    await processRenewals();

const paymentResult =
    await processPayments();

const usageResult =
    await processUsageReset();

        const duration =

            Date.now() - startedAt;

        logger.info(

            `[${JOB_NAME}] Completed in ${duration} ms`

        );

        return buildJobSummary(

    renewalResult,

    paymentResult,

    usageResult,

    duration

);

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
/*
|--------------------------------------------------------------------------
| Process Subscription Renewals
|--------------------------------------------------------------------------
*/

async function processRenewals() {

    logger.info(

        `[${JOB_NAME}] Processing subscription renewals...`

    );

    const result =

        await processSubscriptionRenewals();

    logger.info(

        `[${JOB_NAME}] Subscription renewals completed.`,

        {

            processed:

                result?.processed ?? 0,

            skipped:

                result?.skipped ?? 0

        }

    );

    return result;

}


/*
|--------------------------------------------------------------------------
| Process Failed Payments
|--------------------------------------------------------------------------
*/

async function processPayments() {

    logger.info(

        `[${JOB_NAME}] Processing failed payments...`

    );

    const result =

        await processFailedPayments();

    logger.info(

        `[${JOB_NAME}] Failed payment processing completed.`,

        {

            processed:

                result?.processed ?? 0,

            skipped:

                result?.skipped ?? 0

        }

    );

    return result;

}


/*
|--------------------------------------------------------------------------
| Process Monthly Usage Reset
|--------------------------------------------------------------------------
*/

async function processUsageReset() {

    logger.info(

        `[${JOB_NAME}] Resetting monthly usage...`

    );

    const result =

        await resetMonthlyUsage();

    logger.info(

        `[${JOB_NAME}] Monthly usage reset completed.`,

        {

            processed:

                result?.processed ?? 0,

            skipped:

                result?.skipped ?? 0

        }

    );

    return result;

}


/*
|--------------------------------------------------------------------------
| Build Job Summary
|--------------------------------------------------------------------------
*/

function buildJobSummary(

    renewalResult,

    paymentResult,

    usageResult,

    duration

) {

    return {

        success: true,

        duration,

        renewals: {

            processed:

                renewalResult?.processed ?? 0,

            skipped:

                renewalResult?.skipped ?? 0

        },

        payments: {

            processed:

                paymentResult?.processed ?? 0,

            skipped:

                paymentResult?.skipped ?? 0

        },

        usage: {

            processed:

                usageResult?.processed ?? 0,

            skipped:

                usageResult?.skipped ?? 0

        }

    };

}
/*
|--------------------------------------------------------------------------
| Process Single Subscription
|--------------------------------------------------------------------------
*/

async function processSubscription(

    subscription,

    processor

) {

    try {

        await processor(

            subscription

        );

        return {

            success: true,

            subscriptionId:

                subscription._id

        };

    } catch (error) {

        logger.error(

            `[${JOB_NAME}] Subscription processing failed`,

            {

                subscriptionId:

                    subscription._id,

                message:

                    error.message

            }

        );

        return {

            success: false,

            subscriptionId:

                subscription._id,

            error:

                error.message

        };

    }

}


/*
|--------------------------------------------------------------------------
| Batch Processor
|--------------------------------------------------------------------------
*/

async function processBatch(

    subscriptions = [],

    processor

) {

    const results = [];

    for (

        const subscription

        of subscriptions

    ) {

        const result =

            await processSubscription(

                subscription,

                processor

            );

        results.push(

            result

        );

    }

    return results;

}


/*
|--------------------------------------------------------------------------
| Metrics Builder
|--------------------------------------------------------------------------
*/

function buildMetrics(

    results = []

) {

    const success =

        results.filter(

            item => item.success

        ).length;

    const failed =

        results.length - success;

    return {

        total:

            results.length,

        success,

        failed

    };

}


/*
|--------------------------------------------------------------------------
| Safe Executor
|--------------------------------------------------------------------------
*/

async function safelyExecute(

    title,

    callback

) {

    try {

        logger.info(

            `[${JOB_NAME}] ${title}`

        );

        return await callback();

    }


    catch (error) {

        logger.error(

            `[${JOB_NAME}] ${title} failed`,

            {

                message:

                    error.message,

                stack:

                    error.stack

            }

        );

        return null;

    }

            }
/*
|--------------------------------------------------------------------------
| Send Merchant Notification
|--------------------------------------------------------------------------
*/

async function sendNotification(
    merchant,
    type,
    data = {}
) {

    try {

        const {

            default: notificationService

        } = await import(

            "../services/notification/notification.service.js"

        );

        await notificationService.createNotification({

            merchantId: merchant._id,

            type,

            ...data

        });

    }

    catch (error) {

        logger.error(

            `[${JOB_NAME}] Notification failed`,

            {

                merchantId: merchant?._id,

                message: error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| Send Merchant Email
|--------------------------------------------------------------------------
*/

async function sendEmail(
    merchant,
    template,
    payload = {}
) {

    try {

        const {

            default: emailService

        } = await import(

            "../services/email/email.service.js"

        );

        await emailService.sendTemplateEmail({

            to: merchant.email,

            template,

            data: payload

        });

    }

    catch (error) {

        logger.error(

            `[${JOB_NAME}] Email failed`,

            {

                merchantId: merchant?._id,

                message: error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| Write Audit Log
|--------------------------------------------------------------------------
*/

function writeAuditLog(
    summary
) {

    logger.info(

        `[${JOB_NAME}] Execution Summary`,

        {

            startedAt: summary.startedAt,

            finishedAt: summary.finishedAt,

            duration: summary.duration,

            renewals:

                summary.renewals?.processed ?? 0,

            payments:

                summary.payments?.processed ?? 0,

            usage:

                summary.usage?.processed ?? 0,

            success:

                summary.success

        }

    );

}


/*
|--------------------------------------------------------------------------
| Build Execution Report
|--------------------------------------------------------------------------
*/

function buildExecutionReport(
    summary
) {

    const report = {

        job: JOB_NAME,

        startedAt: summary.startedAt,

        finishedAt: summary.finishedAt,

        duration: summary.duration,

        success: summary.success,

        renewals: summary.renewals,

        payments: summary.payments,

        usage: summary.usage

    };

    writeAuditLog(report);

    return report;

}
/*
|--------------------------------------------------------------------------
| Job Runtime State
|--------------------------------------------------------------------------
*/

let scheduler = null;

const jobState = {

    running: false,

    lastStartedAt: null,

    lastFinishedAt: null,

    lastDuration: 0,

    lastSuccess: null,

    totalRuns: 0,

    totalFailures: 0

};


/*
|--------------------------------------------------------------------------
| Get Job Status
|--------------------------------------------------------------------------
*/

function getJobStatus() {

    return {

        job: JOB_NAME,

        cron: CRON_EXPRESSION,

        running: jobState.running,

        lastStartedAt: jobState.lastStartedAt,

        lastFinishedAt: jobState.lastFinishedAt,

        lastDuration: jobState.lastDuration,

        totalRuns: jobState.totalRuns,

        totalFailures: jobState.totalFailures,

        lastSuccess: jobState.lastSuccess

    };

}


/*
|--------------------------------------------------------------------------
| Update Runtime State
|--------------------------------------------------------------------------
*/

function updateJobState(

    success,

    startedAt,

    finishedAt

) {

    jobState.running = false;

    jobState.lastStartedAt = startedAt;

    jobState.lastFinishedAt = finishedAt;

    jobState.lastDuration =

        finishedAt.getTime() -

        startedAt.getTime();

    jobState.lastSuccess = success;

    jobState.totalRuns++;

    if (

        !success

    ) {

        jobState.totalFailures++;

    }

}


/*
|--------------------------------------------------------------------------
| Stop Scheduler
|--------------------------------------------------------------------------
*/

function stopSubscriptionJob() {

    if (

        !scheduler

    ) {

        return;

    }

    scheduler.stop();

    logger.info(

        `[${JOB_NAME}] Scheduler stopped.`

    );

}


/*
|--------------------------------------------------------------------------
| Destroy Scheduler
|--------------------------------------------------------------------------
*/

function destroySubscriptionJob() {

    if (

        !scheduler

    ) {

        return;

    }

    scheduler.destroy();

    scheduler = null;

    logger.info(

        `[${JOB_NAME}] Scheduler destroyed.`

    );

}


/*
|--------------------------------------------------------------------------
| Reset Runtime Statistics
|--------------------------------------------------------------------------
*/

function resetJobStatistics() {

    jobState.running = false;

    jobState.lastStartedAt = null;

    jobState.lastFinishedAt = null;

    jobState.lastDuration = 0;

    jobState.lastSuccess = null;

    jobState.totalRuns = 0;

    jobState.totalFailures = 0;

}


/*
|--------------------------------------------------------------------------
| Job Health Check
|--------------------------------------------------------------------------
*/

function isJobHealthy() {

    return {

        healthy:

            jobState.totalFailures === 0 ||

            jobState.totalFailures <

            jobState.totalRuns,

        schedulerRunning:

            scheduler !== null,

        statistics:

            getJobStatus()

    };

    }
/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

function registerShutdownHandlers() {

    const shutdown = async (signal) => {

        logger.info(

            `[${JOB_NAME}] Received ${signal}. Stopping scheduler...`

        );

        try {

            stopSubscriptionJob();

            destroySubscriptionJob();

        }

        catch (error) {

            logger.error(

                `[${JOB_NAME}] Shutdown failed`,

                {

                    message: error.message,

                    stack: error.stack

                }

            );

        }

    };

    process.once(

        "SIGINT",

        () => shutdown("SIGINT")

    );

    process.once(

        "SIGTERM",

        () => shutdown("SIGTERM")

    );

}


/*
|--------------------------------------------------------------------------
| Initialize Job
|--------------------------------------------------------------------------
*/

function initializeSubscriptionJob() {

    registerShutdownHandlers();

    return startSubscriptionJob();

}


/*
|--------------------------------------------------------------------------
| Job Information
|--------------------------------------------------------------------------
*/

function getJobInformation() {

    return {

        name: JOB_NAME,

        description:

            "Synchronizes subscriptions, verifies recurring payments, renews active plans and resets monthly usage.",

        schedule: CRON_EXPRESSION,

        timezone: "UTC",

        version: "1.0.0"

    };

}


/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

export {

    initializeSubscriptionJob,

    startSubscriptionJob,

    stopSubscriptionJob,

    destroySubscriptionJob,

    executeNow,

    runSubscriptionJob,

    getJobStatus,

    getJobInformation,

    isJobHealthy,

    resetJobStatistics

};


export default {

    initializeSubscriptionJob,

    startSubscriptionJob,

    stopSubscriptionJob,

    destroySubscriptionJob,

    executeNow,

    runSubscriptionJob,

    getJobStatus,

    getJobInformation,

    isJobHealthy,

    resetJobStatistics

};
