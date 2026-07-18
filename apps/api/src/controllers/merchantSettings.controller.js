/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import merchantSettingsService from "../services/merchantSettings.service.js";


/*
|--------------------------------------------------------------------------
| Get Merchant Settings
|--------------------------------------------------------------------------
*/

async function getMerchantSettings(

    req,

    res,

    next

) {

    try {

        const settings =

            await merchantSettingsService.getMerchantSettings(

                req.shop._id

            );

        return res.status(200).json({

            success: true,

            message: "Merchant settings fetched successfully.",

            data: settings

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
| Get Public Chatbot Settings
|--------------------------------------------------------------------------
*/

async function getPublicChatbotSettings(

    req,

    res,

    next

) {

    try {

        const settings =

            await merchantSettingsService.getPublicChatbotSettings(

                req.shop._id

            );

        return res.status(200).json({

            success: true,

            data: settings

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
| Update Store Branding
|--------------------------------------------------------------------------
*/

async function updateStoreBranding(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateStoreBranding(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Store branding updated successfully.",

            data: settings

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
| Update Store Name
|--------------------------------------------------------------------------
*/

async function updateStoreName(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateStoreName(

                shopId,

                req.body.storeName

            );

        return res.status(200).json({

            success: true,

            message: "Store name updated successfully.",

            data: settings

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
| Update Chatbot Header
|--------------------------------------------------------------------------
*/

async function updateChatbotHeader(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateChatbotHeader(

                shopId,

                req.body.chatbotHeader

            );

        return res.status(200).json({

            success: true,

            message: "Chatbot header updated successfully.",

            data: settings

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
| Update Logo
|--------------------------------------------------------------------------
*/

async function updateLogo(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateLogo(

                shopId,

                req.body.logo

            );

        return res.status(200).json({

            success: true,

            message: "Logo updated successfully.",

            data: settings

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
| Update Favicon
|--------------------------------------------------------------------------
*/

async function updateFavicon(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateFavicon(

                shopId,

                req.body.favicon

            );

        return res.status(200).json({

            success: true,

            message: "Favicon updated successfully.",

            data: settings

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
| Update AI Sales Executive
|--------------------------------------------------------------------------
*/

async function updateSalesExecutive(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateSalesExecutive(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "AI Sales Executive updated successfully.",

            data: settings

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
| Update Avatar
|--------------------------------------------------------------------------
*/

async function updateAvatar(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateAvatar(

                shopId,

                req.body.avatar

            );

        return res.status(200).json({

            success: true,

            message: "Avatar updated successfully.",

            data: settings

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
| Update Avatar Type
|--------------------------------------------------------------------------
*/

async function updateAvatarType(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateAvatarType(

                shopId,

                req.body.avatarType

            );

        return res.status(200).json({

            success: true,

            message: "Avatar type updated successfully.",

            data: settings

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
| Update Online Status
|--------------------------------------------------------------------------
*/

async function updateOnlineStatus(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateOnlineStatus(

                shopId,

                req.body.onlineStatus

            );

        return res.status(200).json({

            success: true,

            message: "Online status updated successfully.",

            data: settings

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
| Update Theme
|--------------------------------------------------------------------------
*/

async function updateTheme(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateTheme(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Chatbot theme updated successfully.",

            data: settings

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
| Update Typography
|--------------------------------------------------------------------------
*/

async function updateTypography(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateTypography(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Typography updated successfully.",

            data: settings

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
| Update Widget Layout
|--------------------------------------------------------------------------
*/

async function updateWidgetLayout(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateWidgetLayout(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Widget layout updated successfully.",

            data: settings

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
| Update Animation Settings
|--------------------------------------------------------------------------
*/

async function updateAnimationSettings(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateAnimationSettings(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Animation settings updated successfully.",

            data: settings

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
| Update Welcome Settings
|--------------------------------------------------------------------------
*/

async function updateWelcomeSettings(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateWelcomeSettings(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Welcome settings updated successfully.",

            data: settings

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
| Update Coupon Banner
|--------------------------------------------------------------------------
*/

async function updateCouponBanner(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateCouponBanner(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Coupon banner updated successfully.",

            data: settings

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
| Update Customer Experience
|--------------------------------------------------------------------------
*/

async function updateCustomerExperience(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateCustomerExperience(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Customer experience updated successfully.",

            data: settings

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
| Reset Welcome Settings
|--------------------------------------------------------------------------
*/

async function resetWelcomeSettings(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.resetWelcomeSettings(

                shopId

            );

        return res.status(200).json({

            success: true,

            message: "Welcome settings reset successfully.",

            data: settings

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
| Update Business Information
|--------------------------------------------------------------------------
*/

async function updateBusinessInformation(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateBusinessInformation(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Business information updated successfully.",

            data: settings

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
| Update Support Information
|--------------------------------------------------------------------------
*/

async function updateSupportInformation(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateSupportInformation(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Support information updated successfully.",

            data: settings

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
| Update Social Links
|--------------------------------------------------------------------------
*/

async function updateSocialLinks(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateSocialLinks(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Social links updated successfully.",

            data: settings

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
| Update Working Hours
|--------------------------------------------------------------------------
*/

async function updateWorkingHours(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateWorkingHours(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Working hours updated successfully.",

            data: settings

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
| Update Holiday Mode
|--------------------------------------------------------------------------
*/

async function updateHolidayMode(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.updateHolidayMode(

                shopId,

                req.body.holidayMode

            );

        return res.status(200).json({

            success: true,

            message: "Holiday mode updated successfully.",

            data: settings

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
| Reset Merchant Settings
|--------------------------------------------------------------------------
*/

async function resetMerchantSettings(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.resetMerchantSettings(

                shopId

            );

        return res.status(200).json({

            success: true,

            message: "Merchant settings reset successfully.",

            data: settings

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
| Export Merchant Settings
|--------------------------------------------------------------------------
*/

async function exportMerchantSettings(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.exportMerchantSettings(

                shopId

            );

        return res.status(200).json({

            success: true,

            message: "Merchant settings exported successfully.",

            data: settings

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
| Import Merchant Settings
|--------------------------------------------------------------------------
*/

async function importMerchantSettings(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const settings =

            await merchantSettingsService.importMerchantSettings(

                shopId,

                req.body

            );

        return res.status(200).json({

            success: true,

            message: "Merchant settings imported successfully.",

            data: settings

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
| Dashboard Configuration
|--------------------------------------------------------------------------
*/

async function getDashboardConfiguration(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const configuration =

            await merchantSettingsService.getDashboardConfiguration(

                shopId

            );

        return res.status(200).json({

            success: true,

            data: configuration

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
| Merchant Settings Summary
|--------------------------------------------------------------------------
*/

async function getMerchantSettingsSummary(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const summary =

            await merchantSettingsService.getMerchantSettingsSummary(

                shopId

            );

        return res.status(200).json({

            success: true,

            data: summary

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
| Get Widget Configuration
|--------------------------------------------------------------------------
*/

async function getWidgetConfiguration(

    req,

    res,

    next

) {

    try {

        const shopId = req.shop._id;

        const configuration =

            await merchantSettingsService.getWidgetConfiguration(

                shopId

            );

        return res.status(200).json({

            success: true,

            data: configuration

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

    getMerchantSettings,

    getPublicChatbotSettings,

    updateStoreBranding,

    updateStoreName,

    updateChatbotHeader,

    updateLogo,

    updateFavicon,

    updateSalesExecutive,

    updateAvatar,

    updateAvatarType,

    updateOnlineStatus,

    updateTheme,

    updateTypography,

    updateWidgetLayout,

    updateAnimationSettings,

    updateWelcomeSettings,

    updateCouponBanner,

    updateCustomerExperience,

    resetWelcomeSettings,

    updateBusinessInformation,

    updateSupportInformation,

    updateSocialLinks,

    updateWorkingHours,

    updateHolidayMode,

    resetMerchantSettings,

    exportMerchantSettings,

    importMerchantSettings,

    getDashboardConfiguration,

    getWidgetConfiguration,

    getMerchantSettingsSummary

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    getMerchantSettings,

    getPublicChatbotSettings,

    updateStoreBranding,

    updateStoreName,

    updateChatbotHeader,

    updateLogo,

    updateFavicon,

    updateSalesExecutive,

    updateAvatar,

    updateAvatarType,

    updateOnlineStatus,

    updateTheme,

    updateTypography,

    updateWidgetLayout,

    updateAnimationSettings,

    updateWelcomeSettings,

    updateCouponBanner,

    updateCustomerExperience,

    resetWelcomeSettings,

    updateBusinessInformation,

    updateSupportInformation,

    updateSocialLinks,

    updateWorkingHours,

    updateHolidayMode,

    resetMerchantSettings,

    exportMerchantSettings,

    importMerchantSettings,

    getDashboardConfiguration,

    getWidgetConfiguration,

    getMerchantSettingsSummary

};
