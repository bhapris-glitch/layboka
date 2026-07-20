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

    updateMerchantAnalytics,

    refreshDashboardStatistics

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
