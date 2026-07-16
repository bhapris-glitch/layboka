/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import { Router } from "express";

import {

    InventoryController

} from "../controllers/inventory.controller.js";

import authenticate from "../middleware/authenticate.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = Router();


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

router.use(

    authenticate

);


/*
|--------------------------------------------------------------------------
| Route Controller Alias
|--------------------------------------------------------------------------
*/

const {

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

} = InventoryController;

/*
|--------------------------------------------------------------------------
| Inventory Read Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/",

    getInventoryLevels

);


router.get(

    "/:inventoryId",

    getInventory

);


router.get(

    "/product/:productId",

    getInventoryByProduct

);
/*
|--------------------------------------------------------------------------
| Inventory Update Routes
|--------------------------------------------------------------------------
*/

router.patch(

    "/:inventoryId",

    updateInventory

);


router.post(

    "/:inventoryId/adjust",

    adjustInventory

);


router.post(

    "/:inventoryId/reserve",

    reserveInventory

);


router.post(

    "/:inventoryId/release",

    releaseInventory

);
/*
|--------------------------------------------------------------------------
| Inventory Sync & Stock Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/:inventoryId/sync",

    syncInventory

);


router.post(

    "/sync-all",

    syncAllInventory

);


router.get(

    "/low-stock",

    lowStockProducts

);


router.get(

    "/out-of-stock",

    outOfStockProducts

);
/*
|--------------------------------------------------------------------------
| Inventory Analytics Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/search",

    searchInventory

);


router.get(

    "/analytics",

    inventoryAnalytics

);


router.get(

    "/statistics",

    inventoryStatistics

);


router.get(

    "/inventory-value",

    calculateInventoryValue

);


/*
|--------------------------------------------------------------------------
| Bulk Inventory Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/bulk-update",

    bulkUpdateInventory

);


router.post(

    "/bulk-reserve",

    bulkReserveInventory

);


router.post(

    "/bulk-release",

    bulkReleaseInventory

);
/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
