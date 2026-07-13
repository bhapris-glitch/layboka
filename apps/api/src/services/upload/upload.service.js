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

export function validateUpload(

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
/*
|--------------------------------------------------------------------------
| Upload Image
|--------------------------------------------------------------------------
*/

export async function uploadImage(

    file,

    folder = "images"

) {

    validateUpload(file);

    validateMimeType(

        file,

        UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES

    );

    return storeFile(

        file,

        folder

    );

}

/*
|--------------------------------------------------------------------------
| Upload Document
|--------------------------------------------------------------------------
*/

export async function uploadDocument(

    file,

    folder = "documents"

) {

    validateUpload(file);

    validateMimeType(

        file,

        UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES

    );

    return storeFile(

        file,

        folder

    );

}

/*
|--------------------------------------------------------------------------
| Upload Audio
|--------------------------------------------------------------------------
*/

export async function uploadAudio(

    file,

    folder = "audio"

) {

    validateUpload(file);

    validateMimeType(

        file,

        UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES

    );

    return storeFile(

        file,

        folder

    );

}

/*
|--------------------------------------------------------------------------
| Upload Avatar
|--------------------------------------------------------------------------
*/

export async function uploadAvatar(

    file

) {

    validateUpload(file);

    validateMimeType(

        file,

        UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES

    );

    const uploaded = await storeFile(

        file,

        "avatars"

    );

    return {

        ...uploaded,

        type: "avatar"

    };

}

/*
|--------------------------------------------------------------------------
| Upload Product Image
|--------------------------------------------------------------------------
*/

export async function uploadProductImage(

    file

) {

    validateUpload(file);

    validateMimeType(

        file,

        UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES

    );

    const uploaded = await storeFile(

        file,

        "products"

    );

    return {

        ...uploaded,

        type: "product"

    };

}

/*
|--------------------------------------------------------------------------
| Generate Public File URL
|--------------------------------------------------------------------------
*/

export function generateFileUrl(

    relativePath

) {

    if (!relativePath) {

        return "";

    }

    return `${APP_URL}/${relativePath.replace(
        /^\/+/,
        ""
    )}`;

        }
/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/

export async function deleteFile(filePath) {

    try {

        await fs.access(filePath);

        await fs.unlink(filePath);

        return true;

    } catch (error) {

        console.error(

            "Delete File Error:",

            error.message

        );

        return false;

    }

}

/*
|--------------------------------------------------------------------------
| Move File
|--------------------------------------------------------------------------
*/

export async function moveFile(

    source,

    destination

) {

    await fs.mkdir(

        path.dirname(destination),

        {

            recursive: true

        }

    );

    await fs.rename(

        source,

        destination

    );

    return destination;

}

/*
|--------------------------------------------------------------------------
| Copy File
|--------------------------------------------------------------------------
*/

export async function copyFile(

    source,

    destination

) {

    await fs.mkdir(

        path.dirname(destination),

        {

            recursive: true

        }

    );

    await fs.copyFile(

        source,

        destination

    );

    return destination;

}

/*
|--------------------------------------------------------------------------
| File Metadata
|--------------------------------------------------------------------------
*/

export async function getFileMetadata(

    filePath

) {

    const stats = await fs.stat(filePath);

    return {

        name: path.basename(filePath),

        extension: path.extname(filePath),

        directory: path.dirname(filePath),

        size: stats.size,

        createdAt: stats.birthtime,

        modifiedAt: stats.mtime,

        accessedAt: stats.atime,

        isFile: stats.isFile(),

        isDirectory: stats.isDirectory()

    };

}

/*
|--------------------------------------------------------------------------
| Optimize Image
|--------------------------------------------------------------------------
*/

export async function optimizeImage(

    input,

    output,

    options = {}

) {

    const {

        width = 1200,

        height = null,

        quality = 85,

        format = "webp"

    } = options;

    await sharp(input)

        .resize({

            width,

            height,

            fit: "inside",

            withoutEnlargement: true

        })

        .toFormat(

            format,

            {

                quality

            }

        )

        .toFile(output);

    return output;

}

/*
|--------------------------------------------------------------------------
| Generate Thumbnail
|--------------------------------------------------------------------------
*/

export async function generateThumbnail(

    input,

    output,

    size = 300

) {

    await sharp(input)

        .resize(

            size,

            size,

            {

                fit: "cover"

            }

        )

        .webp({

            quality: 80

        })

        .toFile(output);

    return output;

 }
/*
|--------------------------------------------------------------------------
| Upload Analytics
|--------------------------------------------------------------------------
*/

export async function trackUploadAnalytics({

    shop,

    visitor = null,

    file,

    uploadTime = 0

}) {

    return {

        shop: shop?._id,

        visitor: visitor?._id || null,

        filename: file.filename,

        mimeType: file.mimetype,

        size: file.size,

        uploadTime,

        uploadedAt: new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Security Scan
|--------------------------------------------------------------------------
*/

export async function securityScan(file) {

    const blockedExtensions = [

        ".exe",
        ".bat",
        ".cmd",
        ".sh",
        ".php",
        ".js",
        ".jar",
        ".msi"

    ];

    const extension = path.extname(

        file.originalname

    ).toLowerCase();

    if (

        blockedExtensions.includes(

            extension

        )

    ) {

        throw new Error(

            "Blocked file type."

        );

    }

    return {

        safe: true,

        extension,

        scannedAt: new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Generate Signed URL
|--------------------------------------------------------------------------
*/

export async function generateSignedUrl(

    key,

    expiresIn = 3600

) {

    return {

        key,

        expiresIn,

        signedUrl: `${process.env.APP_URL}/uploads/${key}`,

        expiresAt: new Date(

            Date.now() +

            expiresIn * 1000

        )

    };

}

/*
|--------------------------------------------------------------------------
| Cleanup Temporary Files
|--------------------------------------------------------------------------
*/

export async function cleanupTempFiles(

    directory = TEMP_UPLOAD_DIR

) {

    const files = await fs.readdir(

        directory

    );

    let removed = 0;

    for (const file of files) {

        const filePath = path.join(

            directory,

            file

        );

        const stat = await fs.stat(

            filePath

        );

        const age =

            Date.now() -

            stat.mtimeMs;

        if (

            age >

            24 * 60 * 60 * 1000

        ) {

            await fs.unlink(

                filePath

            );

            removed++;

        }

    }

    return {

        success: true,

        removed

    };

}

/*
|--------------------------------------------------------------------------
| Upload Service
|--------------------------------------------------------------------------
*/

export const UploadService = {

    uploadSingle,

    uploadMultiple,

    deleteFile,

    validateFile,

    optimizeImage,

    securityScan,

    generateSignedUrl,

    cleanupTempFiles,

    trackUploadAnalytics

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default UploadService;
