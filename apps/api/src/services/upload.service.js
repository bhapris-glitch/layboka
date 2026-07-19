/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import fs from "fs/promises";

import path from "path";

import crypto from "crypto";

import mime from "mime-types";


/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const MAX_IMAGE_SIZE =

    5 * 1024 * 1024; // 5 MB

const MAX_DOCUMENT_SIZE =

    20 * 1024 * 1024; // 20 MB


const IMAGE_TYPES = [

    "image/jpeg",

    "image/png",

    "image/webp",

    "image/svg+xml",

    "image/gif",

    "image/x-icon"

];


const DOCUMENT_TYPES = [

    "application/pdf",

    "text/plain",

    "application/json"

];


/*
|--------------------------------------------------------------------------
| Generate File Name
|--------------------------------------------------------------------------
*/

function generateFileName(

    originalName

) {

    const extension =

        path.extname(

            originalName

        );

    return (

        crypto.randomUUID() +

        extension

    );

}


/*
|--------------------------------------------------------------------------
| Validate Image
|--------------------------------------------------------------------------
*/

function validateImage(

    file

) {

    if (

        !IMAGE_TYPES.includes(

            file.mimetype

        )

    ) {

        throw new Error(

            "Unsupported image format."

        );

    }

    if (

        file.size >

        MAX_IMAGE_SIZE

    ) {

        throw new Error(

            "Image exceeds maximum allowed size."

        );

    }

}


/*
|--------------------------------------------------------------------------
| Validate Document
|--------------------------------------------------------------------------
*/

function validateDocument(

    file

) {

    if (

        !DOCUMENT_TYPES.includes(

            file.mimetype

        )

    ) {

        throw new Error(

            "Unsupported document type."

        );

    }

    if (

        file.size >

        MAX_DOCUMENT_SIZE

    ) {

        throw new Error(

            "Document exceeds maximum allowed size."

        );

    }

}
/*
|--------------------------------------------------------------------------
| Upload Directories
|--------------------------------------------------------------------------
*/

const UPLOAD_ROOT =

    path.join(

        process.cwd(),

        "uploads"

    );


const LOGO_DIRECTORY =

    path.join(

        UPLOAD_ROOT,

        "logos"

    );


const FAVICON_DIRECTORY =

    path.join(

        UPLOAD_ROOT,

        "favicons"

    );


const AVATAR_DIRECTORY =

    path.join(

        UPLOAD_ROOT,

        "avatars"

    );


const CHAT_ICON_DIRECTORY =

    path.join(

        UPLOAD_ROOT,

        "chat-icons"

    );


/*
|--------------------------------------------------------------------------
| Ensure Directory Exists
|--------------------------------------------------------------------------
*/

async function ensureDirectory(

    directory

) {

    await fs.mkdir(

        directory,

        {

            recursive: true

        }

    );

}


/*
|--------------------------------------------------------------------------
| Save File
|--------------------------------------------------------------------------
*/

async function saveFile(

    file,

    directory

) {

    await ensureDirectory(

        directory

    );

    const fileName =

        generateFileName(

            file.originalname

        );

    const destination =

        path.join(

            directory,

            fileName

        );

    await fs.writeFile(

        destination,

        file.buffer

    );

    return {

        fileName,

        path: destination,

        url: `/uploads/${path.basename(directory)}/${fileName}`,

        mimeType: file.mimetype,

        size: file.size

    };

}


/*
|--------------------------------------------------------------------------
| Save Logo
|--------------------------------------------------------------------------
*/

async function saveLogo(

    file

) {

    validateImage(

        file

    );

    return saveFile(

        file,

        LOGO_DIRECTORY

    );

}


/*
|--------------------------------------------------------------------------
| Save Favicon
|--------------------------------------------------------------------------
*/

async function saveFavicon(

    file

) {

    validateImage(

        file

    );

    return saveFile(

        file,

        FAVICON_DIRECTORY

    );

}


/*
|--------------------------------------------------------------------------
| Save Avatar
|--------------------------------------------------------------------------
*/

async function saveAvatar(

    file

) {

    validateImage(

        file

    );

    return saveFile(

        file,

        AVATAR_DIRECTORY

    );

}


/*
|--------------------------------------------------------------------------
| Save Chat Icon
|--------------------------------------------------------------------------
*/

async function saveChatIcon(

    file

) {

    validateImage(

        file

    );

    return saveFile(

        file,

        CHAT_ICON_DIRECTORY

    );

    }
/*
|--------------------------------------------------------------------------
| Additional Directories
|--------------------------------------------------------------------------
*/

const KNOWLEDGE_DIRECTORY =

    path.join(

        UPLOAD_ROOT,

        "knowledge"

    );


const PRODUCT_DIRECTORY =

    path.join(

        UPLOAD_ROOT,

        "products"

    );


const TEMP_DIRECTORY =

    path.join(

        UPLOAD_ROOT,

        "temp"

    );


/*
|--------------------------------------------------------------------------
| Save Knowledge Document
|--------------------------------------------------------------------------
*/

async function saveKnowledgeDocument(

    file

) {

    validateDocument(

        file

    );

    return saveFile(

        file,

        KNOWLEDGE_DIRECTORY

    );

}


/*
|--------------------------------------------------------------------------
| Save Product Image
|--------------------------------------------------------------------------
*/

async function saveProductImage(

    file

) {

    validateImage(

        file

    );

    return saveFile(

        file,

        PRODUCT_DIRECTORY

    );

}


/*
|--------------------------------------------------------------------------
| Save Temporary File
|--------------------------------------------------------------------------
*/

async function saveTemporaryFile(

    file

) {

    await ensureDirectory(

        TEMP_DIRECTORY

    );

    const fileName =

        generateFileName(

            file.originalname

        );

    const destination =

        path.join(

            TEMP_DIRECTORY,

            fileName

        );

    await fs.writeFile(

        destination,

        file.buffer

    );

    return {

        fileName,

        path: destination,

        url: `/uploads/temp/${fileName}`,

        mimeType: file.mimetype,

        size: file.size,

        temporary: true

    };

}


/*
|--------------------------------------------------------------------------
| Remove Uploaded File
|--------------------------------------------------------------------------
*/

async function removeUploadedFile(

    filePath

) {

    try {

        await fs.unlink(

            filePath

        );

        return true;

    }

    catch (

        error

    ) {

        return false;

    }

}


/*
|--------------------------------------------------------------------------
| File Exists
|--------------------------------------------------------------------------
*/

async function fileExists(

    filePath

) {

    try {

        await fs.access(

            filePath

        );

        return true;

    }

    catch (

        error

    ) {

        return false;

    }

    }
/*
|--------------------------------------------------------------------------
| Move Temporary File
|--------------------------------------------------------------------------
*/

async function moveTemporaryFile(

    sourcePath,

    destinationDirectory

) {

    await ensureDirectory(

        destinationDirectory

    );

    const fileName =

        path.basename(

            sourcePath

        );

    const destination =

        path.join(

            destinationDirectory,

            fileName

        );

    await fs.rename(

        sourcePath,

        destination

    );

    return {

        fileName,

        path: destination,

        moved: true

    };

}


/*
|--------------------------------------------------------------------------
| Copy Uploaded File
|--------------------------------------------------------------------------
*/

async function copyUploadedFile(

    sourcePath,

    destinationDirectory

) {

    await ensureDirectory(

        destinationDirectory

    );

    const fileName =

        path.basename(

            sourcePath

        );

    const destination =

        path.join(

            destinationDirectory,

            fileName

        );

    await fs.copyFile(

        sourcePath,

        destination

    );

    return {

        fileName,

        path: destination,

        copied: true

    };

}


/*
|--------------------------------------------------------------------------
| Get File Information
|--------------------------------------------------------------------------
*/

async function getFileInformation(

    filePath

) {

    const stats =

        await fs.stat(

            filePath

        );

    return {

        fileName:

            path.basename(

                filePath

            ),

        extension:

            path.extname(

                filePath

            ),

        size:

            stats.size,

        createdAt:

            stats.birthtime,

        updatedAt:

            stats.mtime,

        isDirectory:

            stats.isDirectory(),

        isFile:

            stats.isFile()

    };

}


/*
|--------------------------------------------------------------------------
| Get Directory Size
|--------------------------------------------------------------------------
*/

async function getDirectorySize(

    directory

) {

    let totalSize = 0;

    const entries =

        await fs.readdir(

            directory,

            {

                withFileTypes: true

            }

        );

    for (

        const entry

        of entries

    ) {

        const fullPath =

            path.join(

                directory,

                entry.name

            );

        if (

            entry.isDirectory()

        ) {

            totalSize +=

                await getDirectorySize(

                    fullPath

                );

        }

        else {

            const stats =

                await fs.stat(

                    fullPath

                );

            totalSize +=

                stats.size;

        }

    }

    return totalSize;

}


/*
|--------------------------------------------------------------------------
| Clean Temporary Files
|--------------------------------------------------------------------------
*/

async function cleanTemporaryFiles(

    maxAgeHours = 24

) {

    await ensureDirectory(

        TEMP_DIRECTORY

    );

    const files =

        await fs.readdir(

            TEMP_DIRECTORY

        );

    const now =

        Date.now();

    let deletedFiles = 0;

    for (

        const file

        of files

    ) {

        const filePath =

            path.join(

                TEMP_DIRECTORY,

                file

            );

        const stats =

            await fs.stat(

                filePath

            );

        const age =

            (

                now -

                stats.mtimeMs

            ) /

            1000 /

            60 /

            60;

        if (

            age >= maxAgeHours

        ) {

            await fs.unlink(

                filePath

            );

            deletedFiles++;

        }

    }

    return {

        success: true,

        deletedFiles,

        maxAgeHours

    };

    }
/*
|--------------------------------------------------------------------------
| Delete Logo
|--------------------------------------------------------------------------
*/

async function deleteLogo(

    filePath

) {

    return removeUploadedFile(

        filePath

    );

}


/*
|--------------------------------------------------------------------------
| Delete Favicon
|--------------------------------------------------------------------------
*/

async function deleteFavicon(

    filePath

) {

    return removeUploadedFile(

        filePath

    );

}


/*
|--------------------------------------------------------------------------
| Delete Avatar
|--------------------------------------------------------------------------
*/

async function deleteAvatar(

    filePath

) {

    return removeUploadedFile(

        filePath

    );

}


/*
|--------------------------------------------------------------------------
| Delete Chat Icon
|--------------------------------------------------------------------------
*/

async function deleteChatIcon(

    filePath

) {

    return removeUploadedFile(

        filePath

    );

}


/*
|--------------------------------------------------------------------------
| Delete Knowledge Document
|--------------------------------------------------------------------------
*/

async function deleteKnowledgeDocument(

    filePath

) {

    return removeUploadedFile(

        filePath

    );

}


/*
|--------------------------------------------------------------------------
| Delete Product Image
|--------------------------------------------------------------------------
*/

async function deleteProductImage(

    filePath

) {

    return removeUploadedFile(

        filePath

    );

    }
/*
|--------------------------------------------------------------------------
| Generate Public URL
|--------------------------------------------------------------------------
*/

function generatePublicUrl(

    file

) {

    if (

        !file ||

        !file.url

    ) {

        return null;

    }

    return file.url;

}


/*
|--------------------------------------------------------------------------
| Generate Signed URL
|--------------------------------------------------------------------------
*/

async function generateSignedUrl(

    file,

    expiresIn = 3600

) {

    return {

        url: file.url,

        expiresIn,

        expiresAt:

            new Date(

                Date.now() +

                expiresIn * 1000

            )

    };

}


/*
|--------------------------------------------------------------------------
| Upload Statistics
|--------------------------------------------------------------------------
*/

async function uploadStatistics() {

    await ensureDirectory(

        UPLOAD_ROOT

    );

    const totalStorage =

        await getDirectorySize(

            UPLOAD_ROOT

        );

    return {

        totalStorage,

        logoDirectory:

            await getDirectorySize(

                LOGO_DIRECTORY

            ).catch(() => 0),

        avatarDirectory:

            await getDirectorySize(

                AVATAR_DIRECTORY

            ).catch(() => 0),

        faviconDirectory:

            await getDirectorySize(

                FAVICON_DIRECTORY

            ).catch(() => 0),

        knowledgeDirectory:

            await getDirectorySize(

                KNOWLEDGE_DIRECTORY

            ).catch(() => 0),

        productDirectory:

            await getDirectorySize(

                PRODUCT_DIRECTORY

            ).catch(() => 0),

        temporaryDirectory:

            await getDirectorySize(

                TEMP_DIRECTORY

            ).catch(() => 0)

    };

}


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

async function healthCheck() {

    try {

        await ensureDirectory(

            UPLOAD_ROOT

        );

        return {

            success: true,

            storage: "available",

            uploadRoot:

                UPLOAD_ROOT,

            timestamp:

                new Date()

        };

    }

    catch (

        error

    ) {

        return {

            success: false,

            storage: "unavailable",

            error:

                error.message

        };

    }

}


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    generateFileName,

    validateImage,

    validateDocument,

    saveLogo,

    saveFavicon,

    saveAvatar,

    saveChatIcon,

    saveKnowledgeDocument,

    saveProductImage,

    saveTemporaryFile,

    removeUploadedFile,

    fileExists,

    moveTemporaryFile,

    copyUploadedFile,

    getFileInformation,

    getDirectorySize,

    cleanTemporaryFiles,

    deleteLogo,

    deleteFavicon,

    deleteAvatar,

    deleteChatIcon,

    deleteKnowledgeDocument,

    deleteProductImage,

    generatePublicUrl,

    generateSignedUrl,

    uploadStatistics,

    healthCheck

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    generateFileName,

    validateImage,

    validateDocument,

    saveLogo,

    saveFavicon,

    saveAvatar,

    saveChatIcon,

    saveKnowledgeDocument,

    saveProductImage,

    saveTemporaryFile,

    removeUploadedFile,

    fileExists,

    moveTemporaryFile,

    copyUploadedFile,

    getFileInformation,

    getDirectorySize,

    cleanTemporaryFiles,

    deleteLogo,

    deleteFavicon,

    deleteAvatar,

    deleteChatIcon,

    deleteKnowledgeDocument,

    deleteProductImage,

    generatePublicUrl,

    generateSignedUrl,

    uploadStatistics,

    healthCheck

};
