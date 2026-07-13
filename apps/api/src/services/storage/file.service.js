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
/*
|--------------------------------------------------------------------------
| Generate Unique File Name
|--------------------------------------------------------------------------
*/

export function generateFileName(file) {

    const extension =

        mime.extension(file.mimetype) ||

        path.extname(file.originalname);

    return (

        crypto.randomUUID() +

        "." +

        extension

    );

}

/*
|--------------------------------------------------------------------------
| Upload File
|--------------------------------------------------------------------------
*/

export async function uploadFile(

    file,

    directory = STORAGE_CONFIG.TEMP_DIRECTORY

) {

    validateUpload(file);

    const fileName =

        generateFileName(file);

    const targetDirectory = path.join(

        STORAGE_CONFIG.ROOT_DIRECTORY,

        directory

    );

    const filePath = path.join(

        targetDirectory,

        fileName

    );

    await fs.writeFile(

        filePath,

        file.buffer

    );

    const stats = await fs.stat(filePath);

    return {

        success: true,

        fileName,

        originalName: file.originalname,

        mimeType: file.mimetype,

        extension:

            path.extname(file.originalname),

        size: stats.size,

        directory,

        path: filePath,

        url: generatePublicUrl(

            directory,

            fileName

        ),

        uploadedAt: new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/

export async function deleteFile(filePath) {

    try {

        if (!existsSync(filePath)) {

            return false;

        }

        await fs.unlink(filePath);

        return true;

    } catch (error) {

        throw new AppError(

            "Unable to delete file.",

            500

        );

    }

}

/*
|--------------------------------------------------------------------------
| Replace File
|--------------------------------------------------------------------------
*/

export async function replaceFile(

    oldFilePath,

    newFile,

    directory = STORAGE_CONFIG.TEMP_DIRECTORY

) {

    if (oldFilePath) {

        await deleteFile(oldFilePath);

    }

    return uploadFile(

        newFile,

        directory

    );

}

/*
|--------------------------------------------------------------------------
| Generate Public URL
|--------------------------------------------------------------------------
*/

export function generatePublicUrl(

    directory,

    fileName

) {

    return (

        STORAGE_CONFIG.PUBLIC_URL +

        "/" +

        directory +

        "/" +

        fileName

    );

            }
/*
|--------------------------------------------------------------------------
| Image Utilities
|--------------------------------------------------------------------------
*/

export function isImage(file) {

    return ALLOWED_MIME_TYPES.images.includes(

        file.mimetype

    );

}

export function isDocument(file) {

    return ALLOWED_MIME_TYPES.documents.includes(

        file.mimetype

    );

}

export function isAudio(file) {

    return ALLOWED_MIME_TYPES.audio.includes(

        file.mimetype

    );

}

export function isVideo(file) {

    return ALLOWED_MIME_TYPES.video.includes(

        file.mimetype

    );

}

/*
|--------------------------------------------------------------------------
| Extract File Metadata
|--------------------------------------------------------------------------
*/

export async function extractMetadata(file) {

    return {

        originalName:

            file.originalname,

        mimeType:

            file.mimetype,

        extension:

            path.extname(

                file.originalname

            ),

        size:

            file.size,

        encoding:

            file.encoding || "",

        uploadedAt:

            new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Generate SHA256 Checksum
|--------------------------------------------------------------------------
*/

export function generateChecksum(buffer) {

    return crypto

        .createHash("sha256")

        .update(buffer)

        .digest("hex");

}

/*
|--------------------------------------------------------------------------
| Cleanup Temporary Files
|--------------------------------------------------------------------------
*/

export async function cleanupDirectory(

    directory = STORAGE_CONFIG.TEMP_DIRECTORY,

    olderThanHours = 24

) {

    const folder = path.join(

        STORAGE_CONFIG.ROOT_DIRECTORY,

        directory

    );

    if (!existsSync(folder)) {

        return 0;

    }

    const files = await fs.readdir(folder);

    let removed = 0;

    const cutoff =

        Date.now() -

        olderThanHours *

            60 *

            60 *

            1000;

    for (const file of files) {

        const filePath = path.join(

            folder,

            file

        );

        const stats =

            await fs.stat(filePath);

        if (

            stats.mtimeMs < cutoff

        ) {

            await fs.unlink(filePath);

            removed++;

        }

    }

    return removed;

}
/*
|--------------------------------------------------------------------------
| File Service
|--------------------------------------------------------------------------
*/

export const FileService = {

    initializeStorage,

    validateUpload,

    generateFileName,

    uploadFile,

    deleteFile,

    replaceFile,

    generatePublicUrl,

    isImage,

    isDocument,

    isAudio,

    isVideo,

    extractMetadata,

    generateChecksum,

    cleanupDirectory

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default FileService;
