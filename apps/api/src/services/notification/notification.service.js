/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import Notification from "../../models/notification.model.js";

import Shop from "../../models/shop.model.js";

import User from "../../models/user.model.js";


/*
|--------------------------------------------------------------------------
| Private Helpers
|--------------------------------------------------------------------------
*/

async function findNotification(

    notificationId

) {

    const notification =

        await Notification.findById(

            notificationId

        );

    if (

        !notification

    ) {

        throw new Error(

            "Notification not found."

        );

    }

    return notification;

}


async function findShop(

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

    return shop;

}


async function findUser(

    userId

) {

    if (

        !userId

    ) {

        return null;

    }

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
| Notification Mapper
|--------------------------------------------------------------------------
*/

function mapNotification(

    notification

) {

    return {

        id:

            notification._id,

        shop:

            notification.shop,

        user:

            notification.user,

        title:

            notification.title,

        message:

            notification.message,

        type:

            notification.type,

        category:

            notification.category,

        priority:

            notification.priority,

        isRead:

            notification.isRead,

        readAt:

            notification.readAt,

        actionLabel:

            notification.actionLabel,

        actionUrl:

            notification.actionUrl,

        icon:

            notification.icon,

        image:

            notification.image,

        expiresAt:

            notification.expiresAt,

        createdAt:

            notification.createdAt,

        updatedAt:

            notification.updatedAt

    };

}
/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/

async function createNotification(

    notificationData

) {

    await findShop(

        notificationData.shop

    );


    if (

        notificationData.user

    ) {

        await findUser(

            notificationData.user

        );

    }


    const notification =

        await Notification.create(

            notificationData

        );


    return mapNotification(

        notification

    );

}


/*
|--------------------------------------------------------------------------
| Get Notification
|--------------------------------------------------------------------------
*/

async function getNotification(

    notificationId

) {

    const notification =

        await findNotification(

            notificationId

        );


    return mapNotification(

        notification

    );

}


/*
|--------------------------------------------------------------------------
| Get Notifications By Shop
|--------------------------------------------------------------------------
*/

async function getNotificationsByShop(

    shopId

) {

    await findShop(

        shopId

    );


    const notifications =

        await Notification.find({

            shop: shopId

        })

        .sort({

            createdAt: -1

        });


    return notifications.map(

        mapNotification

    );

}


/*
|--------------------------------------------------------------------------
| Get Notifications By User
|--------------------------------------------------------------------------
*/

async function getNotificationsByUser(

    userId

) {

    await findUser(

        userId

    );


    const notifications =

        await Notification.find({

            user: userId

        })

        .sort({

            createdAt: -1

        });


    return notifications.map(

        mapNotification

    );

      }
/*
|--------------------------------------------------------------------------
| Update Notification
|--------------------------------------------------------------------------
*/

async function updateNotification(

    notificationId,

    updateData

) {

    const notification =

        await findNotification(

            notificationId

        );


    Object.assign(

        notification,

        updateData

    );


    await notification.save();


    return mapNotification(

        notification

    );

}


/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/

async function deleteNotification(

    notificationId

) {

    const notification =

        await findNotification(

            notificationId

        );


    await notification.deleteOne();


    return {

        deleted: true,

        notificationId

    };

}


/*
|--------------------------------------------------------------------------
| Mark As Read
|--------------------------------------------------------------------------
*/

async function markAsRead(

    notificationId

) {

    const notification =

        await findNotification(

            notificationId

        );


    await notification.markAsRead();


    return mapNotification(

        notification

    );

}


/*
|--------------------------------------------------------------------------
| Mark As Unread
|--------------------------------------------------------------------------
*/

async function markAsUnread(

    notificationId

) {

    const notification =

        await findNotification(

            notificationId

        );


    await notification.markAsUnread();


    return mapNotification(

        notification

    );

          }
/*
|--------------------------------------------------------------------------
| Trial Started Notification
|--------------------------------------------------------------------------
*/

async function createTrialStartedNotification(

    shopId,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Welcome to Layboka AI",

        message:

            "Your 5-day Premium trial has started. Enjoy all Premium features.",

        type: "success",

        category: "trial",

        priority: "normal",

        actionLabel: "Open Dashboard",

        actionUrl: "/dashboard"

    });

}


/*
|--------------------------------------------------------------------------
| Trial Reminder Notification
|--------------------------------------------------------------------------
*/

async function createTrialReminderNotification(

    shopId,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Trial Ending Soon",

        message:

            "Your 5-day Premium trial is ending soon. Choose a plan to continue using Layboka AI.",

        type: "warning",

        category: "trial",

        priority: "high",

        actionLabel: "View Pricing",

        actionUrl: "/pricing"

    });

}


/*
|--------------------------------------------------------------------------
| Trial Expired Notification
|--------------------------------------------------------------------------
*/

async function createTrialExpiredNotification(

    shopId,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Trial Expired",

        message:

            "Your 5-day Premium trial has expired. Your chatbot is now locked until you recharge.",

        type: "error",

        category: "trial",

        priority: "critical",

        actionLabel: "Recharge Now",

        actionUrl: "/pricing"

    });

}


/*
|--------------------------------------------------------------------------
| Recharge Now Notification
|--------------------------------------------------------------------------
*/

async function createRechargeNowNotification(

    shopId,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Recharge Required",

        message:

            "Select Starter, Growth, or Premium to reactivate your chatbot.",

        type: "billing",

        category: "subscription",

        priority: "critical",

        actionLabel: "Recharge Now",

        actionUrl: "/pricing"

    });

          }
/*
|--------------------------------------------------------------------------
| Payment Success Notification
|--------------------------------------------------------------------------
*/

async function createPaymentSuccessNotification(

    shopId,

    userId = null,

    plan = "Premium"

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Payment Successful",

        message:

            `Your ${plan} plan has been activated successfully.`,

        type: "success",

        category: "payment",

        priority: "normal",

        actionLabel: "Open Dashboard",

        actionUrl: "/dashboard"

    });

}


/*
|--------------------------------------------------------------------------
| Payment Failed Notification
|--------------------------------------------------------------------------
*/

async function createPaymentFailedNotification(

    shopId,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Payment Failed",

        message:

            "We couldn't process your payment. Please try again or use another payment method.",

        type: "error",

        category: "payment",

        priority: "high",

        actionLabel: "Retry Payment",

        actionUrl: "/pricing"

    });

}


/*
|--------------------------------------------------------------------------
| Subscription Activated Notification
|--------------------------------------------------------------------------
*/

async function createSubscriptionActivatedNotification(

    shopId,

    userId = null,

    plan = "Premium"

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Subscription Activated",

        message:

            `${plan} plan is now active. Your chatbot has been unlocked.`,

        type: "success",

        category: "subscription",

        priority: "normal",

        actionLabel: "Go to Dashboard",

        actionUrl: "/dashboard"

    });

}


/*
|--------------------------------------------------------------------------
| Subscription Cancelled Notification
|--------------------------------------------------------------------------
*/

async function createSubscriptionCancelledNotification(

    shopId,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title: "Subscription Cancelled",

        message:

            "Your subscription has been cancelled. Your chatbot will remain locked until you purchase a new plan.",

        type: "warning",

        category: "subscription",

        priority: "high",

        actionLabel: "Choose a Plan",

        actionUrl: "/pricing"

    });

}
/*
|--------------------------------------------------------------------------
| Get Unread Notifications
|--------------------------------------------------------------------------
*/

async function getUnreadNotifications(

    shopId

) {

    await findShop(

        shopId

    );


    const notifications =

        await Notification.find({

            shop: shopId,

            isRead: false

        })

        .sort({

            createdAt: -1

        });


    return notifications.map(

        mapNotification

    );

}


/*
|--------------------------------------------------------------------------
| Mark All As Read
|--------------------------------------------------------------------------
*/

async function markAllAsRead(

    shopId

) {

    await findShop(

        shopId

    );


    await Notification.updateMany(

        {

            shop: shopId,

            isRead: false

        },

        {

            $set: {

                isRead: true,

                readAt: new Date()

            }

        }

    );


    return {

        success: true

    };

}


/*
|--------------------------------------------------------------------------
| Delete All Notifications
|--------------------------------------------------------------------------
*/

async function deleteAllNotifications(

    shopId

) {

    await findShop(

        shopId

    );


    const result =

        await Notification.deleteMany({

            shop: shopId

        });


    return {

        success: true,

        deletedCount:

            result.deletedCount

    };

}


/*
|--------------------------------------------------------------------------
| Cleanup Expired Notifications
|--------------------------------------------------------------------------
*/

async function cleanupExpiredNotifications() {

    const result =

        await Notification.deleteMany({

            expiresAt: {

                $ne: null,

                $lte: new Date()

            }

        });


    return {

        success: true,

        deletedCount:

            result.deletedCount

    };

}
/*
|--------------------------------------------------------------------------
| Get Notifications By Category
|--------------------------------------------------------------------------
*/

async function getNotificationsByCategory(

    shopId,

    category

) {

    await findShop(

        shopId

    );


    const notifications =

        await Notification.find({

            shop: shopId,

            category

        })

        .sort({

            createdAt: -1

        });


    return notifications.map(

        mapNotification

    );

}


/*
|--------------------------------------------------------------------------
| Get Notifications By Priority
|--------------------------------------------------------------------------
*/

async function getNotificationsByPriority(

    shopId,

    priority

) {

    await findShop(

        shopId

    );


    const notifications =

        await Notification.find({

            shop: shopId,

            priority

        })

        .sort({

            createdAt: -1

        });


    return notifications.map(

        mapNotification

    );

}


/*
|--------------------------------------------------------------------------
| Notification Analytics
|--------------------------------------------------------------------------
*/

async function getNotificationAnalytics(

    shopId

) {

    await findShop(

        shopId

    );


    const [

        total,

        unread,

        read,

        expired

    ] = await Promise.all([

        Notification.countDocuments({

            shop: shopId

        }),

        Notification.countDocuments({

            shop: shopId,

            isRead: false

        }),

        Notification.countDocuments({

            shop: shopId,

            isRead: true

        }),

        Notification.countDocuments({

            shop: shopId,

            expiresAt: {

                $ne: null,

                $lte: new Date()

            }

        })

    ]);


    return {

        total,

        unread,

        read,

        expired

    };

}


/*
|--------------------------------------------------------------------------
| Latest Notifications
|--------------------------------------------------------------------------
*/

async function getLatestNotifications(

    shopId,

    limit = 10

) {

    await findShop(

        shopId

    );


    const notifications =

        await Notification.find({

            shop: shopId

        })

        .sort({

            createdAt: -1

        })

        .limit(

            limit

        );


    return notifications.map(

        mapNotification

    );

  }
/*
|--------------------------------------------------------------------------
| Send System Notification
|--------------------------------------------------------------------------
*/

async function sendSystemNotification(

    shopId,

    title,

    message,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title,

        message,

        type: "info",

        category: "system",

        priority: "normal"

    });

}


/*
|--------------------------------------------------------------------------
| Send Billing Notification
|--------------------------------------------------------------------------
*/

async function sendBillingNotification(

    shopId,

    title,

    message,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title,

        message,

        type: "billing",

        category: "billing",

        priority: "high",

        actionLabel: "View Billing",

        actionUrl: "/billing"

    });

}


/*
|--------------------------------------------------------------------------
| Send Security Notification
|--------------------------------------------------------------------------
*/

async function sendSecurityNotification(

    shopId,

    title,

    message,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title,

        message,

        type: "warning",

        category: "security",

        priority: "critical"

    });

}


/*
|--------------------------------------------------------------------------
| Send Marketing Notification
|--------------------------------------------------------------------------
*/

async function sendMarketingNotification(

    shopId,

    title,

    message,

    userId = null

) {

    return createNotification({

        shop: shopId,

        user: userId,

        title,

        message,

        type: "info",

        category: "marketing",

        priority: "low",

        actionLabel: "Learn More",

        actionUrl: "/dashboard"

    });

      }
/*
|--------------------------------------------------------------------------
| Delete Expired Notifications
|--------------------------------------------------------------------------
*/

async function deleteExpiredNotifications() {

    const result =

        await Notification.deleteMany({

            expiresAt: {

                $ne: null,

                $lte: new Date()

            }

        });

    return {

        success: true,

        deletedCount: result.deletedCount

    };

}


/*
|--------------------------------------------------------------------------
| Delete Read Notifications
|--------------------------------------------------------------------------
*/

async function deleteReadNotifications(

    shopId

) {

    await findShop(

        shopId

    );

    const result =

        await Notification.deleteMany({

            shop: shopId,

            isRead: true

        });

    return {

        success: true,

        deletedCount: result.deletedCount

    };

}


/*
|--------------------------------------------------------------------------
| Delete Notifications By Category
|--------------------------------------------------------------------------
*/

async function deleteNotificationsByCategory(

    shopId,

    category

) {

    await findShop(

        shopId

    );

    const result =

        await Notification.deleteMany({

            shop: shopId,

            category

        });

    return {

        success: true,

        deletedCount: result.deletedCount

    };

}


/*
|--------------------------------------------------------------------------
| Delete Notifications By Priority
|--------------------------------------------------------------------------
*/

async function deleteNotificationsByPriority(

    shopId,

    priority

) {

    await findShop(

        shopId

    );

    const result =

        await Notification.deleteMany({

            shop: shopId,

            priority

        });

    return {

        success: true,

        deletedCount: result.deletedCount

    };

      }
/*
|--------------------------------------------------------------------------
| Notification Service
|--------------------------------------------------------------------------
*/

const NotificationService = {

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

    getUnreadNotifications,

    markAllAsRead,

    deleteAllNotifications,

    cleanupExpiredNotifications,

    getNotificationsByCategory,

    getNotificationsByPriority,

    getNotificationAnalytics,

    getLatestNotifications,

    sendSystemNotification,

    sendBillingNotification,

    sendSecurityNotification,

    sendMarketingNotification,

    deleteExpiredNotifications,

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

    getUnreadNotifications,

    markAllAsRead,

    deleteAllNotifications,

    cleanupExpiredNotifications,

    getNotificationsByCategory,

    getNotificationsByPriority,

    getNotificationAnalytics,

    getLatestNotifications,

    sendSystemNotification,

    sendBillingNotification,

    sendSecurityNotification,

    sendMarketingNotification,

    deleteExpiredNotifications,

    deleteReadNotifications,

    deleteNotificationsByCategory,

    deleteNotificationsByPriority

};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default NotificationService;
