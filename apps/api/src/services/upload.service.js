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
