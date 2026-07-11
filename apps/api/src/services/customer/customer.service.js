// layboka/apps/api/src/services/customer/customer.service.js
import Visitor from "../../models/Visitor.js";
import Conversation from "../../models/Conversation.js";
import Order from "../../models/Order.js";
import Analytics from "../../models/Analytics.js";

/*
|--------------------------------------------------------------------------
| Customer Configuration
|--------------------------------------------------------------------------
*/

export const CUSTOMER_CONFIG = Object.freeze({

    VIP_SPENDING: 1000,

    VIP_ORDERS: 10,

    RECENT_DAYS: 30

});

/*
|--------------------------------------------------------------------------
| Find Customer
|--------------------------------------------------------------------------
*/

export async function findCustomer(visitorId) {

    return Visitor.findById(visitorId);

}

/*
|--------------------------------------------------------------------------
| Find Customer By Email
|--------------------------------------------------------------------------
*/

export async function findCustomerByEmail(email) {

    if (!email) {

        return null;

    }

    return Visitor.findOne({

        email: email.toLowerCase()

    });

}

/*
|--------------------------------------------------------------------------
| Create Customer
|--------------------------------------------------------------------------
*/

export async function createCustomer(data = {}) {

    const visitor = new Visitor({

        firstName: data.firstName || "",

        lastName: data.lastName || "",

        email: data.email || "",

        phone: data.phone || "",

        preferredLanguage: data.preferredLanguage || "en",

        preferredCurrency: data.preferredCurrency || "USD"

    });

    await visitor.save();

    return visitor;

}

/*
|--------------------------------------------------------------------------
| Update Customer
|--------------------------------------------------------------------------
*/

export async function updateCustomer(

    visitorId,

    updates = {}

) {

    return Visitor.findByIdAndUpdate(

        visitorId,

        {

            $set: updates

        },

        {

            new: true,

            runValidators: true

        }

    );

}

/*
|--------------------------------------------------------------------------
| Update Preferences
|--------------------------------------------------------------------------
*/

export async function updatePreferences(

    visitorId,

    preferences = {}

) {

    return updateCustomer(

        visitorId,

        {

            preferredLanguage:

                preferences.language,

            preferredCurrency:

                preferences.currency,

            favoriteCategory:

                preferences.favoriteCategory,

            favoriteBrand:

                preferences.favoriteBrand

        }

    );

}

/*
|--------------------------------------------------------------------------
| Get Customer Profile
|--------------------------------------------------------------------------
*/

export async function getCustomerProfile(

    visitorId

) {

    return Visitor.findById(visitorId)

        .lean();

}
