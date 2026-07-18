/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import { Router } from "express";

import NotificationController from "../controllers/notification.controller.js";

import authenticate from "../middleware/authenticate.js";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = Router();


/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
*/

router.use(

    authenticate

);


/*
|--------------------------------------------------------------------------
| Controller Alias
|--------------------------------------------------------------------------
*/

const {

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

} = NotificationController;
/*
|--------------------------------------------------------------------------
| Notification CRUD Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/",

    createNotification

);


router.get(

    "/:notificationId",

    getNotification

);


router.get(

    "/shop/:shopId",

    getNotificationsByShop

);


router.get(

    "/user/:userId",

    getNotificationsByUser

);


router.put(

    "/:notificationId",

    updateNotification

);


router.delete(

    "/:notificationId",

    deleteNotification

);
/*
|--------------------------------------------------------------------------
| Read / Unread Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/:notificationId/read",

    markAsRead

);


router.post(

    "/:notificationId/unread",

    markAsUnread

);


router.post(

    "/read-all/:shopId",

    markAllAsRead

);


router.get(

    "/unread/:shopId",

    getUnreadNotifications

);


/*
|--------------------------------------------------------------------------
| Trial Notification Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/trial/start",

    createTrialStartedNotification

);


router.post(

    "/trial/reminder",

    createTrialReminderNotification

);


router.post(

    "/trial/expired",

    createTrialExpiredNotification

);


/*
|--------------------------------------------------------------------------
| Recharge Notification Route
|--------------------------------------------------------------------------
*/

router.post(

    "/recharge",

    createRechargeNowNotification

);
/*
|--------------------------------------------------------------------------
| Payment Notification Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/payment/success",

    createPaymentSuccessNotification

);


router.post(

    "/payment/failed",

    createPaymentFailedNotification

);


/*
|--------------------------------------------------------------------------
| Subscription Notification Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/subscription/activated",

    createSubscriptionActivatedNotification

);


router.post(

    "/subscription/cancelled",

    createSubscriptionCancelledNotification

);


/*
|--------------------------------------------------------------------------
| System Notification Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/system",

    sendSystemNotification

);


/*
|--------------------------------------------------------------------------
| Notification Analytics Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/analytics/:shopId",

    getNotificationAnalytics

);


router.get(

    "/latest/:shopId",

    getLatestNotifications

);


router.get(

    "/category/:shopId/:category",

    getNotificationsByCategory

);


router.get(

    "/priority/:shopId/:priority",

    getNotificationsByPriority

);
/*
|--------------------------------------------------------------------------
| Bulk Notification Routes
|--------------------------------------------------------------------------
*/

router.delete(

    "/all/:shopId",

    deleteAllNotifications

);


router.delete(

    "/read/:shopId",

    deleteReadNotifications

);


router.delete(

    "/category/:shopId/:category",

    deleteNotificationsByCategory

);


router.delete(

    "/priority/:shopId/:priority",

    deleteNotificationsByPriority

);


/*
|--------------------------------------------------------------------------
| Cleanup Routes
|--------------------------------------------------------------------------
*/

router.delete(

    "/cleanup/expired",

    cleanupExpiredNotifications

);


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

export default router;
