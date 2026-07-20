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

    cleanupReadNotifications,

    optimizeNotificationCollection

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

        const expiredResult =

            await cleanupExpiredNotifications();

        const readResult =

            await cleanupReadNotifications();

        const optimizeResult =

            await optimizeNotificationCollection();

        const duration =

            Date.now() - startedAt;

        logger.info(

            `[${JOB_NAME}] Completed in ${duration} ms`

        );

        return {

            success: true,

            duration,

            expired:

                expiredResult?.processed ?? 0,

            read:

                readResult?.processed ?? 0,

            optimized:

                optimizeResult?.processed ?? 0

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
