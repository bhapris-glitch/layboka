/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import mime from "mime-types";

import { existsSync, mkdirSync } from "fs";

import AppError from "../../utils/AppError.js";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

export const STORAGE_CONFIG = {

    DRIVER: process.env.STORAGE_DRIVER || "local",

    ROOT_DIRECTORY:

        process.env.UPLOAD_PATH ||

        "uploads",

    MAX_FILE_SIZE:

        Number(

            process.env.MAX_FILE_SIZE ||

            10485760

        ), // 10 MB

    MAX_FILES: Number(

        process.env.MAX_FILES ||

        10

    ),

    PUBLIC_URL:

        process.env.PUBLIC_UPLOAD_URL ||

        "/uploads",

    IMAGE_DIRECTORY: "images",

    DOCUMENT_DIRECTORY: "documents",

    AUDIO_DIRECTORY: "audio",

    VIDEO_DIRECTORY: "video",

    TEMP_DIRECTORY: "temp"

};

/*
|--------------------------------------------------------------------------
| Allowed MIME Types
|--------------------------------------------------------------------------
*/

export const ALLOWED_MIME_TYPES = {

    images: [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/gif",

        "image/svg+xml"

    ],

    documents: [

        "application/pdf",

        "text/plain",

        "text/csv",

        "application/json",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    ],

    audio: [

        "audio/mpeg",

        "audio/mp3",

        "audio/wav",

        "audio/ogg",

        "audio/webm"

    ],

    video: [

        "video/mp4",

        "video/webm",

        "video/quicktime"

    ]

};

/*
|--------------------------------------------------------------------------
| Storage Configuration
|--------------------------------------------------------------------------
*/

export async function initializeStorage() {

    const directories = [

        STORAGE_CONFIG.ROOT_DIRECTORY,

        path.join(

            STORAGE_CONFIG.ROOT_DIRECTORY,

            STORAGE_CONFIG.IMAGE_DIRECTORY

        ),

        path.join(

            STORAGE_CONFIG.ROOT_DIRECTORY,

            STORAGE_CONFIG.DOCUMENT_DIRECTORY

        ),

        path.join(

            STORAGE_CONFIG.ROOT_DIRECTORY,

            STORAGE_CONFIG.AUDIO_DIRECTORY

        ),

        path.join(

            STORAGE_CONFIG.ROOT_DIRECTORY,

            STORAGE_CONFIG.VIDEO_DIRECTORY

        ),

        path.join(

            STORAGE_CONFIG.ROOT_DIRECTORY,

            STORAGE_CONFIG.TEMP_DIRECTORY

        )

    ];

    for (const directory of directories) {

        if (!existsSync(directory)) {

            mkdirSync(directory, {

                recursive: true

            });

        }

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Upload Validation
|--------------------------------------------------------------------------
*/

export function validateUpload(file) {

    if (!file) {

        throw new AppError(

            "No file uploaded.",

            400

        );

    }

    if (

        file.size >

        STORAGE_CONFIG.MAX_FILE_SIZE

    ) {

        throw new AppError(

            `Maximum file size is ${

                Math.round(

                    STORAGE_CONFIG.MAX_FILE_SIZE /

                    1024 /

                    1024

                )

            } MB.`,

            400

        );

    }

    const allowed = Object.values(

        ALLOWED_MIME_TYPES

    ).flat();

    if (

        !allowed.includes(

            file.mimetype

        )

    ) {

        throw new AppError(

            "Unsupported file type.",

            400

        );

    }

    return true;

}
