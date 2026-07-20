/*
|--------------------------------------------------------------------------
| Layboka AI
|--------------------------------------------------------------------------
| Admin Authorization Middleware
|--------------------------------------------------------------------------
|
| Provides role-based authorization middleware for
| Admin and Super Admin protected resources.
|
|--------------------------------------------------------------------------
*/

import AppError from "../utils/AppError.js";

import logger from "../utils/logger.js";


/*
|--------------------------------------------------------------------------
| Role Constants
|--------------------------------------------------------------------------
*/

export const USER_ROLES = Object.freeze({

    MERCHANT: "merchant",

    ADMIN: "admin",

    SUPER_ADMIN: "super_admin"

});


/*
|--------------------------------------------------------------------------
| Admin Roles
|--------------------------------------------------------------------------
*/

const ADMIN_ROLES = Object.freeze([

    USER_ROLES.ADMIN,

    USER_ROLES.SUPER_ADMIN

]);


/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

const hasRole = (

    user,

    roles

) => {

    if (!user) {

        return false;

    }

    return roles.includes(

        user.role

    );

};


const isAdmin = (

    user

) => {

    return hasRole(

        user,

        ADMIN_ROLES

    );

};


const isSuperAdmin = (

    user

) => {

    return (

        user?.role ===

        USER_ROLES.SUPER_ADMIN

    );

};


/*
|--------------------------------------------------------------------------
| Startup Log
|--------------------------------------------------------------------------
*/

logger.info(

    "Admin authorization middleware loaded."

);
/*
|--------------------------------------------------------------------------
| Require Admin
|--------------------------------------------------------------------------
*/

export const requireAdmin = (

    req,

    res,

    next

) => {

    if (!req.user) {

        return next(

            AppError.unauthorized(

                "Authentication required."

            )

        );

    }

    if (!isAdmin(req.user)) {

        logger.warn(

            `Unauthorized admin access attempt by user ${req.user._id}`

        );

        return next(

            AppError.forbidden(

                "Administrator access required."

            )

        );

    }

    next();

};


/*
|--------------------------------------------------------------------------
| Require Super Admin
|--------------------------------------------------------------------------
*/

export const requireSuperAdmin = (

    req,

    res,

    next

) => {

    if (!req.user) {

        return next(

            AppError.unauthorized(

                "Authentication required."

            )

        );

    }

    if (!isSuperAdmin(req.user)) {

        logger.warn(

            `Unauthorized super admin access attempt by user ${req.user._id}`

        );

        return next(

            AppError.forbidden(

                "Super Administrator access required."

            )

        );

    }

    next();

};


/*
|--------------------------------------------------------------------------
| Require Admin Or Super Admin
|--------------------------------------------------------------------------
*/

export const requireAdminOrSuperAdmin = (

    req,

    res,

    next

) => {

    if (!req.user) {

        return next(

            AppError.unauthorized(

                "Authentication required."

            )

        );

    }

    if (!isAdmin(req.user)) {

        logger.warn(

            `Unauthorized privileged access attempt by user ${req.user._id}`

        );

        return next(

            AppError.forbidden(

                "Admin privileges required."

            )

        );

    }

    next();

};
/*
|--------------------------------------------------------------------------
| Require Specific Roles
|--------------------------------------------------------------------------
*/

export const requireRole = (

    ...roles

) => {

    return (

        req,

        res,

        next

    ) => {

        if (!req.user) {

            return next(

                AppError.unauthorized(

                    "Authentication required."

                )

            );

        }

        if (!roles.includes(req.user.role)) {

            logger.warn(

                `Access denied for user ${req.user._id}. Required roles: ${roles.join(", ")}`

            );

            return next(

                AppError.forbidden(

                    "Insufficient permissions."

                )

            );

        }

        next();

    };

};


/*
|--------------------------------------------------------------------------
| Optional Admin
|--------------------------------------------------------------------------
*/

export const optionalAdmin = (

    req,

    res,

    next

) => {

    req.isAdmin =

        isAdmin(req.user);

    req.isSuperAdmin =

        isSuperAdmin(req.user);

       req.isAdmin =

        isAdmin(req.user);

    req.isSuperAdmin =

        isSuperAdmin(req.user);

    next();

};


/*
|--------------------------------------------------------------------------
| Require Self Or Admin
|--------------------------------------------------------------------------
*/

export const requireSelfOrAdmin = (

    req,

    res,

    next

) => {

    if (!req.user) {

        return next(

            AppError.unauthorized(

                "Authentication required."

            )

        );

    }

    const resourceUserId =

        String(req.params.userId || req.params.id);

    const authenticatedUserId =

        String(req.user._id);

    if (

        authenticatedUserId !== resourceUserId &&

        !isAdmin(req.user)

    ) {

        logger.warn(

            `User ${authenticatedUserId} attempted to access resource owned by ${resourceUserId}`

        );

        return next(

            AppError.forbidden(

                "You do not have permission to access this resource."

            )

        );

    }

    next();

};
/*
|--------------------------------------------------------------------------
| Require Permission
|--------------------------------------------------------------------------
|
| Reserved for future fine-grained permissions.
| Currently validates Admin/Super Admin access.
|
|--------------------------------------------------------------------------
*/

export const requirePermission = (

    permission

) => {

    return (

        req,

        res,

        next

    ) => {

        if (!req.user) {

            return next(

                AppError.unauthorized(

                    "Authentication required."

                )

            );

        }

        if (!isAdmin(req.user)) {

            logger.warn(

                `Permission "${permission}" denied for user ${req.user._id}`

            );

            return next(

                AppError.forbidden(

                    "Permission denied."

                )

            );

        }

        next();

    };

};


/*
|--------------------------------------------------------------------------
| Require Active Admin
|--------------------------------------------------------------------------
*/

export const requireActiveAdmin = (

    req,

    res,

    next

) => {

    if (!req.user) {

        return next(

            AppError.unauthorized(

                "Authentication required."

            )

        );

    }

    if (!isAdmin(req.user)) {

        return next(

            AppError.forbidden(

                "Administrator access required."

            )

        );

    }

    if (req.user.isActive === false) {

        logger.warn(

            `Inactive administrator attempted access: ${req.user._id}`

        );

        return next(

            AppError.forbidden(

                "Administrator account is inactive."

            )

        );

    }

    next();

};


/*
|--------------------------------------------------------------------------
| Audit Admin Action
|--------------------------------------------------------------------------
*/

export const auditAdminAction = (

    action = "UNKNOWN_ACTION"

) => {

    return (

        req,

        res,

        next

    ) => {

        logger.info(

            `[ADMIN AUDIT] ${action}`,

            {

                adminId:

                    req.user?._id,

                role:

                    req.user?.role,

                method:

                    req.method,

                url:

                    req.originalUrl,

                ip:

                    req.ip,

                userAgent:

                    req.get("user-agent"),

                timestamp:

                    new Date().toISOString()

            }

        );

        next();

    };

};
/*
|--------------------------------------------------------------------------
| Middleware Aliases
|--------------------------------------------------------------------------
*/

export const adminOnly =

    requireAdmin;


export const superAdminOnly =

    requireSuperAdmin;


/*
|--------------------------------------------------------------------------
| Helper Exports
|--------------------------------------------------------------------------
*/

export {

    hasRole,

    isAdmin,

    isSuperAdmin

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    requireAdmin,

    requireSuperAdmin,

    requireAdminOrSuperAdmin,

    requireRole,

    requirePermission,

    requireActiveAdmin,

    requireSelfOrAdmin,

    optionalAdmin,

    auditAdminAction,

    adminOnly,

    superAdminOnly,

    hasRole,

    isAdmin,

    isSuperAdmin

};
