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
/*
|--------------------------------------------------------------------------
| Get Inventory Levels
|--------------------------------------------------------------------------
*/

async function getInventoryLevels(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const {

            page,

            limit,

            status,

            search

        } = req.query;

        const result =

            await InventoryService.getInventoryLevels(

                shopId,

                {

                    page,

                    limit,

                    status,

                    search

                }

            );

        return successResponse(

            res,

            result,

            "Inventory levels retrieved successfully."

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
| Update Inventory
|--------------------------------------------------------------------------
*/

async function updateInventory(

    req,

    res

) {

    try {

        const {

            inventoryId

        } = req.params;

        const inventory =

            await InventoryService.updateInventory(

                inventoryId,

                req.body

            );

        return successResponse(

            res,

            inventory,

            "Inventory updated successfully."

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
| Adjust Inventory
|--------------------------------------------------------------------------
*/

async function adjustInventory(

    req,

    res

) {

    try {

        const {

            inventoryId

        } = req.params;

        const {

            quantity,

            reason

        } = req.body;

        const inventory =

            await InventoryService.adjustInventory(

                inventoryId,

                quantity,

                reason

            );

        return successResponse(

            res,

            inventory,

            "Inventory adjusted successfully."

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
| Reserve Inventory
|--------------------------------------------------------------------------
*/

async function reserveInventory(

    req,

    res

) {

    try {

        const {

            inventoryId

        } = req.params;

        const {

            quantity

        } = req.body;

        const inventory =

            await InventoryService.reserveInventory(

                inventoryId,

                quantity

            );

        return successResponse(

            res,

            inventory,

            "Inventory reserved successfully."

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
| Release Inventory
|--------------------------------------------------------------------------
*/

async function releaseInventory(

    req,

    res

) {

    try {

        const {

            inventoryId

        } = req.params;

        const {

            quantity

        } = req.body;

        const inventory =

            await InventoryService.releaseInventory(

                inventoryId,

                quantity

            );

        return successResponse(

            res,

            inventory,

            "Reserved inventory released successfully."

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
| Sync Inventory
|--------------------------------------------------------------------------
*/

async function syncInventory(

    req,

    res

) {

    try {

        const {

            inventoryId

        } = req.params;

        const inventory =

            await InventoryService.syncInventory(

                inventoryId

            );

        return successResponse(

            res,

            inventory,

            "Inventory synchronized successfully."

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
| Sync All Inventory
|--------------------------------------------------------------------------
*/

async function syncAllInventory(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const result =

            await InventoryService.syncAllInventory(

                shopId

            );

        return successResponse(

            res,

            result,

            "Inventory synchronized successfully."

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
| Low Stock Products
|--------------------------------------------------------------------------
*/

async function lowStockProducts(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const result =

            await InventoryService.lowStockProducts(

                shopId,

                req.query

            );

        return successResponse(

            res,

            result,

            "Low stock products retrieved successfully."

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
| Out Of Stock Products
|--------------------------------------------------------------------------
*/

async function outOfStockProducts(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const result =

            await InventoryService.outOfStockProducts(

                shopId,

                req.query

            );

        return successResponse(

            res,

            result,

            "Out of stock products retrieved successfully."

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
| Search Inventory
|--------------------------------------------------------------------------
*/

async function searchInventory(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const {

            keyword,

            page,

            limit

        } = req.query;

        const result =

            await InventoryService.searchInventory(

                shopId,

                keyword,

                {

                    page,

                    limit

                }

            );

        return successResponse(

            res,

            result,

            "Inventory search completed successfully."

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
| Inventory Analytics
|--------------------------------------------------------------------------
*/

async function inventoryAnalytics(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const analytics =

            await InventoryService.inventoryAnalytics(

                shopId

            );

        return successResponse(

            res,

            analytics,

            "Inventory analytics retrieved successfully."

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
| Inventory Statistics
|--------------------------------------------------------------------------
*/

async function inventoryStatistics(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const statistics =

            await InventoryService.inventoryStatistics(

                shopId

            );

        return successResponse(

            res,

            statistics,

            "Inventory statistics retrieved successfully."

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
| Calculate Inventory Value
|--------------------------------------------------------------------------
*/

async function calculateInventoryValue(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const value =

            await InventoryService.calculateInventoryValue(

                shopId

            );

        return successResponse(

            res,

            value,

            "Inventory value calculated successfully."

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
| Bulk Update Inventory
|--------------------------------------------------------------------------
*/

async function bulkUpdateInventory(

    req,

    res

) {

    try {

        const {

            updates

        } = req.body;

        const result =

            await InventoryService.bulkUpdateInventory(

                updates

            );

        return successResponse(

            res,

            result,

            "Bulk inventory update completed successfully."

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
| Bulk Reserve Inventory
|--------------------------------------------------------------------------
*/

async function bulkReserveInventory(

    req,

    res

) {

    try {

        const {

            reservations

        } = req.body;

        const result =

            await InventoryService.bulkReserveInventory(

                reservations

            );

        return successResponse(

            res,

            result,

            "Bulk inventory reservation completed successfully."

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
| Bulk Release Inventory
|--------------------------------------------------------------------------
*/

async function bulkReleaseInventory(

    req,

    res

) {

    try {

        const {

            releases

        } = req.body;

        const result =

            await InventoryService.bulkReleaseInventory(

                releases

            );

        return successResponse(

            res,

            result,

            "Bulk inventory release completed successfully."

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
| Handle Inventory Level Updated
|--------------------------------------------------------------------------
*/

async function handleInventoryLevelUpdated(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const result =

            await InventoryService.handleInventoryLevelUpdated(

                shopId,

                req.body

            );

        return successResponse(

            res,

            result,

            "Inventory level updated successfully."

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
| Handle Inventory Adjustment
|--------------------------------------------------------------------------
*/

async function handleInventoryAdjustment(

    req,

    res

) {

    try {

        const {

            inventoryId,

            quantity,

            reason

        } = req.body;

        const result =

            await InventoryService.handleInventoryAdjustment(

                inventoryId,

                quantity,

                reason

            );

        return successResponse(

            res,

            result,

            "Inventory adjustment processed successfully."

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
| Handle Inventory Sync
|--------------------------------------------------------------------------
*/

async function handleInventorySync(

    req,

    res

) {

    try {

        const shopId =

            req.shop._id;

        const result =

            await InventoryService.handleInventorySync(

                shopId

            );

        return successResponse(

            res,

            result,

            "Inventory synchronization completed successfully."

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
| Controller Helpers
|--------------------------------------------------------------------------
*/

function getShopId(

    req

) {

    return req.shop?._id;

}


function getInventoryId(

    req

) {

    return req.params.inventoryId;

}


/*
|--------------------------------------------------------------------------
| Controller Error Handler
|--------------------------------------------------------------------------
*/

function handleControllerError(

    res,

    error

) {

    return errorResponse(

        res,

        error,

        error.statusCode ||

        500

    );

}
/*
|--------------------------------------------------------------------------
| Inventory Controller
|--------------------------------------------------------------------------
*/

export const InventoryController = {

    getInventory,

    getInventoryByProduct,

    getInventoryLevels,

    updateInventory,

    adjustInventory,

    reserveInventory,

    releaseInventory,

    syncInventory,

    syncAllInventory,

    lowStockProducts,

    outOfStockProducts,

    searchInventory,

    inventoryAnalytics,

    inventoryStatistics,

    calculateInventoryValue,

    bulkUpdateInventory,

    bulkReserveInventory,

    bulkReleaseInventory,

    handleInventoryLevelUpdated,

    handleInventoryAdjustment,

    handleInventorySync

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    getInventory,

    getInventoryByProduct,

    getInventoryLevels,

    updateInventory,

    adjustInventory,

    reserveInventory,

    releaseInventory,

    syncInventory,

    syncAllInventory,

    lowStockProducts,

    outOfStockProducts,

    searchInventory,

    inventoryAnalytics,

    inventoryStatistics,

    calculateInventoryValue,

    bulkUpdateInventory,

    bulkReserveInventory,

    bulkReleaseInventory,

    handleInventoryLevelUpdated,

    handleInventoryAdjustment,

    handleInventorySync

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default InventoryController;
