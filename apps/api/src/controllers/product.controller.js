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
