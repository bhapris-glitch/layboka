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
/*
|--------------------------------------------------------------------------
| Widget UI
|--------------------------------------------------------------------------
*/

createWidget() {

    this.container = document.createElement("div");

    this.container.id = "layboka-chatbot";

    this.container.className = `layboka-widget ${this.config.theme}`;

    this.container.innerHTML = `

        <div class="layboka-window">

            ${this.renderHeader()}

            ${this.renderBody()}

            ${this.renderInput()}

        </div>

    `;

    document.body.appendChild(this.container);

    this.cacheElements();

    this.registerEvents();

}

/*
|--------------------------------------------------------------------------
| Cache DOM Elements
|--------------------------------------------------------------------------
*/

cacheElements() {

    this.windowElement =
        this.container.querySelector(".layboka-window");

    this.headerElement =
        this.container.querySelector(".layboka-header");

    this.bodyElement =
        this.container.querySelector(".layboka-body");

    this.messagesElement =
        this.container.querySelector(".layboka-messages");

    this.footerElement =
        this.container.querySelector(".layboka-footer");

    this.inputElement =
        this.container.querySelector(".layboka-input");

    this.sendButton =
        this.container.querySelector(".layboka-send");

}

/*
|--------------------------------------------------------------------------
| Widget Header
|--------------------------------------------------------------------------
*/

renderHeader() {

    return `

        <div class="layboka-header">

            <div class="layboka-brand">

                <div class="layboka-avatar">

                    AI

                </div>

                <div class="layboka-title">

                    <h3>

                        ${this.config.assistantName}

                    </h3>

                    <span>

                        Online

                    </span>

                </div>

            </div>

            <div class="layboka-actions">

                <button

                    class="layboka-minimize"

                    aria-label="Minimize"

                >

                    −

                </button>

            </div>

        </div>

    `;

}

/*
|--------------------------------------------------------------------------
| Chat Body
|--------------------------------------------------------------------------
*/

renderBody() {

    return `

        <div class="layboka-body">

            <div class="layboka-messages">

            </div>

        </div>

    `;

}

/*
|--------------------------------------------------------------------------
| Input Area
|--------------------------------------------------------------------------
*/

renderInput() {

    return `

        <div class="layboka-footer">

            <textarea

                class="layboka-input"

                rows="1"

                maxlength="2000"

                placeholder="Ask me anything..."

            ></textarea>

            <button

                class="layboka-send"

                aria-label="Send"

            >

                ➜

            </button>

        </div>

    `;

}

/*
|--------------------------------------------------------------------------
| Create Floating Launcher
|--------------------------------------------------------------------------
*/

createLauncher() {

    this.launcher = document.createElement("button");

    this.launcher.className =

        "layboka-launcher";

    this.launcher.innerHTML =

        this.config.launcherIcon ||

        "💬";

    document.body.appendChild(

        this.launcher

    );

}

/*
|--------------------------------------------------------------------------
| Toggle Widget
|--------------------------------------------------------------------------
*/

toggleWidget() {

    this.isOpen = !this.isOpen;

    this.container.classList.toggle(

        "open",

        this.isOpen

    );

}

/*
|--------------------------------------------------------------------------
| Theme Handling
|--------------------------------------------------------------------------
*/

setTheme(theme) {

    this.config.theme = theme;

    this.container.classList.remove(

        "light",

        "dark"

    );

    this.container.classList.add(theme);

}

toggleTheme() {

    const theme =

        this.config.theme === "dark"

        ? "light"

        : "dark";

    this.setTheme(theme);

}

/*
|--------------------------------------------------------------------------
| Update Brand Color
|--------------------------------------------------------------------------
*/

setPrimaryColor(color) {

    document.documentElement.style.setProperty(

        "--layboka-primary",

        color

    );

}

/*
|--------------------------------------------------------------------------
| Enable Glass Effect
|--------------------------------------------------------------------------
*/

enableGlassMode() {

    this.container.classList.add(

        "glass"

    );

}

/*
|--------------------------------------------------------------------------
| Disable Glass Effect
|--------------------------------------------------------------------------
*/

disableGlassMode() {

    this.container.classList.remove(

        "glass"

    );

}
/*
|--------------------------------------------------------------------------
| Widget State
|--------------------------------------------------------------------------
*/

const WidgetState = {

    initialized: false,

    opened: false,

    minimized: false,

    maximized: false,

    dragging: false,

    resizing: false,

    fullscreen: false,

    mobile: false,

    unreadMessages: 0,

    position: {

        left: null,

        top: null,

        right: 24,

        bottom: 24

    },

    size: {

        width: 380,

        height: 650

    }

};

/*
|--------------------------------------------------------------------------
| Local Storage Keys
|--------------------------------------------------------------------------
*/

const STORAGE_KEYS = {

    STATE: "layboka_widget_state",

    POSITION: "layboka_widget_position",

    SIZE: "layboka_widget_size"

};

/*
|--------------------------------------------------------------------------
| Save Widget State
|--------------------------------------------------------------------------
*/

function saveWidgetState() {

    try {

        localStorage.setItem(

            STORAGE_KEYS.STATE,

            JSON.stringify({

                opened: WidgetState.opened,

                minimized: WidgetState.minimized,

                maximized: WidgetState.maximized,

                unreadMessages: WidgetState.unreadMessages

            })

        );

    } catch (error) {

        console.warn(

            "Unable to save widget state.",

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Save Widget Position
|--------------------------------------------------------------------------
*/

function saveWidgetPosition() {

    try {

        localStorage.setItem(

            STORAGE_KEYS.POSITION,

            JSON.stringify(

                WidgetState.position

            )

        );

    } catch (error) {

        console.warn(error);

    }

}

/*
|--------------------------------------------------------------------------
| Save Widget Size
|--------------------------------------------------------------------------
*/

function saveWidgetSize() {

    try {

        localStorage.setItem(

            STORAGE_KEYS.SIZE,

            JSON.stringify(

                WidgetState.size

            )

        );

    } catch (error) {

        console.warn(error);

    }

}

/*
|--------------------------------------------------------------------------
| Load Widget State
|--------------------------------------------------------------------------
*/

function loadWidgetState() {

    try {

        const state = JSON.parse(

            localStorage.getItem(

                STORAGE_KEYS.STATE

            )

        );

        if (!state) {

            return;

        }

        WidgetState.opened =

            !!state.opened;

        WidgetState.minimized =

            !!state.minimized;

        WidgetState.maximized =

            !!state.maximized;

        WidgetState.unreadMessages =

            state.unreadMessages || 0;

    } catch (error) {

        console.warn(error);

    }

}

/*
|--------------------------------------------------------------------------
| Load Widget Position
|--------------------------------------------------------------------------
*/

function loadWidgetPosition() {

    try {

        const position = JSON.parse(

            localStorage.getItem(

                STORAGE_KEYS.POSITION

            )

        );

        if (position) {

            WidgetState.position = position;

        }

    } catch (error) {

        console.warn(error);

    }

}

/*
|--------------------------------------------------------------------------
| Load Widget Size
|--------------------------------------------------------------------------
*/

function loadWidgetSize() {

    try {

        const size = JSON.parse(

            localStorage.getItem(

                STORAGE_KEYS.SIZE

            )

        );

        if (size) {

            WidgetState.size = size;

        }

    } catch (error) {

        console.warn(error);

    }

}

/*
|--------------------------------------------------------------------------
| Apply Widget State
|--------------------------------------------------------------------------
*/

function applyWidgetState() {

    if (!windowElements.chatWindow) {

        return;

    }

    const widget =

        windowElements.chatWindow;

    widget.style.width =

        WidgetState.size.width + "px";

    widget.style.height =

        WidgetState.size.height + "px";

    widget.style.right =

        WidgetState.position.right + "px";

    widget.style.bottom =

        WidgetState.position.bottom + "px";

    if (

        WidgetState.position.left !== null

    ) {

        widget.style.left =

            WidgetState.position.left + "px";

    }

    if (

        WidgetState.position.top !== null

    ) {

        widget.style.top =

            WidgetState.position.top + "px";

    }

    if (WidgetState.maximized) {

        widget.classList.add(

            "layboka-maximized"

        );

    }

    if (WidgetState.minimized) {

        widget.classList.add(

            "layboka-minimized"

        );

    }

    if (WidgetState.opened) {

        widget.classList.add(

            "layboka-open"

        );

    }

}

/*
|--------------------------------------------------------------------------
| Open Widget
|--------------------------------------------------------------------------
*/

function openWidget() {

    WidgetState.opened = true;

    WidgetState.minimized = false;

    windowElements.chatWindow.classList.remove(

        "layboka-minimized"

    );

    windowElements.chatWindow.classList.add(

        "layboka-open"

    );

    saveWidgetState();

}

/*
|--------------------------------------------------------------------------
| Close Widget
|--------------------------------------------------------------------------
*/

function closeWidget() {

    WidgetState.opened = false;

    WidgetState.minimized = false;

    WidgetState.maximized = false;

    windowElements.chatWindow.classList.remove(

        "layboka-open",

        "layboka-minimized",

        "layboka-maximized"

    );

    saveWidgetState();

}

/*
|--------------------------------------------------------------------------
| Minimize Widget
|--------------------------------------------------------------------------
*/

function minimizeWidget() {

    WidgetState.minimized = true;

    WidgetState.maximized = false;

    windowElements.chatWindow.classList.add(

        "layboka-minimized"

    );

    windowElements.chatWindow.classList.remove(

        "layboka-maximized"

    );

    saveWidgetState();

}

/*
|--------------------------------------------------------------------------
| Maximize Widget
|--------------------------------------------------------------------------
*/

function maximizeWidget() {

    WidgetState.maximized = true;

    WidgetState.minimized = false;

    windowElements.chatWindow.classList.add(

        "layboka-maximized"

    );

    windowElements.chatWindow.classList.remove(

        "layboka-minimized"

    );

    saveWidgetState();

}

/*
|--------------------------------------------------------------------------
| Toggle Widget
|--------------------------------------------------------------------------
*/

function toggleWidget() {

    if (!WidgetState.opened) {

        openWidget();

        return;

    }

    if (WidgetState.minimized) {

        openWidget();

        return;

    }

    minimizeWidget();

        }
/*
|--------------------------------------------------------------------------
| Drag & Drop
|--------------------------------------------------------------------------
*/

initializeDragging() {

    this.drag = {

        active: false,

        moved: false,

        startX: 0,

        startY: 0,

        widgetX: 0,

        widgetY: 0

    };

    const header =

        this.widget.querySelector(
            ".layboka-chat-header"
        );

    if (!header) {

        return;

    }

    header.style.cursor = "move";

    header.addEventListener(

        "mousedown",

        this.onDragStart.bind(this)

    );

    document.addEventListener(

        "mousemove",

        this.onDragMove.bind(this)

    );

    document.addEventListener(

        "mouseup",

        this.onDragEnd.bind(this)

    );

    /*
    |--------------------------------------------------------------------------
    | Touch Events
    |--------------------------------------------------------------------------
    */

    header.addEventListener(

        "touchstart",

        this.onTouchStart.bind(this),

        {

            passive: false

        }

    );

    document.addEventListener(

        "touchmove",

        this.onTouchMove.bind(this),

        {

            passive: false

        }

    );

    document.addEventListener(

        "touchend",

        this.onTouchEnd.bind(this)

    );

}

/*
|--------------------------------------------------------------------------
| Mouse Drag Start
|--------------------------------------------------------------------------
*/

onDragStart(event) {

    if (

        this.isMobile()

    ) {

        return;

    }

    this.drag.active = true;

    this.drag.moved = false;

    this.drag.startX = event.clientX;

    this.drag.startY = event.clientY;

    const rect =

        this.widget.getBoundingClientRect();

    this.drag.widgetX = rect.left;

    this.drag.widgetY = rect.top;

    this.widget.classList.add(

        "dragging"

    );

}

/*
|--------------------------------------------------------------------------
| Mouse Drag Move
|--------------------------------------------------------------------------
*/

onDragMove(event) {

    if (

        !this.drag.active

    ) {

        return;

    }

    event.preventDefault();

    const deltaX =

        event.clientX -

        this.drag.startX;

    const deltaY =

        event.clientY -

        this.drag.startY;

    if (

        Math.abs(deltaX) > 5 ||

        Math.abs(deltaY) > 5

    ) {

        this.drag.moved = true;

    }

    let left =

        this.drag.widgetX +

        deltaX;

    let top =

        this.drag.widgetY +

        deltaY;

    const width =

        this.widget.offsetWidth;

    const height =

        this.widget.offsetHeight;

    left = Math.max(

        0,

        Math.min(

            left,

            window.innerWidth -

            width

        )

    );

    top = Math.max(

        0,

        Math.min(

            top,

            window.innerHeight -

            height

        )

    );

    this.widget.style.left =

        `${left}px`;

    this.widget.style.top =

        `${top}px`;

    this.widget.style.right =

        "auto";

    this.widget.style.bottom =

        "auto";

}

/*
|--------------------------------------------------------------------------
| Mouse Drag End
|--------------------------------------------------------------------------
*/

onDragEnd() {

    if (

        !this.drag.active

    ) {

        return;

    }

    this.drag.active = false;

    this.widget.classList.remove(

        "dragging"

    );

    this.saveWidgetPosition();

}

/*
|--------------------------------------------------------------------------
| Touch Start
|--------------------------------------------------------------------------
*/

onTouchStart(event) {

    if (

        !this.isMobile()

    ) {

        return;

    }

    const touch =

        event.touches[0];

    this.drag.active = true;

    this.drag.startX = touch.clientX;

    this.drag.startY = touch.clientY;

    const rect =

        this.widget.getBoundingClientRect();

    this.drag.widgetX = rect.left;

    this.drag.widgetY = rect.top;

}

/*
|--------------------------------------------------------------------------
| Touch Move
|--------------------------------------------------------------------------
*/

onTouchMove(event) {

    if (

        !this.drag.active

    ) {

        return;

    }

    event.preventDefault();

    const touch =

        event.touches[0];

    const deltaX =

        touch.clientX -

        this.drag.startX;

    const deltaY =

        touch.clientY -

        this.drag.startY;

    let left =

        this.drag.widgetX +

        deltaX;

    let top =

        this.drag.widgetY +

        deltaY;

    left = Math.max(

        0,

        Math.min(

            left,

            window.innerWidth -

            this.widget.offsetWidth

        )

    );

    top = Math.max(

        0,

        Math.min(

            top,

            window.innerHeight -

            this.widget.offsetHeight

        )

    );

    this.widget.style.left =

        `${left}px`;

    this.widget.style.top =

        `${top}px`;

    this.widget.style.right =

        "auto";

    this.widget.style.bottom =

        "auto";

}

/*
|--------------------------------------------------------------------------
| Touch End
|--------------------------------------------------------------------------
*/

onTouchEnd() {

    if (

        !this.drag.active

    ) {

        return;

    }

    this.drag.active = false;

    this.saveWidgetPosition();

}

/*
|--------------------------------------------------------------------------
| Save Position
|--------------------------------------------------------------------------
*/

saveWidgetPosition() {

    const rect =

        this.widget.getBoundingClientRect();

    localStorage.setItem(

        "layboka-widget-position",

        JSON.stringify({

            left: rect.left,

            top: rect.top

        })

    );

}

/*
|--------------------------------------------------------------------------
| Restore Position
|--------------------------------------------------------------------------
*/

restoreWidgetPosition() {

    const saved =

        localStorage.getItem(

            "layboka-widget-position"

        );

    if (!saved) {

        return;

    }

    try {

        const position =

            JSON.parse(saved);

        this.widget.style.left =

            `${position.left}px`;

        this.widget.style.top =

            `${position.top}px`;

        this.widget.style.right =

            "auto";

        this.widget.style.bottom =

            "auto";

    } catch (error) {

        console.warn(

            "Unable to restore widget position.",

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Responsive Resize Handler
|--------------------------------------------------------------------------
*/

handleWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.viewport = {
        width,
        height
    };

    const isMobile = width <= 768;

    if (isMobile !== this.isMobile) {

        this.isMobile = isMobile;

        this.applyResponsiveLayout();

    }

    if (!this.isMobile) {

        this.keepWidgetInsideViewport();

    }

}

/*
|--------------------------------------------------------------------------
| Apply Responsive Layout
|--------------------------------------------------------------------------
*/

applyResponsiveLayout() {

    if (!this.chatWindow) {

        return;

    }

    if (this.isMobile) {

        this.chatWindow.classList.add(
            "layboka-mobile"
        );

        this.chatWindow.classList.remove(
            "layboka-desktop"
        );

        this.chatWindow.style.left = "0";
        this.chatWindow.style.top = "0";
        this.chatWindow.style.right = "0";
        this.chatWindow.style.bottom = "0";
        this.chatWindow.style.width = "100vw";
        this.chatWindow.style.height = "100dvh";
        this.chatWindow.style.borderRadius = "0";

        return;

    }

    this.chatWindow.classList.remove(
        "layboka-mobile"
    );

    this.chatWindow.classList.add(
        "layboka-desktop"
    );

    this.chatWindow.style.width =
        `${this.state.width}px`;

    this.chatWindow.style.height =
        `${this.state.height}px`;

    this.chatWindow.style.left =
        `${this.state.left}px`;

    this.chatWindow.style.top =
        `${this.state.top}px`;

    this.chatWindow.style.borderRadius =
        "20px";

}

/*
|--------------------------------------------------------------------------
| Keep Widget Inside Viewport
|--------------------------------------------------------------------------
*/

keepWidgetInsideViewport() {

    if (!this.chatWindow) {

        return;

    }

    const maxLeft =
        window.innerWidth -
        this.state.width;

    const maxTop =
        window.innerHeight -
        this.state.height;

    this.state.left = Math.max(
        10,
        Math.min(
            this.state.left,
            maxLeft - 10
        )
    );

    this.state.top = Math.max(
        10,
        Math.min(
            this.state.top,
            maxTop - 10
        )
    );

    this.chatWindow.style.left =
        `${this.state.left}px`;

    this.chatWindow.style.top =
        `${this.state.top}px`;

}

/*
|--------------------------------------------------------------------------
| Restore Previous Position
|--------------------------------------------------------------------------
*/

restoreWidgetPosition() {

    if (this.isMobile) {

        return;

    }

    this.chatWindow.style.left =
        `${this.state.left}px`;

    this.chatWindow.style.top =
        `${this.state.top}px`;

    this.chatWindow.style.width =
        `${this.state.width}px`;

    this.chatWindow.style.height =
        `${this.state.height}px`;

}

/*
|--------------------------------------------------------------------------
| Register Window Events
|--------------------------------------------------------------------------
*/

registerWindowEvents() {

    window.addEventListener(

        "resize",

        () => this.handleWindowResize()

    );

    window.addEventListener(

        "orientationchange",

        () => {

            setTimeout(() => {

                this.handleWindowResize();

            }, 250);

        }

    );

    document.addEventListener(

        "visibilitychange",

        () => {

            if (

                document.visibilityState ===

                "hidden"

            ) {

                this.saveState();

            }

        }

    );

    window.addEventListener(

        "beforeunload",

        () => this.saveState()

    );

}

/*
|--------------------------------------------------------------------------
| Destroy Widget
|--------------------------------------------------------------------------
*/

destroy() {

    this.saveState();

    window.removeEventListener(

        "resize",

        this.handleWindowResize

    );

    window.removeEventListener(

        "orientationchange",

        this.handleWindowResize

    );

    if (

        this.container &&
        this.container.parentNode

    ) {

        this.container.parentNode.removeChild(

            this.container

        );

    }

}

/*
|--------------------------------------------------------------------------
| Initialize Responsive System
|--------------------------------------------------------------------------
*/

initializeResponsiveSystem() {

    this.isMobile =
        window.innerWidth <= 768;

    this.viewport = {

        width: window.innerWidth,

        height: window.innerHeight

    };

    this.applyResponsiveLayout();

    this.restoreWidgetPosition();

    this.registerWindowEvents();

}
