/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Server Bootstrap
|--------------------------------------------------------------------------
|
| Starts the Express application.
| Connects to MongoDB.
| Boots all background services.
|
|--------------------------------------------------------------------------
*/

import http from "http";

import dotenv from "dotenv";

import app from "./app.js";

import connectDatabase from "./config/database.js";

import logger from "./utils/logger.js";



/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

dotenv.config();



/*
|--------------------------------------------------------------------------
| Server Configuration
|--------------------------------------------------------------------------
*/

const PORT =

    Number(

        process.env.PORT

    ) || 5000;

const NODE_ENV =

    process.env.NODE_ENV ||

    "development";



/*
|--------------------------------------------------------------------------
| HTTP Server
|--------------------------------------------------------------------------
*/

const server =

    http.createServer(

        app

    );



/*
|--------------------------------------------------------------------------
| Bootstrap State
|--------------------------------------------------------------------------
*/

let isShuttingDown = false;



/*
|--------------------------------------------------------------------------
| Startup Banner
|--------------------------------------------------------------------------
*/

logger.info(

    "========================================"

);

logger.info(

    "Starting Layboka AI Backend..."

);

logger.info(

    `Environment : ${NODE_ENV}`

);

logger.info(

    `Port        : ${PORT}`

);

logger.info(

    "========================================"

);
/*
|--------------------------------------------------------------------------
| Connect Database
|--------------------------------------------------------------------------
*/

async function initializeDatabase() {

    logger.info(

        "Connecting to MongoDB..."

    );

    await connectDatabase();

    logger.info(

        "MongoDB connected successfully."

    );

}


/*
|--------------------------------------------------------------------------
| Start HTTP Server
|--------------------------------------------------------------------------
*/

async function startHttpServer() {

    return new Promise(

        (resolve, reject) => {

            server.listen(

                PORT,

                () => {

                    logger.info(

                        `HTTP Server listening on port ${PORT}`

                    );

                    resolve();

                }

            );

            server.on(

                "error",

                reject

            );

        }

    );

}


/*
|--------------------------------------------------------------------------
| Bootstrap Application
|--------------------------------------------------------------------------
*/

async function bootstrap() {

    try {

        logger.info(

            "Bootstrapping application..."

        );

        await initializeDatabase();

        await startHttpServer();

      await initializeApplicationServices();

logRuntimeInformation();

        logger.info(

            "Layboka AI Backend started successfully."

        );

    }

    catch (error) {

        logger.error(

            "Application startup failed.",

            {

                message:

                    error.message,

                stack:

                    error.stack

            }

        );

        process.exit(1);

    }

}


/*
|--------------------------------------------------------------------------
| Start Application
|--------------------------------------------------------------------------
*/

bootstrap();
/*
|--------------------------------------------------------------------------
| Job Imports
|--------------------------------------------------------------------------
*/

import {

    initializeTrialExpiryJob

} from "./jobs/trialExpiry.job.js";

import {

    initializeSubscriptionJob

} from "./jobs/subscription.job.js";

import {

    initializeNotificationCleanupJob

} from "./jobs/notificationCleanup.job.js";

import {

    initializeAnalyticsJob

} from "./jobs/analytics.job.js";


/*
|--------------------------------------------------------------------------
| Initialize Background Jobs
|--------------------------------------------------------------------------
*/

function initializeBackgroundJobs() {

    logger.info(

        "Initializing background jobs..."

    );

    initializeTrialExpiryJob();

    initializeSubscriptionJob();

    initializeNotificationCleanupJob();

    initializeAnalyticsJob();

    logger.info(

        "Background jobs initialized successfully."

    );

}


/*
|--------------------------------------------------------------------------
| Initialize Application Services
|--------------------------------------------------------------------------
*/

async function initializeApplicationServices() {

    initializeBackgroundJobs();

    logger.info(

        "Application services initialized."

    );

}


/*
|--------------------------------------------------------------------------
| Runtime Information
|--------------------------------------------------------------------------
*/

function logRuntimeInformation() {

    logger.info(

        "========================================"

    );

    logger.info(

        "Layboka AI Backend is running."

    );

    logger.info(

        `Environment : ${NODE_ENV}`

    );

    logger.info(

        `Port        : ${PORT}`

    );

    logger.info(

        `Started At  : ${new Date().toISOString()}`

    );

    logger.info(

        "========================================"

    );

          }
/*
|--------------------------------------------------------------------------
| Process Error Handlers
|--------------------------------------------------------------------------
*/

process.on(

    "unhandledRejection",

    (reason) => {

        logger.error(

            "Unhandled Promise Rejection.",

            {

                reason:

                    reason instanceof Error

                        ? reason.message

                        : reason

            }

        );

    }

);


process.on(

    "uncaughtException",

    (error) => {

        logger.error(

            "Uncaught Exception.",

            {

                message:

                    error.message,

                stack:

                    error.stack

            }

        );

        process.exit(1);

    }

);


/*
|--------------------------------------------------------------------------
| Server Error Handler
|--------------------------------------------------------------------------
*/

server.on(

    "error",

    (error) => {

        logger.error(

            "HTTP Server Error.",

            {

                message:

                    error.message,

                stack:

                    error.stack

            }

        );

    }

);


/*
|--------------------------------------------------------------------------
| Process Warning Handler
|--------------------------------------------------------------------------
*/

process.on(

    "warning",

    (warning) => {

        logger.warn(

            "Node.js Warning.",

            {

                name:

                    warning.name,

                message:

                    warning.message

            }

        );

    }

);


/*
|--------------------------------------------------------------------------
| Memory Usage Logger
|--------------------------------------------------------------------------
*/

function logMemoryUsage() {

    const memory =

        process.memoryUsage();

    logger.info(

        "Memory Usage",

        {

            rss:

                memory.rss,

            heapTotal:

                memory.heapTotal,

            heapUsed:

                memory.heapUsed,

            external:

                memory.external

        }

    );

}
/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

async function gracefulShutdown(signal) {

    if (isShuttingDown) {

        return;

    }

    isShuttingDown = true;

    logger.info(

        `Received ${signal}. Starting graceful shutdown...`

    );

    try {

        await new Promise(

            (resolve) => {

                server.close(

                    () => {

                        logger.info(

                            "HTTP server closed."

                        );

                        resolve();

                    }

                );

            }

        );

        logger.info(

            "Graceful shutdown completed."

        );

        process.exit(0);

    }

    catch (error) {

        logger.error(

            "Graceful shutdown failed.",

            {

                message:

                    error.message,

                stack:

                    error.stack

            }

        );

        process.exit(1);

    }

}


/*
|--------------------------------------------------------------------------
| Shutdown Signals
|--------------------------------------------------------------------------
*/

process.once(

    "SIGINT",

    () => gracefulShutdown("SIGINT")

);

process.once(

    "SIGTERM",

    () => gracefulShutdown("SIGTERM")

);


/*
|--------------------------------------------------------------------------
| Process Exit
|--------------------------------------------------------------------------
*/

process.on(

    "exit",

    (code) => {

        logger.info(

            `Process exited with code ${code}.`

        );

    }

);
// Part 6
/*
|--------------------------------------------------------------------------
| Server Information
|--------------------------------------------------------------------------
*/

function getServerInformation() {

    return {

        application: "Layboka AI",

        version: "1.0.0",

        environment: NODE_ENV,

        port: PORT,

        pid: process.pid,

        startedAt: new Date().toISOString(),

        uptime: process.uptime()

    };

}


/*
|--------------------------------------------------------------------------
| Startup Summary
|--------------------------------------------------------------------------
*/

function printStartupSummary() {

    const info =

        getServerInformation();

    logger.info(

        "========================================"

    );

    logger.info(

        "Layboka AI Backend Started Successfully"

    );

    logger.info(

        `Application : ${info.application}`

    );

    logger.info(

        `Version     : ${info.version}`

    );

    logger.info(

        `Environment : ${info.environment}`

    );

    logger.info(

        `Port        : ${info.port}`

    );

    logger.info(

        `Process ID  : ${info.pid}`

    );

    logger.info(

        `Started At  : ${info.startedAt}`

    );

    logger.info(

        "========================================"

    );

}


/*
|--------------------------------------------------------------------------
| Print Startup Summary
|--------------------------------------------------------------------------
*/

printStartupSummary();


/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/

export {

    app,

    server,

    bootstrap,

    gracefulShutdown,

    getServerInformation

};


export default server;
