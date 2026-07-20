/*
|--------------------------------------------------------------------------
| Analytics Job
|--------------------------------------------------------------------------
| Responsible for:
| - Generating daily analytics
| - Updating merchant dashboards
| - Refreshing reports
| - Aggregating platform statistics
|--------------------------------------------------------------------------
*/

import cron from "node-cron";

import logger from "../utils/logger.js";

import {

    generateDailyAnalytics,

    generateWeeklyAnalytics,

    generateMonthlyAnalytics,

    generateYearlyAnalytics

} from "../services/analytics/analytics.service.js";


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const JOB_NAME = "analytics-job";

/*
|--------------------------------------------------------------------------
| Every Day at 01:00 UTC
|--------------------------------------------------------------------------
|
| Minute Hour Day Month Weekday
|   0      1    *    *      *
|
*/

const CRON_EXPRESSION = "0 1 * * *";


/*
|--------------------------------------------------------------------------
| Execute Job
|--------------------------------------------------------------------------
*/

async function runAnalyticsJob() {

    const startedAt = Date.now();

    logger.info(

        `[${JOB_NAME}] Started`

    );

    try {

        const analyticsResult =

            await generateDailyAnalytics();

        const merchantResult =

            await updateMerchantAnalytics();

        const dashboardResult =

            await refreshDashboardStatistics();

        const duration =

            Date.now() - startedAt;

        logger.info(

            `[${JOB_NAME}] Completed in ${duration} ms`

        );

        return {

            success: true,

            duration,

            analytics:

                analyticsResult?.processed ?? 0,

            merchants:

                merchantResult?.processed ?? 0,

            dashboards:

                dashboardResult?.processed ?? 0

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

function startAnalyticsJob() {

    logger.info(

        `[${JOB_NAME}] Scheduled (${CRON_EXPRESSION})`

    );

    return cron.schedule(

        CRON_EXPRESSION,

        async () => {

            await runAnalyticsJob();

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

    return runAnalyticsJob();

}
/*
|--------------------------------------------------------------------------
| Generate Daily Analytics
|--------------------------------------------------------------------------
*/

async function processDailyAnalytics() {

    logger.info(

        `[${JOB_NAME}] Generating daily analytics...`

    );

    const result =

        await generateDailyAnalytics();

    logger.info(

        `[${JOB_NAME}] Daily analytics completed.`,

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
| Generate Weekly Analytics
|--------------------------------------------------------------------------
*/

async function processWeeklyAnalytics() {

    logger.info(

        `[${JOB_NAME}] Generating weekly analytics...`

    );

    const result =

        await generateWeeklyAnalytics();

    logger.info(

        `[${JOB_NAME}] Weekly analytics completed.`,

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
| Generate Monthly Analytics
|--------------------------------------------------------------------------
*/

async function processMonthlyAnalytics() {

    logger.info(

        `[${JOB_NAME}] Generating monthly analytics...`

    );

    const result =

        await generateMonthlyAnalytics();

    logger.info(

        `[${JOB_NAME}] Monthly analytics completed.`,

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
| Generate Yearly Analytics
|--------------------------------------------------------------------------
*/

async function processYearlyAnalytics() {

    logger.info(

        `[${JOB_NAME}] Generating yearly analytics...`

    );

    const result =

        await generateYearlyAnalytics();

    logger.info(

        `[${JOB_NAME}] Yearly analytics completed.`,

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

    dailyResult,

    weeklyResult,

    monthlyResult,

    yearlyResult,

    duration

) {

    return {

        success: true,

        duration,

        daily: {

            processed:

                dailyResult?.processed ?? 0,

            skipped:

                dailyResult?.skipped ?? 0

        },

        weekly: {

            processed:

                weeklyResult?.processed ?? 0,

            skipped:

                weeklyResult?.skipped ?? 0

        },

        monthly: {

            processed:

                monthlyResult?.processed ?? 0,

            skipped:

                monthlyResult?.skipped ?? 0

        },

        yearly: {

            processed:

                yearlyResult?.processed ?? 0,

            skipped:

                yearlyResult?.skipped ?? 0

        }

    };

}
/*
|--------------------------------------------------------------------------
| Process Analytics Task
|--------------------------------------------------------------------------
*/

async function processAnalyticsTask(

    taskName,

    processor

) {

    try {

        logger.info(

            `[${JOB_NAME}] ${taskName} started.`

        );

        const result =

            await processor();

        logger.info(

            `[${JOB_NAME}] ${taskName} completed.`

        );

        return {

            success: true,

            processed:

                result?.processed ?? 0,

            skipped:

                result?.skipped ?? 0,

            result

        };

    }

    catch (error) {

        logger.error(

            `[${JOB_NAME}] ${taskName} failed`,

            {

                message:

                    error.message,

                stack:

                    error.stack

            }

        );

        return {

            success: false,

            processed: 0,

            skipped: 0,

            error:

                error.message

        };

    }

}


/*
|--------------------------------------------------------------------------
| Execute All Analytics Jobs
|--------------------------------------------------------------------------
*/

async function processAnalyticsJobs() {

    const daily =

        await processAnalyticsTask(

            "Daily Analytics",

            processDailyAnalytics

        );

    const weekly =

        await processAnalyticsTask(

            "Weekly Analytics",

            processWeeklyAnalytics

        );

    const monthly =

        await processAnalyticsTask(

            "Monthly Analytics",

            processMonthlyAnalytics

        );

    const yearly =

        await processAnalyticsTask(

            "Yearly Analytics",

            processYearlyAnalytics

        );

    return {

        daily,

        weekly,

        monthly,

        yearly

    };

}


/*
|--------------------------------------------------------------------------
| Build Metrics
|--------------------------------------------------------------------------
*/

function buildMetrics(

    results

) {

    const tasks = [

        results.daily,

        results.weekly,

        results.monthly,

        results.yearly

    ];

    const successful =

        tasks.filter(

            task => task.success

        ).length;

    const failed =

        tasks.length - successful;

    return {

        totalTasks:

            tasks.length,

        successful,

        failed,

        successRate:

            Number(

                (

                    successful /

                    tasks.length

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

        return null;

    }

        }
/*
|--------------------------------------------------------------------------
| Write Audit Log
|--------------------------------------------------------------------------
*/

function writeAuditLog(summary) {

    logger.info(

        `[${JOB_NAME}] Analytics job completed`,

        {

            success: summary.success,

            duration: summary.duration,

            dailyProcessed:

                summary.daily?.processed ?? 0,

            weeklyProcessed:

                summary.weekly?.processed ?? 0,

            monthlyProcessed:

                summary.monthly?.processed ?? 0,

            yearlyProcessed:

                summary.yearly?.processed ?? 0,

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

        daily: {

            processed:

                summary.daily?.processed ?? 0,

            skipped:

                summary.daily?.skipped ?? 0

        },

        weekly: {

            processed:

                summary.weekly?.processed ?? 0,

            skipped:

                summary.weekly?.skipped ?? 0

        },

        monthly: {

            processed:

                summary.monthly?.processed ?? 0,

            skipped:

                summary.monthly?.skipped ?? 0

        },

        yearly: {

            processed:

                summary.yearly?.processed ?? 0,

            skipped:

                summary.yearly?.skipped ?? 0

        }

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
| Finalize Analytics Job
|--------------------------------------------------------------------------
*/

function finalizeAnalyticsJob(summary) {

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

    scheduler = startAnalyticsJob();

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
| Reset Job Statistics
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
| Get Runtime Metrics
|--------------------------------------------------------------------------
*/

function getRuntimeMetrics() {

    return {

        uptimeRuns:

            jobState.totalRuns,

        successfulRuns:

            jobState.totalRuns -

            jobState.totalFailures,

        failedRuns:

            jobState.totalFailures,

        lastExecution:

            jobState.lastFinishedAt,

        averageHealth:

            jobState.totalRuns === 0

                ? 100

                : Number(

                    (

                        (

                            jobState.totalRuns -

                            jobState.totalFailures

                        ) /

                        jobState.totalRuns

                    ) * 100

                ).toFixed(2)

    };

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

            getJobStatus(),

        metrics:

            getRuntimeMetrics()

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

                    message:

                        error.message,

                    stack:

                        error.stack

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
| Initialize Analytics Job
|--------------------------------------------------------------------------
*/

function initializeAnalyticsJob() {

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

        name:

            JOB_NAME,

        description:

            "Generates daily, weekly, monthly and yearly analytics reports for Layboka SaaS merchants.",

        schedule:

            CRON_EXPRESSION,

        timezone:

            "UTC",

        version:

            "1.0.0"

    };

}


/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

export {

    initializeAnalyticsJob,

    startScheduler,

    stopScheduler,

    destroyScheduler,

    executeNow,

    runAnalyticsJob,

    getJobStatus,

    getJobInformation,

    isJobHealthy,

    resetJobStatistics,

    getRuntimeMetrics

};


export default {

    initializeAnalyticsJob,

    startScheduler,

    stopScheduler,

    destroyScheduler,

    executeNow,

    runAnalyticsJob,

    getJobStatus,

    getJobInformation,

    isJobHealthy,

    resetJobStatistics,

    getRuntimeMetrics

};
