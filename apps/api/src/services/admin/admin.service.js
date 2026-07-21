/*
|--------------------------------------------------------------------------
| Admin Service
| apps/api/src/services/admin/admin.service.js
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import mongoose from "mongoose";

import User from "../../models/User.js";

import Shop from "../../models/shop.js";

import Subscription from "../../models/subscription.model.js";

import Order from "../../models/Order.js";

import Product from "../../models/Product.js";

import Customer from "../../models/Customer.js";

import SubscriptionService from "../subscription/subscription.service.js";


/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const VALID_ADMIN_ROLES = [

    "admin",

    "super_admin"

];


const VALID_USER_ROLES = [

    "merchant",

    "admin",

    "super_admin"

];


const VALID_SUBSCRIPTION_STATUSES = [

    "trial",

    "active",

    "past_due",

    "cancelled",

    "expired",

    "inactive"

];


const VALID_PLANS = [

    "starter",

    "growth",

    "premium",

    "enterprise"

];


const DEFAULT_PAGE = 1;


const DEFAULT_LIMIT = 20;


const MAX_LIMIT = 100;


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Validate ObjectId
|--------------------------------------------------------------------------
*/

function isValidObjectId(

    id

) {

    return mongoose.Types.ObjectId.isValid(

        id

    );

}


/*
|--------------------------------------------------------------------------
| Require ObjectId
|--------------------------------------------------------------------------
*/

function requireObjectId(

    id,

    fieldName = "ID"

) {

    if (

        !id ||

        !isValidObjectId(

            id

        )

    ) {

        throw new Error(

            `Invalid ${fieldName}.`

        );

    }

    return id;

}


/*
|--------------------------------------------------------------------------
| Normalize Pagination
|--------------------------------------------------------------------------
*/

function normalizePagination(

    page = DEFAULT_PAGE,

    limit = DEFAULT_LIMIT

) {

    const normalizedPage = Math.max(

        1,

        Number(

            page

        ) || DEFAULT_PAGE

    );


    const normalizedLimit = Math.min(

        MAX_LIMIT,

        Math.max(

            1,

            Number(

                limit

            ) || DEFAULT_LIMIT

        )

    );


    return {

        page:

            normalizedPage,

        limit:

            normalizedLimit,

        skip:

            (

                normalizedPage -

                1

            ) *

            normalizedLimit

    };

}


/*
|--------------------------------------------------------------------------
| Get Pagination Result
|--------------------------------------------------------------------------
*/

function buildPagination(

    page,

    limit,

    total

) {

    return {

        page,

        limit,

        total,

        totalPages:

            Math.ceil(

                total /

                limit

            ),

        hasNextPage:

            page <

            Math.ceil(

                total /

                limit

            ),

        hasPreviousPage:

            page > 1

    };

}


/*
|--------------------------------------------------------------------------
| Find User By ID
|--------------------------------------------------------------------------
*/

async function findUserById(

    userId

) {

    requireObjectId(

        userId,

        "user ID"

    );


    const user =

        await User.findById(

            userId

        );


    if (

        !user

    ) {

        throw new Error(

            "User not found."

        );

    }


    return user;

}


/*
|--------------------------------------------------------------------------
| Find Admin By ID
|--------------------------------------------------------------------------
*/

async function findAdminById(

    userId

) {

    const user =

        await findUserById(

            userId

        );


    if (

        !VALID_ADMIN_ROLES.includes(

            user.role

        )

    ) {

        throw new Error(

            "Admin access required."

        );

    }


    return user;

}


/*
|--------------------------------------------------------------------------
| Find Active Admin By ID
|--------------------------------------------------------------------------
*/

async function findActiveAdminById(

    userId

) {

    const user =

        await findAdminById(

            userId

        );


    if (

        user.isActive !== true

    ) {

        throw new Error(

            "Admin account is inactive."

        );

    }


    return user;

}


/*
|--------------------------------------------------------------------------
| Find Shop By ID
|--------------------------------------------------------------------------
*/

async function findShopById(

    shopId

) {

    requireObjectId(

        shopId,

        "shop ID"

    );


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


    return shop;

}


/*
|--------------------------------------------------------------------------
| Find Shop With Subscription
|--------------------------------------------------------------------------
*/

async function findShopWithSubscription(

    shopId

) {

    const shop =

        await findShopById(

            shopId

        );


    const subscription =

        await Subscription.findByShop(

            shop._id

        );


    return {

        shop,

        subscription

    };

}


/*
|--------------------------------------------------------------------------
| Find Subscription By ID
|--------------------------------------------------------------------------
*/

async function findSubscriptionById(

    subscriptionId

) {

    requireObjectId(

        subscriptionId,

        "subscription ID"

    );


    const subscription =

        await Subscription.findById(

            subscriptionId

        );


    if (

        !subscription

    ) {

        throw new Error(

            "Subscription not found."

        );

    }


    return subscription;

}


/*
|--------------------------------------------------------------------------
| Find Subscription By Shop
|--------------------------------------------------------------------------
*/

async function findSubscriptionByShopId(

    shopId

) {

    requireObjectId(

        shopId,

        "shop ID"

    );


    const subscription =

        await Subscription.findByShop(

            shopId

        );


    if (

        !subscription

    ) {

        throw new Error(

            "Subscription not found."

        );

    }


    return subscription;

}


/*
|--------------------------------------------------------------------------
| Validate Admin Role
|--------------------------------------------------------------------------
*/

function validateAdminRole(

    role

) {

    if (

        !VALID_ADMIN_ROLES.includes(

            role

        )

    ) {

        throw new Error(

            "Invalid admin role."

        );

    }


    return true;

}


/*
|--------------------------------------------------------------------------
| Validate User Role
|--------------------------------------------------------------------------
*/

function validateUserRole(

    role

) {

    if (

        !VALID_USER_ROLES.includes(

            role

        )

    ) {

        throw new Error(

            "Invalid user role."

        );

    }


    return true;

}


/*
|--------------------------------------------------------------------------
| Validate Subscription Plan
|--------------------------------------------------------------------------
*/

function validateSubscriptionPlan(

    plan

) {

    if (

        !VALID_PLANS.includes(

            plan

        )

    ) {

        throw new Error(

            "Invalid subscription plan."

        );

    }


    return true;

}


/*
|--------------------------------------------------------------------------
| Validate Subscription Status
|--------------------------------------------------------------------------
*/

function validateSubscriptionStatus(

    status

) {

    if (

        !VALID_SUBSCRIPTION_STATUSES.includes(

            status

        )

    ) {

        throw new Error(

            "Invalid subscription status."

        );

    }


    return true;

}


/*
|--------------------------------------------------------------------------
| Admin Service
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Part 1 Ends Here
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| User Management Helpers
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Build User Search Query
|--------------------------------------------------------------------------
*/

function buildUserSearchQuery(

    search

) {

    if (

        !search ||

        typeof search !== "string"

    ) {

        return {};

    }


    const searchRegex =

        new RegExp(

            search.trim(),

            "i"

        );


    return {

        $or: [

            {

                firstName:

                    searchRegex

            },

            {

                lastName:

                    searchRegex

            },

            {

                email:

                    searchRegex

            },

            {

                phone:

                    searchRegex

            }

        ]

    };

}


/*
|--------------------------------------------------------------------------
| Build User Filter Query
|--------------------------------------------------------------------------
*/

function buildUserFilterQuery(

    filters = {}

) {

    const query = {};


    /*
    |--------------------------------------------------------------------------
    | Role Filter
    |--------------------------------------------------------------------------
    */

    if (

        filters.role

    ) {

        validateUserRole(

            filters.role

        );


        query.role =

            filters.role;

    }


    /*
    |--------------------------------------------------------------------------
    | Active Status Filter
    |--------------------------------------------------------------------------
    */

    if (

        filters.isActive !== undefined

    ) {

        query.isActive =

            filters.isActive === true ||

            filters.isActive === "true";

    }


    /*
    |--------------------------------------------------------------------------
    | Email Verification Filter
    |--------------------------------------------------------------------------
    */

    if (

        filters.isEmailVerified !== undefined

    ) {

        query.isEmailVerified =

            filters.isEmailVerified === true ||

            filters.isEmailVerified === "true";

    }


    return query;

}


/*
|--------------------------------------------------------------------------
| Build User Query
|--------------------------------------------------------------------------
*/

function buildUserQuery(

    filters = {}

) {

    return {

        ...buildUserFilterQuery(

            filters

        ),

        ...buildUserSearchQuery(

            filters.search

        )

    };

}


/*
|--------------------------------------------------------------------------
| Sanitize User
|--------------------------------------------------------------------------
*/

function sanitizeUser(

    user

) {

    if (

        !user

    ) {

        return null;

    }


    const userObject =

        typeof user.toObject === "function"

            ? user.toObject()

            : {

                ...user

            };


    /*
    |--------------------------------------------------------------------------
    | Remove Sensitive Fields
    |--------------------------------------------------------------------------
    */

    delete userObject.password;


    return userObject;

}


/*
|--------------------------------------------------------------------------
| Get User Statistics
|--------------------------------------------------------------------------
*/

async function getUserStatistics() {

    const [

        totalUsers,

        activeUsers,

        inactiveUsers,

        verifiedUsers,

        unverifiedUsers,

        merchantUsers,

        adminUsers,

        superAdminUsers

    ] =

        await Promise.all([

            User.countDocuments(),

            User.countDocuments({

                isActive:

                    true

            }),

            User.countDocuments({

                isActive:

                    false

            }),

            User.countDocuments({

                isEmailVerified:

                    true

            }),

            User.countDocuments({

                isEmailVerified:

                    false

            }),

            User.countDocuments({

                role:

                    "merchant"

            }),

            User.countDocuments({

                role:

                    "admin"

            }),

            User.countDocuments({

                role:

                    "super_admin"

            })

        ]);


    return {

        totalUsers,

        activeUsers,

        inactiveUsers,

        verifiedUsers,

        unverifiedUsers,

        merchantUsers,

        adminUsers,

        superAdminUsers

    };

}


/*
|--------------------------------------------------------------------------
| Get User Counts By Role
|--------------------------------------------------------------------------
*/

async function getUserCountsByRole() {

    const results =

        await User.aggregate([

            {

                $group: {

                    _id:

                        "$role",

                    count: {

                        $sum:

                            1

                    }

                }

            },

            {

                $sort: {

                    _id:

                        1

                }

            }

        ]);


    return results.map(

        (item) => ({

            role:

                item._id,

            count:

                item.count

        })

    );

}


/*
|--------------------------------------------------------------------------
| Get User Counts By Active Status
|--------------------------------------------------------------------------
*/

async function getUserCountsByActiveStatus() {

    const results =

        await User.aggregate([

            {

                $group: {

                    _id:

                        "$isActive",

                    count: {

                        $sum:

                            1

                    }

                }

            }

        ]);


    return results.map(

        (item) => ({

            isActive:

                item._id,

            count:

                item.count

        })

    );

}


/*
|--------------------------------------------------------------------------
| Get Recent Users
|--------------------------------------------------------------------------
*/

async function getRecentUsers(

    limit = 10

) {

    const normalizedLimit =

        Math.min(

            MAX_LIMIT,

            Math.max(

                1,

                Number(

                    limit

                ) || 10

            )

        );


    const users =

        await User.find()

            .sort({

                createdAt:

                    -1

            })

            .limit(

                normalizedLimit

            );


    return users.map(

        sanitizeUser

    );

}


/*
|--------------------------------------------------------------------------
| Get User By Email
|--------------------------------------------------------------------------
*/

async function findUserByEmail(

    email

) {

    if (

        !email ||

        typeof email !== "string"

    ) {

        throw new Error(

            "Email is required."

        );

    }


    const user =

        await User.findOne({

            email:

                email

                    .trim()

                    .toLowerCase()

        });


    if (

        !user

    ) {

        throw new Error(

            "User not found."

        );

    }


    return user;

}


/*
|--------------------------------------------------------------------------
| Check Email Exists
|--------------------------------------------------------------------------
*/

async function emailExists(

    email,

    excludeUserId = null

) {

    if (

        !email

    ) {

        return false;

    }


    const query = {

        email:

            email

                .trim()

                .toLowerCase()

    };


    if (

        excludeUserId &&

        isValidObjectId(

            excludeUserId

        )

    ) {

        query._id = {

            $ne:

                excludeUserId

        };

    }


    const user =

        await User.findOne(

            query

        ).select(

            "_id"

        );


    return Boolean(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Ensure User Can Be Modified
|--------------------------------------------------------------------------
*/

function ensureUserCanBeModified(

    targetUser,

    adminUser

) {

    if (

        !targetUser

    ) {

        throw new Error(

            "Target user not found."

        );

    }


    if (

        !adminUser

    ) {

        throw new Error(

            "Admin user is required."

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Prevent Self Deactivation
    |--------------------------------------------------------------------------
    */

    if (

        String(

            targetUser._id

        ) ===

        String(

            adminUser._id

        ) &&

        targetUser.isActive === true

    ) {

        throw new Error(

            "You cannot deactivate your own admin account."

        );

    }


    return true;

}


/*
|--------------------------------------------------------------------------
| Ensure Admin Can Modify Role
|--------------------------------------------------------------------------
*/

function ensureAdminCanModifyRole(

    adminUser,

    targetRole

) {

    validateUserRole(

        targetRole

    );


    /*
    |--------------------------------------------------------------------------
    | Only Super Admin Can Create/Assign Super Admin
    |--------------------------------------------------------------------------
    */

    if (

        targetRole ===

            "super_admin" &&

        adminUser.role !==

            "super_admin"

    ) {

        throw new Error(

            "Only a super admin can assign the super admin role."

        );

    }


    return true;

}


/*
|--------------------------------------------------------------------------
| Part 2 Ends Here
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| User Management Operations
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get Users
|--------------------------------------------------------------------------
*/

async function getUsers(

    options = {}

) {

    const {

        page,

        limit,

        skip

    } = normalizePagination(

        options.page,

        options.limit

    );


    const query =

        buildUserQuery(

            options

        );


    const [

        users,

        total

    ] =

        await Promise.all([

            User.find(

                query

            )

                .sort({

                    createdAt:

                        -1

                })

                .skip(

                    skip

                )

                .limit(

                    limit

                ),

            User.countDocuments(

                query

            )

        ]);


    return {

        users:

            users.map(

                sanitizeUser

            ),

        pagination:

            buildPagination(

                page,

                limit,

                total

            )

    };

}


/*
|--------------------------------------------------------------------------
| Get User
|--------------------------------------------------------------------------
*/

async function getUser(

    userId

) {

    const user =

        await findUserById(

            userId

        );


    return sanitizeUser(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Get User With Details
|--------------------------------------------------------------------------
|
| Returns user information together with related
| shop and subscription information when available.
|
|--------------------------------------------------------------------------
*/

async function getUserWithDetails(

    userId

) {

    const user =

        await findUserById(

            userId

        );


    const userObject =

        sanitizeUser(

            user

        );


    /*
    |--------------------------------------------------------------------------
    | Find Shops Owned By User
    |--------------------------------------------------------------------------
    |
    | This assumes the Shop model contains a user/owner
    | reference. If your Shop model uses a different field,
    | this query should be adjusted to match that model.
    |
    |--------------------------------------------------------------------------
    */

    let shops = [];


    if (

        Shop.schema.path(

            "user"

        )

    ) {

        shops =

            await Shop.find({

                user:

                    user._id

            });

    }

    else if (

        Shop.schema.path(

            "owner"

        )

    ) {

        shops =

            await Shop.find({

                owner:

                    user._id

            });

    }


    /*
    |--------------------------------------------------------------------------
    | Get Subscriptions
    |--------------------------------------------------------------------------
    */

    const shopIds =

        shops.map(

            (shop) =>

                shop._id

        );


    const subscriptions =

        shopIds.length

            ? await Subscription.find({

                shop: {

                    $in:

                        shopIds

                }

            })

            : [];


    return {

        user:

            userObject,

        shops,

        subscriptions

    };

}


/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
*/

async function createUser(

    data = {},

    adminUserId

) {

    /*
    |--------------------------------------------------------------------------
    | Verify Admin
    |--------------------------------------------------------------------------
    */

    const adminUser =

        await findActiveAdminById(

            adminUserId

        );


    /*
    |--------------------------------------------------------------------------
    | Validate Required Fields
    |--------------------------------------------------------------------------
    */

    if (

        !data.firstName ||

        !data.lastName ||

        !data.email ||

        !data.password

    ) {

        throw new Error(

            "First name, last name, email, and password are required."

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Normalize Email
    |--------------------------------------------------------------------------
    */

    const email =

        data.email

            .trim()

            .toLowerCase();


    /*
    |--------------------------------------------------------------------------
    | Check Duplicate Email
    |--------------------------------------------------------------------------
    */

    if (

        await emailExists(

            email

        )

    ) {

        throw new Error(

            "A user with this email already exists."

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Determine Role
    |--------------------------------------------------------------------------
    */

    const role =

        data.role ||

        "merchant";


    validateUserRole(

        role

    );


    ensureAdminCanModifyRole(

        adminUser,

        role

    );


    /*
    |--------------------------------------------------------------------------
    | Create User
    |--------------------------------------------------------------------------
    */

    const user =

        await User.create({

            firstName:

                data.firstName

                    .trim(),

            lastName:

                data.lastName

                    .trim(),

            email,

            password:

                data.password,

            role,

            isEmailVerified:

                data.isEmailVerified === true,

            isActive:

                data.isActive !== false,

            avatar:

                data.avatar ||

                "",

            phone:

                data.phone ||

                "",

            timezone:

                data.timezone ||

                "UTC"

        });


    return sanitizeUser(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/

async function updateUser(

    userId,

    data = {},

    adminUserId

) {

    const adminUser =

        await findActiveAdminById(

            adminUserId

        );


    const user =

        await findUserById(

            userId

        );


    ensureUserCanBeModified(

        user,

        adminUser

    );


    /*
    |--------------------------------------------------------------------------
    | Update First Name
    |--------------------------------------------------------------------------
    */

    if (

        data.firstName !== undefined

    ) {

        user.firstName =

            String(

                data.firstName

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Update Last Name
    |--------------------------------------------------------------------------
    */

    if (

        data.lastName !== undefined

    ) {

        user.lastName =

            String(

                data.lastName

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Update Email
    |--------------------------------------------------------------------------
    */

    if (

        data.email !== undefined

    ) {

        const email =

            String(

                data.email

            )

                .trim()

                .toLowerCase();


        if (

            email !==

            user.email

        ) {

            if (

                await emailExists(

                    email,

                    user._id

                )

            ) {

                throw new Error(

                    "A user with this email already exists."

                );

            }


            user.email =

                email;


            /*
            |--------------------------------------------------------------------------
            | Email Changed
            |--------------------------------------------------------------------------
            |
            | Require verification again after changing email.
            |
            |--------------------------------------------------------------------------
            */

            user.isEmailVerified =

                false;

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Update Phone
    |--------------------------------------------------------------------------
    */

    if (

        data.phone !== undefined

    ) {

        user.phone =

            String(

                data.phone

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Update Avatar
    |--------------------------------------------------------------------------
    */

    if (

        data.avatar !== undefined

    ) {

        user.avatar =

            String(

                data.avatar

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Update Timezone
    |--------------------------------------------------------------------------
    */

    if (

        data.timezone !== undefined

    ) {

        user.timezone =

            String(

                data.timezone

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Update Email Verification
    |--------------------------------------------------------------------------
    */

    if (

        data.isEmailVerified !== undefined

    ) {

        user.isEmailVerified =

            data.isEmailVerified === true;

    }


    /*
    |--------------------------------------------------------------------------
    | Update Active Status
    |--------------------------------------------------------------------------
    */

    if (

        data.isActive !== undefined

    ) {

        const requestedStatus =

            data.isActive === true;


        if (

            !requestedStatus &&

            String(

                user._id

            ) ===

            String(

                adminUser._id

            )

        ) {

            throw new Error(

                "You cannot deactivate your own admin account."

            );

        }


        user.isActive =

            requestedStatus;

    }


    await user.save();


    return sanitizeUser(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Change User Role
|--------------------------------------------------------------------------
*/

async function changeUserRole(

    userId,

    role,

    adminUserId

) {

    const adminUser =

        await findActiveAdminById(

            adminUserId

        );


    const user =

        await findUserById(

            userId

        );


    ensureUserCanBeModified(

        user,

        adminUser

    );


    validateUserRole(

        role

    );


    ensureAdminCanModifyRole(

        adminUser,

        role

    );


    /*
    |--------------------------------------------------------------------------
    | Prevent Admin From Changing Own Role
    |--------------------------------------------------------------------------
    */

    if (

        String(

            user._id

        ) ===

        String(

            adminUser._id

        )

    ) {

        throw new Error(

            "You cannot change your own admin role."

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Super Admin Protection
    |--------------------------------------------------------------------------
    |
    | Only a super admin can modify a super admin account.
    |
    |--------------------------------------------------------------------------
    */

    if (

        user.role ===

            "super_admin" &&

        adminUser.role !==

            "super_admin"

    ) {

        throw new Error(

            "Only a super admin can modify a super admin account."

        );

    }


    user.role =

        role;


    await user.save();


    return sanitizeUser(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Activate User
|--------------------------------------------------------------------------
*/

async function activateUser(

    userId,

    adminUserId

) {

    const adminUser =

        await findActiveAdminById(

            adminUserId

        );


    const user =

        await findUserById(

            userId

        );


    /*
    |--------------------------------------------------------------------------
    | Super Admin Protection
    |--------------------------------------------------------------------------
    */

    if (

        user.role ===

            "super_admin" &&

        adminUser.role !==

            "super_admin"

    ) {

        throw new Error(

            "Only a super admin can activate a super admin account."

        );

    }


    user.isActive =

        true;


    await user.save();


    return sanitizeUser(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Deactivate User
|--------------------------------------------------------------------------
*/

async function deactivateUser(

    userId,

    adminUserId

) {

    const adminUser =

        await findActiveAdminById(

            adminUserId

        );


    const user =

        await findUserById(

            userId

        );


    ensureUserCanBeModified(

        user,

        adminUser

    );


    /*
    |--------------------------------------------------------------------------
    | Super Admin Protection
    |--------------------------------------------------------------------------
    */

    if (

        user.role ===

            "super_admin" &&

        adminUser.role !==

            "super_admin"

    ) {

        throw new Error(

            "Only a super admin can deactivate a super admin account."

        );

    }


    user.isActive =

        false;


    await user.save();


    return sanitizeUser(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
|
| We do not physically delete users by default.
| The current User model does not have a deleted field,
| so deletion is implemented as account deactivation.
|
|--------------------------------------------------------------------------
*/

async function deleteUser(

    userId,

    adminUserId

) {

    const adminUser =

        await findActiveAdminById(

            adminUserId

        );


    const user =

        await findUserById(

            userId

        );


    ensureUserCanBeModified(

        user,

        adminUser

    );


    /*
    |--------------------------------------------------------------------------
    | Super Admin Protection
    |--------------------------------------------------------------------------
    */

    if (

        user.role ===

            "super_admin" &&

        adminUser.role !==

            "super_admin"

    ) {

        throw new Error(

            "Only a super admin can delete a super admin account."

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Safe Account Deactivation
    |--------------------------------------------------------------------------
    */

    user.isActive =

        false;


    await user.save();


    return {

        success:

            true,

        message:

            "User account deactivated successfully.",

        user:

            sanitizeUser(

                user

            )

    };

}


/*
|--------------------------------------------------------------------------
| Reset Failed Login Attempts
|--------------------------------------------------------------------------
*/

async function resetFailedLoginAttempts(

    userId,

    adminUserId

) {

    const adminUser =

        await findActiveAdminById(

            adminUserId

        );


    const user =

        await findUserById(

            userId

        );


    /*
    |--------------------------------------------------------------------------
    | Super Admin Protection
    |--------------------------------------------------------------------------
    */

    if (

        user.role ===

            "super_admin" &&

        adminUser.role !==

            "super_admin"

    ) {

        throw new Error(

            "Only a super admin can modify a super admin account."

        );

    }


    user.failedLoginAttempts =

        0;


    await user.save();


    return sanitizeUser(

        user

    );

}


/*
|--------------------------------------------------------------------------
| Part 3 Ends Here
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Shop / Store Administration
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Build Shop Search Query
|--------------------------------------------------------------------------
*/

function buildShopSearchQuery(

    search

) {

    if (

        !search ||

        typeof search !== "string"

    ) {

        return {};

    }


    const searchRegex =

        new RegExp(

            search.trim(),

            "i"

        );


    const searchableFields = [

        "storeName",

        "shop",

        "shopDomain",

        "domain",

        "email",

        "storeEmail",

        "myshopifyDomain"

    ];


    const existingFields =

        searchableFields.filter(

            (field) =>

                Boolean(

                    Shop.schema.path(

                        field

                    )

                )

        );


    if (

        existingFields.length === 0

    ) {

        return {};

    }


    return {

        $or:

            existingFields.map(

                (field) => ({

                    [field]:

                        searchRegex

                })

            )

    };

}


/*
|--------------------------------------------------------------------------
| Build Shop Filter Query
|--------------------------------------------------------------------------
*/

function buildShopFilterQuery(

    filters = {}

) {

    const query = {};


    /*
    |--------------------------------------------------------------------------
    | Active Status
    |--------------------------------------------------------------------------
    */

    if (

        filters.isActive !== undefined &&

        Shop.schema.path(

            "isActive"

        )

    ) {

        query.isActive =

            filters.isActive === true ||

            filters.isActive === "true";

    }


    /*
    |--------------------------------------------------------------------------
    | Connection Status
    |--------------------------------------------------------------------------
    */

    if (

        filters.status &&

        Shop.schema.path(

            "status"

        )

    ) {

        query.status =

            filters.status;

    }


    /*
    |--------------------------------------------------------------------------
    | Shopify Domain
    |--------------------------------------------------------------------------
    */

    if (

        filters.shopifyDomain &&

        Shop.schema.path(

            "shopifyDomain"

        )

    ) {

        query.shopifyDomain =

            filters.shopifyDomain;

    }


    /*
    |--------------------------------------------------------------------------
    | Shop Domain
    |--------------------------------------------------------------------------
    */

    if (

        filters.shop &&

        Shop.schema.path(

            "shop"

        )

    ) {

        query.shop =

            filters.shop;

    }


    return query;

}


/*
|--------------------------------------------------------------------------
| Build Shop Query
|--------------------------------------------------------------------------
*/

function buildShopQuery(

    filters = {}

) {

    return {

        ...buildShopFilterQuery(

            filters

        ),

        ...buildShopSearchQuery(

            filters.search

        )

    };

}


/*
|--------------------------------------------------------------------------
| Sanitize Shop
|--------------------------------------------------------------------------
*/

function sanitizeShop(

    shop

) {

    if (

        !shop

    ) {

        return null;

    }


    const shopObject =

        typeof shop.toObject === "function"

            ? shop.toObject()

            : {

                ...shop

            };


    /*
    |--------------------------------------------------------------------------
    | Remove Sensitive Shopify Credentials
    |--------------------------------------------------------------------------
    */

    delete shopObject.accessToken;

    delete shopObject.access_token;

    delete shopObject.clientSecret;

    delete shopObject.client_secret;

    delete shopObject.encryptionKey;

    delete shopObject.encryption_key;


    return shopObject;

}


/*
|--------------------------------------------------------------------------
| Get Shops
|--------------------------------------------------------------------------
*/

async function getShops(

    options = {}

) {

    const {

        page,

        limit,

        skip

    } = normalizePagination(

        options.page,

        options.limit

    );


    const query =

        buildShopQuery(

            options

        );


    const [

        shops,

        total

    ] =

        await Promise.all([

            Shop.find(

                query

            )

                .sort({

                    createdAt:

                        -1

                })

                .skip(

                    skip

                )

                .limit(

                    limit

                ),

            Shop.countDocuments(

                query

            )

        ]);


    return {

        shops:

            shops.map(

                sanitizeShop

            ),

        pagination:

            buildPagination(

                page,

                limit,

                total

            )

    };

}


/*
|--------------------------------------------------------------------------
| Get Shop
|--------------------------------------------------------------------------
*/

async function getShop(

    shopId

) {

    const shop =

        await findShopById(

            shopId

        );


    return sanitizeShop(

        shop

    );

}


/*
|--------------------------------------------------------------------------
| Get Shop With Details
|--------------------------------------------------------------------------
*/

async function getShopWithDetails(

    shopId

) {

    const shop =

        await findShopById(

            shopId

        );


    const subscription =

        await Subscription.findByShop(

            shop._id

        );


    const [

        orderCount,

        productCount,

        customerCount

    ] =

        await Promise.all([

            Order.countDocuments({

                shop:

                    shop._id

            }),

            Product.countDocuments({

                shop:

                    shop._id

            }),

            Customer.countDocuments({

                shop:

                    shop._id

            })

        ]);


    return {

        shop:

            sanitizeShop(

                shop

            ),

        subscription:

            subscription || null,

        statistics: {

            orderCount,

            productCount,

            customerCount

        }

    };

}


/*
|--------------------------------------------------------------------------
| Get Shop Statistics
|--------------------------------------------------------------------------
*/

async function getShopStatistics() {

    const [

        totalShops,

        activeShops,

        inactiveShops

    ] =

        await Promise.all([

            Shop.countDocuments(),

            Shop.schema.path(

                "isActive"

            )

                ? Shop.countDocuments({

                    isActive:

                        true

                })

                : 0,

            Shop.schema.path(

                "isActive"

            )

                ? Shop.countDocuments({

                    isActive:

                        false

                })

                : 0

        ]);


    /*
    |--------------------------------------------------------------------------
    | Subscription Statistics
    |--------------------------------------------------------------------------
    */

    const subscriptionStats =

        await Subscription.aggregate([

            {

                $group: {

                    _id:

                        "$status",

                    count: {

                        $sum:

                            1

                    }

                }

            }

        ]);


    const planStats =

        await Subscription.aggregate([

            {

                $group: {

                    _id:

                        "$plan",

                    count: {

                        $sum:

                            1

                    }

                }

            }

        ]);


    return {

        totalShops,

        activeShops,

        inactiveShops,

        subscriptionsByStatus:

            subscriptionStats.map(

                (item) => ({

                    status:

                        item._id,

                    count:

                        item.count

                })

            ),

        subscriptionsByPlan:

            planStats.map(

                (item) => ({

                    plan:

                        item._id,

                    count:

                        item.count

                })

            )

    };

}


/*
|--------------------------------------------------------------------------
| Get Shop Subscription
|--------------------------------------------------------------------------
*/

async function getShopSubscription(

    shopId

) {

    const shop =

        await findShopById(

            shopId

        );


    const subscription =

        await SubscriptionService.getSubscriptionByShop(

            shop._id

        );


    return {

        shop:

            sanitizeShop(

                shop

            ),

        subscription

    };

}


/*
|--------------------------------------------------------------------------
| Activate Shop
|--------------------------------------------------------------------------
*/

async function activateShop(

    shopId

) {

    const shop =

        await findShopById(

            shopId

        );


    if (

        Shop.schema.path(

            "isActive"

        )

    ) {

        shop.isActive =

            true;

    }


    if (

        Shop.schema.path(

            "status"

        )

    ) {

        shop.status =

            "active";

    }


    await shop.save();


    return sanitizeShop(

        shop

    );

}


/*
|--------------------------------------------------------------------------
| Deactivate Shop
|--------------------------------------------------------------------------
*/

async function deactivateShop(

    shopId

) {

    const shop =

        await findShopById(

            shopId

        );


    if (

        Shop.schema.path(

            "isActive"

        )

    ) {

        shop.isActive =

            false;

    }


    if (

        Shop.schema.path(

            "status"

        )

    ) {

        shop.status =

            "inactive";

    }


    await shop.save();


    return sanitizeShop(

        shop

    );

}


/*
|--------------------------------------------------------------------------
| Update Shop Information
|--------------------------------------------------------------------------
*/

async function updateShop(

    shopId,

    data = {}

) {

    const shop =

        await findShopById(

            shopId

        );


    /*
    |--------------------------------------------------------------------------
    | Store Name
    |--------------------------------------------------------------------------
    */

    if (

        data.storeName !== undefined &&

        Shop.schema.path(

            "storeName"

        )

    ) {

        shop.storeName =

            String(

                data.storeName

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Shop Name
    |--------------------------------------------------------------------------
    */

    if (

        data.shop !== undefined &&

        Shop.schema.path(

            "shop"

        )

    ) {

        shop.shop =

            String(

                data.shop

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Shop Domain
    |--------------------------------------------------------------------------
    */

    if (

        data.shopDomain !== undefined &&

        Shop.schema.path(

            "shopDomain"

        )

    ) {

        shop.shopDomain =

            String(

                data.shopDomain

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Store Email
    |--------------------------------------------------------------------------
    */

    if (

        data.storeEmail !== undefined &&

        Shop.schema.path(

            "storeEmail"

        )

    ) {

        shop.storeEmail =

            String(

                data.storeEmail

            )

                .trim()

                .toLowerCase();

    }


    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    if (

        data.currency !== undefined &&

        Shop.schema.path(

            "currency"

        )

    ) {

        shop.currency =

            String(

                data.currency

            )

                .trim()

                .toUpperCase();

    }


    /*
    |--------------------------------------------------------------------------
    | Timezone
    |--------------------------------------------------------------------------
    */

    if (

        data.timezone !== undefined &&

        Shop.schema.path(

            "timezone"

        )

    ) {

        shop.timezone =

            String(

                data.timezone

            ).trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Active Status
    |--------------------------------------------------------------------------
    */

    if (

        data.isActive !== undefined &&

        Shop.schema.path(

            "isActive"

        )

    ) {

        shop.isActive =

            data.isActive === true;

    }


    await shop.save();


    return sanitizeShop(

        shop

    );

}


/*
|--------------------------------------------------------------------------
| Delete Shop
|--------------------------------------------------------------------------
|
| Shops are not physically deleted here.
| The Shopify store data may be required for analytics,
| billing, audit history, and webhook records.
|
|--------------------------------------------------------------------------
*/

async function deleteShop(

    shopId

) {

    const shop =

        await findShopById(

            shopId

        );


    /*
    |--------------------------------------------------------------------------
    | Deactivate Shop
    |--------------------------------------------------------------------------
    */

    if (

        Shop.schema.path(

            "isActive"

        )

    ) {

        shop.isActive =

            false;

    }


    if (

        Shop.schema.path(

            "status"

        )

    ) {

        shop.status =

            "inactive";

    }


    await shop.save();


    /*
    |--------------------------------------------------------------------------
    | Cancel Subscription
    |--------------------------------------------------------------------------
    */

    const subscription =

        await Subscription.findByShop(

            shop._id

        );


    if (

        subscription

    ) {

        await SubscriptionService.cancelSubscription(

            subscription._id

        );

    }


    return {

        success:

            true,

        message:

            "Shop deactivated successfully.",

        shop:

            sanitizeShop(

                shop

            )

    };

}


/*
|--------------------------------------------------------------------------
| Part 4 Ends Here
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Subscription Administration
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get Subscriptions
|--------------------------------------------------------------------------
*/

async function getSubscriptions(

    options = {}

) {

    const {

        page,

        limit,

        skip

    } = normalizePagination(

        options.page,

        options.limit

    );


    const query = {};


    /*
    |--------------------------------------------------------------------------
    | Plan Filter
    |--------------------------------------------------------------------------
    */

    if (

        options.plan

    ) {

        validateSubscriptionPlan(

            options.plan

        );


        query.plan =

            options.plan;

    }


    /*
    |--------------------------------------------------------------------------
    | Status Filter
    |--------------------------------------------------------------------------
    */

    if (

        options.status

    ) {

        validateSubscriptionStatus(

            options.status

        );


        query.status =

            options.status;

    }


    /*
    |--------------------------------------------------------------------------
    | Shop Filter
    |--------------------------------------------------------------------------
    */

    if (

        options.shopId

    ) {

        requireObjectId(

            options.shopId,

            "shop ID"

        );


        query.shop =

            options.shopId;

    }


    /*
    |--------------------------------------------------------------------------
    | Stripe Customer Filter
    |--------------------------------------------------------------------------
    */

    if (

        options.stripeCustomerId

    ) {

        query.stripeCustomerId =

            options.stripeCustomerId;

    }


    /*
    |--------------------------------------------------------------------------
    | Stripe Subscription Filter
    |--------------------------------------------------------------------------
    */

    if (

        options.stripeSubscriptionId

    ) {

        query.stripeSubscriptionId =

            options.stripeSubscriptionId;

    }


    const [

        subscriptions,

        total

    ] =

        await Promise.all([

            Subscription.find(

                query

            )

                .populate(

                    "shop"

                )

                .sort({

                    createdAt:

                        -1

                })

                .skip(

                    skip

                )

                .limit(

                    limit

                ),

            Subscription.countDocuments(

                query

            )

        ]);


    return {

        subscriptions,

        pagination:

            buildPagination(

                page,

                limit,

                total

            )

    };

}


/*
|--------------------------------------------------------------------------
| Get Subscription
|--------------------------------------------------------------------------
*/

async function getSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    return subscription;

}


/*
|--------------------------------------------------------------------------
| Get Subscription Details
|--------------------------------------------------------------------------
*/

async function getSubscriptionDetails(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    const shop =

        await Shop.findById(

            subscription.shop

        );


    return {

        subscription,

        shop:

            shop

                ? sanitizeShop(

                    shop

                )

                : null

    };

}


/*
|--------------------------------------------------------------------------
| Get Subscription Statistics
|--------------------------------------------------------------------------
*/

async function getSubscriptionStatistics() {

    const [

        total,

        trial,

        active,

        pastDue,

        cancelled,

        expired,

        inactive

    ] =

        await Promise.all([

            Subscription.countDocuments(),

            Subscription.countDocuments({

                status:

                    "trial"

            }),

            Subscription.countDocuments({

                status:

                    "active"

            }),

            Subscription.countDocuments({

                status:

                    "past_due"

            }),

            Subscription.countDocuments({

                status:

                    "cancelled"

            }),

            Subscription.countDocuments({

                status:

                    "expired"

            }),

            Subscription.countDocuments({

                status:

                    "inactive"

            })

        ]);


    /*
    |--------------------------------------------------------------------------
    | Plan Distribution
    |--------------------------------------------------------------------------
    */

    const planDistribution =

        await Subscription.aggregate([

            {

                $group: {

                    _id:

                        "$plan",

                    count: {

                        $sum:

                            1

                    }

                }

            },

            {

                $sort: {

                    count:

                        -1

                }

            }

        ]);


    /*
    |--------------------------------------------------------------------------
    | Revenue Estimate
    |--------------------------------------------------------------------------
    */

    const revenueResult =

        await Subscription.aggregate([

            {

                $match: {

                    status: {

                        $in: [

                            "active",

                            "trial"

                        ]

                    },

                    plan: {

                        $ne:

                            "enterprise"

                    }

                }

            },

            {

                $group: {

                    _id:

                        null,

                    monthlyRevenue: {

                        $sum: {

                            $cond: [

                                {

                                    $eq: [

                                        "$billingCycle",

                                        "monthly"

                                    ]

                                },

                                "$amount",

                                0

                            ]

                        }

                    }

                }

            }

        ]);


    return {

        total,

        trial,

        active,

        pastDue,

        cancelled,

        expired,

        inactive,

        planDistribution:

            planDistribution.map(

                (item) => ({

                    plan:

                        item._id,

                    count:

                        item.count

                })

            ),

        estimatedMonthlyRevenue:

            revenueResult[0]

                ?.monthlyRevenue ||

            0

    };

}


/*
|--------------------------------------------------------------------------
| Change Subscription Plan
|--------------------------------------------------------------------------
*/

async function changeSubscriptionPlan(

    subscriptionId,

    planData

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    validateSubscriptionPlan(

        planData.plan

    );


    /*
    |--------------------------------------------------------------------------
    | Enterprise Plan
    |--------------------------------------------------------------------------
    */

    if (

        planData.plan ===

            "enterprise"

    ) {

        planData = {

            ...planData,

            planName:

                planData.planName ||

                "Enterprise"

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Change Plan Through Subscription Service
    |--------------------------------------------------------------------------
    */

    const updatedSubscription =

        await SubscriptionService.changePlan(

            subscription._id,

            {

                ...planData,

                plan:

                    planData.plan,

                planName:

                    planData.planName ||

                    subscription.planName

            }

        );


    return updatedSubscription;

}


/*
|--------------------------------------------------------------------------
| Upgrade Subscription
|--------------------------------------------------------------------------
*/

async function upgradeSubscription(

    subscriptionId,

    planData

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    validateSubscriptionPlan(

        planData.plan

    );


    const updatedSubscription =

        await SubscriptionService.upgradePlan(

            subscription._id,

            {

                ...planData,

                plan:

                    planData.plan

            }

        );


    return updatedSubscription;

}


/*
|--------------------------------------------------------------------------
| Downgrade Subscription
|--------------------------------------------------------------------------
*/

async function downgradeSubscription(

    subscriptionId,

    planData

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    validateSubscriptionPlan(

        planData.plan

    );


    const updatedSubscription =

        await SubscriptionService.downgradePlan(

            subscription._id,

            {

                ...planData,

                plan:

                    planData.plan

            }

        );


    return updatedSubscription;

}


/*
|--------------------------------------------------------------------------
| Activate Subscription Trial
|--------------------------------------------------------------------------
*/

async function activateSubscriptionTrial(

    shopId

) {

    requireObjectId(

        shopId,

        "shop ID"

    );


    const subscription =

        await findSubscriptionByShopId(

            shopId

        );


    const result =

        await SubscriptionService.activateTrial(

            shopId

        );


    return result;

}


/*
|--------------------------------------------------------------------------
| Extend Subscription Trial
|--------------------------------------------------------------------------
*/

async function extendSubscriptionTrial(

    shopId,

    extraDays = 5

) {

    requireObjectId(

        shopId,

        "shop ID"

    );


    const days =

        Number(

            extraDays

        );


    if (

        !Number.isInteger(

            days

        ) ||

        days <= 0 ||

        days > 365

    ) {

        throw new Error(

            "Trial extension must be between 1 and 365 days."

        );

    }


    const subscription =

        await findSubscriptionByShopId(

            shopId

        );


    return SubscriptionService.extendTrial(

        subscription.shop,

        days

    );

}


/*
|--------------------------------------------------------------------------
| Check Subscription Trial
|--------------------------------------------------------------------------
*/

async function checkSubscriptionTrial(

    shopId

) {

    requireObjectId(

        shopId,

        "shop ID"

    );


    return SubscriptionService.checkTrialStatus(

        shopId

    );

}


/*
|--------------------------------------------------------------------------
| Expire Subscription
|--------------------------------------------------------------------------
*/

async function expireSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    return SubscriptionService.expireSubscription(

        subscription._id

    );

}


/*
|--------------------------------------------------------------------------
| Reactivate Subscription
|--------------------------------------------------------------------------
*/

async function reactivateSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    return SubscriptionService.reactivateSubscription(

        subscription._id

    );

}


/*
|--------------------------------------------------------------------------
| Cancel Subscription
|--------------------------------------------------------------------------
*/

async function cancelSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    return SubscriptionService.cancelSubscription(

        subscription._id

    );

}


/*
|--------------------------------------------------------------------------
| Cancel Stripe Subscription
|--------------------------------------------------------------------------
*/

async function cancelStripeSubscription(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    if (

        !subscription.stripeSubscriptionId

    ) {

        throw new Error(

            "Stripe subscription is not connected."

        );

    }


    return SubscriptionService.cancelStripeSubscription(

        subscription._id

    );

}


/*
|--------------------------------------------------------------------------
| Check Subscription Usage
|--------------------------------------------------------------------------
*/

async function checkSubscriptionUsage(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    return SubscriptionService.checkUsageLimit(

        subscription._id

    );

}


/*
|--------------------------------------------------------------------------
| Reset Subscription Usage
|--------------------------------------------------------------------------
*/

async function resetSubscriptionUsage(

    subscriptionId

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    return SubscriptionService.resetMonthlyUsage(

        subscription._id

    );

}


/*
|--------------------------------------------------------------------------
| Track Subscription Usage
|--------------------------------------------------------------------------
*/

async function trackSubscriptionUsage(

    subscriptionId,

    tokensUsed = 0,

    messagesUsed = 1

) {

    const subscription =

        await findSubscriptionById(

            subscriptionId

        );


    const tokens =

        Number(

            tokensUsed

        ) || 0;


    const messages =

        Number(

            messagesUsed

        ) || 0;


    if (

        tokens < 0 ||

        messages < 0

    ) {

        throw new Error(

            "Usage values cannot be negative."

        );

    }


    return SubscriptionService.trackUsage(

        subscription._id,

        tokens,

        messages

    );

}


/*
|--------------------------------------------------------------------------
| Part 5 Ends Here
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Get Subscription Usage
|--------------------------------------------------------------------------
*/

async function getSubscriptionUsage(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const subscription =

        await SubscriptionService.getSubscriptionByShop(

            shopId

        );


    if (!subscription) {

        throw new Error(

            "Subscription not found."

        );

    }


    return {

        subscriptionId:

            subscription.id,

        plan:

            subscription.plan,

        planName:

            subscription.planName,

        status:

            subscription.status,

        monthlyMessageLimit:

            subscription.monthlyMessageLimit,

        monthlyMessageUsed:

            subscription.monthlyMessageUsed,

        monthlyMessagesRemaining:

            Math.max(

                0,

                subscription.monthlyMessageLimit -

                subscription.monthlyMessageUsed

            ),

        monthlyTokenLimit:

            subscription.monthlyTokenLimit,

        monthlyTokenUsed:

            subscription.monthlyTokenUsed,

        monthlyTokensRemaining:

            Math.max(

                0,

                subscription.monthlyTokenLimit -

                subscription.monthlyTokenUsed

            ),

        usageResetAt:

            subscription.usageResetAt,

        lastUsageAt:

            subscription.lastUsageAt

    };

}


/*
|--------------------------------------------------------------------------
| Check Subscription Access
|--------------------------------------------------------------------------
*/

async function checkSubscriptionAccess(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const subscription =

        await SubscriptionService.getSubscriptionByShop(

            shopId

        );


    if (!subscription) {

        return {

            allowed:

                false,

            reason:

                "No subscription found.",

            status:

                "inactive"

        };

    }


    const now =

        new Date();


    /*
    |--------------------------------------------------------------------------
    | Trial Expiration Check
    |--------------------------------------------------------------------------
    */

    if (

        subscription.status === "trial" &&

        subscription.trialEnd &&

        new Date(

            subscription.trialEnd

        ) <= now

    ) {

        return {

            allowed:

                false,

            reason:

                "Your 5-day free trial has expired.",

            status:

                "expired",

            subscription:

                subscription

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Subscription Status Check
    |--------------------------------------------------------------------------
    */

    const activeStatuses = [

        "trial",

        "active"

    ];


    if (

        !activeStatuses.includes(

            subscription.status

        )

    ) {

        return {

            allowed:

                false,

            reason:

                "Your subscription is not active.",

            status:

                subscription.status,

            subscription:

                subscription

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Usage Check
    |--------------------------------------------------------------------------
    */

    const messagesRemaining =

        Math.max(

            0,

            subscription.monthlyMessageLimit -

            subscription.monthlyMessageUsed

        );


    const tokensRemaining =

        Math.max(

            0,

            subscription.monthlyTokenLimit -

            subscription.monthlyTokenUsed

        );


    if (

        messagesRemaining <= 0

    ) {

        return {

            allowed:

                false,

            reason:

                "Monthly message limit reached.",

            status:

                subscription.status,

            subscription:

                subscription

        };

    }


    if (

        tokensRemaining <= 0

    ) {

        return {

            allowed:

                false,

            reason:

                "Monthly token limit reached.",

            status:

                subscription.status,

            subscription:

                subscription

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Access Granted
    |--------------------------------------------------------------------------
    */

    return {

        allowed:

            true,

        reason:

            "Subscription access granted.",

        status:

            subscription.status,

        plan:

            subscription.plan,

        planName:

            subscription.planName,

        aiModel:

            subscription.aiModel,

        messagesRemaining:

            messagesRemaining,

        tokensRemaining:

            tokensRemaining,

        subscription:

            subscription

    };

}


/*
|--------------------------------------------------------------------------
| Get Dashboard Statistics
|--------------------------------------------------------------------------
*/

async function getDashboardStatistics(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const [

        totalOrders,

        totalProducts,

        totalCustomers,

        totalMessages

    ] = await Promise.all([

        Order.countDocuments({

            shop:

                shopId

        }),

        Product.countDocuments({

            shop:

                shopId

        }),

        Customer.countDocuments({

            shop:

                shopId,

            deleted:

                false

        }),

        Conversation.countDocuments({

            shop:

                shopId

        })

    ]);


    const revenueResult =

        await Order.aggregate([

            {

                $match: {

                    shop:

                        new mongoose.Types.ObjectId(

                            shopId

                        ),

                    financialStatus: {

                        $in: [

                            "paid",

                            "partially_paid"

                        ]

                    }

                }

            },

            {

                $group: {

                    _id:

                        null,

                    totalRevenue: {

                        $sum:

                            "$totalPrice"

                    }

                }

            }

        ]);


    const totalRevenue =

        revenueResult.length > 0

            ? revenueResult[0].totalRevenue

            : 0;


    return {

        totalOrders:

            totalOrders,

        totalProducts:

            totalProducts,

        totalCustomers:

            totalCustomers,

        totalMessages:

            totalMessages,

        totalRevenue:

            totalRevenue

    };

}


/*
|--------------------------------------------------------------------------
| Get Store Overview
|--------------------------------------------------------------------------
*/

async function getStoreOverview(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const shop =

        await Shop.findById(

            shopId

        );


    if (!shop) {

        throw new Error(

            "Shop not found."

        );

    }


    const subscription =

        await SubscriptionService.getSubscriptionByShop(

            shopId

        );


    const statistics =

        await getDashboardStatistics(

            shopId

        );


    return {

        shop: {

            id:

                shop._id,

            storeName:

                shop.storeName || "",

            shopDomain:

                shop.shopDomain || "",

            myshopifyDomain:

                shop.myshopifyDomain || "",

            email:

                shop.email || "",

            currency:

                shop.currency || "USD",

            country:

                shop.country || "",

            timezone:

                shop.timezone || "UTC",

            isActive:

                shop.isActive !== false

        },

        subscription:

            subscription,

        statistics:

            statistics

    };

}


/*
|--------------------------------------------------------------------------
| Get Recent Orders
|--------------------------------------------------------------------------
*/

async function getRecentOrders(

    shopId,

    limit = 10

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const safeLimit =

        Math.min(

            Math.max(

                Number(limit) || 10,

                1

            ),

            100

        );


    return Order.find({

        shop:

            shopId

    })

        .sort({

            createdAt:

                -1

        })

        .limit(

            safeLimit

        )

        .lean();

}


/*
|--------------------------------------------------------------------------
| Get Top Products
|--------------------------------------------------------------------------
*/

async function getTopProducts(

    shopId,

    limit = 10

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const safeLimit =

        Math.min(

            Math.max(

                Number(limit) || 10,

                1

            ),

            100

        );


    return Product.find({

        shop:

            shopId,

        status:

            "active"

    })

        .sort({

            revenue:

                -1,

            purchases:

                -1,

            popularityScore:

                -1

        })

        .limit(

            safeLimit

        )

        .lean();

}


/*
|--------------------------------------------------------------------------
| Get Customer Statistics
|--------------------------------------------------------------------------
*/

async function getCustomerStatistics(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const result =

        await Customer.aggregate([

            {

                $match: {

                    shop:

                        new mongoose.Types.ObjectId(

                            shopId

                        ),

                    deleted:

                        false

                }

            },

            {

                $group: {

                    _id:

                        "$customerSegment",

                    count: {

                        $sum:

                            1

                    }

                }

            }

        ]);


    const segments = {

        new:

            0,

        returning:

            0,

        vip:

            0,

        at_risk:

            0,

        inactive:

            0

    };


    result.forEach(

        item => {

            if (

                Object.prototype.hasOwnProperty.call(

                    segments,

                    item._id

                )

            ) {

                segments[

                    item._id

                ] =

                    item.count;

            }

        }

    );


    return segments;

}


/*
|--------------------------------------------------------------------------
| Part 6 Ends Here
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Get Admin Dashboard
|--------------------------------------------------------------------------
*/

async function getAdminDashboard(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const [

        storeOverview,

        usage,

        customerStatistics,

        recentOrders,

        topProducts

    ] = await Promise.all([

        getStoreOverview(

            shopId

        ),

        getSubscriptionUsage(

            shopId

        ),

        getCustomerStatistics(

            shopId

        ),

        getRecentOrders(

            shopId,

            10

        ),

        getTopProducts(

            shopId,

            10

        )

    ]);


    return {

        store:

            storeOverview.shop,

        subscription:

            storeOverview.subscription,

        statistics:

            storeOverview.statistics,

        usage:

            usage,

        customers:

            customerStatistics,

        recentOrders:

            recentOrders,

        topProducts:

            topProducts

    };

}


/*
|--------------------------------------------------------------------------
| Get AI Model For Shop
|--------------------------------------------------------------------------
*/

async function getAIModelForShop(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const subscription =

        await SubscriptionService.getSubscriptionByShop(

            shopId

        );


    if (!subscription) {

        throw new Error(

            "Subscription not found."

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Premium & Enterprise
    |--------------------------------------------------------------------------
    */

    if (

        subscription.plan === "premium" ||

        subscription.plan === "enterprise"

    ) {

        return "gpt-5";

    }


    /*
    |--------------------------------------------------------------------------
    | Starter & Growth
    |--------------------------------------------------------------------------
    */

    return "gpt-4o-mini";

}


/*
|--------------------------------------------------------------------------
| Check AI Request Access
|--------------------------------------------------------------------------
*/

async function checkAIRequestAccess(

    shopId,

    estimatedTokens = 0

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const access =

        await checkSubscriptionAccess(

            shopId

        );


    if (!access.allowed) {

        return {

            allowed:

                false,

            reason:

                access.reason,

            status:

                access.status

        };

    }


    if (

        estimatedTokens < 0

    ) {

        throw new Error(

            "Estimated token value cannot be negative."

        );

    }


    if (

        estimatedTokens >

        access.tokensRemaining

    ) {

        return {

            allowed:

                false,

            reason:

                "Insufficient monthly AI token allowance.",

            status:

                access.status,

            tokensRemaining:

                access.tokensRemaining

        };

    }


    return {

        allowed:

            true,

        aiModel:

            access.aiModel ||

            await getAIModelForShop(

                shopId

            ),

        plan:

            access.plan,

        status:

            access.status,

        tokensRemaining:

            access.tokensRemaining,

        messagesRemaining:

            access.messagesRemaining

    };

}


/*
|--------------------------------------------------------------------------
| Get Store Information
|--------------------------------------------------------------------------
*/

async function getStoreInformation(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const shop =

        await Shop.findById(

            shopId

    ).lean();


    if (!shop) {

        throw new Error(

            "Shop not found."

        );

    }


    return {

        id:

            shop._id,

        storeName:

            shop.storeName || "",

        shopDomain:

            shop.shopDomain || "",

        myshopifyDomain:

            shop.myshopifyDomain || "",

        email:

            shop.email || "",

        phone:

            shop.phone || "",

        country:

            shop.country || "",

        currency:

            shop.currency || "USD",

        timezone:

            shop.timezone || "UTC",

        isActive:

            shop.isActive !== false,

        installedAt:

            shop.installedAt || null,

        createdAt:

            shop.createdAt,

        updatedAt:

            shop.updatedAt

    };

}


/*
|--------------------------------------------------------------------------
| Update Store Information
|--------------------------------------------------------------------------
*/

async function updateStoreInformation(

    shopId,

    updateData = {}

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const allowedFields = [

        "storeName",

        "email",

        "phone",

        "country",

        "currency",

        "timezone"

    ];


    const updates = {};


    allowedFields.forEach(

        field => {

            if (

                updateData[field] !== undefined

            ) {

                updates[field] =

                    updateData[field];

            }

        }

    );


    const shop =

        await Shop.findByIdAndUpdate(

            shopId,

            {

                $set:

                    updates

            },

            {

                new:

                    true,

                runValidators:

                    true

            }

        ).lean();


    if (!shop) {

        throw new Error(

            "Shop not found."

        );

    }


    return {

        id:

            shop._id,

        storeName:

            shop.storeName || "",

        shopDomain:

            shop.shopDomain || "",

        myshopifyDomain:

            shop.myshopifyDomain || "",

        email:

            shop.email || "",

        phone:

            shop.phone || "",

        country:

            shop.country || "",

        currency:

            shop.currency || "USD",

        timezone:

            shop.timezone || "UTC",

        isActive:

            shop.isActive !== false

    };

}


/*
|--------------------------------------------------------------------------
| Get Subscription And Access
|--------------------------------------------------------------------------
*/

async function getSubscriptionAndAccess(

    shopId

) {

    if (!shopId) {

        throw new Error(

            "Shop ID is required."

        );

    }


    const [

        subscription,

        access

    ] = await Promise.all([

        SubscriptionService.getSubscriptionByShop(

            shopId

        ),

        checkSubscriptionAccess(

            shopId

        )

    ]);


    return {

        subscription:

            subscription,

        access:

            access

    };

}


/*
|--------------------------------------------------------------------------
| Admin Service
|--------------------------------------------------------------------------
*/

const AdminService = {

    getSubscriptionUsage,

    checkSubscriptionAccess,

    getDashboardStatistics,

    getStoreOverview,

    getRecentOrders,

    getTopProducts,

    getCustomerStatistics,

    getAdminDashboard,

    getAIModelForShop,

    checkAIRequestAccess,

    getStoreInformation,

    updateStoreInformation,

    getSubscriptionAndAccess,

    trackSubscriptionUsage

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    getSubscriptionUsage,

    checkSubscriptionAccess,

    getDashboardStatistics,

    getStoreOverview,

    getRecentOrders,

    getTopProducts,

    getCustomerStatistics,

    getAdminDashboard,

    getAIModelForShop,

    checkAIRequestAccess,

    getStoreInformation,

    updateStoreInformation,

    getSubscriptionAndAccess,

    trackSubscriptionUsage

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default AdminService;
