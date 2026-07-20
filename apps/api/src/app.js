/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Express Application
|--------------------------------------------------------------------------
|
| Configures the Express application.
| This file does NOT start the HTTP server.
| Server startup is handled by server.js.
|
|--------------------------------------------------------------------------
*/

import express from "express";

import path from "path";

import { fileURLToPath } from "url";


/*
|--------------------------------------------------------------------------
| Third-Party Middleware
|--------------------------------------------------------------------------
*/

import helmet from "helmet";

import cors from "cors";

import compression from "compression";

import cookieParser from "cookie-parser";

import morgan from "morgan";

import hpp from "hpp";

import mongoSanitize from "express-mongo-sanitize";


/*
|--------------------------------------------------------------------------
| Internal Modules
|--------------------------------------------------------------------------
*/

import logger from "./utils/logger.js";

import apiRoutes from "./routes/index.js";

import notFound from "./middleware/notFound.js";

import errorHandler from "./middleware/errorHandler.js";


/*
|--------------------------------------------------------------------------
| Express Application
|--------------------------------------------------------------------------
*/

const app = express();


/*
|--------------------------------------------------------------------------
| Path Configuration
|--------------------------------------------------------------------------
*/

const __filename =

    fileURLToPath(

        import.meta.url

    );

const __dirname =

    path.dirname(

        __filename

    );

const ROOT_DIRECTORY =

    path.resolve(

        __dirname,

        ".."

    );

const PUBLIC_DIRECTORY =

    path.join(

        ROOT_DIRECTORY,

        "public"

    );

const UPLOAD_DIRECTORY =

    path.join(

        ROOT_DIRECTORY,

        "uploads"

    );


/*
|--------------------------------------------------------------------------
| Startup Log
|--------------------------------------------------------------------------
*/

logger.info(

    "Initializing Express application..."

);
/*
|--------------------------------------------------------------------------
| Express Configuration
|--------------------------------------------------------------------------
*/

app.disable(

    "x-powered-by"

);

app.set(

    "trust proxy",

    1

);


/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(

    helmet({

        crossOriginResourcePolicy: {

            policy: "cross-origin"

        }

    })

);

app.use(

    cors({

        origin:

            process.env.CORS_ORIGIN

                ? process.env.CORS_ORIGIN

                    .split(",")

                    .map(

                        origin => origin.trim()

                    )

                : "*",

        credentials: true,

        methods: [

            "GET",

            "POST",

            "PUT",

            "PATCH",

            "DELETE",

            "OPTIONS"

        ],

        allowedHeaders: [

            "Content-Type",

            "Authorization",

            "X-Shopify-Shop-Domain",

            "X-Shopify-Hmac-Sha256",

            "X-Shopify-Access-Token"

        ]

    })

);


/*
|--------------------------------------------------------------------------
| Performance Middleware
|--------------------------------------------------------------------------
*/

app.use(

    compression()

);


/*
|--------------------------------------------------------------------------
| Cookie Middleware
|--------------------------------------------------------------------------
*/

app.use(

    cookieParser(

        process.env.COOKIE_SECRET

    )

);


/*
|--------------------------------------------------------------------------
| Request Security
|--------------------------------------------------------------------------
*/

app.use(

    mongoSanitize()

);

app.use(

    hpp({

        whitelist: [

            "sort",

            "fields",

            "page",

            "limit",

            "search"

        ]

    })

);


/*
|--------------------------------------------------------------------------
| HTTP OPTIONS
|--------------------------------------------------------------------------
*/

app.options(

    "*",

    cors()

);


/*
|--------------------------------------------------------------------------
| Security Log
|--------------------------------------------------------------------------
*/

logger.info(

    "Security middleware registered."

);
/*
|--------------------------------------------------------------------------
| HTTP Request Logging
|--------------------------------------------------------------------------
*/

if (

    process.env.NODE_ENV === "development"

) {

    app.use(

        morgan(

            "dev"

        )

    );

}

else {

    app.use(

        morgan(

            "combined",

            {

                stream: {

                    write: (message) =>

                        logger.info(

                            message.trim()

                        )

                }

            }

        )

    );

}


/*
|--------------------------------------------------------------------------
| Request Body Parsers
|--------------------------------------------------------------------------
*/

app.use(

    express.json({

        limit:

            process.env.JSON_LIMIT ||

            "10mb"

    })

);

app.use(

    express.urlencoded({

        extended: true,

        limit:

            process.env.URL_ENCODED_LIMIT ||

            "10mb"

    })

);


/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
*/

app.use(

    "/public",

    express.static(

        PUBLIC_DIRECTORY

    )

);

app.use(

    "/uploads",

    express.static(

        UPLOAD_DIRECTORY

    )

);


/*
|--------------------------------------------------------------------------
| Response Headers
|--------------------------------------------------------------------------
*/

app.use(

    (

        req,

        res,

        next

    ) => {

        res.setHeader(

            "X-App-Name",

            "Layboka AI"

        );

        res.setHeader(

            "X-App-Version",

            "1.0.0"

        );

        res.setHeader(

            "X-Content-Type-Options",

            "nosniff"

        );

        next();

    }

);


/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use(

    (

        req,

        res,

        next

    ) => {

        logger.debug(

            `${req.method} ${req.originalUrl}`

        );

        next();

    }

);


/*
|--------------------------------------------------------------------------
| Middleware Log
|--------------------------------------------------------------------------
*/

logger.info(

    "Application middleware registered."

);
