/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Customer from "../../models/Customer.js";
import Shop from "../../models/Shop.js";
import Order from "../../models/Order.js";

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
| Map Customer
|--------------------------------------------------------------------------
*/

function mapCustomer(

    customer

) {

    if (

        !customer

    ) {

        return null;

    }

    return {

        id:

            customer._id,

        shop:

            customer.shop,

        shopifyCustomerId:

            customer.shopifyCustomerId,

        firstName:

            customer.firstName,

        lastName:

            customer.lastName,

        fullName:

            customer.fullName,

        displayName:

            customer.displayName,

        email:

            customer.email,

        phone:

            customer.phone,

        acceptsMarketing:

            customer.acceptsMarketing,

        emailVerified:

            customer.emailVerified,

        smsMarketing:

            customer.smsMarketing,

        defaultAddress:

            customer.defaultAddress,

        totalOrders:

            customer.totalOrders,

        totalSpent:

            customer.totalSpent,

        averageOrderValue:

            customer.averageOrderValue,

        lastOrderAt:

            customer.lastOrderAt,

        preferredCurrency:

            customer.preferredCurrency,

        preferredLanguage:

            customer.preferredLanguage,

        preferredLocale:

            customer.preferredLocale,

        customerSegment:

            customer.customerSegment,

        customerScore:

            customer.customerScore,

        lifetimeValue:

            customer.lifetimeValue,

        status:

            customer.status,

        state:

            customer.state,

        syncStatus:

            customer.syncStatus,

        lastSyncedAt:

            customer.lastSyncedAt,

        createdAt:

            customer.createdAt,

        updatedAt:

            customer.updatedAt

    };

}


/*
|--------------------------------------------------------------------------
| Find Customer
|--------------------------------------------------------------------------
*/

async function findCustomer(

    customerId

) {

    return Customer.findById(

        customerId

    )

    .populate(

        "shop"

    );

}


/*
|--------------------------------------------------------------------------
| Find Customer By Shopify ID
|--------------------------------------------------------------------------
*/

async function findCustomerByShopifyId(

    shopId,

    shopifyCustomerId

) {

    return Customer.findByShopifyCustomerId(

        shopId,

        shopifyCustomerId

    );

}
/*
|--------------------------------------------------------------------------
| Get Customer
|--------------------------------------------------------------------------
*/

async function getCustomer(

    customerId

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Get Customer By Shopify ID
|--------------------------------------------------------------------------
*/

async function getCustomerByShopifyId(

    shopId,

    shopifyCustomerId

) {

    const customer =

        await findCustomerByShopifyId(

            shopId,

            shopifyCustomerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Get Customers
|--------------------------------------------------------------------------
*/

async function getCustomers(

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

        query.status =

            status;

    }

    if (

        search

    ) {

        query.$or = [

            {

                firstName: {

                    $regex: search,

                    $options: "i"

                }

            },

            {

                lastName: {

                    $regex: search,

                    $options: "i"

                }

            },

            {

                fullName: {

                    $regex: search,

                    $options: "i"

                }

            },

            {

                email: {

                    $regex: search,

                    $options: "i"

                }

            }

        ];

    }

    const skip =

        (

            Number(page) - 1

        ) *

        Number(limit);

    const [

        customers,

        total

    ] = await Promise.all([

        Customer.find(

            query

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

        Customer.countDocuments(

            query

        )

    ]);

    return {

        items:

            customers.map(

                mapCustomer

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
| Search Customers
|--------------------------------------------------------------------------
*/

async function searchCustomers(

    shopId,

    keyword,

    options = {}

) {

    return getCustomers(

        shopId,

        {

            ...options,

            search: keyword

        }

    );

}


/*
|--------------------------------------------------------------------------
| Get Customer Orders
|--------------------------------------------------------------------------
*/

async function getCustomerOrders(

    customerId,

    options = {}

) {

    const {

        page = 1,

        limit = 20

    } = options;

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    const query = {

        customer:

            customer._id,

        deleted: false

    };

    const skip =

        (

            Number(page) - 1

        ) *

        Number(limit);

    const [

        orders,

        total

    ] = await Promise.all([

        Order.find(

            query

        )

        .sort({

            createdAt: -1

        })

        .skip(

            skip

        )

        .limit(

            Number(limit)

        ),

        Order.countDocuments(

            query

        )

    ]);

    return {

        customer:

            mapCustomer(

                customer

            ),

        items:

            orders,

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
| Get Customer Analytics
|--------------------------------------------------------------------------
*/

async function getCustomerAnalytics(

    shopId

) {

    const [

        totalCustomers,

        activeCustomers,

        inactiveCustomers,

        vipCustomers

    ] = await Promise.all([

        Customer.countDocuments({

            shop: shopId,

            deleted: false

        }),

        Customer.countDocuments({

            shop: shopId,

            status: "active",

            deleted: false

        }),

        Customer.countDocuments({

            shop: shopId,

            status: "inactive",

            deleted: false

        }),

        Customer.countDocuments({

            shop: shopId,

            customerSegment: "vip",

            deleted: false

        })

    ]);

    return {

        totalCustomers,

        activeCustomers,

        inactiveCustomers,

        vipCustomers

    };

}
/*
|--------------------------------------------------------------------------
| Update Customer
|--------------------------------------------------------------------------
*/

async function updateCustomer(

    customerId,

    payload

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    Object.assign(

        customer,

        payload

    );

    await customer.save();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Sync Shopify Customer
|--------------------------------------------------------------------------
*/

async function syncShopifyCustomer(

    shopId,

    shopifyCustomer

) {

    let customer =

        await findCustomerByShopifyId(

            shopId,

            String(

                shopifyCustomer.id

            )

        );

    if (

        !customer

    ) {

        customer =

            new Customer({

                shop: shopId,

                shopifyCustomerId: String(

                    shopifyCustomer.id

                )

            });

    }

    customer.firstName =

        shopifyCustomer.first_name ||

        "";

    customer.lastName =

        shopifyCustomer.last_name ||

        "";

    customer.fullName =

        [

            customer.firstName,

            customer.lastName

        ]

        .filter(

            Boolean

        )

        .join(

            " "

        )

        .trim();

    customer.email =

        shopifyCustomer.email ||

        "";

    customer.phone =

        shopifyCustomer.phone ||

        "";

    customer.acceptsMarketing =

        shopifyCustomer.accepts_marketing ||

        false;

    customer.state =

        shopifyCustomer.state ||

        "enabled";

    customer.status =

        "active";

    customer.syncStatus =

        "synced";

    customer.lastSyncedAt =

        new Date();

    await customer.save();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Sync All Customers
|--------------------------------------------------------------------------
*/

async function syncAllCustomers(

    shopId

) {

    const shop =

        await Shop.findById(

            shopId

        );

    if (

        !shop

    ) {

        throw new Error(

            "Shop not found."

        );

    }

    const customers =

        await ShopifyService.getCustomers(

            shop

        );

    const results = [];

    for (

        const customer of customers

    ) {

        results.push(

            await syncShopifyCustomer(

                shopId,

                customer

            )

        );

    }

    return results;

          }
/*
|--------------------------------------------------------------------------
| Delete Customer
|--------------------------------------------------------------------------
*/

async function deleteCustomer(

    customerId

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    await customer.markAsDeleted();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Restore Customer
|--------------------------------------------------------------------------
*/

async function restoreCustomer(

    customerId

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    customer.deleted = false;

    customer.status = "active";

    customer.syncStatus = "pending";

    await customer.save();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Update Customer Statistics
|--------------------------------------------------------------------------
*/

async function updateCustomerStatistics(

    customerId

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    const orders =

        await Order.find({

            customer: customer._id,

            deleted: false

        });

    const totalOrders =

        orders.length;

    const totalSpent =

        orders.reduce(

            (

                total,

                order

            ) =>

                total +

                (

                    order.totalPrice ||

                    0

                ),

            0

        );

    const averageOrderValue =

        totalOrders > 0

            ? totalSpent /

              totalOrders

            : 0;

    const lastOrderAt =

        totalOrders > 0

            ? orders

                  .sort(

                      (

                          a,

                          b

                      ) =>

                          new Date(

                              b.createdAt

                          ) -

                          new Date(

                              a.createdAt

                          )

                  )[0]

                  .createdAt

            : null;

    await customer.updateCustomerStatistics({

        totalOrders,

        totalSpent,

        averageOrderValue,

        lastOrderAt

    });

    return mapCustomer(

        customer

    );

      }
/*
|--------------------------------------------------------------------------
| Update Customer Segment
|--------------------------------------------------------------------------
*/

async function updateCustomerSegment(

    customerId,

    customerSegment

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    customer.customerSegment =

        customerSegment;

    await customer.save();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Update Customer Score
|--------------------------------------------------------------------------
*/

async function updateCustomerScore(

    customerId,

    customerScore

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    customer.customerScore =

        customerScore;

    await customer.save();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Update Lifetime Value
|--------------------------------------------------------------------------
*/

async function updateLifetimeValue(

    customerId,

    lifetimeValue

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    customer.lifetimeValue =

        lifetimeValue;

    await customer.save();

    return mapCustomer(

        customer

    );

      }
/*
|--------------------------------------------------------------------------
| Mark Customer As Synced
|--------------------------------------------------------------------------
*/

async function markCustomerAsSynced(

    customerId

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    await customer.markAsSynced();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Mark Customer As Deleted
|--------------------------------------------------------------------------
*/

async function markCustomerAsDeleted(

    customerId

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    await customer.markAsDeleted();

    return mapCustomer(

        customer

    );

}


/*
|--------------------------------------------------------------------------
| Update Last Seen At
|--------------------------------------------------------------------------
*/

async function updateLastSeenAt(

    customerId,

    lastSeenAt = new Date()

) {

    const customer =

        await findCustomer(

            customerId

        );

    if (

        !customer ||

        customer.deleted

    ) {

        throw new Error(

            "Customer not found."

        );

    }

    customer.lastSeenAt =

        lastSeenAt;

    await customer.save();

    return mapCustomer(

        customer

    );

}
/*
|--------------------------------------------------------------------------
| Handle Customer Created
|--------------------------------------------------------------------------
*/

async function handleCustomerCreated(

    shopId,

    shopifyCustomer

) {

    return syncShopifyCustomer(

        shopId,

        shopifyCustomer

    );

}


/*
|--------------------------------------------------------------------------
| Handle Customer Updated
|--------------------------------------------------------------------------
*/

async function handleCustomerUpdated(

    shopId,

    shopifyCustomer

) {

    return syncShopifyCustomer(

        shopId,

        shopifyCustomer

    );

}


/*
|--------------------------------------------------------------------------
| Handle Customer Deleted
|--------------------------------------------------------------------------
*/

async function handleCustomerDeleted(

    shopId,

    shopifyCustomerId

) {

    const customer =

        await findCustomerByShopifyId(

            shopId,

            String(

                shopifyCustomerId

            )

        );

    if (

        !customer

    ) {

        return null;

    }

    await customer.markAsDeleted();

    return mapCustomer(

        customer

    );

      }
/*
|--------------------------------------------------------------------------
| Customer Service
|--------------------------------------------------------------------------
*/

export const CustomerService = {

    getCustomer,

    getCustomerByShopifyId,

    getCustomers,

    searchCustomers,

    getCustomerOrders,

    getCustomerAnalytics,

    updateCustomer,

    syncShopifyCustomer,

    syncAllCustomers,

    deleteCustomer,

    restoreCustomer,

    updateCustomerStatistics,

    updateCustomerSegment,

    updateCustomerScore,

    updateLifetimeValue,

    markCustomerAsSynced,

    markCustomerAsDeleted,

    updateLastSeenAt,

    handleCustomerCreated,

    handleCustomerUpdated,

    handleCustomerDeleted

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    getCustomer,

    getCustomerByShopifyId,

    getCustomers,

    searchCustomers,

    getCustomerOrders,

    getCustomerAnalytics,

    updateCustomer,

    syncShopifyCustomer,

    syncAllCustomers,

    deleteCustomer,

    restoreCustomer,

    updateCustomerStatistics,

    updateCustomerSegment,

    updateCustomerScore,

    updateLifetimeValue,

    markCustomerAsSynced,

    markCustomerAsDeleted,

    updateLastSeenAt,

    handleCustomerCreated,

    handleCustomerUpdated,

    handleCustomerDeleted

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default CustomerService;
