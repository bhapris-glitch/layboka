// layboka/apps/api/src/services/product/product.service.js
import Product from "../../models/Product.js";
import Shop from "../../models/Shop.js";

/*
|--------------------------------------------------------------------------
| Product Service Configuration
|--------------------------------------------------------------------------
*/

export const PRODUCT_CONFIG = Object.freeze({

    DEFAULT_LIMIT: 20,

    MAX_LIMIT: 100,

    LOW_STOCK_THRESHOLD: 10,

    CACHE_TTL: 300,

    SEARCH_FIELDS: [

        "title",

        "description",

        "vendor",

        "productType",

        "tags"

    ]

});

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export async function createProduct(data) {

    const product = await Product.create(data);

    return product;

}

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

export async function updateProduct(

    productId,

    data

) {

    return Product.findByIdAndUpdate(

        productId,

        data,

        {

            new: true,

            runValidators: true

        }

    );

}

/*
|--------------------------------------------------------------------------
| Delete Product (Soft Delete)
|--------------------------------------------------------------------------
*/

export async function deleteProduct(

    productId

) {

    return Product.findByIdAndUpdate(

        productId,

        {

            deleted: true,

            deletedAt: new Date()

        },

        {

            new: true

        }

    );

}

/*
|--------------------------------------------------------------------------
| Find Product By ID
|--------------------------------------------------------------------------
*/

export async function getProductById(

    productId

) {

    return Product.findOne({

        _id: productId,

        deleted: false

    });

}

/*
|--------------------------------------------------------------------------
| Find Shopify Product
|--------------------------------------------------------------------------
*/

export async function getProductByShopifyId(

    shopifyProductId,

    shopId

) {

    return Product.findOne({

        shop: shopId,

        shopifyProductId,

        deleted: false

    });

}

/*
|--------------------------------------------------------------------------
| Get Shop Products
|--------------------------------------------------------------------------
*/

export async function getShopProducts(

    shopId,

    limit = PRODUCT_CONFIG.DEFAULT_LIMIT,

    page = 1

) {

    const skip =

        (page - 1) * limit;

    return Product.find({

        shop: shopId,

        deleted: false

    })

    .sort({

        createdAt: -1

    })

    .skip(skip)

    .limit(limit);

}
/*
|--------------------------------------------------------------------------
| Search Products
|--------------------------------------------------------------------------
*/

export async function searchProducts({

    shop,

    keyword = "",

    limit = PRODUCT_LIMITS.DEFAULT_LIMIT

}) {

    const query = {

        shop,

        status: "active",

        deleted: false

    };

    if (keyword.trim()) {

        query.$or = [

            {
                title: {
                    $regex: keyword,
                    $options: "i"
                }
            },

            {
                description: {
                    $regex: keyword,
                    $options: "i"
                }
            },

            {
                vendor: {
                    $regex: keyword,
                    $options: "i"
                }
            },

            {
                productType: {
                    $regex: keyword,
                    $options: "i"
                }
            },

            {
                tags: {
                    $elemMatch: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            }

        ];

    }

    return Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

}

/*
|--------------------------------------------------------------------------
| Filter By Category
|--------------------------------------------------------------------------
*/

export async function getProductsByCategory(

    shop,

    category,

    limit = PRODUCT_LIMITS.DEFAULT_LIMIT

) {

    return Product.find({

        shop,

        productType: category,

        status: "active",

        deleted: false

    })

    .sort({ title: 1 })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Filter By Vendor
|--------------------------------------------------------------------------
*/

export async function getProductsByVendor(

    shop,

    vendor,

    limit = PRODUCT_LIMITS.DEFAULT_LIMIT

) {

    return Product.find({

        shop,

        vendor,

        status: "active",

        deleted: false

    })

    .sort({ title: 1 })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Filter By Price
|--------------------------------------------------------------------------
*/

export async function getProductsByPrice(

    shop,

    minPrice = 0,

    maxPrice = Number.MAX_SAFE_INTEGER,

    limit = PRODUCT_LIMITS.DEFAULT_LIMIT

) {

    return Product.find({

        shop,

        status: "active",

        deleted: false,

        price: {

            $gte: minPrice,

            $lte: maxPrice

        }

    })

    .sort({ price: 1 })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Inventory Filter
|--------------------------------------------------------------------------
*/

export async function getInStockProducts(

    shop,

    limit = PRODUCT_LIMITS.DEFAULT_LIMIT

) {

    return Product.find({

        shop,

        status: "active",

        deleted: false,

        inventoryQuantity: {

            $gt: 0

        }

    })

    .sort({

        inventoryQuantity: -1

    })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Featured Products
|--------------------------------------------------------------------------
*/

export async function getFeaturedProducts(

    shop,

    limit = PRODUCT_LIMITS.DEFAULT_LIMIT

) {

    return Product.find({

        shop,

        featured: true,

        status: "active",

        deleted: false

    })

    .sort({

        totalSales: -1

    })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Active Products
|--------------------------------------------------------------------------
*/

export async function getActiveProducts(

    shop,

    limit = PRODUCT_LIMITS.MAX_LIMIT

) {

    return Product.find({

        shop,

        status: "active",

        deleted: false

    })

    .sort({

        updatedAt: -1

    })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Product Statistics
|--------------------------------------------------------------------------
*/

export async function getProductStatistics(shop) {

    const [

        total,

        active,

        featured,

        outOfStock

    ] = await Promise.all([

        Product.countDocuments({

            shop,

            deleted: false

        }),

        Product.countDocuments({

            shop,

            status: "active",

            deleted: false

        }),

        Product.countDocuments({

            shop,

            featured: true,

            status: "active",

            deleted: false

        }),

        Product.countDocuments({

            shop,

            status: "active",

            deleted: false,

            inventoryQuantity: {

                $lte: 0

            }

        })

    ]);

    return {

        total,

        active,

        featured,

        outOfStock

    };

}
/*
|--------------------------------------------------------------------------
| Sync Shopify Products
|--------------------------------------------------------------------------
*/

export async function syncShopifyProducts(

    shop,

    shopifyProducts = []

) {

    const results = {

        created: 0,

        updated: 0,

        failed: 0

    };

    for (const item of shopifyProducts) {

        try {

            const existing = await Product.findOne({

                shop,

                shopifyProductId: String(item.id)

            });

            const data = {

                shop,

                shopifyProductId: String(item.id),

                title: item.title,

                description: item.body_html || "",

                handle: item.handle,

                vendor: item.vendor || "",

                productType: item.product_type || "",

                status: item.status || "active",

                tags: item.tags
                    ? item.tags.split(",").map(tag => tag.trim())
                    : [],

                featuredImage:
                    item.image?.src || "",

                images:
                    item.images?.map(img => img.src) || [],

                price: Number(

                    item.variants?.[0]?.price || 0

                ),

                compareAtPrice: Number(

                    item.variants?.[0]?.compare_at_price || 0

                ),

                inventoryQuantity: Number(

                    item.variants?.[0]?.inventory_quantity || 0

                )

            };

            if (existing) {

                await Product.updateOne(

                    { _id: existing._id },

                    data

                );

                results.updated++;

            } else {

                await Product.create(data);

                results.created++;

            }

        } catch {

            results.failed++;

        }

    }

    return results;

}

/*
|--------------------------------------------------------------------------
| Bulk Import Products
|--------------------------------------------------------------------------
*/

export async function bulkImportProducts(

    products = []

) {

    if (!products.length) {

        return [];

    }

    return Product.insertMany(

        products,

        {

            ordered: false

        }

    );

}

/*
|--------------------------------------------------------------------------
| Bulk Update Products
|--------------------------------------------------------------------------
*/

export async function bulkUpdateProducts(

    updates = []

) {

    if (!updates.length) {

        return {

            modifiedCount: 0

        };

    }

    const operations = updates.map(item => ({

        updateOne: {

            filter: {

                _id: item._id

            },

            update: {

                $set: item.data

            }

        }

    }));

    return Product.bulkWrite(

        operations

    );

}

/*
|--------------------------------------------------------------------------
| Product Cache
|--------------------------------------------------------------------------
*/

const productCache = new Map();

export function cacheProduct(

    product

) {

    if (!product) {

        return;

    }

    productCache.set(

        String(product._id),

        {

            data: product,

            cachedAt: Date.now()

        }

    );

}

export function getCachedProduct(

    productId

) {

    const cached = productCache.get(

        String(productId)

    );

    if (!cached) {

        return null;

    }

    return cached.data;

}

export function clearProductCache() {

    productCache.clear();

}

/*
|--------------------------------------------------------------------------
| Search Optimization
|--------------------------------------------------------------------------
*/

export function normalizeSearchQuery(

    query = ""

) {

    return query

        .toLowerCase()

        .trim()

        .replace(/\s+/g, " ");

}

export function buildSearchRegex(

    keyword = ""

) {

    return new RegExp(

        normalizeSearchQuery(keyword),

        "i"

    );

}

export function scoreProductMatch(

    product,

    keyword

) {

    let score = 0;

    const search = normalizeSearchQuery(keyword);

    if (

        product.title?.toLowerCase().includes(search)

    ) {

        score += 50;

    }

    if (

        product.vendor?.toLowerCase().includes(search)

    ) {

        score += 20;

    }

    if (

        product.productType?.toLowerCase().includes(search)

    ) {

        score += 15;

    }

    if (

        product.tags?.some(tag =>

            tag.toLowerCase().includes(search)

        )

    ) {

        score += 15;

    }

    return score;

                }
/*
|--------------------------------------------------------------------------
| Product Analytics
|--------------------------------------------------------------------------
*/

export async function getProductAnalytics(shop) {

    const [
        totalProducts,
        activeProducts,
        featuredProducts,
        outOfStockProducts,
        totalInventory,
        totalValue,
        averagePrice,
        topSellingProducts,
        recentlyAddedProducts
    ] = await Promise.all([

        Product.countDocuments({
            shop,
            deleted: false
        }),

        Product.countDocuments({
            shop,
            status: "active",
            deleted: false
        }),

        Product.countDocuments({
            shop,
            featured: true,
            status: "active",
            deleted: false
        }),

        Product.countDocuments({
            shop,
            status: "active",
            deleted: false,
            inventoryQuantity: { $lte: 0 }
        }),

        Product.aggregate([
            {
                $match: {
                    shop,
                    deleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalInventory: {
                        $sum: "$inventoryQuantity"
                    }
                }
            }
        ]),

        Product.aggregate([
            {
                $match: {
                    shop,
                    deleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    inventoryValue: {
                        $sum: {
                            $multiply: [
                                "$price",
                                "$inventoryQuantity"
                            ]
                        }
                    }
                }
            }
        ]),

        Product.aggregate([
            {
                $match: {
                    shop,
                    status: "active",
                    deleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    averagePrice: {
                        $avg: "$price"
                    }
                }
            }
        ]),

        Product.find({
            shop,
            status: "active",
            deleted: false
        })
        .sort({
            totalSales: -1
        })
        .limit(10)
        .lean(),

        Product.find({
            shop,
            deleted: false
        })
        .sort({
            createdAt: -1
        })
        .limit(10)
        .lean()

    ]);

    return {

        totalProducts,

        activeProducts,

        featuredProducts,

        outOfStockProducts,

        totalInventory:
            totalInventory[0]?.totalInventory || 0,

        inventoryValue:
            totalValue[0]?.inventoryValue || 0,

        averagePrice:
            averagePrice[0]?.averagePrice || 0,

        topSellingProducts,

        recentlyAddedProducts

    };

}

/*
|--------------------------------------------------------------------------
| Product Service
|--------------------------------------------------------------------------
*/

export const ProductService = {

    createProduct,

    updateProduct,

    deleteProduct,

    getProductById,

    getProductByShopifyId,

    searchProducts,

    getProductsByCategory,

    getProductsByVendor,

    getProductsByPrice,

    getInStockProducts,

    getFeaturedProducts,

    getActiveProducts,

    getProductStatistics,

    syncShopifyProducts,

    bulkImportProducts,

    bulkUpdateProducts,

    rebuildProductCache,

    optimizeProductSearch,

    getProductAnalytics

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ProductService;
