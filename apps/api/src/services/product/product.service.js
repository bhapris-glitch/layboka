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
