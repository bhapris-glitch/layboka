import Product from "../../models/Product.js";
import Conversation from "../../models/Conversation.js";
import Visitor from "../../models/Visitor.js";

/*
|--------------------------------------------------------------------------
| Recommendation Configuration
|--------------------------------------------------------------------------
*/

export const RECOMMENDATION_CONFIG = Object.freeze({

    MAX_PRODUCTS: 12,

    MIN_STOCK: 1,

    DEFAULT_LIMIT: 4,

    MAX_LIMIT: 12,

    MIN_SCORE: 40,

    SCORE: {

        STOCK: 20,

        CATEGORY: 20,

        BRAND: 15,

        PRICE: 20,

        POPULARITY: 15,

        CUSTOMER_HISTORY: 10

    }

});

/*
|--------------------------------------------------------------------------
| Recommendation Types
|--------------------------------------------------------------------------
*/

export const RECOMMENDATION_TYPES = Object.freeze({

    RELATED: "related",

    SIMILAR: "similar",

    UPSELL: "upsell",

    CROSS_SELL: "cross_sell",

    TRENDING: "trending",

    BEST_SELLER: "best_seller",

    NEW_ARRIVAL: "new_arrival",

    PERSONALIZED: "personalized",

    CART: "cart"

});

/*
|--------------------------------------------------------------------------
| Calculate Recommendation Score
|--------------------------------------------------------------------------
*/

export function calculateScore(product = {}) {

    let score = 0;

    /*
    |--------------------------------------------------------------------------
    | Inventory
    |--------------------------------------------------------------------------
    */

    if ((product.inventoryQuantity || 0) > 20) {

        score += RECOMMENDATION_CONFIG.SCORE.STOCK;

    } else if ((product.inventoryQuantity || 0) > 0) {

        score += 10;

    }

    /*
    |--------------------------------------------------------------------------
    | Popularity
    |--------------------------------------------------------------------------
    */

    score += Math.min(

        Number(product.totalSales || 0) / 100,

        RECOMMENDATION_CONFIG.SCORE.POPULARITY

    );

    /*
    |--------------------------------------------------------------------------
    | Rating
    |--------------------------------------------------------------------------
    */

    score += Math.min(

        Number(product.rating || 0) * 4,

        20

    );

    /*
    |--------------------------------------------------------------------------
    | Featured Product
    |--------------------------------------------------------------------------
    */

    if (product.featured) {

        score += 10;

    }

    return Math.round(score);

}

/*
|--------------------------------------------------------------------------
| Filter Available Products
|--------------------------------------------------------------------------
*/

export function filterAvailableProducts(products = []) {

    return products.filter(product => {

        return (

            product.status === "active" &&

            !product.deleted &&

            (product.inventoryQuantity || 0) >=
            RECOMMENDATION_CONFIG.MIN_STOCK

        );

    });

}

/*
|--------------------------------------------------------------------------
| Filter By Category
|--------------------------------------------------------------------------
*/

export function filterByCategory(

    products = [],

    category = ""

) {

    if (!category) {

        return products;

    }

    return products.filter(product =>

        product.productType === category

    );

}

/*
|--------------------------------------------------------------------------
| Filter By Brand
|--------------------------------------------------------------------------
*/

export function filterByBrand(

    products = [],

    vendor = ""

) {

    if (!vendor) {

        return products;

    }

    return products.filter(product =>

        product.vendor === vendor

    );

}

/*
|--------------------------------------------------------------------------
| Filter By Budget
|--------------------------------------------------------------------------
*/

export function filterByBudget(

    products = [],

    minPrice = 0,

    maxPrice = Number.MAX_SAFE_INTEGER

) {

    return products.filter(product => {

        const price = Number(product.price || 0);

        return (

            price >= minPrice &&

            price <= maxPrice

        );

    });

}

/*
|--------------------------------------------------------------------------
| Sort By Recommendation Score
|--------------------------------------------------------------------------
*/

export function sortRecommendations(products = []) {

    return products

        .map(product => ({

            ...product,

            recommendationScore:

                calculateScore(product)

        }))

        .sort(

            (a, b) =>

                b.recommendationScore -

                a.recommendationScore

        );

}
