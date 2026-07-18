/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import express from "express";

import merchantSettingsController from "../controllers/merchantSettings.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = express.Router();


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
| Merchant Settings
|--------------------------------------------------------------------------
*/

router.get(

    "/",

    merchantSettingsController.getMerchantSettings

);


router.get(

    "/public",

    merchantSettingsController.getPublicChatbotSettings

);
/*
|--------------------------------------------------------------------------
| Store Branding
|--------------------------------------------------------------------------
*/

router.put(

    "/branding",

    merchantSettingsController.updateStoreBranding

);


router.put(

    "/store-name",

    merchantSettingsController.updateStoreName

);


router.put(

    "/chatbot-header",

    merchantSettingsController.updateChatbotHeader

);


router.put(

    "/logo",

    merchantSettingsController.updateLogo

);


router.put(

    "/favicon",

    merchantSettingsController.updateFavicon

);


/*
|--------------------------------------------------------------------------
| AI Sales Executive
|--------------------------------------------------------------------------
*/

router.put(

    "/sales-executive",

    merchantSettingsController.updateSalesExecutive

);


router.put(

    "/avatar",

    merchantSettingsController.updateAvatar

);


router.put(

    "/avatar-type",

    merchantSettingsController.updateAvatarType

);


router.put(

    "/online-status",

    merchantSettingsController.updateOnlineStatus

);
/*
|--------------------------------------------------------------------------
| Chatbot Appearance
|--------------------------------------------------------------------------
*/

router.put(

    "/theme",

    merchantSettingsController.updateTheme

);


router.put(

    "/typography",

    merchantSettingsController.updateTypography

);


router.put(

    "/widget-layout",

    merchantSettingsController.updateWidgetLayout

);


router.put(

    "/animation",

    merchantSettingsController.updateAnimationSettings

);
/*
|--------------------------------------------------------------------------
| Welcome Settings
|--------------------------------------------------------------------------
*/

router.put(

    "/welcome",

    merchantSettingsController.updateWelcomeSettings

);


router.post(

    "/welcome/reset",

    merchantSettingsController.resetWelcomeSettings

);


/*
|--------------------------------------------------------------------------
| Coupon Banner
|--------------------------------------------------------------------------
*/

router.put(

    "/coupon-banner",

    merchantSettingsController.updateCouponBanner

);


/*
|--------------------------------------------------------------------------
| Customer Experience
|--------------------------------------------------------------------------
*/

router.put(

    "/customer-experience",

    merchantSettingsController.updateCustomerExperience

);
/*
|--------------------------------------------------------------------------
| Business Information
|--------------------------------------------------------------------------
*/

router.put(

    "/business",

    merchantSettingsController.updateBusinessInformation

);


/*
|--------------------------------------------------------------------------
| Support Information
|--------------------------------------------------------------------------
*/

router.put(

    "/support",

    merchantSettingsController.updateSupportInformation

);


/*
|--------------------------------------------------------------------------
| Social Links
|--------------------------------------------------------------------------
*/

router.put(

    "/social-links",

    merchantSettingsController.updateSocialLinks

);


/*
|--------------------------------------------------------------------------
| Working Hours
|--------------------------------------------------------------------------
*/

router.put(

    "/working-hours",

    merchantSettingsController.updateWorkingHours

);


/*
|--------------------------------------------------------------------------
| Holiday Mode
|--------------------------------------------------------------------------
*/

router.put(

    "/holiday-mode",

    merchantSettingsController.updateHolidayMode

);
/*
|--------------------------------------------------------------------------
| Settings Management
|--------------------------------------------------------------------------
*/

router.post(

    "/reset",

    merchantSettingsController.resetMerchantSettings

);


router.get(

    "/export",

    merchantSettingsController.exportMerchantSettings

);


router.post(

    "/import",

    merchantSettingsController.importMerchantSettings

);


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(

    "/dashboard",

    merchantSettingsController.getDashboardConfiguration

);


router.get(

    "/widget",

    merchantSettingsController.getWidgetConfiguration

);


router.get(

    "/summary",

    merchantSettingsController.getMerchantSettingsSummary

);


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
