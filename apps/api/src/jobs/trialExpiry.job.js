/*
|--------------------------------------------------------------------------
| Trial Expiry Job
|--------------------------------------------------------------------------
| Responsible only for:
| - Detecting expired trials
| - Triggering grace period
| - Expiring subscriptions after grace
|--------------------------------------------------------------------------
*/

import cron from "node-cron";

import logger from "../utils/logger.js";

import {
    processExpiredTrials,
    processExpiredGracePeriods
} from "../services/subscription/subscription.service.js";


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const JOB_NAME = "trial-expiry-job";

/*
|--------------------------------------------------------------------------
| Every Hour
|--------------------------------------------------------------------------
|
| Minute Hour Day Month Weekday
|   0      *    *    *      *
|
*/

const CRON_EXPRESSION = "0 * * * *";


/*
|--------------------------------------------------------------------------
| Execute Job
|--------------------------------------------------------------------------
*/

async function runTrialExpiryJob() {

    const startedAt = new Date();

    logger.info(`[${JOB_NAME}] Started`);

    try {

        const trialResult =
    await processTrialExpiry();

const graceResult =
    await processGraceExpiry();

        const finishedAt = new Date();

const duration =
    finishedAt.getTime() -
    startedAt.getTime();

        logger.info(

            `[${JOB_NAME}] Completed in ${duration} ms`

        );

        const summary = {

    ...buildJobSummary(

        trialResult,

        graceResult,

        duration

    ),

    startedAt,

    finishedAt

};

return buildExecutionReport(

    summary

);
    } catch (error) {

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
| Start Cron
|--------------------------------------------------------------------------
*/

function startTrialExpiryJob() {

    logger.info(

        `[${JOB_NAME}] Scheduled (${CRON_EXPRESSION})`

    );

    scheduler = cron.schedule(

        CRON_EXPRESSION,

        async () => {

            jobState.running = true;

jobState.lastStartedAt = new Date();

const result =

    await runTrialExpiryJob();

jobState.lastFinishedAt =

    new Date();

jobState.lastSuccess =

    result.success;

jobState.lastDuration =

    jobState.lastFinishedAt.getTime() -

    jobState.lastStartedAt.getTime();

jobState.totalRuns++;

if (

    !result.success

) {

    jobState.totalFailures++;

}

        },

        {

            scheduled: true,

            timezone: "UTC"

        }

    );

);

return scheduler;


/*
|--------------------------------------------------------------------------
| Manual Runner
|--------------------------------------------------------------------------
|
| Useful for:
| - Admin panel
| - Testing
| - CLI
|--------------------------------------------------------------------------
*/

async function executeNow() {

    return runTrialExpiryJob();

}
/*
|--------------------------------------------------------------------------
| Process Trial Expiry
|--------------------------------------------------------------------------
*/

async function processTrialExpiry() {

    logger.info(

        `[${JOB_NAME}] Checking expired trials...`

    );

    const result =

        await processExpiredTrials();

    logger.info(

        `[${JOB_NAME}] Trial check completed.`,

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
| Process Grace Period Expiry
|--------------------------------------------------------------------------
*/

async function processGraceExpiry() {

    logger.info(

        `[${JOB_NAME}] Checking expired grace periods...`

    );

    const result =

        await processExpiredGracePeriods();

    logger.info(

        `[${JOB_NAME}] Grace period check completed.`,

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
| Build Job Statistics
|--------------------------------------------------------------------------
*/

function buildJobSummary(

    trialResult,

    graceResult,

    duration

) {

    return {

        success: true,

        duration,

        trials: {

            processed:

                trialResult?.processed ?? 0,

            skipped:

                trialResult?.skipped ?? 0

        },

        grace: {

            processed:

                graceResult?.processed ?? 0,

            skipped:

                graceResult?.skipped ?? 0

        }

    };

}
/*
|--------------------------------------------------------------------------
| Process Single Merchant
|--------------------------------------------------------------------------
*/

async function processMerchant(

    merchant,

    processor

) {

    try {

        await processor(

            merchant

        );

        return {

            success: true,

            merchantId:

                merchant._id

        };

    } catch (error) {

        logger.error(

            `[${JOB_NAME}] Merchant processing failed`,

            {

                merchantId:

                    merchant._id,

                message:

                    error.message

            }

        );

        return {

            success: false,

            merchantId:

                merchant._id,

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

    merchants = [],

    processor

) {

    const results = [];

    for (

        const merchant

        of merchants

    ) {

        const result =

            await processMerchant(

                merchant,

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

            merchantId:

                merchant._id,

            type,

            ...data

        });

    }

    catch (error) {

        logger.error(

            `[${JOB_NAME}] Notification failed`,

            {

                merchantId:

                    merchant._id,

                message:

                    error.message

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

            to:

                merchant.email,

            template,

            data:

                payload

        });

    }

    catch (error) {

        logger.error(

            `[${JOB_NAME}] Email failed`,

            {

                merchantId:

                    merchant._id,

                message:

                    error.message

            }

        );

    }

}


/*
|--------------------------------------------------------------------------
| Audit Logger
|--------------------------------------------------------------------------
*/

function writeAuditLog(

    summary

) {

    logger.info(

        `[${JOB_NAME}] Execution Summary`,

        {

            startedAt:

                summary.startedAt,

            finishedAt:

                summary.finishedAt,

            duration:

                summary.duration,

            trialProcessed:

                summary.trials?.processed ?? 0,

            graceProcessed:

                summary.grace?.processed ?? 0,

            success:

                summary.success

        }

    );

}


/*
|--------------------------------------------------------------------------
| Final Report
|--------------------------------------------------------------------------
*/

function buildExecutionReport(

    summary

) {

    const report = {

        job:

            JOB_NAME,

        startedAt:

            summary.startedAt,

        finishedAt:

            summary.finishedAt,

        duration:

            summary.duration,

        success:

            summary.success,

        trials:

            summary.trials,

        grace:

            summary.grace

    };

    writeAuditLog(

        report

    );

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
| Health Status
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
| Update Runtime Statistics
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

    if (!success) {

        jobState.totalFailures++;

    }

}


/*
|--------------------------------------------------------------------------
| Stop Job
|--------------------------------------------------------------------------
*/

function stopTrialExpiryJob() {

    if (!scheduler) {

        return;

    }

    scheduler.stop();

    logger.info(

        `[${JOB_NAME}] Scheduler stopped.`

    );

}


/*
|--------------------------------------------------------------------------
| Destroy Job
|--------------------------------------------------------------------------
*/

function destroyTrialExpiryJob() {

    if (!scheduler) {

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
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

function registerShutdownHandlers() {

    const shutdown = (signal) => {

        logger.info(

            `[${JOB_NAME}] Received ${signal}. Stopping scheduler...`

        );

        try {

            destroyTrialExpiryJob();

        } catch (error) {

            logger.error(

                `[${JOB_NAME}] Shutdown Error`,

                {

                    message: error.message,

                    stack: error.stack

                }

            );

        }

        process.exit(0);

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

function initializeTrialExpiryJob() {

    registerShutdownHandlers();

    return startTrialExpiryJob();

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

            "Automatically manages trial expiry and grace period lifecycle.",

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

    initializeTrialExpiryJob,

    startTrialExpiryJob,

    stopTrialExpiryJob,

    destroyTrialExpiryJob,

    executeNow,

    runTrialExpiryJob,

    getJobStatus,

    getJobInformation

};

export default {

    initializeTrialExpiryJob,

    startTrialExpiryJob,

    stopTrialExpiryJob,

    destroyTrialExpiryJob,

    executeNow,

    runTrialExpiryJob,

    getJobStatus,

    getJobInformation

};
