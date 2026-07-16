/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import CustomerService from "../services/customer/customer.service.js";

import {

    successResponse,

    errorResponse

} from "../utils/response.js";


/*
|--------------------------------------------------------------------------
| Controller Helpers
|--------------------------------------------------------------------------
*/

function getShopId(

    req

) {

    return req.shop._id;

}


function getCustomerId(

    req

) {

    return req.params.customerId;

}
