// layboka/apps/api/src/services/shopify/shopify.service.js
import "@shopify/shopify-api/adapters/node";

import {
    shopifyApi,
    LATEST_API_VERSION
} from "@shopify/shopify-api";

import { RestClient } from "@shopify/shopify-api";

import Shop from "../../models/Shop.js";

/*
|--------------------------------------------------------------------------
| Shopify Configuration
|--------------------------------------------------------------------------
*/

export const shopify = shopifyApi({

    apiKey: process.env.SHOPIFY_API_KEY,

    apiSecretKey: process.env.SHOPIFY_API_SECRET,

    scopes: process.env.SHOPIFY_SCOPES
        ?.split(","),

    hostName: process.env.APP_HOST
        ?.replace(/^https?:\/\//, ""),

    hostScheme: "https",

    apiVersion:
        process.env.SHOPIFY_API_VERSION ||
        LATEST_API_VERSION,

    isEmbeddedApp: true

});

/*
|--------------------------------------------------------------------------
| Get Shop Record
|--------------------------------------------------------------------------
*/

export async function getShop(shopId) {

    return Shop.findById(shopId);

}

/*
|--------------------------------------------------------------------------
| Get Shop By Domain
|--------------------------------------------------------------------------
*/

export async function getShopByDomain(domain) {

    return Shop.findOne({

        shop: domain

    });

}

/*
|--------------------------------------------------------------------------
| Create REST Client
|--------------------------------------------------------------------------
*/

export async function getRestClient(shopId) {

    const shop =
        await getShop(shopId);

    if (!shop) {

        throw new Error(
            "Shop not found."
        );

    }

    return new RestClient({

        session: {

            shop: shop.shop,

            accessToken:
                shop.accessToken

        }

    });

}

/*
|--------------------------------------------------------------------------
| Validate Access Token
|--------------------------------------------------------------------------
*/

export async function validateAccessToken(shopId) {

    try {

        const client =
            await getRestClient(shopId);

        await client.get({

            path: "shop"

        });

        return true;

    } catch {

        return false;

    }

}
/*
|--------------------------------------------------------------------------
| Get Shop Information
|--------------------------------------------------------------------------
*/

export async function getShopInformation(session) {

    const client = getAdminClient(session);

    const response = await client.request(

        `#graphql
        query {

            shop {

                id
                name
                email
                myshopifyDomain
                primaryDomain {
                    url
                    host
                }
                currencyCode
                timezoneAbbreviation
                plan {
                    displayName
                    partnerDevelopment
                }
            }

        }`

    );

    return response.data.shop;

}

/*
|--------------------------------------------------------------------------
| Get Products
|--------------------------------------------------------------------------
*/

export async function getProducts(

    session,

    first = 50

) {

    const client = getAdminClient(session);

    const response = await client.request(

        `#graphql
        query Products($first:Int!) {

            products(first:$first) {

                nodes {

                    id
                    title
                    handle
                    vendor
                    productType
                    status

                    featuredImage{
                        url
                    }

                    totalInventory

                    variants(first:20){

                        nodes{

                            id
                            title
                            sku
                            barcode
                            price
                            compareAtPrice
                            inventoryQuantity

                        }

                    }

                }

            }

        }`,

        {

            variables: {

                first

            }

        }

    );

    return response.data.products.nodes;

}

/*
|--------------------------------------------------------------------------
| Get Collections
|--------------------------------------------------------------------------
*/

export async function getCollections(

    session,

    first = 50

) {

    const client = getAdminClient(session);

    const response = await client.request(

        `#graphql
        query Collections($first:Int!){

            collections(first:$first){

                nodes{

                    id
                    title
                    handle
                    description

                    image{

                        url

                    }

                }

            }

        }`,

        {

            variables: {

                first

            }

        }

    );

    return response.data.collections.nodes;

}

/*
|--------------------------------------------------------------------------
| Get Customers
|--------------------------------------------------------------------------
*/

export async function getCustomers(

    session,

    first = 50

) {

    const client = getAdminClient(session);

    const response = await client.request(

        `#graphql
        query Customers($first:Int!){

            customers(first:$first){

                nodes{

                    id

                    firstName

                    lastName

                    email

                    phone

                    numberOfOrders

                    amountSpent{

                        amount

                        currencyCode

                    }

                }

            }

        }`,

        {

            variables: {

                first

            }

        }

    );

    return response.data.customers.nodes;

}

/*
|--------------------------------------------------------------------------
| Get Orders
|--------------------------------------------------------------------------
*/

export async function getOrders(

    session,

    first = 50

) {

    const client = getAdminClient(session);

    const response = await client.request(

        `#graphql
        query Orders($first:Int!){

            orders(first:$first){

                nodes{

                    id

                    name

                    displayFinancialStatus

                    displayFulfillmentStatus

                    createdAt

                    totalPriceSet{

                        shopMoney{

                            amount

                            currencyCode

                        }

                    }

                    customer{

                        id

                        firstName

                        lastName

                    }

                }

            }

        }`,

        {

            variables: {

                first

            }

        }

    );

    return response.data.orders.nodes;

}

/*
|--------------------------------------------------------------------------
| Get Inventory
|--------------------------------------------------------------------------
*/

export async function getInventory(

    session,

    first = 100

) {

    const client = getAdminClient(session);

    const response = await client.request(

        `#graphql
        query Inventory($first:Int!){

            inventoryItems(first:$first){

                nodes{

                    id

                    sku

                    tracked

                }

            }

        }`,

        {

            variables: {

                first

            }

        }

    );

    return response.data.inventoryItems.nodes;

}

/*
|--------------------------------------------------------------------------
| Get Locations
|--------------------------------------------------------------------------
*/

export async function getLocations(session) {

    const client = getAdminClient(session);

    const response = await client.request(

        `#graphql
        query{

            locations(first:50){

                nodes{

                    id

                    name

                    isActive

                    fulfillsOnlineOrders

                    address{

                        city

                        province

                        country

                        zip

                    }

                }

            }

        }`

    );

    return response.data.locations.nodes;

}
