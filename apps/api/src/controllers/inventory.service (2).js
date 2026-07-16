/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Inventory from "../../models/Inventory.js";
import Product from "../../models/Product.js";
import Shop from "../../models/Shop.js";

import ShopifyService from "../shopify/shopify.service.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const {

    SHOPIFY_API_VERSION

} = process.env;

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

function mapInventory(

    inventory

) {

    if (!inventory) {

        return null;

    }

    return {

        id: inventory._id,

        shop: inventory.shop,

        product: inventory.product,

        shopifyInventoryItemId:

            inventory.shopifyInventoryItemId,

        shopifyLocationId:

            inventory.shopifyLocationId,

        sku:

            inventory.sku,

        barcode:

            inventory.barcode,

        quantity:

            inventory.quantity,

        reservedQuantity:

            inventory.reservedQuantity,

        availableQuantity:

            inventory.availableQuantity,

        incomingQuantity:

            inventory.incomingQuantity,

        committedQuantity:

            inventory.committedQuantity,

        reorderPoint:

            inventory.reorderPoint,

        reorderQuantity:

            inventory.reorderQuantity,

        safetyStock:

            inventory.safetyStock,

        status:

            inventory.status,

        inventoryValue:

            inventory.inventoryValue,

        syncStatus:

            inventory.syncStatus,

        lastSyncedAt:

            inventory.lastSyncedAt,

        createdAt:

            inventory.createdAt,

        updatedAt:

            inventory.updatedAt

    };

}

/*
|--------------------------------------------------------------------------
| Find Inventory
|--------------------------------------------------------------------------
*/

async function findInventory(

    inventoryId

) {

    return Inventory.findById(

        inventoryId

    )

        .populate(

            "product"

        )

        .populate(

            "shop"

        );

}

/*
|--------------------------------------------------------------------------
| Find Inventory By Product
|--------------------------------------------------------------------------
*/

async function findInventoryByProduct(

    shopId,

    productId

) {

    return Inventory.findOne({

        shop: shopId,

        product: productId,

        deleted: false

    })

        .populate(

            "product"

        );

}
/*
|--------------------------------------------------------------------------
| Get Inventory
|--------------------------------------------------------------------------
*/

async function getInventory(

    inventoryId

) {

    const inventory =

        await findInventory(

            inventoryId

        );

    if (

        !inventory ||

        inventory.deleted

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    return mapInventory(

        inventory

    );

}

/*
|--------------------------------------------------------------------------
| Get Inventory By Product
|--------------------------------------------------------------------------
*/

async function getInventoryByProduct(

    shopId,

    productId

) {

    const inventory =

        await findInventoryByProduct(

            shopId,

            productId

        );

    if (

        !inventory

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    return mapInventory(

        inventory

    );

}

/*
|--------------------------------------------------------------------------
| Get Inventory Levels
|--------------------------------------------------------------------------
*/

async function getInventoryLevels(

    shopId,

    {

        page = 1,

        limit = 20,

        status,

        search

    } = {}

) {

    const query = {

        shop: shopId,

        deleted: false

    };

    if (

        status

    ) {

        query.status = status;

    }

    if (

        search

    ) {

        const products =

            await Product.find({

                shop: shopId,

                $or: [

                    {

                        title: {

                            $regex: search,

                            $options: "i"

                        }

                    },

                    {

                        sku: {

                            $regex: search,

                            $options: "i"

                        }

                    }

                ]

            }).select(

                "_id"

            );

        query.product = {

            $in: products.map(

                product => product._id

            )

        };

    }

    const skip =

        (

            Number(page) - 1

        ) *

        Number(limit);

    const [

        inventories,

        total

    ] = await Promise.all([

        Inventory.find(

            query

        )

            .populate(

                "product"

            )

            .sort({

                updatedAt: -1

            })

            .skip(

                skip

            )

            .limit(

                Number(limit)

            ),

        Inventory.countDocuments(

            query

        )

    ]);

    return {

        items: inventories.map(

            mapInventory

        ),

        pagination: {

            page:

                Number(page),

            limit:

                Number(limit),

            total,

            pages:

                Math.ceil(

                    total /

                    Number(limit)

                )

        }

    };

}
/*
|--------------------------------------------------------------------------
| Update Inventory
|--------------------------------------------------------------------------
*/

async function updateInventory(

    inventoryId,

    updateData = {}

) {

    const inventory =

        await findInventory(

            inventoryId

        );

    if (

        !inventory ||

        inventory.deleted

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    const allowedFields = [

        "reorderPoint",

        "reorderQuantity",

        "safetyStock",

        "trackQuantity",

        "allowBackorder",

        "continueSelling",

        "warehouse",

        "locationName",

        "aisle",

        "bin",

        "costPrice",

        "averageCost",

        "notes",

        "tags",

        "metadata"

    ];

    for (

        const field of allowedFields

    ) {

        if (

            Object.prototype.hasOwnProperty.call(

                updateData,

                field

            )

        ) {

            inventory[field] =

                updateData[field];

        }

    }

    inventory.lastCheckedAt =

        new Date();

    await inventory.save();

    return mapInventory(

        inventory

    );

}


/*
|--------------------------------------------------------------------------
| Adjust Inventory
|--------------------------------------------------------------------------
*/

async function adjustInventory(

    inventoryId,

    quantity,

    reason = "Manual adjustment"

) {

    const inventory =

        await findInventory(

            inventoryId

        );

    if (

        !inventory ||

        inventory.deleted

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    await inventory.adjustQuantity(

        Number(quantity),

        reason

    );

    inventory.lastCheckedAt =

        new Date();

    await inventory.save();

    return mapInventory(

        inventory

    );

}


/*
|--------------------------------------------------------------------------
| Reserve Inventory
|--------------------------------------------------------------------------
*/

async function reserveInventory(

    inventoryId,

    quantity

) {

    const inventory =

        await findInventory(

            inventoryId

        );

    if (

        !inventory ||

        inventory.deleted

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    await inventory.reserveStock(

        Number(quantity)

    );

    inventory.lastCheckedAt =

        new Date();

    await inventory.save();

    return mapInventory(

        inventory

    );

  }
/*
|--------------------------------------------------------------------------
| Release Inventory
|--------------------------------------------------------------------------
*/

async function releaseInventory(

    inventoryId,

    quantity

) {

    const inventory =

        await findInventory(

            inventoryId

        );

    if (

        !inventory ||

        inventory.deleted

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    await inventory.releaseReservedStock(

        Number(quantity)

    );

    inventory.lastCheckedAt =

        new Date();

    await inventory.save();

    return mapInventory(

        inventory

    );

}


/*
|--------------------------------------------------------------------------
| Sync Inventory
|--------------------------------------------------------------------------
*/

async function syncInventory(

    inventoryId

) {

    const inventory =

        await findInventory(

            inventoryId

        );

    if (

        !inventory ||

        inventory.deleted

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    const shop =

        await Shop.findById(

            inventory.shop

        );

    if (

        !shop

    ) {

        throw new Error(

            "Shop not found."

        );

    }

    const shopifyInventory =

        await ShopifyService.getInventoryLevel(

            shop,

            inventory.shopifyInventoryItemId,

            inventory.shopifyLocationId

        );

    inventory.quantity =

        Number(

            shopifyInventory.available ||

            0

        );

    inventory.lastSyncedAt =

        new Date();

    inventory.lastCheckedAt =

        new Date();

    inventory.syncStatus =

        "synced";

    await inventory.save();

    return mapInventory(

        inventory

    );

}


/*
|--------------------------------------------------------------------------
| Sync All Inventory
|--------------------------------------------------------------------------
*/

async function syncAllInventory(

    shopId

) {

    const inventories =

        await Inventory.find({

            shop: shopId,

            deleted: false

        });

    const results = [];

    for (

        const inventory of inventories

    ) {

        try {

            const syncedInventory =

                await syncInventory(

                    inventory._id

                );

            results.push(

                syncedInventory

            );

        }

        catch (error) {

            results.push({

                inventoryId:

                    inventory._id,

                success: false,

                error:

                    error.message

            });

        }

    }

    return results;

  }
/*
|--------------------------------------------------------------------------
| Low Stock Products
|--------------------------------------------------------------------------
*/

async function lowStockProducts(

    shopId,

    options = {}

) {

    const {

        limit = 50

    } = options;

    const inventories =

        await Inventory.find({

            shop: shopId,

            deleted: false,

            status: "low_stock"

        })

        .populate(

            "product"

        )

        .sort({

            availableQuantity: 1,

            updatedAt: -1

        })

        .limit(

            Number(limit)

        );

    return inventories.map(

        mapInventory

    );

}


/*
|--------------------------------------------------------------------------
| Out Of Stock Products
|--------------------------------------------------------------------------
*/

async function outOfStockProducts(

    shopId,

    options = {}

) {

    const {

        limit = 50

    } = options;

    const inventories =

        await Inventory.find({

            shop: shopId,

            deleted: false,

            status: "out_of_stock"

        })

        .populate(

            "product"

        )

        .sort({

            updatedAt: -1

        })

        .limit(

            Number(limit)

        );

    return inventories.map(

        mapInventory

    );

}


/*
|--------------------------------------------------------------------------
| Search Inventory
|--------------------------------------------------------------------------
*/

async function searchInventory(

    shopId,

    keyword,

    options = {}

) {

    const {

        page = 1,

        limit = 20

    } = options;

    const products =

        await Product.find({

            shop: shopId,

            $or: [

                {

                    title: {

                        $regex: keyword,

                        $options: "i"

                    }

                },

                {

                    sku: {

                        $regex: keyword,

                        $options: "i"

                    }

                }

            ]

        }).select(

            "_id"

        );

    const productIds =

        products.map(

            product => product._id

        );

    const query = {

        shop: shopId,

        deleted: false,

        product: {

            $in: productIds

        }

    };

    const skip =

        (

            Number(page) - 1

        ) *

        Number(limit);

    const [

        inventories,

        total

    ] = await Promise.all([

        Inventory.find(

            query

        )

        .populate(

            "product"

        )

        .sort({

            updatedAt: -1

        })

        .skip(

            skip

        )

        .limit(

            Number(limit)

        ),

        Inventory.countDocuments(

            query

        )

    ]);

    return {

        items: inventories.map(

            mapInventory

        ),

        pagination: {

            page:

                Number(page),

            limit:

                Number(limit),

            total,

            pages:

                Math.ceil(

                    total /

                    Number(limit)

                )

        }

    };

                         }
/*
|--------------------------------------------------------------------------
| Inventory Analytics
|--------------------------------------------------------------------------
*/

async function inventoryAnalytics(

    shopId

) {

    const [

        totalProducts,

        inStock,

        lowStock,

        outOfStock,

        inventoryValue

    ] = await Promise.all([

        Inventory.countDocuments({

            shop: shopId,

            deleted: false

        }),

        Inventory.countDocuments({

            shop: shopId,

            deleted: false,

            status: "in_stock"

        }),

        Inventory.countDocuments({

            shop: shopId,

            deleted: false,

            status: "low_stock"

        }),

        Inventory.countDocuments({

            shop: shopId,

            deleted: false,

            status: "out_of_stock"

        }),

        calculateInventoryValue(

            shopId

        )

    ]);

    return {

        totalProducts,

        inStock,

        lowStock,

        outOfStock,

        inventoryValue

    };

}


/*
|--------------------------------------------------------------------------
| Inventory Statistics
|--------------------------------------------------------------------------
*/

async function inventoryStatistics(

    shopId

) {

    const statistics =

        await Inventory.aggregate([

            {

                $match: {

                    shop: shopId,

                    deleted: false

                }

            },

            {

                $group: {

                    _id: "$status",

                    totalItems: {

                        $sum: 1

                    },

                    totalQuantity: {

                        $sum: "$quantity"

                    },

                    totalAvailableQuantity: {

                        $sum: "$availableQuantity"

                    },

                    totalReservedQuantity: {

                        $sum: "$reservedQuantity"

                    },

                    totalInventoryValue: {

                        $sum: "$inventoryValue"

                    }

                }

            }

        ]);

    return statistics;

}


/*
|--------------------------------------------------------------------------
| Calculate Inventory Value
|--------------------------------------------------------------------------
*/

async function calculateInventoryValue(

    shopId

) {

    const result =

        await Inventory.aggregate([

            {

                $match: {

                    shop: shopId,

                    deleted: false

                }

            },

            {

                $group: {

                    _id: null,

                    totalValue: {

                        $sum: "$inventoryValue"

                    },

                    totalQuantity: {

                        $sum: "$quantity"

                    },

                    averageCost: {

                        $avg: "$averageCost"

                    }

                }

            }

        ]);

    if (

        result.length === 0

    ) {

        return {

            totalValue: 0,

            totalQuantity: 0,

            averageCost: 0

        };

    }

    return {

        totalValue:

            result[0].totalValue || 0,

        totalQuantity:

            result[0].totalQuantity || 0,

        averageCost:

            result[0].averageCost || 0

    };

}
/*
|--------------------------------------------------------------------------
| Bulk Update Inventory
|--------------------------------------------------------------------------
*/

async function bulkUpdateInventory(

    updates = []

) {

    const results = [];

    for (

        const update of updates

    ) {

        try {

            const inventory =

                await updateInventory(

                    update.inventoryId,

                    update.data

                );

            results.push({

                success: true,

                inventory

            });

        } catch (error) {

            results.push({

                success: false,

                inventoryId: update.inventoryId,

                error: error.message

            });

        }

    }

    return results;

}


/*
|--------------------------------------------------------------------------
| Bulk Reserve Inventory
|--------------------------------------------------------------------------
*/

async function bulkReserveInventory(

    reservations = []

) {

    const results = [];

    for (

        const reservation of reservations

    ) {

        try {

            const inventory =

                await reserveInventory(

                    reservation.inventoryId,

                    reservation.quantity

                );

            results.push({

                success: true,

                inventory

            });

        } catch (error) {

            results.push({

                success: false,

                inventoryId: reservation.inventoryId,

                error: error.message

            });

        }

    }

    return results;

}


/*
|--------------------------------------------------------------------------
| Bulk Release Inventory
|--------------------------------------------------------------------------
*/

async function bulkReleaseInventory(

    releases = []

) {

    const results = [];

    for (

        const release of releases

    ) {

        try {

            const inventory =

                await releaseInventory(

                    release.inventoryId,

                    release.quantity

                );

            results.push({

                success: true,

                inventory

            });

        } catch (error) {

            results.push({

                success: false,

                inventoryId: release.inventoryId,

                error: error.message

            });

        }

    }

    return results;

}
/*
|--------------------------------------------------------------------------
| Handle Inventory Level Updated
|--------------------------------------------------------------------------
*/

async function handleInventoryLevelUpdated(

    shopId,

    payload

) {

    const inventory =

        await Inventory.findOne({

            shop: shopId,

            shopifyInventoryItemId:

                String(

                    payload.inventory_item_id

                ),

            shopifyLocationId:

                String(

                    payload.location_id

                ),

            deleted: false

        });

    if (

        !inventory

    ) {

        throw new Error(

            "Inventory record not found."

        );

    }

    inventory.quantity =

        Number(

            payload.available || 0

        );

    inventory.lastCheckedAt =

        new Date();

    inventory.lastSyncedAt =

        new Date();

    inventory.syncStatus =

        "synced";

    await inventory.save();

    return mapInventory(

        inventory

    );

}


/*
|--------------------------------------------------------------------------
| Handle Inventory Adjustment
|--------------------------------------------------------------------------
*/

async function handleInventoryAdjustment(

    inventoryId,

    quantity,

    reason = "Inventory adjustment"

) {

    return adjustInventory(

        inventoryId,

        quantity,

        reason

    );

}


/*
|--------------------------------------------------------------------------
| Handle Inventory Sync
|--------------------------------------------------------------------------
*/

async function handleInventorySync(

    shopId

) {

    const results =

        await syncAllInventory(

            shopId

        );

    const success =

        results.filter(

            result =>

                !result.error

        ).length;

    const failed =

        results.filter(

            result =>

                result.error

        ).length;

    return {

        total:

            results.length,

        success,

        failed,

        results

    };

}
/*
|--------------------------------------------------------------------------
| Validation Helpers
|--------------------------------------------------------------------------
*/

function validateInventoryId(

    inventoryId

) {

    if (

        !inventoryId

    ) {

        throw new Error(

            "Inventory ID is required."

        );

    }

}


function validateQuantity(

    quantity

) {

    if (

        quantity === undefined ||

        quantity === null ||

        Number.isNaN(

            Number(quantity)

        )

    ) {

        throw new Error(

            "A valid quantity is required."

        );

    }

}


/*
|--------------------------------------------------------------------------
| Error Helpers
|--------------------------------------------------------------------------
*/

function createInventoryError(

    message,

    statusCode = 400

) {

    const error =

        new Error(

            message

        );

    error.statusCode =

        statusCode;

    return error;

}


/*
|--------------------------------------------------------------------------
| Logging Helpers
|--------------------------------------------------------------------------
*/

function logInventoryOperation(

    operation,

    metadata = {}

) {

    console.info(

        `[InventoryService] ${operation}`,

        {

            timestamp:

                new Date().toISOString(),

            ...metadata

        }

    );

}


function logInventoryError(

    operation,

    error

) {

    console.error(

        `[InventoryService] ${operation}`,

        {

            message:

                error.message,

            stack:

                error.stack,

            timestamp:

                new Date().toISOString()

        }

    );

  }
/*
|--------------------------------------------------------------------------
| Inventory Service
|--------------------------------------------------------------------------
*/

export const InventoryService = {

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

export default InventoryService;
