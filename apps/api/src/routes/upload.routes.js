/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import express from "express";

import multer from "multer";

import uploadController from "../controllers/upload.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Multer Configuration
|--------------------------------------------------------------------------
*/

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {

        fileSize:

            20 * 1024 * 1024

    }

});


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/health",

    uploadController.uploadHealthCheck

);


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(

    authMiddleware

);
/*
|--------------------------------------------------------------------------
| Branding Uploads
|--------------------------------------------------------------------------
*/

router.post(

    "/logo",

    upload.single(

        "logo"

    ),

    uploadController.uploadLogo

);


router.post(

    "/favicon",

    upload.single(

        "favicon"

    ),

    uploadController.uploadFavicon

);


/*
|--------------------------------------------------------------------------
| Avatar Uploads
|--------------------------------------------------------------------------
*/

router.post(

    "/avatar",

    upload.single(

        "avatar"

    ),

    uploadController.uploadAvatar

);


router.post(

    "/chat-icon",

    upload.single(

        "chatIcon"

    ),

    uploadController.uploadChatIcon

);
/*
|--------------------------------------------------------------------------
| Knowledge Base
|--------------------------------------------------------------------------
*/

router.post(

    "/knowledge",

    upload.single(

        "document"

    ),

    uploadController.uploadKnowledgeDocument

);


/*
|--------------------------------------------------------------------------
| Temporary Upload
|--------------------------------------------------------------------------
*/

router.post(

    "/temp",

    upload.single(

        "file"

    ),

    uploadController.uploadTemporaryFile

);


/*
|--------------------------------------------------------------------------
| Upload Statistics
|--------------------------------------------------------------------------
*/

router.get(

    "/statistics",

    uploadController.getUploadStatistics

);


/*
|--------------------------------------------------------------------------
| File Information
|--------------------------------------------------------------------------
*/

router.get(

    "/file",

    uploadController.getUploadedFile

);


/*
|--------------------------------------------------------------------------
| Download Knowledge Document
|--------------------------------------------------------------------------
*/

router.get(

    "/download",

    uploadController.downloadKnowledgeDocument

);
/*
|--------------------------------------------------------------------------
| Delete Uploads
|--------------------------------------------------------------------------
*/

router.delete(

    "/file",

    uploadController.deleteUploadedFile

);


router.delete(

    "/temp",

    uploadController.deleteTemporaryFile

);


/*
|--------------------------------------------------------------------------
| Signed Upload URL
|--------------------------------------------------------------------------
*/

router.post(

    "/signed-url",

    uploadController.generateSignedUploadUrl

);


/*
|--------------------------------------------------------------------------
| Widget Assets
|--------------------------------------------------------------------------
*/

router.get(

    "/widget-assets",

    uploadController.getUploadStatistics

);
/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
