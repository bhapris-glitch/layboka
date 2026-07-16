/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import { InventoryService } from "../services/inventory/inventory.service.js";

/*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/

function successResponse(

    res,

    data,

    message = "Success",

    statusCode = 200

) {

    return res.status(

        statusCode

    ).json({

        success: true,

        message,

        data

    });

}


function errorResponse(

    res,

    error,

    statusCode = 500

) {

    return res.status(

        error.statusCode ||

        statusCode

    ).json({

        success: false,

        message:

            error.message ||

            "Internal Server Error"

    });

}


/*
|--------------------------------------------------------------------------
| Get Inventory
|--------------------------------------------------------------------------
*/

async function getInventory(

    req,

    res

) {

    try {

        const {

            inventoryId

        } = req.params;

        const inventory =

            await InventoryService.getInventory(

                inventoryId

            );

        return successResponse(

            res,

            inventory,

            "Inventory retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}


/*
|--------------------------------------------------------------------------
| Get Inventory By Product
|--------------------------------------------------------------------------
*/

async function getInventoryByProduct(

    req,

    res

) {

    try {

        const {

            productId

        } = req.params;

        const shopId =

            req.shop._id;

        const inventory =

            await InventoryService.getInventoryByProduct(

                shopId,

                productId

            );

        return successResponse(

            res,

            inventory,

            "Inventory retrieved successfully."

        );

    }

    catch (

        error

    ) {

        return errorResponse(

            res,

            error

        );

    }

}
