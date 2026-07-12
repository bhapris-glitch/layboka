/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| Template Constants
|--------------------------------------------------------------------------
*/

export const TEMPLATE_TYPES = Object.freeze({

    WELCOME: "welcome",

    GREETING: "greeting",

    FALLBACK: "fallback",

    PRODUCT: "product",

    CART: "cart",

    CHECKOUT: "checkout",

    ORDER: "order",

    SHIPPING: "shipping",

    DISCOUNT: "discount",

    UPSELL: "upsell",

    CROSS_SELL: "cross_sell",

    THANK_YOU: "thank_you",

    GOODBYE: "goodbye",

    ERROR: "error"

});

export const TEMPLATE_LANGUAGES = [

    "en",

    "hi"

];

export const DEFAULT_LANGUAGE = "en";

/*
|--------------------------------------------------------------------------
| Template Registry
|--------------------------------------------------------------------------
*/

const TEMPLATE_REGISTRY = {

    welcome: [],

    greeting: [],

    fallback: [],

    product: [],

    cart: [],

    checkout: [],

    shipping: [],

    discount: [],

    order: [],

    upsell: [],

    crossSell: [],

    thankYou: [],

    goodbye: [],

    error: []

};

/*
|--------------------------------------------------------------------------
| Welcome Templates
|--------------------------------------------------------------------------
*/

const WELCOME_TEMPLATES = [

    "👋 Welcome to {{shopName}}! I'm {{assistantName}}. I can help you discover products, answer questions, compare options, and guide you through checkout.",

    "Hi! I'm {{assistantName}}, your AI shopping assistant. Tell me what you're looking for and I'll help you find the perfect product.",

    "Welcome! 😊 Need product recommendations, pricing, shipping details, or order help? I'm here for you."

];

/*
|--------------------------------------------------------------------------
| Greeting Templates
|--------------------------------------------------------------------------
*/

const GREETING_TEMPLATES = [

    "Hello! 👋 How can I help you today?",

    "Hi there! What can I help you find?",

    "Welcome back! What are you shopping for today?",

    "Good to see you again! 😊"

];

/*
|--------------------------------------------------------------------------
| Fallback Templates
|--------------------------------------------------------------------------
*/

const FALLBACK_TEMPLATES = [

    "I'm sorry, I couldn't fully understand that. Could you rephrase your question?",

    "I didn't quite catch that. Can you give me a little more detail?",

    "I'm here to help with products, orders, shipping, discounts and more. Could you try asking differently?",

    "Sorry, I'm not confident about that answer. Let me try again if you can provide a bit more context."

];
