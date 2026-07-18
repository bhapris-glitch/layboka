/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import MerchantSettings from "../models/merchantSettings.model.js";
import Shop from "../models/shop.model.js";


/*
|--------------------------------------------------------------------------
| Create Default Merchant Settings
|--------------------------------------------------------------------------
*/

async function createDefaultSettings(

    shopId

) {

    let settings = await MerchantSettings.findOne({

        shop: shopId

    });

    if (

        settings

    ) {

        return settings;

    }

    settings = await MerchantSettings.create({

        shop: shopId

    });

    return settings;

}


/*
|--------------------------------------------------------------------------
| Get Merchant Settings
|--------------------------------------------------------------------------
*/

async function getMerchantSettings(

    shopId

) {

    let settings = await MerchantSettings.findOne({

        shop: shopId

    });

    if (

        !settings

    ) {

        settings = await createDefaultSettings(

            shopId

        );

    }

    return settings;

}


/*
|--------------------------------------------------------------------------
| Public Chatbot Settings
|--------------------------------------------------------------------------
*/

async function getPublicChatbotSettings(

    shopId

) {

    const settings = await getMerchantSettings(

        shopId

    );

    return {

        salesExecutiveName:

            settings.salesExecutiveName,

        avatar:

            settings.avatar,

        avatarType:

            settings.avatarType,

        onlineStatus:

            settings.onlineStatus,

        storeName:

            settings.storeName,

        chatbotHeader:

            settings.chatbotHeader,

        logo:

            settings.logo,

        themeColor:

            settings.themeColor,

        headerColor:

            settings.headerColor,

        backgroundColor:

            settings.backgroundColor,

        textColor:

            settings.textColor,

        secondaryTextColor:

            settings.secondaryTextColor,

        accentColor:

            settings.accentColor,

        fontFamily:

            settings.fontFamily,

        fontSize:

            settings.fontSize,

        borderRadius:

            settings.borderRadius,

        chatPosition:

            settings.chatPosition,

        widgetWidth:

            settings.widgetWidth,

        widgetHeight:

            settings.widgetHeight,

        chatIcon:

            settings.chatIcon,

        welcomeEnabled:

            settings.welcomeEnabled,

        welcomeTitle:

            settings.welcomeTitle,

        welcomeMessage:

            settings.welcomeMessage,

        welcomeButton:

            settings.welcomeButton

    };

}
/*
|--------------------------------------------------------------------------
| Update Store Branding
|--------------------------------------------------------------------------
*/

async function updateStoreBranding(

    shopId,

    brandingData

) {

    const settings = await getMerchantSettings(

        shopId

    );

    Object.assign(

        settings,

        brandingData

    );

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Store Name
|--------------------------------------------------------------------------
*/

async function updateStoreName(

    shopId,

    storeName

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.storeName =

        storeName?.trim() || "";

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Chatbot Header
|--------------------------------------------------------------------------
*/

async function updateChatbotHeader(

    shopId,

    chatbotHeader

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.chatbotHeader =

        chatbotHeader?.trim() || "";

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Logo
|--------------------------------------------------------------------------
*/

async function updateLogo(

    shopId,

    logo

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.logo =

        logo;

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Favicon
|--------------------------------------------------------------------------
*/

async function updateFavicon(

    shopId,

    favicon

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.favicon =

        favicon;

    await settings.save();

    return settings;

}
/*
|--------------------------------------------------------------------------
| Update AI Sales Executive
|--------------------------------------------------------------------------
*/

async function updateSalesExecutive(

    shopId,

    executiveData

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        executiveData.salesExecutiveName !== undefined

    ) {

        settings.salesExecutiveName =

            executiveData.salesExecutiveName.trim();

    }

    if (

        executiveData.avatar !== undefined

    ) {

        settings.avatar =

            executiveData.avatar;

    }

    if (

        executiveData.avatarType !== undefined

    ) {

        settings.avatarType =

            executiveData.avatarType;

    }

    if (

        executiveData.onlineStatus !== undefined

    ) {

        settings.onlineStatus =

            executiveData.onlineStatus;

    }

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Avatar
|--------------------------------------------------------------------------
*/

async function updateAvatar(

    shopId,

    avatar

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.avatar =

        avatar;

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Avatar Type
|--------------------------------------------------------------------------
*/

async function updateAvatarType(

    shopId,

    avatarType

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.avatarType =

        avatarType;

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Online Status
|--------------------------------------------------------------------------
*/

async function updateOnlineStatus(

    shopId,

    onlineStatus

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.onlineStatus =

        Boolean(

            onlineStatus

        );

    await settings.save();

    return settings;

}
/*
|--------------------------------------------------------------------------
| Update Chatbot Theme
|--------------------------------------------------------------------------
*/

async function updateTheme(

    shopId,

    theme

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        theme.themeColor !== undefined

    ) {

        settings.themeColor =

            theme.themeColor;

    }

    if (

        theme.headerColor !== undefined

    ) {

        settings.headerColor =

            theme.headerColor;

    }

    if (

        theme.backgroundColor !== undefined

    ) {

        settings.backgroundColor =

            theme.backgroundColor;

    }

    if (

        theme.textColor !== undefined

    ) {

        settings.textColor =

            theme.textColor;

    }

    if (

        theme.secondaryTextColor !== undefined

    ) {

        settings.secondaryTextColor =

            theme.secondaryTextColor;

    }

    if (

        theme.accentColor !== undefined

    ) {

        settings.accentColor =

            theme.accentColor;

    }

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Typography
|--------------------------------------------------------------------------
*/

async function updateTypography(

    shopId,

    typography

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        typography.fontFamily !== undefined

    ) {

        settings.fontFamily =

            typography.fontFamily;

    }

    if (

        typography.fontSize !== undefined

    ) {

        settings.fontSize =

            typography.fontSize;

    }

    if (

        typography.borderRadius !== undefined

    ) {

        settings.borderRadius =

            typography.borderRadius;

    }

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Widget Layout
|--------------------------------------------------------------------------
*/

async function updateWidgetLayout(

    shopId,

    layout

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        layout.chatPosition !== undefined

    ) {

        settings.chatPosition =

            layout.chatPosition;

    }

    if (

        layout.widgetWidth !== undefined

    ) {

        settings.widgetWidth =

            layout.widgetWidth;

    }

    if (

        layout.widgetHeight !== undefined

    ) {

        settings.widgetHeight =

            layout.widgetHeight;

    }

    if (

        layout.chatIcon !== undefined

    ) {

        settings.chatIcon =

            layout.chatIcon;

    }

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Animation Settings
|--------------------------------------------------------------------------
*/

async function updateAnimationSettings(

    shopId,

    animation

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        animation.shadowEnabled !== undefined

    ) {

        settings.shadowEnabled =

            animation.shadowEnabled;

    }

    if (

        animation.animationEnabled !== undefined

    ) {

        settings.animationEnabled =

            animation.animationEnabled;

    }

    if (

        animation.minimizeOnMobile !== undefined

    ) {

        settings.minimizeOnMobile =

            animation.minimizeOnMobile;

    }

    if (

        animation.darkMode !== undefined

    ) {

        settings.darkMode =

            animation.darkMode;

    }

    if (

        animation.showBranding !== undefined

    ) {

        settings.showBranding =

            animation.showBranding;

    }

    await settings.save();

    return settings;

}
/*
|--------------------------------------------------------------------------
| Update Welcome Settings
|--------------------------------------------------------------------------
*/

async function updateWelcomeSettings(

    shopId,

    welcomeData

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        welcomeData.welcomeEnabled !== undefined

    ) {

        settings.welcomeEnabled =

            welcomeData.welcomeEnabled;

    }

    if (

        welcomeData.welcomeTitle !== undefined

    ) {

        settings.welcomeTitle =

            welcomeData.welcomeTitle.trim();

    }

    if (

        welcomeData.welcomeMessage !== undefined

    ) {

        settings.welcomeMessage =

            welcomeData.welcomeMessage.trim();

    }

    if (

        welcomeData.welcomeButton !== undefined

    ) {

        settings.welcomeButton =

            welcomeData.welcomeButton.trim();

    }

    if (

        welcomeData.showWelcomeOnlyOnce !== undefined

    ) {

        settings.showWelcomeOnlyOnce =

            welcomeData.showWelcomeOnlyOnce;

    }

    if (

        welcomeData.autoOpenChat !== undefined

    ) {

        settings.autoOpenChat =

            welcomeData.autoOpenChat;

    }

    if (

        welcomeData.autoOpenDelay !== undefined

    ) {

        settings.autoOpenDelay =

            welcomeData.autoOpenDelay;

    }

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Coupon Banner
|--------------------------------------------------------------------------
*/

async function updateCouponBanner(

    shopId,

    couponData

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        couponData.couponCode !== undefined

    ) {

        settings.couponCode =

            couponData.couponCode.trim().toUpperCase();

    }

    if (

        couponData.discountLabel !== undefined

    ) {

        settings.discountLabel =

            couponData.discountLabel.trim();

    }

    if (

        couponData.discountMessage !== undefined

    ) {

        settings.discountMessage =

            couponData.discountMessage.trim();

    }

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Customer Experience
|--------------------------------------------------------------------------
*/

async function updateCustomerExperience(

    shopId,

    experience

) {

    const settings = await getMerchantSettings(

        shopId

    );

    if (

        experience.collectCustomerName !== undefined

    ) {

        settings.collectCustomerName =

            experience.collectCustomerName;

    }

    if (

        experience.collectCustomerEmail !== undefined

    ) {

        settings.collectCustomerEmail =

            experience.collectCustomerEmail;

    }

    if (

        experience.collectCustomerPhone !== undefined

    ) {

        settings.collectCustomerPhone =

            experience.collectCustomerPhone;

    }

    if (

        experience.requireConsent !== undefined

    ) {

        settings.requireConsent =

            experience.requireConsent;

    }

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Reset Welcome Settings
|--------------------------------------------------------------------------
*/

async function resetWelcomeSettings(

    shopId

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.welcomeEnabled = true;

    settings.welcomeTitle =

        "👋 Welcome!";

    settings.welcomeMessage =

        "Hi! I'm your AI Sales Executive. How can I help you today?";

    settings.welcomeButton =

        "Start Shopping";

    settings.showWelcomeOnlyOnce = true;

    settings.autoOpenChat = false;

    settings.autoOpenDelay = 5;

    settings.couponCode = "";

    settings.discountLabel = "";

    settings.discountMessage = "";

    await settings.save();

    return settings;

}
/*
|--------------------------------------------------------------------------
| Update Business Information
|--------------------------------------------------------------------------
*/

async function updateBusinessInformation(

    shopId,

    businessData

) {

    const settings = await getMerchantSettings(

        shopId

    );

    const fields = [

        "supportEmail",

        "supportPhone",

        "businessAddress",

        "website",

        "businessDescription",

        "currency",

        "timezone",

        "country",

        "state",

        "city"

    ];

    fields.forEach(

        (field) => {

            if (

                businessData[field] !== undefined

            ) {

                settings[field] =

                    businessData[field];

            }

        }

    );

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Support Information
|--------------------------------------------------------------------------
*/

async function updateSupportInformation(

    shopId,

    supportData

) {

    const settings = await getMerchantSettings(

        shopId

    );

    const fields = [

        "enableLiveChat",

        "enableEmailSupport",

        "enablePhoneSupport",

        "enableWhatsappSupport",

        "whatsappNumber",

        "contactUsUrl"

    ];

    fields.forEach(

        (field) => {

            if (

                supportData[field] !== undefined

            ) {

                settings[field] =

                    supportData[field];

            }

        }

    );

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Social Links
|--------------------------------------------------------------------------
*/

async function updateSocialLinks(

    shopId,

    socialData

) {

    const settings = await getMerchantSettings(

        shopId

    );

    const fields = [

        "facebook",

        "instagram",

        "x",

        "youtube",

        "linkedin",

        "tiktok",

        "pinterest"

    ];

    fields.forEach(

        (field) => {

            if (

                socialData[field] !== undefined

            ) {

                settings[field] =

                    socialData[field];

            }

        }

    );

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Working Hours
|--------------------------------------------------------------------------
*/

async function updateWorkingHours(

    shopId,

    workingHours

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.workingHours =

        workingHours;

    await settings.save();

    return settings;

}


/*
|--------------------------------------------------------------------------
| Update Holiday Mode
|--------------------------------------------------------------------------
*/

async function updateHolidayMode(

    shopId,

    holidayMode

) {

    const settings = await getMerchantSettings(

        shopId

    );

    settings.holidayMode =

        Boolean(

            holidayMode

        );

    await settings.save();

    return settings;

}
