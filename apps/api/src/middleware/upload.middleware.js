/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import multer from "multer";


/*
|--------------------------------------------------------------------------
| Upload Limits
|--------------------------------------------------------------------------
*/

const MAX_IMAGE_SIZE =

    5 * 1024 * 1024; // 5 MB


const MAX_DOCUMENT_SIZE =

    20 * 1024 * 1024; // 20 MB


/*
|--------------------------------------------------------------------------
| Memory Storage
|--------------------------------------------------------------------------
*/

const storage =

    multer.memoryStorage();


/*
|--------------------------------------------------------------------------
| Allowed Image Types
|--------------------------------------------------------------------------
*/

const IMAGE_TYPES = [

    "image/jpeg",

    "image/png",

    "image/webp",

    "image/svg+xml",

    "image/gif",

    "image/x-icon"

];


/*
|--------------------------------------------------------------------------
| Allowed Document Types
|--------------------------------------------------------------------------
*/

const DOCUMENT_TYPES = [

    "application/pdf",

    "text/plain",

    "application/json"

];


/*
|--------------------------------------------------------------------------
| Image File Filter
|--------------------------------------------------------------------------
*/

function imageFileFilter(

    req,

    file,

    cb

) {

    if (

        IMAGE_TYPES.includes(

            file.mimetype

        )

    ) {

        return cb(

            null,

            true

        );

    }

    return cb(

        new Error(

            "Only JPEG, PNG, WEBP, SVG, GIF and ICO images are allowed."

        ),

        false

    );

}


/*
|--------------------------------------------------------------------------
| Document File Filter
|--------------------------------------------------------------------------
*/

function documentFileFilter(

    req,

    file,

    cb

) {

    if (

        DOCUMENT_TYPES.includes(

            file.mimetype

        )

    ) {

        return cb(

            null,

            true

        );

    }

    return cb(

        new Error(

            "Only PDF, TXT and JSON documents are allowed."

        ),

        false

    );

}
/*
|--------------------------------------------------------------------------
| Image Upload
|--------------------------------------------------------------------------
*/

const imageUpload = multer({

    storage,

    limits: {

        fileSize: MAX_IMAGE_SIZE

    },

    fileFilter: imageFileFilter

});


/*
|--------------------------------------------------------------------------
| Document Upload
|--------------------------------------------------------------------------
*/

const documentUpload = multer({

    storage,

    limits: {

        fileSize: MAX_DOCUMENT_SIZE

    },

    fileFilter: documentFileFilter

});


/*
|--------------------------------------------------------------------------
| Merchant Branding
|--------------------------------------------------------------------------
*/

const uploadLogo =

    imageUpload.single(

        "logo"

    );


const uploadAvatar =

    imageUpload.single(

        "avatar"

    );


const uploadFavicon =

    imageUpload.single(

        "favicon"

    );


const uploadChatIcon =

    imageUpload.single(

        "chatIcon"

    );


/*
|--------------------------------------------------------------------------
| AI Knowledge Base
|--------------------------------------------------------------------------
*/

const uploadKnowledge =

    documentUpload.single(

        "document"

    );


/*
|--------------------------------------------------------------------------
| Temporary Upload
|--------------------------------------------------------------------------
*/

const uploadTemporary =

    multer({

        storage,

        limits: {

            fileSize:

                MAX_DOCUMENT_SIZE

        }

    }).single(

        "file"

    );
/*
|--------------------------------------------------------------------------
| Reusable Upload Factory
|--------------------------------------------------------------------------
*/

function createUploader({

    maxSize,

    fileFilter

}) {

    return multer({

        storage,

        limits: {

            fileSize: maxSize

        },

        fileFilter

    });

}


/*
|--------------------------------------------------------------------------
| Upload Instances
|--------------------------------------------------------------------------
*/

const imageUpload =

    createUploader({

        maxSize: MAX_IMAGE_SIZE,

        fileFilter: imageFileFilter

    });


const documentUpload =

    createUploader({

        maxSize: MAX_DOCUMENT_SIZE,

        fileFilter: documentFileFilter

    });


/*
|--------------------------------------------------------------------------
| Upload Error Handler
|--------------------------------------------------------------------------
*/

function handleUploadError(

    error,

    req,

    res,

    next

) {

    if (

        error instanceof multer.MulterError

    ) {

        switch (

            error.code

        ) {

            case "LIMIT_FILE_SIZE":

                return res.status(400).json({

                    success: false,

                    code: "FILE_TOO_LARGE",

                    message: "Uploaded file exceeds the allowed size."

                });

            case "LIMIT_UNEXPECTED_FILE":

                return res.status(400).json({

                    success: false,

                    code: "INVALID_FIELD",

                    message: "Unexpected upload field."

                });

            default:

                return res.status(400).json({

                    success: false,

                    code: "UPLOAD_ERROR",

                    message: error.message

                });

        }

    }

    if (

        error

    ) {

        return res.status(400).json({

            success: false,

            code: "INVALID_FILE",

            message: error.message

        });

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Missing File Validation
|--------------------------------------------------------------------------
*/

function requireUploadedFile(

    req,

    res,

    next

) {

    if (

        !req.file

    ) {

        return res.status(400).json({

            success: false,

            code: "FILE_REQUIRED",

            message: "Please upload a file."

        });

    }

    next();

}


/*
|--------------------------------------------------------------------------
| Validate Uploaded File
|--------------------------------------------------------------------------
*/

function validateUploadedFile(

    req,

    res,

    next

) {

    if (

        !req.file

    ) {

        return res.status(400).json({

            success: false,

            code: "INVALID_UPLOAD",

            message: "No valid file uploaded."

        });

    }

    next();

          }
/*
|--------------------------------------------------------------------------
| Required File Factory
|--------------------------------------------------------------------------
*/

function requireFile(

    fieldName,

    displayName

) {

    return (

        req,

        res,

        next

    ) => {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                code: "FILE_REQUIRED",

                field: fieldName,

                message: `${displayName} is required.`

            });

        }

        next();

    };

}


/*
|--------------------------------------------------------------------------
| Merchant Branding
|--------------------------------------------------------------------------
*/

const requireLogo =

    requireFile(

        "logo",

        "Store logo"

    );


const requireAvatar =

    requireFile(

        "avatar",

        "AI Sales Executive avatar"

    );


const requireFavicon =

    requireFile(

        "favicon",

        "Store favicon"

    );


const requireChatIcon =

    requireFile(

        "chatIcon",

        "Chat widget icon"

    );


/*
|--------------------------------------------------------------------------
| Knowledge Base
|--------------------------------------------------------------------------
*/

const requireKnowledgeDocument =

    requireFile(

        "document",

        "Knowledge document"

    );


/*
|--------------------------------------------------------------------------
| Temporary Upload
|--------------------------------------------------------------------------
*/

const requireTemporaryFile =

    requireFile(

        "file",

        "Temporary file"

    );
/*
|--------------------------------------------------------------------------
| Upload Context Validation
|--------------------------------------------------------------------------
*/

function validateUploadContext({

    allowedPlans = [],

    maxFiles = 1

} = {}) {

    return (

        req,

        res,

        next

    ) => {

        if (

            allowedPlans.length > 0 &&

            !allowedPlans.includes(

                req.plan

            )

        ) {

            return res.status(403).json({

                success: false,

                code: "PLAN_NOT_ALLOWED",

                currentPlan: req.plan,

                allowedPlans,

                message: "Your subscription plan does not allow this upload."

            });

        }

        if (

            Array.isArray(

                req.files

            ) &&

            req.files.length >

            maxFiles

        ) {

            return res.status(400).json({

                success: false,

                code: "TOO_MANY_FILES",

                message: `Maximum ${maxFiles} file(s) allowed.`

            });

        }

        next();

    };

}


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    uploadLogo,

    uploadAvatar,

    uploadFavicon,

    uploadChatIcon,

    uploadKnowledge,

    uploadTemporary,

    imageUpload,

    documentUpload,

    createUploader,

    imageFileFilter,

    documentFileFilter,

    handleUploadError,

    validateUploadedFile,

    requireUploadedFile,

    requireFile,

    requireLogo,

    requireAvatar,

    requireFavicon,

    requireChatIcon,

    requireKnowledgeDocument,

    requireTemporaryFile,

    validateUploadContext

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    uploadLogo,

    uploadAvatar,

    uploadFavicon,

    uploadChatIcon,

    uploadKnowledge,

    uploadTemporary,

    imageUpload,

    documentUpload,

    createUploader,

    imageFileFilter,

    documentFileFilter,

    handleUploadError,

    validateUploadedFile,

    requireUploadedFile,

    requireFile,

    requireLogo,

    requireAvatar,

    requireFavicon,

    requireChatIcon,

    requireKnowledgeDocument,

    requireTemporaryFile,

    validateUploadContext

};
