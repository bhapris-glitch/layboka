import asyncHandler from "express-async-handler";

import * as OAuthService from "../services/shopify/oauth.service.js";

import Shop from "../models/Shop.js";

import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Auth Controller
|--------------------------------------------------------------------------
*/

class AuthController {

    /*
    |--------------------------------------------------------------------------
    | Start Shopify OAuth Installation
    |--------------------------------------------------------------------------
    */

    static install = asyncHandler(

        async (req, res) => {

            const installUrl =

                await OAuthService.startOAuth(

                    req,

                    res

                );

            if (installUrl) {

                return res.json({

                    success: true,

                    installUrl

                });

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Shopify OAuth Callback
    |--------------------------------------------------------------------------
    */

    static callback = asyncHandler(

        async (req, res) => {

            const result =

                await OAuthService.handleCallback(

                    req,

                    res

                );

            return res.status(200).json({

                success: true,

                message:
                    "Shop installed successfully.",

                data: result

            });

        }

    );
    /*
    |--------------------------------------------------------------------------
    | Get Current Authenticated User
    |--------------------------------------------------------------------------
    */

    static me = asyncHandler(

        async (req, res) => {

            const user = await User.findById(

                req.user.id

            ).select("-password");

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            return res.status(200).json({

                success: true,

                data: user

            });

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Get Current Shop
    |--------------------------------------------------------------------------
    */

    static currentShop = asyncHandler(

        async (req, res) => {

            const shop = await Shop.findOne({

                owner: req.user.id,

                deleted: false

            });

            if (!shop) {

                return res.status(404).json({

                    success: false,

                    message: "Shop not found."

                });

            }

            return res.status(200).json({

                success: true,

                data: shop

            });

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Refresh Authentication
    |--------------------------------------------------------------------------
    */

    static refresh = asyncHandler(

        async (req, res) => {

            return res.status(200).json({

                success: true,

                message: "Authentication refreshed."

            });

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    static logout = asyncHandler(

        async (req, res) => {

            return res.status(200).json({

                success: true,

                message: "Logged out successfully."

            });

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Uninstall Shopify App
    |--------------------------------------------------------------------------
    */

    static uninstall = asyncHandler(

        async (req, res) => {

            const shop = await Shop.findById(

                req.params.shopId

            );

            if (!shop) {

                return res.status(404).json({

                    success: false,

                    message: "Shop not found."

                });

            }

            shop.installed = false;

            shop.uninstalledAt = new Date();

            await shop.save();

            return res.status(200).json({

                success: true,

                message:
                    "Application uninstalled successfully."

            });

        }

    );

}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export { AuthController };

export default AuthController;
