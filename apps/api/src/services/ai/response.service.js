import { randomUUID } from "crypto";

/*
|--------------------------------------------------------------------------
| Response Configuration
|--------------------------------------------------------------------------
*/

export const RESPONSE_CONFIG = Object.freeze({

    DEFAULT_LANGUAGE: "en",

    DEFAULT_TYPE: "text",

    MAX_QUICK_REPLIES: 6,

    MAX_ACTIONS: 5,

    MAX_PRODUCT_CARDS: 6

});

/*
|--------------------------------------------------------------------------
| Response Types
|--------------------------------------------------------------------------
*/

export const RESPONSE_TYPES = Object.freeze({

    TEXT: "text",

    PRODUCT_CARDS: "product_cards",

    QUICK_REPLIES: "quick_replies",

    ACTIONS: "actions",

    ERROR: "error",

    HANDOFF: "handoff",

    SYSTEM: "system"

});

/*
|--------------------------------------------------------------------------
| Create Base Response
|--------------------------------------------------------------------------
*/

export function createResponse({

    type = RESPONSE_TYPES.TEXT,

    content = "",

    language = RESPONSE_CONFIG.DEFAULT_LANGUAGE

} = {}) {

    return {

        id: randomUUID(),

        type,

        language,

        content,

        createdAt: new Date().toISOString()

    };

}

/*
|--------------------------------------------------------------------------
| Text Response
|--------------------------------------------------------------------------
*/

export function createTextResponse(

    content,

    language = "en"

) {

    return createResponse({

        type: RESPONSE_TYPES.TEXT,

        content,

        language

    });

}

/*
|--------------------------------------------------------------------------
| Error Response
|--------------------------------------------------------------------------
*/

export function createErrorResponse(

    message =

        "Something went wrong. Please try again."

) {

    return createResponse({

        type: RESPONSE_TYPES.ERROR,

        content: message

    });

}

/*
|--------------------------------------------------------------------------
| System Response
|--------------------------------------------------------------------------
*/

export function createSystemResponse(

    message

) {

    return createResponse({

        type: RESPONSE_TYPES.SYSTEM,

        content: message

    });

}

/*
|--------------------------------------------------------------------------
| Human Handoff Response
|--------------------------------------------------------------------------
*/

export function createHandoffResponse() {

    return createResponse({

        type: RESPONSE_TYPES.HANDOFF,

        content:
            "A human support representative will assist you shortly."

    });

}
