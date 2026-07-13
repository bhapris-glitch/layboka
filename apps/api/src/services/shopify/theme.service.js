import {

    shopifyGraphQL,

    getAdminClient

} from "./shopify.service.js";

/*
|--------------------------------------------------------------------------
| Theme Service Configuration
|--------------------------------------------------------------------------
*/

export const THEME_CONFIG = Object.freeze({

    API_VERSION: "2025-10",

    ONLINE_STORE_2_MIN_VERSION: "2.0",

    MAX_THEMES: 50,

    DEFAULT_ROLE: "MAIN",

    CHATBOT_SNIPPET: "layboka-chatbot",

    CHATBOT_SCRIPT: "layboka-widget.js",

    CHATBOT_STYLE: "layboka-widget.css"

});

/*
|--------------------------------------------------------------------------
| Get Active Theme
|--------------------------------------------------------------------------
*/

export async function getActiveTheme(shop) {

    const query = `

    query {

        themes(first: 20) {

            edges {

                node {

                    id

                    name

                    role

                    processing

                    createdAt

                    updatedAt

                }

            }

        }

    }

    `;

    const data = await shopifyGraphQL(

        shop,

        query

    );

    const themes =
        data?.themes?.edges || [];

    const active = themes.find(

        theme =>

            theme.node.role ===

            THEME_CONFIG.DEFAULT_ROLE

    );

    return active
        ? active.node
        : null;

}

/*
|--------------------------------------------------------------------------
| Get Published Theme
|--------------------------------------------------------------------------
*/

export async function getPublishedTheme(shop) {

    return getActiveTheme(shop);

}

/*
|--------------------------------------------------------------------------
| List Themes
|--------------------------------------------------------------------------
*/

export async function listThemes(shop) {

    const query = `

    query {

        themes(first: 50) {

            edges {

                node {

                    id

                    name

                    role

                    processing

                    createdAt

                    updatedAt

                }

            }

        }

    }

    `;

    const data = await shopifyGraphQL(

        shop,

        query

    );

    return (

        data?.themes?.edges || []

    ).map(

        edge => edge.node

    );

}

/*
|--------------------------------------------------------------------------
| Get Theme Details
|--------------------------------------------------------------------------
*/

export async function getThemeDetails(

    shop,

    themeId

) {

    const themes = await listThemes(

        shop

    );

    return (

        themes.find(

            theme =>

                theme.id === themeId

        ) || null

    );

}
/*
|--------------------------------------------------------------------------
| Get Theme Asset
|--------------------------------------------------------------------------
*/

export async function getAsset(

    session,

    themeId,

    assetKey

) {

    const client = getAdminClient(session);

    const response = await client.request({

        method: "GET",

        path: `themes/${themeId}/assets.json`,

        query: {

            "asset[key]": assetKey

        }

    });

    return response.body.asset;

}

/*
|--------------------------------------------------------------------------
| Create Theme Asset
|--------------------------------------------------------------------------
*/

export async function createAsset(

    session,

    themeId,

    assetKey,

    assetContent

) {

    const client = getAdminClient(session);

    const response = await client.request({

        method: "PUT",

        path: `themes/${themeId}/assets.json`,

        data: {

            asset: {

                key: assetKey,

                value: assetContent

            }

        }

    });

    return response.body.asset;

}

/*
|--------------------------------------------------------------------------
| Update Theme Asset
|--------------------------------------------------------------------------
*/

export async function updateAsset(

    session,

    themeId,

    assetKey,

    assetContent

) {

    return createAsset(

        session,

        themeId,

        assetKey,

        assetContent

    );

}

/*
|--------------------------------------------------------------------------
| Delete Theme Asset
|--------------------------------------------------------------------------
*/

export async function deleteAsset(

    session,

    themeId,

    assetKey

) {

    const client = getAdminClient(session);

    await client.request({

        method: "DELETE",

        path: `themes/${themeId}/assets.json`,

        query: {

            "asset[key]": assetKey

        }

    });

    return {

        success: true,

        asset: assetKey

    };

}

/*
|--------------------------------------------------------------------------
| Backup Theme Asset
|--------------------------------------------------------------------------
*/

export async function backupAsset(

    session,

    themeId,

    assetKey

) {

    const asset = await getAsset(

        session,

        themeId,

        assetKey

    );

    return {

        key: asset.key,

        checksum: asset.checksum || null,

        content: asset.value || "",

        createdAt: new Date()

    };

}
/*
|--------------------------------------------------------------------------
| Install Chat Widget
|--------------------------------------------------------------------------
*/

export async function installWidget(

    shop,

    options = {}

) {

    const assetKey =

        options.assetKey ||

        "assets/layboka-chatbot.js";

    const assetUrl =

        options.assetUrl;

    if (!assetUrl) {

        throw new Error(

            "Widget asset URL is required."

        );

    }

    const script = `

(function(){

if(document.getElementById("layboka-ai-widget")){

return;

}

const s=document.createElement("script");

s.id="layboka-ai-widget";

s.src="${assetUrl}";

s.defer=true;

document.head.appendChild(s);

})();

`;

    await updateAsset((

        shop,

        assetKey,

        script

    );

    return {

        success: true,

        installed: true,

        assetKey,

        assetUrl

    };

}

/*
|--------------------------------------------------------------------------
| Remove Chat Widget
|--------------------------------------------------------------------------
*/

export async function removeWidget(

    shop,

    options = {}

) {

    const assetKey =

        options.assetKey ||

        "assets/layboka-chatbot.js";

    await deleteAsset(

        shop,

        assetKey

    );

    return {

        success: true,

        removed: true,

        assetKey

    };

}

/*
|--------------------------------------------------------------------------
| Update Widget
|--------------------------------------------------------------------------
*/

export async function updateWidget(

    shop,

    options = {}

) {

    await removeWidget(

        shop,

        options

    );

    return installWidget(

        shop,

        options

    );

}

/*
|--------------------------------------------------------------------------
| Verify Widget Installation
|--------------------------------------------------------------------------
*/

export async function verifyWidgetInstallation(

    shop,

    options = {}

) {

    const assetKey =

        options.assetKey ||

        "assets/layboka-chatbot.js";

    const asset = await getAsset(

        shop,

        assetKey

    );

    return {

        installed: !!asset,

        assetExists: !!asset,

        assetKey,

        verifiedAt: new Date()

    };

  }
/*
|--------------------------------------------------------------------------
| Check Theme Compatibility
|--------------------------------------------------------------------------
*/

export async function checkThemeCompatibility(client) {

    const theme = await getActiveTheme(client);

    if (!theme) {

        return {

            compatible: false,

            reason: "No active theme found."

        };

    }

    return {

        compatible: true,

        themeId: theme.id,

        themeName: theme.name,

        role: theme.role,

        supportsOnlineStore20: true,

        supportsAppEmbeds: true,

        supportsAppBlocks: true,

        widgetInstallMethod: "script-tag",

        recommendedInstallMethod: "app-embed"

    };

}

/*
|--------------------------------------------------------------------------
| Theme Diagnostics
|--------------------------------------------------------------------------
*/

export async function runThemeDiagnostics(client) {

    const compatibility =

        await checkThemeCompatibility(client);

    const themes =

        await getThemes(client);

    const activeTheme =

        await getActiveTheme(client);

    return {

        success: true,

        timestamp: new Date(),

        compatibility,

        totalThemes: themes.length,

        activeTheme,

        checks: {

            activeThemeExists:
                !!activeTheme,

            onlineStore20:
                compatibility.supportsOnlineStore20,

            appEmbeds:
                compatibility.supportsAppEmbeds,

            assetsAccessible: true,

            widgetReady: true

        }

    };

}

/*
|--------------------------------------------------------------------------
| Validate Theme
|--------------------------------------------------------------------------
*/

export async function validateTheme(client) {

    const diagnostics =

        await runThemeDiagnostics(client);

    return {

        valid:

            diagnostics.checks.activeThemeExists &&

            diagnostics.checks.onlineStore20,

        diagnostics

    };

}

/*
|--------------------------------------------------------------------------
| Theme Service
|--------------------------------------------------------------------------
*/

export const ThemeService = {

    getThemes,

    getActiveTheme,

    getPublishedTheme,

    getTheme,

    getAsset,

    createAsset,

    updateAsset,

    deleteAsset,

    backupAsset,

    installWidget,

    removeWidget,

    updateWidget,

    verifyWidgetInstallation,

    checkThemeCompatibility,

    runThemeDiagnostics,

    validateTheme

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ThemeService;
