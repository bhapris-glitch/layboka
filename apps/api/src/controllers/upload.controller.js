/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import uploadService from "../services/upload.service.js";

import merchantSettingsService from "../services/merchantSettings.service.js";


/*
|--------------------------------------------------------------------------
| Upload Store Logo
|--------------------------------------------------------------------------
*/

async function uploadLogo(

    req,

    res,

    next

) {

    try {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                message: "Logo file is required."

            });

        }

        const uploadedFile =

            await uploadService.saveLogo(

                req.file

            );

        await merchantSettingsService.updateLogo(

            req.shop._id,

            uploadedFile.url

        );

        return res.status(200).json({

            success: true,

            message: "Logo uploaded successfully.",

            data: uploadedFile

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Upload Favicon
|--------------------------------------------------------------------------
*/

async function uploadFavicon(

    req,

    res,

    next

) {

    try {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                message: "Favicon file is required."

            });

        }

        const uploadedFile =

            await uploadService.saveFavicon(

                req.file

            );

        await merchantSettingsService.updateFavicon(

            req.shop._id,

            uploadedFile.url

        );

        return res.status(200).json({

            success: true,

            message: "Favicon uploaded successfully.",

            data: uploadedFile

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Upload AI Sales Executive Avatar
|--------------------------------------------------------------------------
*/

async function uploadAvatar(

    req,

    res,

    next

) {

    try {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                message: "Avatar file is required."

            });

        }

        const uploadedFile =

            await uploadService.saveAvatar(

                req.file

            );

        await merchantSettingsService.updateAvatar(

            req.shop._id,

            uploadedFile.url

        );

        return res.status(200).json({

            success: true,

            message: "Avatar uploaded successfully.",

            data: uploadedFile

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Upload Chat Widget Icon
|--------------------------------------------------------------------------
*/

async function uploadChatIcon(

    req,

    res,

    next

) {

    try {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                message: "Chat widget icon is required."

            });

        }

        const uploadedFile =

            await uploadService.saveChatIcon(

                req.file

            );

        await merchantSettingsService.updateWidgetLayout(

            req.shop._id,

            {

                chatIcon: uploadedFile.url

            }

        );

        return res.status(200).json({

            success: true,

            message: "Chat widget icon uploaded successfully.",

            data: uploadedFile

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Upload Product Image
|--------------------------------------------------------------------------
*/

async function uploadProductImage(

    req,

    res,

    next

) {

    try {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                message: "Product image is required."

            });

        }

        const uploadedFile =

            await uploadService.saveProductImage(

                req.file

            );

        return res.status(200).json({

            success: true,

            message: "Product image uploaded successfully.",

            data: uploadedFile

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

  }
/*
|--------------------------------------------------------------------------
| Upload Knowledge Document
|--------------------------------------------------------------------------
*/

async function uploadKnowledgeDocument(

    req,

    res,

    next

) {

    try {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                message: "Knowledge document is required."

            });

        }

        const uploadedFile =

            await uploadService.saveKnowledgeDocument(

                req.file

            );

        return res.status(200).json({

            success: true,

            message: "Knowledge document uploaded successfully.",

            data: uploadedFile

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Upload Temporary File
|--------------------------------------------------------------------------
*/

async function uploadTemporaryFile(

    req,

    res,

    next

) {

    try {

        if (

            !req.file

        ) {

            return res.status(400).json({

                success: false,

                message: "Temporary file is required."

            });

        }

        const uploadedFile =

            await uploadService.saveTemporaryFile(

                req.file

            );

        return res.status(200).json({

            success: true,

            message: "Temporary file uploaded successfully.",

            data: uploadedFile

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Upload Statistics
|--------------------------------------------------------------------------
*/

async function getUploadStatistics(

    req,

    res,

    next

) {

    try {

        const statistics =

            await uploadService.uploadStatistics();

        return res.status(200).json({

            success: true,

            data: statistics

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Upload Health Check
|--------------------------------------------------------------------------
*/

async function uploadHealthCheck(

    req,

    res,

    next

) {

    try {

        const health =

            await uploadService.healthCheck();

        return res.status(200).json({

            success: true,

            data: health

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

                                    }
/*
|--------------------------------------------------------------------------
| Delete Uploaded File
|--------------------------------------------------------------------------
*/

async function deleteUploadedFile(

    req,

    res,

    next

) {

    try {

        const {

            filePath

        } = req.body;

        const deleted =

            await uploadService.removeUploadedFile(

                filePath

            );

        return res.status(200).json({

            success: deleted,

            message: deleted

                ? "File deleted successfully."

                : "File not found."

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Delete Temporary File
|--------------------------------------------------------------------------
*/

async function deleteTemporaryFile(

    req,

    res,

    next

) {

    try {

        const {

            filePath

        } = req.body;

        const deleted =

            await uploadService.removeUploadedFile(

                filePath

            );

        return res.status(200).json({

            success: deleted,

            message: deleted

                ? "Temporary file deleted successfully."

                : "Temporary file not found."

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Uploaded File Information
|--------------------------------------------------------------------------
*/

async function getUploadedFile(

    req,

    res,

    next

) {

    try {

        const {

            filePath

        } = req.query;

        const file =

            await uploadService.getFileInformation(

                filePath

            );

        return res.status(200).json({

            success: true,

            data: file

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Download Knowledge Document
|--------------------------------------------------------------------------
*/

async function downloadKnowledgeDocument(

    req,

    res,

    next

) {

    try {

        const {

            filePath

        } = req.query;

        return res.download(

            filePath

        );

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Generate Signed Upload URL
|--------------------------------------------------------------------------
*/

async function generateSignedUploadUrl(

    req,

    res,

    next

) {

    try {

        const {

            file,

            expiresIn

        } = req.body;

        const signedUrl =

            await uploadService.generateSignedUrl(

                file,

                expiresIn

            );

        return res.status(200).json({

            success: true,

            data: signedUrl

        });

    }

    catch (

        error

    ) {

        next(

            error

        );

    }

          }
/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    uploadLogo,

    uploadFavicon,

    uploadAvatar,

    uploadChatIcon,

    uploadProductImage,

    uploadKnowledgeDocument,

    uploadTemporaryFile,

    getUploadStatistics,

    uploadHealthCheck,

    deleteUploadedFile,

    deleteTemporaryFile,

    getUploadedFile,

    downloadKnowledgeDocument,

    generateSignedUploadUrl

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    uploadLogo,

    uploadFavicon,

    uploadAvatar,

    uploadChatIcon,

    uploadProductImage,

    uploadKnowledgeDocument,

    uploadTemporaryFile,

    getUploadStatistics,

    uploadHealthCheck,

    deleteUploadedFile,

    deleteTemporaryFile,

    getUploadedFile,

    downloadKnowledgeDocument,

    generateSignedUploadUrl

};
