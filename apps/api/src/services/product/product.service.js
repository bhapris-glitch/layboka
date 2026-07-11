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
