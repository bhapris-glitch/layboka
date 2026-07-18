/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import NotificationService from "../services/notification/notification.service.js";

import {

    successResponse,

    errorResponse

} from "../utils/apiResponse.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

function getNotificationId(

    req

) {

    return (

        req.params.notificationId ||

        req.body.notificationId

    );

}


function getShopId(

    req

) {

    return (

        req.params.shopId ||

        req.body.shopId ||

        req.user?.shop ||

        req.user?.shopId

    );

}


function getUserId(

    req

) {

    return (

        req.params.userId ||

        req.body.userId ||

        req.user?._id ||

        req.user?.id

    );

}


/*
|--------------------------------------------------------------------------
| Request Helpers
|--------------------------------------------------------------------------
*/

function getPagination(

    req

) {

    return {

        page:

            Number(

                req.query.page || 1

            ),

        limit:

            Number(

                req.query.limit || 20

            )

    };

}


function getNotificationFilters(

    req

) {

    return {

        category:

            req.query.category ||

            req.body.category,

        priority:

            req.query.priority ||

            req.body.priority,

        unread:

            req.query.unread === "true"

    };

}
/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/

async function createNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createNotification(

                req.body

            );

        return successResponse(

            res,

            notification,

            "Notification created successfully."

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
| Get Notification
|--------------------------------------------------------------------------
*/

async function getNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.getNotification(

                getNotificationId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Notification retrieved successfully."

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
| Get Notifications By Shop
|--------------------------------------------------------------------------
*/

async function getNotificationsByShop(

    req,

    res

) {

    try {

        const notifications =

            await NotificationService.getNotificationsByShop(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            notifications,

            "Notifications retrieved successfully."

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
| Get Notifications By User
|--------------------------------------------------------------------------
*/

async function getNotificationsByUser(

    req,

    res

) {

    try {

        const notifications =

            await NotificationService.getNotificationsByUser(

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notifications,

            "User notifications retrieved successfully."

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
| Update Notification
|--------------------------------------------------------------------------
*/

async function updateNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.updateNotification(

                getNotificationId(

                    req

                ),

                req.body

            );

        return successResponse(

            res,

            notification,

            "Notification updated successfully."

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
| Delete Notification
|--------------------------------------------------------------------------
*/

async function deleteNotification(

    req,

    res

) {

    try {

        const result =

            await NotificationService.deleteNotification(

                getNotificationId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Notification deleted successfully."

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
| Mark As Read
|--------------------------------------------------------------------------
*/

async function markAsRead(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.markAsRead(

                getNotificationId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Notification marked as read."

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
| Mark As Unread
|--------------------------------------------------------------------------
*/

async function markAsUnread(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.markAsUnread(

                getNotificationId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Notification marked as unread."

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
| Trial Started Notification
|--------------------------------------------------------------------------
*/

async function createTrialStartedNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createTrialStartedNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Trial started notification created successfully."

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
| Trial Reminder Notification
|--------------------------------------------------------------------------
*/

async function createTrialReminderNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createTrialReminderNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Trial reminder notification created successfully."

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
| Trial Expired Notification
|--------------------------------------------------------------------------
*/

async function createTrialExpiredNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createTrialExpiredNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Trial expired notification created successfully."

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
| Recharge Now Notification
|--------------------------------------------------------------------------
*/

async function createRechargeNowNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createRechargeNowNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Recharge notification created successfully."

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
| Payment Success Notification
|--------------------------------------------------------------------------
*/

async function createPaymentSuccessNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createPaymentSuccessNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                ),

                req.body.plan

            );

        return successResponse(

            res,

            notification,

            "Payment success notification created."

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
| Payment Failed Notification
|--------------------------------------------------------------------------
*/

async function createPaymentFailedNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createPaymentFailedNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Payment failed notification created."

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
| Subscription Activated Notification
|--------------------------------------------------------------------------
*/

async function createSubscriptionActivatedNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createSubscriptionActivatedNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                ),

                req.body.plan

            );

        return successResponse(

            res,

            notification,

            "Subscription activated notification created."

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
| Subscription Cancelled Notification
|--------------------------------------------------------------------------
*/

async function createSubscriptionCancelledNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.createSubscriptionCancelledNotification(

                getShopId(

                    req

                ),

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "Subscription cancelled notification created."

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
| System Notification
|--------------------------------------------------------------------------
*/

async function sendSystemNotification(

    req,

    res

) {

    try {

        const notification =

            await NotificationService.sendSystemNotification(

                getShopId(

                    req

                ),

                req.body.title,

                req.body.message,

                getUserId(

                    req

                )

            );

        return successResponse(

            res,

            notification,

            "System notification sent successfully."

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
| Get Unread Notifications
|--------------------------------------------------------------------------
*/

async function getUnreadNotifications(

    req,

    res

) {

    try {

        const notifications =

            await NotificationService.getUnreadNotifications(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            notifications,

            "Unread notifications retrieved successfully."

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
| Get Notifications By Category
|--------------------------------------------------------------------------
*/

async function getNotificationsByCategory(

    req,

    res

) {

    try {

        const notifications =

            await NotificationService.getNotificationsByCategory(

                getShopId(

                    req

                ),

                req.params.category ||

                req.query.category

            );

        return successResponse(

            res,

            notifications,

            "Category notifications retrieved successfully."

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
| Get Notifications By Priority
|--------------------------------------------------------------------------
*/

async function getNotificationsByPriority(

    req,

    res

) {

    try {

        const notifications =

            await NotificationService.getNotificationsByPriority(

                getShopId(

                    req

                ),

                req.params.priority ||

                req.query.priority

            );

        return successResponse(

            res,

            notifications,

            "Priority notifications retrieved successfully."

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
| Get Latest Notifications
|--------------------------------------------------------------------------
*/

async function getLatestNotifications(

    req,

    res

) {

    try {

        const notifications =

            await NotificationService.getLatestNotifications(

                getShopId(

                    req

                ),

                Number(

                    req.query.limit || 10

                )

            );

        return successResponse(

            res,

            notifications,

            "Latest notifications retrieved successfully."

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
| Get Notification Analytics
|--------------------------------------------------------------------------
*/

async function getNotificationAnalytics(

    req,

    res

) {

    try {

        const analytics =

            await NotificationService.getNotificationAnalytics(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            analytics,

            "Notification analytics retrieved successfully."

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
| Mark All As Read
|--------------------------------------------------------------------------
*/

async function markAllAsRead(

    req,

    res

) {

    try {

        const result =

            await NotificationService.markAllAsRead(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "All notifications marked as read."

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
| Delete All Notifications
|--------------------------------------------------------------------------
*/

async function deleteAllNotifications(

    req,

    res

) {

    try {

        const result =

            await NotificationService.deleteAllNotifications(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "All notifications deleted successfully."

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
| Cleanup Expired Notifications
|--------------------------------------------------------------------------
*/

async function cleanupExpiredNotifications(

    req,

    res

) {

    try {

        const result =

            await NotificationService.cleanupExpiredNotifications();

        return successResponse(

            res,

            result,

            "Expired notifications cleaned successfully."

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
| Delete Read Notifications
|--------------------------------------------------------------------------
*/

async function deleteReadNotifications(

    req,

    res

) {

    try {

        const result =

            await NotificationService.deleteReadNotifications(

                getShopId(

                    req

                )

            );

        return successResponse(

            res,

            result,

            "Read notifications deleted successfully."

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
| Delete Notifications By Category
|--------------------------------------------------------------------------
*/

async function deleteNotificationsByCategory(

    req,

    res

) {

    try {

        const result =

            await NotificationService.deleteNotificationsByCategory(

                getShopId(

                    req

                ),

                req.params.category ||

                req.body.category

            );

        return successResponse(

            res,

            result,

            "Category notifications deleted successfully."

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
| Delete Notifications By Priority
|--------------------------------------------------------------------------
*/

async function deleteNotificationsByPriority(

    req,

    res

) {

    try {

        const result =

            await NotificationService.deleteNotificationsByPriority(

                getShopId(

                    req

                ),

                req.params.priority ||

                req.body.priority

            );

        return successResponse(

            res,

            result,

            "Priority notifications deleted successfully."

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
| Notification Controller
|--------------------------------------------------------------------------
*/

const NotificationController = {

    createNotification,

    getNotification,

    getNotificationsByShop,

    getNotificationsByUser,

    updateNotification,

    deleteNotification,

    markAsRead,

    markAsUnread,

    createTrialStartedNotification,

    createTrialReminderNotification,

    createTrialExpiredNotification,

    createRechargeNowNotification,

    createPaymentSuccessNotification,

    createPaymentFailedNotification,

    createSubscriptionActivatedNotification,

    createSubscriptionCancelledNotification,

    sendSystemNotification,

    getUnreadNotifications,

    getNotificationsByCategory,

    getNotificationsByPriority,

    getLatestNotifications,

    getNotificationAnalytics,

    markAllAsRead,

    deleteAllNotifications,

    cleanupExpiredNotifications,

    deleteReadNotifications,

    deleteNotificationsByCategory,

    deleteNotificationsByPriority

};


/*
|--------------------------------------------------------------------------
| Named Exports
|--------------------------------------------------------------------------
*/

export {

    NotificationController,

    createNotification,

    getNotification,

    getNotificationsByShop,

    getNotificationsByUser,

    updateNotification,

    deleteNotification,

    markAsRead,

    markAsUnread,

    createTrialStartedNotification,

    createTrialReminderNotification,

    createTrialExpiredNotification,

    createRechargeNowNotification,

    createPaymentSuccessNotification,

    createPaymentFailedNotification,

    createSubscriptionActivatedNotification,

    createSubscriptionCancelledNotification,

    sendSystemNotification,

    getUnreadNotifications,

    getNotificationsByCategory,

    getNotificationsByPriority,

    getLatestNotifications,

    getNotificationAnalytics,

    markAllAsRead,

    deleteAllNotifications,

    cleanupExpiredNotifications,

    deleteReadNotifications,

    deleteNotificationsByCategory,

    deleteNotificationsByPriority

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default NotificationController;
