// layboka/apps/api/src/services/shopify/inventory.service.js
import Product from "../../models/Product.js";
import Shop from "../../models/Shop.js";
import logger from "../../config/logger.js";
import shopifyService from "./shopify.service.js";

/*
|--------------------------------------------------------------------------
| Inventory Configuration
|--------------------------------------------------------------------------
*/

export const INVENTORY_CONFIG = Object.freeze({

    LOW_STOCK_THRESHOLD: 10,

    OUT_OF_STOCK: 0,

    DEFAULT_LOCATION: "default",

    MAX_BATCH_SIZE: 100,

    CACHE_TTL: 300

});

/*
|--------------------------------------------------------------------------
| Get Product Inventory
|--------------------------------------------------------------------------
*/

export async function getInventory(

    productId

) {

    return Product.findById(productId)
        .select(
            "inventoryQuantity inventoryPolicy inventoryManagement availableForSale"
        )
        .lean();

}

/*
|--------------------------------------------------------------------------
| Get Inventory By Shopify Product ID
|--------------------------------------------------------------------------
*/

export async function getInventoryByShopifyId(

    shopId,

    shopifyProductId

) {

    return Product.findOne({

        shop: shopId,

        shopifyProductId,

        deleted: false

    })
    .select(
        "inventoryQuantity inventoryPolicy inventoryManagement availableForSale"
    )
    .lean();

}

/*
|--------------------------------------------------------------------------
| Check Product Availability
|--------------------------------------------------------------------------
*/

export async function isProductAvailable(

    productId,

    quantity = 1

) {

    const product = await getInventory(productId);

    if (!product) {

        return false;

    }

    return (

        product.availableForSale === true &&

        product.inventoryQuantity >= quantity

    );

}

/*
|--------------------------------------------------------------------------
| Check Low Stock
|--------------------------------------------------------------------------
*/

export function isLowStock(

    product

) {

    if (!product) {

        return false;

    }

    return (

        product.inventoryQuantity <=

        INVENTORY_CONFIG.LOW_STOCK_THRESHOLD &&

        product.inventoryQuantity >

        INVENTORY_CONFIG.OUT_OF_STOCK

    );

}

/*
|--------------------------------------------------------------------------
| Check Out Of Stock
|--------------------------------------------------------------------------
*/

export function isOutOfStock(

    product

) {

    if (!product) {

        return true;

    }

    return (

        product.inventoryQuantity <=

        INVENTORY_CONFIG.OUT_OF_STOCK ||

        product.availableForSale === false

    );

}
/*
|--------------------------------------------------------------------------
| Inventory Synchronization
|--------------------------------------------------------------------------
*/

export async function syncInventory(shop) {
    ...
}

/*
|--------------------------------------------------------------------------
| Batch Inventory Update
|--------------------------------------------------------------------------
*/

export async function batchUpdateInventory(shop, products) {
    ...
}

/*
|--------------------------------------------------------------------------
| Inventory Adjustment
|--------------------------------------------------------------------------
*/

export async function adjustInventory(product, quantity, reason = "") {
    ...
}

/*
|--------------------------------------------------------------------------
| Reserve Inventory
|--------------------------------------------------------------------------
*/

export async function reserveInventory(product, quantity) {
    ...
}

/*
|--------------------------------------------------------------------------
| Release Reserved Inventory
|--------------------------------------------------------------------------
*/

export async function releaseReservedInventory(product, quantity) {
    ...
}

/*
|--------------------------------------------------------------------------
| Validate Inventory
|--------------------------------------------------------------------------
*/

export async function validateInventory(product, quantity) {
    ...
}

/*
|--------------------------------------------------------------------------
| Update Sync Timestamp
|--------------------------------------------------------------------------
*/

export async function updateInventorySyncTime(shop) {
    ...
}

/*
|--------------------------------------------------------------------------
| Inventory Error Handler
|--------------------------------------------------------------------------
*/

export function handleInventoryError(error) {
    ...
}

/*
|--------------------------------------------------------------------------
| Inventory Service
|--------------------------------------------------------------------------
*/

export const InventoryService = {

    getInventory,

    getInventoryByProduct,

    updateInventory,

    syncInventory,

    batchUpdateInventory,

    adjustInventory,

    reserveInventory,

    releaseReservedInventory,

    validateInventory,

    updateInventorySyncTime,

    handleInventoryError

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default InventoryService;
