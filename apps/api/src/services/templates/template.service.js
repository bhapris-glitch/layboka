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
/*
|--------------------------------------------------------------------------
| Product Recommendation Templates
|--------------------------------------------------------------------------
*/

export const PRODUCT_RECOMMENDATION_TEMPLATES = [

    {
        id: "recommended_for_you",

        category: "recommendation",

        title: "Recommended For You",

        template:
            "Based on what you're looking for, I recommend **{product}**. It matches your requirements and is one of our most popular choices.",

        priority: 100
    },

    {
        id: "best_seller",

        category: "recommendation",

        title: "Best Seller",

        template:
            "**{product}** is currently one of our best-selling products with excellent customer reviews.",

        priority: 90
    },

    {
        id: "new_arrival",

        category: "recommendation",

        title: "New Arrival",

        template:
            "You may also like our latest arrival **{product}**. It's just been added to the store.",

        priority: 80
    }

];

/*
|--------------------------------------------------------------------------
| Upsell Templates
|--------------------------------------------------------------------------
*/

export const UPSELL_TEMPLATES = [

    {
        id: "premium_upgrade",

        title: "Premium Upgrade",

        template:
            "For a better experience, you may want to upgrade to **{product}**. It offers additional features and better value.",

        priority: 100
    },

    {
        id: "higher_capacity",

        title: "Higher Capacity",

        template:
            "Many customers choose **{product}** because it provides greater performance and long-term value.",

        priority: 90
    }

];

/*
|--------------------------------------------------------------------------
| Cross-sell Templates
|--------------------------------------------------------------------------
*/

export const CROSS_SELL_TEMPLATES = [

    {
        id: "complete_the_bundle",

        title: "Complete Your Purchase",

        template:
            "Customers who bought this item also purchased **{product}**.",

        priority: 100
    },

    {
        id: "frequently_bought",

        title: "Frequently Bought Together",

        template:
            "**{product}** is frequently purchased together with your selected item.",

        priority: 90
    }

];

/*
|--------------------------------------------------------------------------
| Discount Templates
|--------------------------------------------------------------------------
*/

export const DISCOUNT_TEMPLATES = [

    {
        id: "limited_offer",

        title: "Limited Time Offer",

        template:
            "🎉 Great news! Use code **{code}** to save **{discount}%** on your order.",

        priority: 100
    },

    {
        id: "free_shipping",

        title: "Free Shipping",

        template:
            "Complete your purchase today and enjoy **FREE SHIPPING** on eligible orders.",

        priority: 90
    },

    {
        id: "bundle_discount",

        title: "Bundle Discount",

        template:
            "Buy more and save more! Add **{product}** to unlock your bundle discount.",

        priority: 80
    }

];

/*
|--------------------------------------------------------------------------
| Cart Recovery Templates
|--------------------------------------------------------------------------
*/

export const CART_RECOVERY_TEMPLATES = [

    {
        id: "cart_reminder",

        title: "Cart Reminder",

        template:
            "🛒 Your cart is waiting for you! Complete your purchase before your items sell out.",

        priority: 100
    },

    {
        id: "checkout_reminder",

        title: "Checkout Reminder",

        template:
            "You're just one step away from completing your order. Finish checkout now while your cart is still available.",

        priority: 90
    },

    {
        id: "discount_recovery",

        title: "Recovery Discount",

        template:
            "Complete your order today and use **{code}** to receive **{discount}% OFF**.",

        priority: 95
    }

];
/*
|--------------------------------------------------------------------------
| Order Templates
|--------------------------------------------------------------------------
*/

export const OrderTemplates = {

    orderReceived(customerName, orderNumber) {

        return `Hi ${customerName}! 🎉

Thank you for your order.

Your order (${orderNumber}) has been received successfully and is now being processed.

We'll notify you once it has been shipped.`;
    },

    orderProcessing(customerName, orderNumber) {

        return `Hi ${customerName},

Your order (${orderNumber}) is currently being prepared by our team.

We'll send shipping details as soon as it's ready.`;
    },

    orderShipped(customerName, trackingNumber) {

        return `🚚 Great news!

Your order has been shipped.

Tracking Number:
${trackingNumber}

You can use this tracking number to follow your package until delivery.`;
    },

    orderDelivered(customerName) {

        return `🎉 Your order has been delivered.

Thank you for shopping with us!

We'd love to hear your feedback.`;
    }

};

/*
|--------------------------------------------------------------------------
| Shipping Templates
|--------------------------------------------------------------------------
*/

export const ShippingTemplates = {

    shippingInformation() {

        return `Shipping times depend on your delivery location.

Estimated delivery:
• Domestic: 2–5 business days
• International: 5–12 business days`;
    },

    shippingDelay() {

        return `We apologize for the delay.

Your shipment is still in transit and our logistics partner is working to deliver it as soon as possible.`;
    },

    freeShipping(minimumAmount) {

        return `🎉 Good news!

Orders above ${minimumAmount} qualify for FREE shipping.`;
    }

};

/*
|--------------------------------------------------------------------------
| Return & Refund Templates
|--------------------------------------------------------------------------
*/

export const ReturnTemplates = {

    returnPolicy(days) {

        return `You can return eligible products within ${days} days of delivery.

Items should be unused and in their original packaging.`;
    },

    refundProcessing() {

        return `Your refund request has been received.

Refunds are usually processed within 5–10 business days after approval.`;
    },

    exchangePolicy() {

        return `Need a different size or color?

We're happy to help with exchanges for eligible products.`;
    }

};

/*
|--------------------------------------------------------------------------
| Customer Support Templates
|--------------------------------------------------------------------------
*/

export const SupportTemplates = {

    contactSupport() {

        return `Our support team is ready to help.

Please describe your issue and we'll assist you as quickly as possible.`;
    },

    technicalIssue() {

        return `We're sorry you're experiencing an issue.

Please provide as much detail as possible so we can investigate.`;
    },

    unavailableInformation() {

        return `I'm unable to find that information right now.

Let me connect you with our support team for further assistance.`;
    }

};

/*
|--------------------------------------------------------------------------
| Human Handoff Templates
|--------------------------------------------------------------------------
*/

export const HumanHandoffTemplates = {

    requestAgent() {

        return `I've forwarded your conversation to one of our support specialists.

Someone will assist you shortly.`;
    },

    agentAssigned(agentName) {

        return `You're now connected with ${agentName}.

They'll continue assisting you from here.`;
    },

    outsideBusinessHours() {

        return `Our support team is currently offline.

We've received your message and will respond as soon as business hours resume.`;
    }

};
/*
|--------------------------------------------------------------------------
| Variable Replacement Engine
|--------------------------------------------------------------------------
*/

export function replaceVariables(

    template,

    variables = {}

) {

    if (!template) {

        return "";

    }

    let content = template;

    Object.entries(variables).forEach(

        ([key, value]) => {

            const regex = new RegExp(

                `{{\\s*${key}\\s*}}`,

                "gi"

            );

            content = content.replace(

                regex,

                value ?? ""

            );

        }

    );

    return content;

}

/*
|--------------------------------------------------------------------------
| Language Selection
|--------------------------------------------------------------------------
*/

export function selectLanguageTemplate(

    templates = {},

    language = "en"

) {

    if (

        templates[language]

    ) {

        return templates[language];

    }

    if (

        templates.en

    ) {

        return templates.en;

    }

    return Object.values(

        templates

    )[0] || "";

}

/*
|--------------------------------------------------------------------------
| Template Selection
|--------------------------------------------------------------------------
*/

export function getTemplate(

    type,

    language = "en",

    variables = {}

) {

    const templateGroup =

        TEMPLATE_LIBRARY[type];

    if (!templateGroup) {

        throw new Error(

            `Template '${type}' not found.`

        );

    }

    const template =

        selectLanguageTemplate(

            templateGroup,

            language

        );

    return replaceVariables(

        template,

        variables

    );

}

/*
|--------------------------------------------------------------------------
| Template Validation
|--------------------------------------------------------------------------
*/

export function validateTemplate(

    template

) {

    if (

        !template ||

        typeof template !== "string"

    ) {

        return false;

    }

    return template.trim().length > 0;

}

/*
|--------------------------------------------------------------------------
| Template Service
|--------------------------------------------------------------------------
*/

export const TemplateService = {

    getTemplate,

    replaceVariables,

    selectLanguageTemplate,

    validateTemplate,

    loadTemplates,

    registerTemplate,

    removeTemplate,

    getAvailableTemplates,

    hasTemplate

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default TemplateService;
