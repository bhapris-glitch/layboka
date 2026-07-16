/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import mongoose from "mongoose";

const {

    Schema,

    model

} = mongoose;

/*
|--------------------------------------------------------------------------
| Inventory Schema
|--------------------------------------------------------------------------
*/

const InventorySchema = new Schema(

    {

        /*
        |--------------------------------------------------------------------------
        | Shop
        |--------------------------------------------------------------------------
        */

        shop: {

            type: Schema.Types.ObjectId,

            ref: "Shop",

            required: true,

            index: true

        },

        /*
        |--------------------------------------------------------------------------
        | Product
        |--------------------------------------------------------------------------
        */

        product: {

            type: Schema.Types.ObjectId,

            ref: "Product",

            required: true,

            index: true

        },

        /*
        |--------------------------------------------------------------------------
        | Shopify Inventory Item
        |--------------------------------------------------------------------------
        */

        shopifyInventoryItemId: {

            type: String,

            required: true,

            index: true

        },

        /*
        |--------------------------------------------------------------------------
        | Shopify Location
        |--------------------------------------------------------------------------
        */

        shopifyLocationId: {

            type: String,

            required: true,

            index: true

        },

        /*
        |--------------------------------------------------------------------------
        | SKU
        |--------------------------------------------------------------------------
        */

        sku: {

            type: String,

            default: "",

            trim: true,

            index: true

        },

        /*
        |--------------------------------------------------------------------------
        | Barcode
        |--------------------------------------------------------------------------
        */

        barcode: {

            type: String,

            default: "",

            trim: true

        },

        /*
        |--------------------------------------------------------------------------
        | Quantity
        |--------------------------------------------------------------------------
        */

        quantity: {

            type: Number,

            default: 0,

            min: 0

        },

        /*
        |--------------------------------------------------------------------------
        | Reserved Quantity
        |--------------------------------------------------------------------------
        */

        reservedQuantity: {

            type: Number,

            default: 0,

            min: 0

        }

    },

    {

        timestamps: true,

        versionKey: false

    }

);
/*
|--------------------------------------------------------------------------
| Available Quantity
|--------------------------------------------------------------------------
*/

availableQuantity: {

    type: Number,

    default: 0,

    min: 0

},

/*
|--------------------------------------------------------------------------
| Incoming Quantity
|--------------------------------------------------------------------------
*/

incomingQuantity: {

    type: Number,

    default: 0,

    min: 0

},

/*
|--------------------------------------------------------------------------
| Committed Quantity
|--------------------------------------------------------------------------
*/

committedQuantity: {

    type: Number,

    default: 0,

    min: 0

},

/*
|--------------------------------------------------------------------------
| Reorder Point
|--------------------------------------------------------------------------
*/

reorderPoint: {

    type: Number,

    default: 10,

    min: 0

},

/*
|--------------------------------------------------------------------------
| Reorder Quantity
|--------------------------------------------------------------------------
*/

reorderQuantity: {

    type: Number,

    default: 50,

    min: 0

},

/*
|--------------------------------------------------------------------------
| Safety Stock
|--------------------------------------------------------------------------
*/

safetyStock: {

    type: Number,

    default: 5,

    min: 0

},

/*
|--------------------------------------------------------------------------
| Inventory Status
|--------------------------------------------------------------------------
*/

status: {

    type: String,

    enum: [

        "in_stock",

        "low_stock",

        "out_of_stock",

        "incoming",

        "discontinued"

    ],

    default: "in_stock",

    index: true

},

/*
|--------------------------------------------------------------------------
| Inventory Tracking Enabled
|--------------------------------------------------------------------------
*/

trackQuantity: {

    type: Boolean,

    default: true

},

/*
|--------------------------------------------------------------------------
| Allow Backorders
|--------------------------------------------------------------------------
*/

allowBackorder: {

    type: Boolean,

    default: false

},

/*
|--------------------------------------------------------------------------
| Continue Selling
|--------------------------------------------------------------------------
*/

continueSelling: {

    type: Boolean,

    default: false

},

/*
|--------------------------------------------------------------------------
| Last Inventory Sync
|--------------------------------------------------------------------------
*/

lastSyncedAt: {

    type: Date,

    default: null

},

/*
|--------------------------------------------------------------------------
| Last Inventory Check
|--------------------------------------------------------------------------
*/

lastCheckedAt: {

    type: Date,

    default: null

},

/*
|--------------------------------------------------------------------------
| Sync Status
|--------------------------------------------------------------------------
*/

syncStatus: {

    type: String,

    enum: [

        "pending",

        "syncing",

        "synced",

        "failed"

    ],

    default: "pending",

    index: true

},
/*
|--------------------------------------------------------------------------
| Warehouse Information
|--------------------------------------------------------------------------
*/

warehouse: {

    type: String,

    default: "",

    trim: true

},

locationName: {

    type: String,

    default: "",

    trim: true

},

aisle: {

    type: String,

    default: "",

    trim: true

},

bin: {

    type: String,

    default: "",

    trim: true

},

/*
|--------------------------------------------------------------------------
| Cost Information
|--------------------------------------------------------------------------
*/

costPrice: {

    type: Number,

    default: 0,

    min: 0

},

averageCost: {

    type: Number,

    default: 0,

    min: 0

},

inventoryValue: {

    type: Number,

    default: 0,

    min: 0

},

currency: {

    type: String,

    default: "USD",

    uppercase: true,

    trim: true

},

/*
|--------------------------------------------------------------------------
| Audit Information
|--------------------------------------------------------------------------
*/

lastStockInAt: {

    type: Date,

    default: null

},

lastStockOutAt: {

    type: Date,

    default: null

},

lastAdjustmentAt: {

    type: Date,

    default: null

},

lastAdjustmentReason: {

    type: String,

    default: "",

    trim: true

},

/*
|--------------------------------------------------------------------------
| Metadata
|--------------------------------------------------------------------------
*/

notes: {

    type: String,

    default: "",

    trim: true

},

tags: {

    type: [

        String

    ],

    default: []

},

metadata: {

    type: Schema.Types.Mixed,

    default: {}

},

deleted: {

    type: Boolean,

    default: false,

    index: true

        }
/*
|--------------------------------------------------------------------------
| Virtual Fields
|--------------------------------------------------------------------------
*/

InventorySchema.virtual(

    "availableStock"

).get(function () {

    return Math.max(

        this.quantity -

        this.reservedQuantity,

        0

    );

});

InventorySchema.virtual(

    "isLowStock"

).get(function () {

    return (

        this.availableStock <=

        this.reorderPoint

    );

});

InventorySchema.virtual(

    "isOutOfStock"

).get(function () {

    return (

        this.availableStock <= 0

    );

});

/*
|--------------------------------------------------------------------------
| Database Indexes
|--------------------------------------------------------------------------
*/

InventorySchema.index({

    shop: 1,

    product: 1

}, {

    unique: true

});

InventorySchema.index({

    shop: 1,

    status: 1

});

InventorySchema.index({

    shop: 1,

    syncStatus: 1

});

InventorySchema.index({

    shopifyInventoryItemId: 1,

    shopifyLocationId: 1

});

/*
|--------------------------------------------------------------------------
| Pre Save Middleware
|--------------------------------------------------------------------------
*/

InventorySchema.pre(

    "save",

    function (

        next

    ) {

        this.availableQuantity =

            Math.max(

                this.quantity -

                this.reservedQuantity,

                0

            );

        this.inventoryValue =

            Number(

                this.availableQuantity

            ) *

            Number(

                this.averageCost ||

                this.costPrice ||

                0

            );

        if (

            this.availableQuantity <= 0

        ) {

            this.status =

                "out_of_stock";

        }

        else if (

            this.availableQuantity <=

            this.reorderPoint

        ) {

            this.status =

                "low_stock";

        }

        else {

            this.status =

                "in_stock";

        }

        next();

    }

);
/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

InventorySchema.methods.adjustQuantity = function (

    quantity,

    reason = ""

) {

    this.quantity += quantity;

    this.lastAdjustmentAt = new Date();

    this.lastAdjustmentReason = reason;

    return this.save();

};

InventorySchema.methods.reserveStock = function (

    quantity

) {

    if (

        this.availableQuantity < quantity

    ) {

        throw new Error(

            "Insufficient inventory available."

        );

    }

    this.reservedQuantity += quantity;

    return this.save();

};

InventorySchema.methods.releaseReservedStock = function (

    quantity

) {

    this.reservedQuantity = Math.max(

        this.reservedQuantity - quantity,

        0

    );

    return this.save();

};

InventorySchema.methods.markSynced = function () {

    this.syncStatus = "synced";

    this.lastSyncedAt = new Date();

    return this.save();

};


/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

InventorySchema.statics.findByProduct = function (

    shopId,

    productId

) {

    return this.findOne({

        shop: shopId,

        product: productId,

        deleted: false

    });

};

InventorySchema.statics.findLowStock = function (

    shopId

) {

    return this.find({

        shop: shopId,

        status: "low_stock",

        deleted: false

    });

};

InventorySchema.statics.findOutOfStock = function (

    shopId

) {

    return this.find({

        shop: shopId,

        status: "out_of_stock",

        deleted: false

    });

};


/*
|--------------------------------------------------------------------------
| JSON Transform
|--------------------------------------------------------------------------
*/

InventorySchema.set(

    "toJSON",

    {

        virtuals: true,

        versionKey: false,

        transform(

            doc,

            ret

        ) {

            delete ret.__v;

            return ret;

        }

    }

);


/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Inventory = model(

    "Inventory",

    InventorySchema

);

export {

    Inventory

};

export default Inventory;
