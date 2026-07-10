import mongoose from "mongoose";

const { Schema } = mongoose;

const invoiceSchema = new Schema(
{
    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true
    },

    merchant: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    subscription: {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
        default: null
    },

    payment: {
        type: Schema.Types.ObjectId,
        ref: "Payment",
        default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Invoice Identity
    |--------------------------------------------------------------------------
    */

    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },

    invoiceType: {
        type: String,
        enum: [
            "subscription",
            "upgrade",
            "downgrade",
            "renewal",
            "enterprise",
            "refund",
            "manual"
        ],
        default: "subscription"
    },

    status: {
        type: String,
        enum: [
            "draft",
            "pending",
            "paid",
            "partially-paid",
            "failed",
            "cancelled",
            "refunded",
            "void"
        ],
        default: "pending",
        index: true
    },

    /*
    |--------------------------------------------------------------------------
    | Billing Information
    |--------------------------------------------------------------------------
    */

    customer: {

        companyName: {
            type: String,
            default: ""
        },

        fullName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            default: ""
        },

        addressLine1: {
            type: String,
            default: ""
        },

        addressLine2: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: ""
        },

        postalCode: {
            type: String,
            default: ""
        },

        country: {
            type: String,
            default: ""
        },

        taxId: {
            type: String,
            default: ""
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Plan Details
    |--------------------------------------------------------------------------
    */

    plan: {

        name: {
            type: String,
            enum: [
                "Starter",
                "Growth",
                "Premium",
                "Enterprise"
            ],
            required: true
        },

        billingCycle: {
            type: String,
            enum: [
                "monthly",
                "yearly",
                "custom"
            ],
            default: "monthly"
        },

        users: {
            type: Number,
            default: 1
        },

        aiModel: {
            type: String,
            enum: [
                "gpt-4o-mini",
                "gpt-5"
            ],
            default: "gpt-4o-mini"
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Invoice Dates
    |--------------------------------------------------------------------------
    */

    issuedAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    paidAt: {
        type: Date,
        default: null
    },

    billingPeriodStart: {
        type: Date,
        required: true
    },

    billingPeriodEnd: {
        type: Date,
        required: true
    },
      /*
    |--------------------------------------------------------------------------
    | Invoice Line Items
    |--------------------------------------------------------------------------
    */

    items: [{
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        quantity: {
            type: Number,
            default: 1,
            min: 1
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    }],

    /*
    |--------------------------------------------------------------------------
    | Tax Information
    |--------------------------------------------------------------------------
    */

    tax: {

        enabled: {
            type: Boolean,
            default: false
        },

        taxName: {
            type: String,
            default: "Tax"
        },

        taxPercentage: {
            type: Number,
            default: 0,
            min: 0
        },

        taxAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        taxNumber: {
            type: String,
            default: ""
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Discount
    |--------------------------------------------------------------------------
    */

    discount: {

        couponCode: {
            type: String,
            default: ""
        },

        discountType: {
            type: String,
            enum: [
                "none",
                "percentage",
                "fixed"
            ],
            default: "none"
        },

        discountValue: {
            type: Number,
            default: 0
        },

        discountAmount: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    currency: {

        code: {
            type: String,
            default: "USD"
        },

        symbol: {
            type: String,
            default: "$"
        },

        exchangeRate: {
            type: Number,
            default: 1
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Payment Information
    |--------------------------------------------------------------------------
    */

    paymentDetails: {

        provider: {
            type: String,
            enum: [
                "stripe",
                "razorpay",
                "manual"
            ],
            default: "stripe"
        },

        paymentIntentId: {
            type: String,
            default: ""
        },

        transactionId: {
            type: String,
            default: ""
        },

        paymentMethod: {
            type: String,
            default: ""
        },

        receiptUrl: {
            type: String,
            default: ""
        },

        invoiceUrl: {
            type: String,
            default: ""
        },

        failureReason: {
            type: String,
            default: ""
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Invoice Totals
    |--------------------------------------------------------------------------
    */

    totals: {

        subtotal: {
            type: Number,
            default: 0
        },

        tax: {
            type: Number,
            default: 0
        },

        discount: {
            type: Number,
            default: 0
        },

        grandTotal: {
            type: Number,
            default: 0
        },

        amountPaid: {
            type: Number,
            default: 0
        },

        amountDue: {
            type: Number,
            default: 0
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Notes
    |--------------------------------------------------------------------------
    */

    notes: {

        customerNote: {
            type: String,
            default: "",
            maxlength: 5000
        },

        internalNote: {
            type: String,
            default: "",
            maxlength: 5000
        },

        footer: {
            type: String,
            default: "Thank you for choosing Layboka AI."
        }

    },
      /*
    |--------------------------------------------------------------------------
    | Email Delivery
    |--------------------------------------------------------------------------
    */

    email: {

        sent: {
            type: Boolean,
            default: false
        },

        sentAt: {
            type: Date,
            default: null
        },

        recipient: {
            type: String,
            default: ""
        },

        subject: {
            type: String,
            default: ""
        },

        deliveryStatus: {
            type: String,
            enum: [
                "pending",
                "sent",
                "delivered",
                "opened",
                "failed"
            ],
            default: "pending"
        },

        error: {
            type: String,
            default: ""
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Refund Information
    |--------------------------------------------------------------------------
    */

    refund: {

        refunded: {
            type: Boolean,
            default: false
        },

        refundedAt: {
            type: Date,
            default: null
        },

        refundAmount: {
            type: Number,
            default: 0
        },

        refundReason: {
            type: String,
            default: ""
        },

        refundTransactionId: {
            type: String,
            default: ""
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Metadata
    |--------------------------------------------------------------------------
    */

    metadata: {

        generatedBy: {
            type: String,
            default: "Layboka AI"
        },

        version: {
            type: String,
            default: "1.0.0"
        },

        ipAddress: {
            type: String,
            default: ""
        },

        userAgent: {
            type: String,
            default: ""
        },

        custom: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {}
        }

    },

    /*
    |--------------------------------------------------------------------------
    | Soft Delete
    |--------------------------------------------------------------------------
    */

    archived: {
        type: Boolean,
        default: false,
        index: true
    },

    archivedAt: {
        type: Date,
        default: null
    },

    deleted: {
        type: Boolean,
        default: false,
        index: true
    },

    deletedAt: {
        type: Date,
        default: null
    }

},
{
    timestamps: true,
    versionKey: false
});

/*
|--------------------------------------------------------------------------
| Database Indexes
|--------------------------------------------------------------------------
*/

invoiceSchema.index({
    invoiceNumber: 1
});

invoiceSchema.index({
    shop: 1,
    issuedAt: -1
});

invoiceSchema.index({
    merchant: 1,
    issuedAt: -1
});

invoiceSchema.index({
    subscription: 1
});

invoiceSchema.index({
    status: 1
});

invoiceSchema.index({
    dueDate: 1
});

invoiceSchema.index({
    paidAt: 1
});

invoiceSchema.index({
    "customer.email": 1
});

invoiceSchema.index({
    "paymentDetails.transactionId": 1
});

invoiceSchema.index({
    "paymentDetails.paymentIntentId": 1
});

invoiceSchema.index({
    archived: 1,
    deleted: 1
});
/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

invoiceSchema.virtual("isPaid").get(function () {
    return this.status === "paid";
});

invoiceSchema.virtual("isPending").get(function () {
    return this.status === "pending";
});

invoiceSchema.virtual("isOverdue").get(function () {

    return (
        this.status !== "paid" &&
        this.dueDate &&
        this.dueDate < new Date()
    );

});

invoiceSchema.virtual("isRefunded").get(function () {
    return this.refund.refunded;
});

invoiceSchema.virtual("balanceDue").get(function () {

    return Math.max(
        (this.totals.grandTotal || 0) -
        (this.totals.amountPaid || 0),
        0
    );

});

invoiceSchema.virtual("billingPeriodDays").get(function () {

    if (!this.billingPeriodStart || !this.billingPeriodEnd) {
        return 0;
    }

    const diff =
        this.billingPeriodEnd.getTime() -
        this.billingPeriodStart.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));

});

/*
|--------------------------------------------------------------------------
| Instance Methods
|--------------------------------------------------------------------------
*/

invoiceSchema.methods.markPaid = async function (
    transactionId = "",
    paymentMethod = ""
) {

    this.status = "paid";
    this.paidAt = new Date();

    this.paymentDetails.transactionId = transactionId;
    this.paymentDetails.paymentMethod = paymentMethod;

    this.totals.amountPaid =
        this.totals.grandTotal;

    this.totals.amountDue = 0;

    return this.save();

};

invoiceSchema.methods.markFailed = async function (
    reason = ""
) {

    this.status = "failed";
    this.paymentDetails.failureReason = reason;

    return this.save();

};

invoiceSchema.methods.markRefunded = async function (
    amount = 0
) {

    this.status = "refunded";

    this.refund.refunded = true;
    this.refund.refundedAt = new Date();
    this.refund.refundAmount = amount;

    return this.save();

};

invoiceSchema.methods.archive = async function () {

    this.archived = true;
    this.archivedAt = new Date();

    return this.save();

};

invoiceSchema.methods.softDelete = async function () {

    this.deleted = true;
    this.deletedAt = new Date();

    return this.save();

};

/*
|--------------------------------------------------------------------------
| Static Methods
|--------------------------------------------------------------------------
*/

invoiceSchema.statics.findPaid = function () {

    return this.find({
        status: "paid",
        deleted: false
    }).sort({
        issuedAt: -1
    });

};

invoiceSchema.statics.findPending = function () {

    return this.find({
        status: "pending",
        deleted: false
    }).sort({
        dueDate: 1
    });

};

invoiceSchema.statics.findOverdue = function () {

    return this.find({

        status: {
            $nin: [
                "paid",
                "cancelled",
                "void",
                "refunded"
            ]
        },

        dueDate: {
            $lt: new Date()
        },

        deleted: false

    });

};

invoiceSchema.statics.findByShop = function (
    shopId
) {

    return this.find({

        shop: shopId,
        deleted: false

    }).sort({
        issuedAt: -1
    });

};

/*
|--------------------------------------------------------------------------
| Pre Save Middleware
|--------------------------------------------------------------------------
*/

invoiceSchema.pre("save", function (next) {

    let subtotal = 0;

    if (Array.isArray(this.items)) {

        subtotal = this.items.reduce(
            (sum, item) => {

                return sum + (item.totalPrice || 0);

            },
            0
        );

    }

    this.totals.subtotal = subtotal;

    this.totals.tax =
        this.tax.taxAmount || 0;

    this.totals.discount =
        this.discount.discountAmount || 0;

    this.totals.grandTotal =
        subtotal +
        this.totals.tax -
        this.totals.discount;

    this.totals.amountDue =
        this.totals.grandTotal -
        this.totals.amountPaid;

    next();

});

/*
|--------------------------------------------------------------------------
| JSON Transform
|--------------------------------------------------------------------------
*/

invoiceSchema.set("toJSON", {

    virtuals: true,

    transform(doc, ret) {

        delete ret.__v;

        return ret;

    }

});

invoiceSchema.set("toObject", {
    virtuals: true
});

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

const Invoice =
    mongoose.models.Invoice ||
    mongoose.model(
        "Invoice",
        invoiceSchema
    );

export default Invoice;
