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
/*
|--------------------------------------------------------------------------
| Recommend By Category
|--------------------------------------------------------------------------
*/

export async function recommendByCategory(

    shopId,

    category,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const products = await Product.find({

        shop: shopId,

        productType: category,

        status: "active",

        deleted: false

    }).lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Recommend By Brand
|--------------------------------------------------------------------------
*/

export async function recommendByBrand(

    shopId,

    vendor,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const products = await Product.find({

        shop: shopId,

        vendor,

        status: "active",

        deleted: false

    }).lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Recommend By Budget
|--------------------------------------------------------------------------
*/

export async function recommendByBudget(

    shopId,

    minPrice,

    maxPrice,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const products = await Product.find({

        shop: shopId,

        status: "active",

        deleted: false

    }).lean();

    const filtered = filterByBudget(

        filterAvailableProducts(products),

        minPrice,

        maxPrice

    );

    return sortRecommendations(filtered)

        .slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Personalized Recommendations
|--------------------------------------------------------------------------
*/

export async function recommendForCustomer(

    conversation,

    shopId,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const memory = conversation?.memory || [];

    const category =

        memory.find(

            item => item.key === "favorite_category"

        )?.value;

    const brand =

        memory.find(

            item => item.key === "favorite_brand"

        )?.value;

    const budget =

        memory.find(

            item => item.key === "budget"

        )?.value;

    if (category) {

        return recommendByCategory(

            shopId,

            category,

            limit

        );

    }

    if (brand) {

        return recommendByBrand(

            shopId,

            brand,

            limit

        );

    }

    if (

        budget &&
        typeof budget.min === "number" &&
        typeof budget.max === "number"

    ) {

        return recommendByBudget(

            shopId,

            budget.min,

            budget.max,

            limit

        );

    }

    return [];

}

/*
|--------------------------------------------------------------------------
| Similar Products
|--------------------------------------------------------------------------
*/

export async function recommendSimilarProducts(

    product,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    if (!product) {

        return [];

    }

    const products = await Product.find({

        shop: product.shop,

        _id: {

            $ne: product._id

        },

        productType: product.productType,

        status: "active",

        deleted: false

    }).lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Recently Viewed Products
|--------------------------------------------------------------------------
*/

export async function recommendRecentlyViewed(

    visitorId,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const visitor = await Visitor.findById(visitorId)

        .populate({

            path: "recentProducts",

            match: {

                status: "active",

                deleted: false

            }

        })

        .lean();

    if (!visitor?.recentProducts) {

        return [];

    }

    return sortRecommendations(

        filterAvailableProducts(

            visitor.recentProducts

        )

    ).slice(0, limit);

}
/*
|--------------------------------------------------------------------------
| Upsell Recommendations
|--------------------------------------------------------------------------
*/

export async function recommendUpsell(

    product,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    if (!product) {

        return [];

    }

    const products = await Product.find({

        shop: product.shop,

        status: "active",

        deleted: false,

        price: {

            $gt: Number(product.price || 0)

        }

    })
        .sort({

            price: 1

        })
        .lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Cross Sell Recommendations
|--------------------------------------------------------------------------
*/

export async function recommendCrossSell(

    product,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    if (!product) {

        return [];

    }

    const products = await Product.find({

        shop: product.shop,

        status: "active",

        deleted: false,

        productType: {

            $ne: product.productType

        }

    }).lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Cart Recommendations
|--------------------------------------------------------------------------
*/

export async function recommendCartProducts(

    cartItems = [],

    shopId,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    if (!cartItems.length) {

        return [];

    }

    const categories = [

        ...new Set(

            cartItems.map(

                item => item.productType

            )

        )

    ];

    const products = await Product.find({

        shop: shopId,

        productType: {

            $in: categories

        },

        status: "active",

        deleted: false

    }).lean();

    const cartIds =

        cartItems.map(

            item =>

                item._id?.toString()

        );

    const recommendations =

        filterAvailableProducts(products)

        .filter(

            product =>

                !cartIds.includes(

                    product._id.toString()

                )

        );

    return sortRecommendations(

        recommendations

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Checkout Recommendations
|--------------------------------------------------------------------------
*/

export async function recommendCheckoutProducts(

    order,

    limit = 3

) {

    if (!order) {

        return [];

    }

    return recommendCartProducts(

        order.items || [],

        order.shop,

        limit

    );

}

/*
|--------------------------------------------------------------------------
| Trending Products
|--------------------------------------------------------------------------
*/

export async function recommendTrending(

    shopId,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const products = await Product.find({

        shop: shopId,

        status: "active",

        deleted: false

    })
        .sort({

            totalSales: -1,

            views: -1

        })
        .lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Best Seller Recommendations
|--------------------------------------------------------------------------
*/

export async function recommendBestSellers(

    shopId,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const products = await Product.find({

        shop: shopId,

        status: "active",

        deleted: false,

        featured: true

    })
        .sort({

            totalSales: -1

        })
        .lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| New Arrival Recommendations
|--------------------------------------------------------------------------
*/

export async function recommendNewArrivals(

    shopId,

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    const products = await Product.find({

        shop: shopId,

        status: "active",

        deleted: false

    })
        .sort({

            createdAt: -1

        })
        .lean();

    return sortRecommendations(

        filterAvailableProducts(products)

    ).slice(0, limit);

    }
/*
|--------------------------------------------------------------------------
| Build Recommendation Explanation
|--------------------------------------------------------------------------
*/

export function buildRecommendationReason(product = {}) {

    const reasons = [];

    if (product.featured) {
        reasons.push("Featured product");
    }

    if ((product.totalSales || 0) > 100) {
        reasons.push("Popular with customers");
    }

    if ((product.inventoryQuantity || 0) > 20) {
        reasons.push("In stock");
    }

    if (product.compareAtPrice > product.price) {
        reasons.push("Currently discounted");
    }

    if (!reasons.length) {
        reasons.push("Recommended for you");
    }

    return reasons.join(" • ");

}

/*
|--------------------------------------------------------------------------
| Enrich Recommendations
|--------------------------------------------------------------------------
*/

export function enrichRecommendations(products = []) {

    return products.map(product => ({

        ...product,

        recommendationType:

            product.recommendationType ||

            RECOMMENDATION_TYPES.PERSONALIZED,

        recommendationScore:

            product.recommendationScore ||

            calculateScore(product),

        recommendationReason:

            buildRecommendationReason(product)

    }));

}

/*
|--------------------------------------------------------------------------
| Remove Duplicate Recommendations
|--------------------------------------------------------------------------
*/

export function uniqueRecommendations(products = []) {

    const seen = new Set();

    return products.filter(product => {

        const id = product._id.toString();

        if (seen.has(id)) {

            return false;

        }

        seen.add(id);

        return true;

    });

}

/*
|--------------------------------------------------------------------------
| Final Recommendation Pipeline
|--------------------------------------------------------------------------
*/

export function finalizeRecommendations(

    products = [],

    limit = RECOMMENDATION_CONFIG.DEFAULT_LIMIT

) {

    return uniqueRecommendations(

        enrichRecommendations(

            sortRecommendations(products)

        )

    ).slice(0, limit);

}

/*
|--------------------------------------------------------------------------
| Save Recommendation Analytics
|--------------------------------------------------------------------------
*/

export async function saveRecommendationAnalytics(

    conversation,

    recommendations = []

) {

    if (!conversation) {

        return;

    }

    conversation.recommendationsGenerated +=
        recommendations.length;

    conversation.recommendedProducts =
        recommendations.map(product => ({

            product: product._id,

            shopifyProductId:

                product.shopifyProductId,

            title: product.title,

            handle: product.handle,

            price: product.price,

            score:

                product.recommendationScore ||

                calculateScore(product),

            reason:

                product.recommendationReason ||

                buildRecommendationReason(product)

        }));

    await conversation.save();

}

/*
|--------------------------------------------------------------------------
| Recommendation Service
|--------------------------------------------------------------------------
*/

export const RecommendationService = {

    calculateScore,

    filterAvailableProducts,

    filterByCategory,

    filterByBrand,

    filterByBudget,

    sortRecommendations,

    recommendByCategory,

    recommendByBrand,

    recommendByBudget,

    recommendForCustomer,

    recommendSimilarProducts,

    recommendRecentlyViewed,

    recommendUpsell,

    recommendCrossSell,

    recommendCartProducts,

    recommendCheckoutProducts,

    recommendTrending,

    recommendBestSellers,

    recommendNewArrivals,

    buildRecommendationReason,

    enrichRecommendations,

    uniqueRecommendations,

    finalizeRecommendations,

    saveRecommendationAnalytics

};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default RecommendationService;
