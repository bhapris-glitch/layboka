// layboka/apps/api/src/services/shopify/scriptTag.service.js
import axios from "axios";

/*
|--------------------------------------------------------------------------
| ScriptTag Configuration
|--------------------------------------------------------------------------
*/

export const SCRIPT_TAG_CONFIG = Object.freeze({

    API_VERSION: process.env.SHOPIFY_API_VERSION || "2025-10",

    EVENT: "onload",

    DISPLAY_SCOPE: "online_store",

    CACHE_TTL: 300

});

/*
|--------------------------------------------------------------------------
| Build Widget URL
|--------------------------------------------------------------------------
*/

export function buildWidgetUrl(shop) {

    const baseUrl =
        process.env.WIDGET_URL ||
        process.env.APP_URL;

    return `${baseUrl}/widget/chatbot.js?shop=${shop.shop}`;
}

/*
|--------------------------------------------------------------------------
| Shopify Request
|--------------------------------------------------------------------------
*/

async function shopifyRequest(

    shop,

    method,

    endpoint,

    data = {}

) {

    const url =

`https://${shop.shop}/admin/api/${SCRIPT_TAG_CONFIG.API_VERSION}/${endpoint}`;

    const response = await axios({

        method,

        url,

        headers: {

            "X-Shopify-Access-Token":

                shop.accessToken,

            "Content-Type":

                "application/json"

        },

        data

    });

    return response.data;

}

/*
|--------------------------------------------------------------------------
| Get Script Tags
|--------------------------------------------------------------------------
*/

export async function findLaybokaScript(shop) {

    const result = await shopifyRequest(

        shop,

        "GET",

        "script_tags.json"

    );

    return result.script_tags || [];

}

/*
|--------------------------------------------------------------------------
| Find Layboka Script
|--------------------------------------------------------------------------
*/

export async function findLaybokaScript(

    shop

) {

    const scripts =

        await getScriptTags(shop);

    return scripts.find(script =>

        script.src.includes("chatbot.js")

    ) || null;

}
/*
|--------------------------------------------------------------------------
| Install ScriptTag
|--------------------------------------------------------------------------
*/

export async function installScriptTag(shop) {

    const existing = await findLaybokaScript(shop);

    if (existing) {

        return existing;
    }

    const client = await getAdminClient(shop);

    const response = await client.post(

        "/script_tags.json",

        {
            script_tag: {

                event: "onload",

                src: buildWidgetUrl(shop),

                display_scope: "online_store"

            }

        }

    );

    return response.data.script_tag;

}

/*
|--------------------------------------------------------------------------
| Update ScriptTag
|--------------------------------------------------------------------------
*/

export async function updateScriptTag(shop) {

    const scriptTag = await findLaybokaScript(shop);

    if (!scriptTag) {

        return installScriptTag(shop);

    }

    const client = await getAdminClient(shop);

    const response = await client.put(

        `/script_tags/${scriptTag.id}.json`,

        {

            script_tag: {

                id: scriptTag.id,

                src: buildWidgetUrl(shop),

                event: "onload",

                display_scope: "online_store"

            }

        }

    );

    return response.data.script_tag;

}

/*
|--------------------------------------------------------------------------
| Remove ScriptTag
|--------------------------------------------------------------------------
*/

export async function removeScriptTag(shop) {

    const scriptTag = await findLaybokaScript(shop);

    if (!scriptTag) {

        return true;

    }

    const client = await getAdminClient(shop);

    await client.delete(

        `/script_tags/${scriptTag.id}.json`

    );

    return true;

}

/*
|--------------------------------------------------------------------------
| Prevent Duplicate Installation
|--------------------------------------------------------------------------
*/

export async function ensureSingleInstallation(shop) {

    const client = await getAdminClient(shop);

    const response = await client.get(

        "/script_tags.json"

    );

    const scriptTags =

        response.data.script_tags || [];

    const widgetUrl = buildWidgetUrl(shop);

    const matches = scriptTags.filter(

        tag => tag.src === widgetUrl

    );

    if (matches.length <= 1) {

        return matches[0] || null;

    }

    for (let i = 1; i < matches.length; i++) {

        await client.delete(

            `/script_tags/${matches[i].id}.json`

        );

    }

    return matches[0];

}

/*
|--------------------------------------------------------------------------
| Validate Installation
|--------------------------------------------------------------------------
*/

export async function validateInstallation(shop) {

    const scriptTag = await findLaybokaScript(shop);

    if (!scriptTag) {

        return {

            installed: false,

            valid: false,

            reason: "ScriptTag not found."

        };

    }

    const expectedUrl = buildWidgetUrl(shop);

    const valid =

        scriptTag.src === expectedUrl;

    return {

        installed: true,

        valid,

        scriptTagId: scriptTag.id,

        src: scriptTag.src,

        expectedSrc: expectedUrl

    };

      }
/*
|--------------------------------------------------------------------------
| ScriptTag Status Check
|--------------------------------------------------------------------------
*/

export async function getScriptTagStatus(shop) {

    try {

        const scriptTag = await getInstalledScriptTag(shop);

        return {

            installed: !!scriptTag,

            healthy: !!scriptTag,

            scriptTagId: scriptTag?.id || null,

            src: scriptTag?.src || null,

            createdAt: scriptTag?.created_at || null,

            updatedAt: scriptTag?.updated_at || null

        };

    } catch (error) {

        logger.error(
            "Failed to check ScriptTag status.",
            error
        );

        return {

            installed: false,

            healthy: false,

            scriptTagId: null,

            src: null,

            error: error.message

        };

    }

}

/*
|--------------------------------------------------------------------------
| Reinstall ScriptTag
|--------------------------------------------------------------------------
*/

export async function reinstallScriptTag(shop) {

    try {

        await uninstallScriptTag(shop);

    } catch (error) {

        logger.warn(
            "Unable to remove existing ScriptTag.",
            error
        );

    }

    const scriptTag =

        await installScriptTag(shop);

    return scriptTag;

}

/*
|--------------------------------------------------------------------------
| Synchronize ScriptTag With Database
|--------------------------------------------------------------------------
*/

export async function synchronizeScriptTag(shop) {

    const status =

        await findLaybokaScriptStatus(shop);

    shop.scriptTag = {

        installed: status.installed,

        healthy: status.healthy,

        scriptTagId: status.scriptTagId,

        src: status.src,

        synchronizedAt: new Date()

    };

    await shop.save();

    return shop.scriptTag;

}

/*
|--------------------------------------------------------------------------
| ScriptTag Health Check
|--------------------------------------------------------------------------
*/

export async function healthCheck(shop) {

    try {

        const status =

            await findLaybokaScriptStatus(shop);

        return {

            success: true,

            service: "ScriptTag",

            installed: status.installed,

            healthy: status.healthy,

            timestamp: new Date().toISOString()

        };

    } catch (error) {

        return {

            success: false,

            service: "ScriptTag",

            healthy: false,

            error: error.message,

            timestamp: new Date().toISOString()

        };

    }

}

/*
|--------------------------------------------------------------------------
| ScriptTag Service
|--------------------------------------------------------------------------
*/

export const ScriptTagService = {

    installScriptTag,

    uninstallScriptTag,

    getInstalledScriptTag,

    ensureScriptTag,

    findLaybokaScriptStatus,

    reinstallScriptTag,

    synchronizeScriptTag,

    healthCheck

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ScriptTagService;
