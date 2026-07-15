// layboka/apps/api/src/services/product/product.service.js
/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import mongoose from "mongoose";

import Product from "../../models/Product.js";
import Shop from "../../models/Shop.js";
import Conversation from "../../models/Conversation.js";

import {

    getShop,

    shopifyGraphQL

} from "../shopify/shopify.service.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const PRODUCT_CONFIG = {

    DEFAULT_LIMIT: 20,

    MAX_LIMIT: 250,

    DEFAULT_CURRENCY: "USD",

    DEFAULT_STATUS: "active",

    DEFAULT_SCORE: 0,

    CACHE_TTL: 60 * 5

};

/*
|--------------------------------------------------------------------------
| Map Shopify Product
|--------------------------------------------------------------------------
*/

export function mapShopifyProduct(

    shop,

    shopifyProduct

) {

    if (!shopifyProduct) {

        return null;

    }

    const firstVariant =

        shopifyProduct.variants?.edges?.[0]?.node ||

        shopifyProduct.variants?.[0] ||

        {};

    const firstImage =

        shopifyProduct.images?.edges?.[0]?.node ||

        shopifyProduct.images?.[0] ||

        {};

    return {

        shop: shop._id || shop,

        shopifyProductId: String(

            shopifyProduct.id || ""

        ),

        title:

            shopifyProduct.title || "",

        handle:

            shopifyProduct.handle || "",

        description:

            shopifyProduct.description ||

            shopifyProduct.descriptionHtml ||

            "",

        vendor:

            shopifyProduct.vendor || "",

        productType:

            shopifyProduct.productType || "",

        status:

            shopifyProduct.status ||

            PRODUCT_CONFIG.DEFAULT_STATUS,

        tags:

            Array.isArray(

                shopifyProduct.tags

            )

                ? shopifyProduct.tags

                : [],

        image:

            firstImage.url ||

            firstImage.src ||

            "",

        images:

            shopifyProduct.images?.edges?.map(

                ({ node }) => node.url

            ) ||

            [],

        variantId:

            String(

                firstVariant.id || ""

            ),

        sku:

            firstVariant.sku || "",

        barcode:

            firstVariant.barcode || "",

        inventoryQuantity:

            Number(

                firstVariant.inventoryQuantity || 0

            ),

        inventoryPolicy:

            firstVariant.inventoryPolicy ||

            "DENY",

        price:

            Number(

                firstVariant.price || 0

            ),

        compareAtPrice:

            Number(

                firstVariant.compareAtPrice || 0

            ),

        currency:

            PRODUCT_CONFIG.DEFAULT_CURRENCY,

        availableForSale:

            Boolean(

                shopifyProduct.availableForSale

            ),

        publishedAt:

            shopifyProduct.publishedAt ||

            null,

        updatedAt:

            shopifyProduct.updatedAt ||

            new Date()

    };

}

/*
|--------------------------------------------------------------------------
| Get Product
|--------------------------------------------------------------------------
*/

export async function getProduct(

    productId

) {

    if (

        !mongoose.Types.ObjectId.isValid(

            productId

        )

    ) {

        throw new Error(

            "Invalid product id."

        );

    }

    const product =

        await Product.findById(

            productId

        )

        .populate(

            "shop",

            "name shop"

        )

        .lean();

    if (!product) {

        throw new Error(

            "Product not found."

        );

    }

    return product;

}

/*
|--------------------------------------------------------------------------
| Get Product By Shopify ID
|--------------------------------------------------------------------------
*/

export async function getProductByShopifyId(

    shopId,

    shopifyProductId

) {

    return Product.findOne({

        shop: shopId,

        shopifyProductId: String(

            shopifyProductId

        ),

        deleted: false

    });

}
/*
|--------------------------------------------------------------------------
| Get Products
|--------------------------------------------------------------------------
*/

export async function getProducts(

    shopId,

    {

        page = 1,

        limit = PRODUCT_CONFIG.DEFAULT_LIMIT,

        status,

        vendor,

        productType,

        search

    } = {}

) {

    limit = Math.min(

        Number(limit),

        PRODUCT_CONFIG.MAX_LIMIT

    );

    const skip =

        (Number(page) - 1) * limit;

    const query = {

        shop: shopId,

        deleted: false

    };

    if (status) {

        query.status = status;

    }

    if (vendor) {

        query.vendor = vendor;

    }

    if (productType) {

        query.productType = productType;

    }

    if (search) {

        query.$text = {

            $search: search

        };

    }

    const [

        products,

        total

    ] = await Promise.all([

        Product.find(query)

            .sort({

                updatedAt: -1

            })

            .skip(skip)

            .limit(limit)

            .lean(),

        Product.countDocuments(query)

    ]);

    return {

        products,

        pagination: {

            page: Number(page),

            limit,

            total,

            pages: Math.ceil(

                total / limit

            )

        }

    };

}

/*
|--------------------------------------------------------------------------
| Search Products
|--------------------------------------------------------------------------
*/

export async function searchProducts(

    shopId,

    keyword,

    limit = 20

) {

    return Product.find({

        shop: shopId,

        deleted: false,

        $or: [

            {

                title: {

                    $regex: keyword,

                    $options: "i"

                }

            },

            {

                handle: {

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

                sku: {

                    $regex: keyword,

                    $options: "i"

                }

            },

            {

                tags: {

                    $regex: keyword,

                    $options: "i"

                }

            }

        ]

    })

    .sort({

        updatedAt: -1

    })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Get Featured Products
|--------------------------------------------------------------------------
*/

export async function getFeaturedProducts(

    shopId,

    limit = 8

) {

    return Product.find({

        shop: shopId,

        deleted: false,

        status: "active"

    })

    .sort({

        recommendationScore: -1,

        salesCount: -1,

        updatedAt: -1

    })

    .limit(limit)

    .lean();

}

/*
|--------------------------------------------------------------------------
| Get Related Products
|--------------------------------------------------------------------------
*/

export async function getRelatedProducts(

    productId,

    limit = 6

) {

    const product =

        await Product.findById(

            productId

        );

    if (!product) {

        return [];

    }

    return Product.find({

        _id: {

            $ne: product._id

        },

        shop: product.shop,

        deleted: false,

        status: "active",

        $or: [

            {

                productType:

                    product.productType

            },

            {

                vendor:

                    product.vendor

            },

            {

                tags: {

                    $in:

                        product.tags || []

                }

            }

        ]

    })

    .sort({

        recommendationScore: -1,

        salesCount: -1

    })

    .limit(limit)

    .lean();

}
/*
|--------------------------------------------------------------------------
| Sync Single Shopify Product
|--------------------------------------------------------------------------
*/

export async function syncShopifyProduct(

    shopId,

    shopifyProduct

) {

    const shop = await getShop(shopId);

    if (!shop) {

        throw new Error(

            "Shop not found."

        );

    }

    const productData = mapShopifyProduct(

        shop,

        shopifyProduct

    );

    let product = await getProductByShopifyId(

        shop._id,

        productData.shopifyProductId

    );

    if (product) {

        Object.assign(

            product,

            productData

        );

        product.lastSyncedAt =

            new Date();

        await product.save();

        return product;

    }

    product = await Product.create({

        ...productData,

        lastSyncedAt: new Date()

    });

    return product;

}

/*
|--------------------------------------------------------------------------
| Sync All Shopify Products
|--------------------------------------------------------------------------
*/

export async function syncAllProducts(

    shopId

) {

    const shop = await getShop(

        shopId

    );

    if (!shop) {

        throw new Error(

            "Shop not found."

        );

    }

    const query = `

    query Products($first:Int!) {

      products(first:$first) {

        edges {

          node {

            id

            title

            handle

            description

            vendor

            productType

            status

            tags

            availableForSale

            publishedAt

            updatedAt

            images(first:5) {

              edges {

                node {

                  url

                }

              }

            }

            variants(first:20) {

              edges {

                node {

                  id

                  sku

                  barcode

                  inventoryQuantity

                  inventoryPolicy

                  price

                  compareAtPrice

                }

              }

            }

          }

        }

      }

    }

    `;

    const data = await shopifyGraphQL(

        shop.session,

        query,

        {

            first:

                PRODUCT_CONFIG.MAX_LIMIT

        }

    );

    const products =

        data.products?.edges || [];

    const syncedProducts = [];

    for (const item of products) {

        const synced =

            await syncShopifyProduct(

                shopId,

                item.node

            );

        syncedProducts.push(

            synced

        );

    }

    return {

        success: true,

        synced:

            syncedProducts.length,

        products:

            syncedProducts

    };

}

/*
|--------------------------------------------------------------------------
| Update Inventory
|--------------------------------------------------------------------------
*/

export async function updateInventory(

    productId,

    inventoryQuantity

) {

    const product = await Product.findById(

        productId

    );

    if (!product) {

        throw new Error(

            "Product not found."

        );

    }

    product.inventoryQuantity =

        Number(

            inventoryQuantity

        );

    product.lastSyncedAt =

        new Date();

    await product.save();

    return product;

}

/*
|--------------------------------------------------------------------------
| Update Product Price
|--------------------------------------------------------------------------
*/

export async function updatePrice(

    productId,

    {

        price,

        compareAtPrice

    }

) {

    const product = await Product.findById(

        productId

    );

    if (!product) {

        throw new Error(

            "Product not found."

        );

    }

    if (

        price !== undefined

    ) {

        product.price =

            Number(price);

    }

    if (

        compareAtPrice !== undefined

    ) {

        product.compareAtPrice =

            Number(compareAtPrice);

    }

    product.lastSyncedAt =

        new Date();

    await product.save();

    return product;

}
/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export async function createProduct(

    productData

) {

    const product = await Product.create({

        ...productData,

        lastSyncedAt: new Date()

    });

    return product;

}

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

export async function updateProduct(

    productId,

    updateData

) {

    const product = await Product.findById(

        productId

    );

    if (!product) {

        throw new Error(

            "Product not found."

        );

    }

    Object.assign(

        product,

        updateData

    );

    product.lastSyncedAt =

        new Date();

    await product.save();

    return product;

}

/*
|--------------------------------------------------------------------------
| Archive Product
|--------------------------------------------------------------------------
*/

export async function archiveProduct(

    productId

) {

    const product = await Product.findById(

        productId

    );

    if (!product) {

        throw new Error(

            "Product not found."

        );

    }

    product.archived = true;

    product.archivedAt =

        new Date();

    await product.save();

    return product;

}

/*
|--------------------------------------------------------------------------
| Delete Product (Soft Delete)
|--------------------------------------------------------------------------
*/

export async function deleteProduct(

    productId

) {

    const product = await Product.findById(

        productId

    );

    if (!product) {

        throw new Error(

            "Product not found."

        );

    }

    product.deleted = true;

    product.deletedAt =

        new Date();

    await product.save();

    return {

        success: true,

        message: "Product deleted successfully."

    };

}

/*
|--------------------------------------------------------------------------
| Product Service
|--------------------------------------------------------------------------
*/

export const ProductService = {

    mapShopifyProduct,

    getProduct,

    getProductByShopifyId,

    getProducts,

    searchProducts,

    getFeaturedProducts,

    getRelatedProducts,

    syncShopifyProduct,

    syncAllProducts,

    updateInventory,

    updatePrice,

    createProduct,

    updateProduct,

    archiveProduct,

    deleteProduct,

    getProductAnalytics,

    getProductStatistics

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ProductService;
