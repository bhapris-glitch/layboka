/*
|--------------------------------------------------------------------------
| Notification Cleanup Job
|--------------------------------------------------------------------------
| Responsible for:
| - Cleaning expired notifications
| - Removing old read notifications
| - Optimizing notification storage
|--------------------------------------------------------------------------
*/

import cron from "node-cron";

import logger from "../utils/logger.js";

import {

    cleanupExpiredNotifications,

    deleteExpiredNotifications,

    deleteReadNotifications

} from "../services/notification/notification.service.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const JOB_NAME = "notification-cleanup-job";

/*
|--------------------------------------------------------------------------
| Every Day at 02:00 UTC
|--------------------------------------------------------------------------
|
| Minute Hour Day Month Weekday
|   0      2    *    *      *
|
*/

const CRON_EXPRESSION = "0 2 * * *";


/*
|--------------------------------------------------------------------------
| Execute Job
|--------------------------------------------------------------------------
*/

async function runNotificationCleanupJob() {

    const startedAt = Date.now();

    logger.info(

        `[${JOB_NAME}] Started`

    );

    try {

        const cleanupResult =
    await processExpiredNotifications();

const expiredResult =
    await processDeleteExpiredNotifications();

const readResult =
    await processDeleteReadNotifications();

        const duration =

            Date.now() - startedAt;

        logger.info(

            `[${JOB_NAME}] Completed in ${duration} ms`

        );

        return buildJobSummary(

    cleanupResult,

    expiredResult,

    readResult,

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

function startNotificationCleanupJob() {

    logger.info(

        `[${JOB_NAME}] Scheduled (${CRON_EXPRESSION})`

    );

    return cron.schedule(

        CRON_EXPRESSION,

        async () => {

            await runNotificationCleanupJob();

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

    return runNotificationCleanupJob();

}
/*
|--------------------------------------------------------------------------
| Cleanup Expired Notifications
|--------------------------------------------------------------------------
*/

async function processExpiredNotifications() {

    logger.info(

        `[${JOB_NAME}] Cleaning expired notifications...`

    );

    const result =

        await cleanupExpiredNotifications();

    logger.info(

        `[${JOB_NAME}] Expired notification cleanup completed.`,

        {

            processed:

                result?.processed ?? 0,

            deleted:

                result?.deleted ?? 0

        }

    );

    return result;

}


/*
|--------------------------------------------------------------------------
| Delete Expired Notifications
|--------------------------------------------------------------------------
*/

async function processDeleteExpiredNotifications() {

    logger.info(

        `[${JOB_NAME}] Deleting expired notifications...`

    );

    const result =

        await deleteExpiredNotifications();

    logger.info(

        `[${JOB_NAME}] Expired notifications deleted.`,

        {

            deleted:

                result?.deleted ?? 0

        }

    );

    return result;

}


/*
|--------------------------------------------------------------------------
| Delete Read Notifications
|--------------------------------------------------------------------------
*/

async function processDeleteReadNotifications() {

    logger.info(

        `[${JOB_NAME}] Deleting read notifications...`

    );

    const result =

        await deleteReadNotifications();

    logger.info(

        `[${JOB_NAME}] Read notifications deleted.`,

        {

            deleted:

                result?.deleted ?? 0

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

    cleanupResult,

    expiredResult,

    readResult,

    duration

) {

    return {

        success: true,

        duration,

        cleanup: {

            processed:

                cleanupResult?.processed ?? 0

        },

        expired: {

            deleted:

                expiredResult?.deleted ?? 0

        },

        read: {

            deleted:

                readResult?.deleted ?? 0

        }

    };

}
/*
|--------------------------------------------------------------------------
| Process Notification Batch
|--------------------------------------------------------------------------
*/

async function processNotificationBatch(

    notifications = [],

    processor

) {

    const results = [];

    for (

        const notification

        of notifications

    ) {

        try {

            const result =

                await processor(

                    notification

                );

            results.push({

                success: true,

                notificationId:

                    notification._id,

                result

            });

        }

        catch (error) {

            logger.error(

                `[${JOB_NAME}] Notification processing failed`,

                {

                    notificationId:

                        notification?._id,

                    message:

                        error.message

                }

            );

            results.push({

                success: false,

                notificationId:

                    notification?._id,

                error:

                    error.message

            });

        }

    }

    return results;

}


/*
|--------------------------------------------------------------------------
| Build Cleanup Metrics
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

        failed,

        successRate:

            results.length === 0

                ? 100

                : Number(

                    (

                        success /

                        results.length

                    ) * 100

                ).toFixed(2)

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

        return {

            success: false,

            error:

                error.message

        };

    }

}


/*
|--------------------------------------------------------------------------
| Build Cleanup Summary
|--------------------------------------------------------------------------
*/

function buildCleanupSummary(

    expiredResult,

    readResult,

    duration

) {

    return {

        success: true,

        duration,

        expired: {

            processed:

                expiredResult?.processed ?? 0,

            deleted:

                expiredResult?.deleted ?? 0

        },

        read: {

            processed:

                readResult?.processed ?? 0,

            deleted:

                readResult?.deleted ?? 0

        }

    };

            }
/*
|--------------------------------------------------------------------------
| Write Audit Log
|--------------------------------------------------------------------------
*/

function writeAuditLog(summary) {

    logger.info(

        `[${JOB_NAME}] Notification cleanup completed`,

        {

            success: summary.success,

            duration: summary.duration,

            cleanupProcessed:

                summary.cleanup?.processed ?? 0,

            expiredDeleted:

                summary.expired?.deleted ?? 0,

            readDeleted:

                summary.read?.deleted ?? 0,

            totalDeleted:

                (summary.expired?.deleted ?? 0) +

                (summary.read?.deleted ?? 0),

            timestamp:

                new Date().toISOString()

        }

    );

}


/*
|--------------------------------------------------------------------------
| Build Execution Report
|--------------------------------------------------------------------------
*/

function buildExecutionReport(summary) {

    return {

        job: JOB_NAME,

        success: summary.success,

        duration: summary.duration,

        timestamp:

            new Date().toISOString(),

        cleanup: {

            processed:

                summary.cleanup?.processed ?? 0

        },

        expired: {

            deleted:

                summary.expired?.deleted ?? 0

        },

        read: {

            deleted:

                summary.read?.deleted ?? 0

        },

        totalDeleted:

            (summary.expired?.deleted ?? 0) +

            (summary.read?.deleted ?? 0)

    };

}


/*
|--------------------------------------------------------------------------
| Log Execution Report
|--------------------------------------------------------------------------
*/

function logExecutionReport(report) {

    logger.info(

        `[${JOB_NAME}] Execution Report`,

        report

    );

}


/*
|--------------------------------------------------------------------------
| Finalize Job
|--------------------------------------------------------------------------
*/

function finalizeJob(summary) {

    writeAuditLog(

        summary

    );

    const report =

        buildExecutionReport(

            summary

        );

    logExecutionReport(

        report

    );

    return report;

}
/*
|--------------------------------------------------------------------------
| Scheduler Instance
|--------------------------------------------------------------------------
*/

let scheduler = null;


/*
|--------------------------------------------------------------------------
| Runtime State
|--------------------------------------------------------------------------
*/

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

        schedule: CRON_EXPRESSION,

        running: jobState.running,

        lastStartedAt: jobState.lastStartedAt,

        lastFinishedAt: jobState.lastFinishedAt,

        lastDuration: jobState.lastDuration,

        lastSuccess: jobState.lastSuccess,

        totalRuns: jobState.totalRuns,

        totalFailures: jobState.totalFailures

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

    if (!success) {

        jobState.totalFailures++;

    }

}


/*
|--------------------------------------------------------------------------
| Start Scheduler
|--------------------------------------------------------------------------
*/

function startScheduler() {

    if (scheduler) {

        return scheduler;

    }

    scheduler = startNotificationCleanupJob();

    logger.info(

        `[${JOB_NAME}] Scheduler started.`

    );

    return scheduler;

}


/*
|--------------------------------------------------------------------------
| Stop Scheduler
|--------------------------------------------------------------------------
*/

function stopScheduler() {

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
| Destroy Scheduler
|--------------------------------------------------------------------------
*/

function destroyScheduler() {

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
| Reset Statistics
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
| Health Check
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

        runtime:

            getJobStatus()

    };

    }
/*
|--------------------------------------------------------------------------
| Register Shutdown Handlers
|--------------------------------------------------------------------------
*/

function registerShutdownHandlers() {

    const shutdown = async (signal) => {

        logger.info(

            `[${JOB_NAME}] Received ${signal}. Shutting down scheduler...`

        );

        try {

            stopScheduler();

            destroyScheduler();

            logger.info(

                `[${JOB_NAME}] Scheduler shutdown completed.`

            );

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

function initializeNotificationCleanupJob() {

    registerShutdownHandlers();

    return startScheduler();

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

            "Automatically cleans expired and read notifications to keep the notification collection optimized.",

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

    initializeNotificationCleanupJob,

    startScheduler,

    stopScheduler,

    destroyScheduler,

    executeNow,

    runNotificationCleanupJob,

    getJobStatus,

    getJobInformation,

    isJobHealthy,

    resetJobStatistics

};


export default {

    initializeNotificationCleanupJob,

    startScheduler,

    stopScheduler,

    destroyScheduler,

    executeNow,

    runNotificationCleanupJob,

    getJobStatus,

    getJobInformation,

    isJobHealthy,

    resetJobStatistics

};
