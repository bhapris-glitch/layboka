/*
|--------------------------------------------------------------------------
| Layboka AI Shopify Widget
|--------------------------------------------------------------------------
|
| Version : 1.0.0
| Company : Layboka AI
| Website : https://layboka.com
|--------------------------------------------------------------------------
*/

"use strict";

/*
|--------------------------------------------------------------------------
| Widget Constants
|--------------------------------------------------------------------------
*/

const LAYBOKA = Object.freeze({

    VERSION: "1.0.0",

    NAME: "Layboka AI",

    API_VERSION: "v1",

    STORAGE_KEY: "layboka_chat",

    SESSION_KEY: "layboka_session",

    VISITOR_KEY: "layboka_visitor",

    CONVERSATION_KEY: "layboka_conversation",

    EVENT_PREFIX: "layboka:",

    DEFAULT_POSITION: "bottom-right"

});

/*
|--------------------------------------------------------------------------
| Default Configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_CONFIG = {

    apiUrl: "https://api.layboka.com/api/v1",

    widgetId: "",

    shop: "",

    shopId: "",

    token: "",

    theme: "light",

    language: "en",

    currency: "USD",

    position: "bottom-right",

    primaryColor: "#FF3B2F",

    secondaryColor: "#1E3928",

    textColor: "#FFFFFF",

    borderRadius: 18,

    autoOpen: false,

    greeting:

        "👋 Hi! I'm Layboka AI. How can I help you today?",

    placeholder:

        "Ask anything about our products...",

    typingSpeed: 20,

    streaming: true,

    enableVoice: false,

    enableEmoji: true,

    enableFileUpload: false,

    enableProductCards: true,

    enableRecommendations: true,

    enableQuickReplies: true,

    enableCartRecovery: true,

    enableAnalytics: true,

    debug: false

};

/*
|--------------------------------------------------------------------------
| Widget State
|--------------------------------------------------------------------------
*/

const state = {

    initialized: false,

    opened: false,

    loading: false,

    typing: false,

    connected: false,

    sessionId: null,

    visitorId: null,

    conversationId: null,

    config: {

        ...DEFAULT_CONFIG

    },

    elements: {}

};

/*
|--------------------------------------------------------------------------
| Utilities
|--------------------------------------------------------------------------
*/

const $ = selector =>

    document.querySelector(selector);

const create = (tag, className = "") => {

    const element = document.createElement(tag);

    if (className) {

        element.className = className;

    }

    return element;

};

const mergeConfig = config => {

    state.config = {

        ...DEFAULT_CONFIG,

        ...config

    };

};

/*
|--------------------------------------------------------------------------
| Widget Bootstrap
|--------------------------------------------------------------------------
*/

async function bootstrap(config = {}) {

    if (state.initialized) {

        return;

    }

    mergeConfig(config);

    await loadSession();

    createWidget();

    attachEvents();

    state.initialized = true;

}

/*
|--------------------------------------------------------------------------
| Create Widget
|--------------------------------------------------------------------------
*/

function createWidget() {

    const container = create(

        "div",

        "layboka-widget"

    );

    container.id = "layboka-widget";

    container.innerHTML = "";

    document.body.appendChild(

        container

    );

    state.elements.container =

        container;

}

/*
|--------------------------------------------------------------------------
| Initialize Widget
|--------------------------------------------------------------------------
*/

async function initialize(config = {}) {

    try {

        await bootstrap(config);

        if (

            state.config.autoOpen

        ) {

            openWidget();

        }

        console.info(

            `${LAYBOKA.NAME} initialized.`

        );

    } catch (error) {

        console.error(

            "Layboka Initialization Error",

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Auto Initialization
|--------------------------------------------------------------------------
*/

window.addEventListener(

    "DOMContentLoaded",

    () => {

        initialize(

            window.LaybokaConfig || {}

        );

    }

);
