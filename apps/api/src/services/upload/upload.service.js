import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import mime from "mime-types";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| Upload Configuration
|--------------------------------------------------------------------------
*/

export const UPLOAD_CONFIG = {

    STORAGE_PROVIDER:

        process.env.UPLOAD_PROVIDER ||

        "local",

    ROOT_DIRECTORY:

        process.env.UPLOAD_PATH ||

        path.join(

            __dirname,

            "../../../uploads"

        ),

    PUBLIC_URL:

        process.env.UPLOAD_PUBLIC_URL ||

        "/uploads",

    MAX_FILE_SIZE:

        Number(

            process.env.MAX_FILE_SIZE ||

            10485760

        ), // 10 MB

    MAX_IMAGE_SIZE:

        Number(

            process.env.MAX_IMAGE_SIZE ||

            5242880

        ), // 5 MB

    MAX_DOCUMENT_SIZE:

        Number(

            process.env.MAX_DOCUMENT_SIZE ||

            10485760

        ), // 10 MB

    MAX_AUDIO_SIZE:

        Number(

            process.env.MAX_AUDIO_SIZE ||

            15728640

        ), // 15 MB

    MAX_VIDEO_SIZE:

        Number(

            process.env.MAX_VIDEO_SIZE ||

            52428800

        ), // 50 MB

    IMAGE_TYPES: [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/gif",

        "image/svg+xml"

    ],

    DOCUMENT_TYPES: [

        "application/pdf",

        "text/plain",

        "text/csv",

        "application/json",

        "application/zip"

    ],

    AUDIO_TYPES: [

        "audio/mpeg",

        "audio/mp3",

        "audio/wav",

        "audio/webm"

    ],

    VIDEO_TYPES: [

        "video/mp4",

        "video/webm",

        "video/quicktime"

    ]

};

/*
|--------------------------------------------------------------------------
| Storage Providers
|--------------------------------------------------------------------------
*/

export const STORAGE_PROVIDERS = {

    LOCAL: "local",

    AWS_S3: "s3",

    CLOUDINARY: "cloudinary",

    R2: "cloudflare-r2"

};

/*
|--------------------------------------------------------------------------
| Generate File Name
|--------------------------------------------------------------------------
*/

export function generateFileName(

    originalName

) {

    const extension =

        path.extname(originalName);

    return `${Date.now()}-${crypto.randomUUID()}${extension}`;

}

/*
|--------------------------------------------------------------------------
| Validate MIME Type
|--------------------------------------------------------------------------
*/

export function validateMimeType(

    file,

    allowedTypes = []

) {

    if (!file?.mimetype) {

        throw new Error(

            "Missing file MIME type."

        );

    }

    if (

        !allowedTypes.includes(

            file.mimetype

        )

    ) {

        throw new Error(

            `Unsupported file type: ${file.mimetype}`

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Validate File Size
|--------------------------------------------------------------------------
*/

export function validateFileSize(

    file,

    maxSize =

        UPLOAD_CONFIG.MAX_FILE_SIZE

) {

    if (!file?.size) {

        throw new Error(

            "File size is missing."

        );

    }

    if (file.size > maxSize) {

        throw new Error(

            `Maximum upload size is ${maxSize} bytes.`

        );

    }

    return true;

}

/*
|--------------------------------------------------------------------------
| Validate Upload
|--------------------------------------------------------------------------
*/

export function validateFile(

    file,

    {

        allowedTypes = [],

        maxSize =

            UPLOAD_CONFIG.MAX_FILE_SIZE

    } = {}

) {

    validateMimeType(

        file,

        allowedTypes

    );

    validateFileSize(

        file,

        maxSize

    );

    return true;

}
