/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import ProductService from "../services/product/product.service.js";

/*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/

const successResponse = (

    res,

    message,

    data = null,

    status = 200

) => {

    return res.status(status).json({

        success: true,

        message,

        data

    });

};

const errorResponse = (

    res,

    error,

    status = 500

) => {

    return res.status(status).json({

        success: false,

        message:

            error.message ||

            "Internal Server Error"

    });

};

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export async function create(

    req,

    res

) {

    try {

        const product =

            await ProductService.createProduct(

                req.body

            );

        return successResponse(

            res,

            "Product created successfully.",

            product,

            201

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

export async function update(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const product =

            await ProductService.updateProduct(

                productId,

                req.body

            );

        return successResponse(

            res,

            "Product updated successfully.",

            product

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Delete Product (Soft Delete)
|--------------------------------------------------------------------------
*/

export async function remove(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const result =

            await ProductService.deleteProduct(

                productId

            );

        return successResponse(

            res,

            "Product deleted successfully.",

            result

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Archive Product
|--------------------------------------------------------------------------
*/

export async function archive(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const product =

            await ProductService.archiveProduct(

                productId

            );

        return successResponse(

            res,

            "Product archived successfully.",

            product

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Get Single Product
|--------------------------------------------------------------------------
*/

export async function getOne(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const product =

            await ProductService.getProduct(

                productId

            );

        return successResponse(

            res,

            "Product fetched successfully.",

            product

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

export async function getAll(

    req,

    res

) {

    try {

        const {

            page,

            limit,

            status,

            vendor,

            productType,

            search

        } = req.query;

        const products =

            await ProductService.getProducts(

                req.shop._id,

                {

                    page,

                    limit,

                    status,

                    vendor,

                    productType,

                    search

                }

            );

        return successResponse(

            res,

            "Products fetched successfully.",

            products

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Search Products
|--------------------------------------------------------------------------
*/

export async function search(

    req,

    res

) {

    try {

        const {

            keyword,

            limit

        } = req.query;

        if (!keyword) {

            return errorResponse(

                res,

                new Error(

                    "Search keyword is required."

                ),

                400

            );

        }

        const products =

            await ProductService.searchProducts(

                req.shop._id,

                keyword,

                limit

            );

        return successResponse(

            res,

            "Products retrieved successfully.",

            products

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Get Featured Products
|--------------------------------------------------------------------------
*/

export async function getFeatured(

    req,

    res

) {

    try {

        const {

            limit

        } = req.query;

        const products =

            await ProductService.getFeaturedProducts(

                req.shop._id,

                limit

            );

        return successResponse(

            res,

            "Featured products retrieved successfully.",

            products

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Get Related Products
|--------------------------------------------------------------------------
*/

export async function getRelated(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const {

            limit

        } = req.query;

        const products =

            await ProductService.getRelatedProducts(

                productId,

                limit

            );

        return successResponse(

            res,

            "Related products retrieved successfully.",

            products

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

            }
/*
|--------------------------------------------------------------------------
| Sync Single Shopify Product
|--------------------------------------------------------------------------
*/

export async function syncProduct(

    req,

    res

) {

    try {

        const {

            shopifyProduct

        } = req.body;

        if (!shopifyProduct) {

            return errorResponse(

                res,

                new Error(

                    "Shopify product data is required."

                ),

                400

            );

        }

        const product =

            await ProductService.syncShopifyProduct(

                req.shop._id,

                shopifyProduct

            );

        return successResponse(

            res,

            "Product synchronized successfully.",

            product

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Sync All Shopify Products
|--------------------------------------------------------------------------
*/

export async function syncAllProducts(

    req,

    res

) {

    try {

        const result =

            await ProductService.syncAllProducts(

                req.shop._id

            );

        return successResponse(

            res,

            "All Shopify products synchronized successfully.",

            result

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Update Product Inventory
|--------------------------------------------------------------------------
*/

export async function updateInventory(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const {

            inventory

        } = req.body;

        if (inventory === undefined) {

            return errorResponse(

                res,

                new Error(

                    "inventory is required."

                ),

                400

            );

        }

        const product =

            await ProductService.updateInventory(

                productId,

                inventory

            );

        return successResponse(

            res,

            "Inventory updated successfully.",

            product

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Update Product Price
|--------------------------------------------------------------------------
*/

export async function updatePrice(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const {

            price,

            compareAtPrice

        } = req.body;

        const product =

            await ProductService.updatePrice(

                productId,

                {

                    price,

                    compareAtPrice

                }

            );

        return successResponse(

            res,

            "Product price updated successfully.",

            product

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Product Analytics
|--------------------------------------------------------------------------
*/

export async function analytics(

    req,

    res

) {

    try {

        const analytics =

            await ProductService.getProductAnalytics(

                req.shop._id,

                req.query

            );

        return successResponse(

            res,

            "Product analytics retrieved successfully.",

            analytics

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}

/*
|--------------------------------------------------------------------------
| Product Statistics
|--------------------------------------------------------------------------
*/

export async function statistics(

    req,

    res

) {

    try {

        const statistics =

            await ProductService.getProductStatistics(

                req.shop._id

            );

        return successResponse(

            res,

            "Product statistics retrieved successfully.",

            statistics

        );

    } catch (error) {

        return errorResponse(

            res,

            error

        );

    }

}
/*
|--------------------------------------------------------------------------
| Product Controller
|--------------------------------------------------------------------------
*/

export const ProductController = {

    create,

    update,

    remove,

    archive,

    getOne,

    getAll,

    search,

    getFeatured,

    getRelated,

    syncProduct,

    syncAllProducts,

    updateInventory,

    updatePrice,

    analytics,

    statistics

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ProductController;
