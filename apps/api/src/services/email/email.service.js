/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import nodemailer from "nodemailer";
import { Resend } from "resend";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIRECTORY = path.join(
    __dirname,
    "../../templates/emails"
);

const EMAIL_PROVIDER =
    process.env.EMAIL_PROVIDER || "resend";

const EMAIL_FROM =
    process.env.EMAIL_FROM ||
    "Layboka AI <noreply@layboka.com>";

/*
|--------------------------------------------------------------------------
| Email Provider Initialization
|--------------------------------------------------------------------------
*/

let resend = null;
let transporter = null;

if (
    EMAIL_PROVIDER === "resend" &&
    process.env.RESEND_API_KEY
) {

    resend = new Resend(

        process.env.RESEND_API_KEY

    );

}

if (

    EMAIL_PROVIDER === "smtp"

) {

    transporter = nodemailer.createTransport({

        host: process.env.SMTP_HOST,

        port: Number(

            process.env.SMTP_PORT || 587

        ),

        secure:

            process.env.SMTP_SECURE === "true",

        auth: {

            user: process.env.SMTP_USER,

            pass: process.env.SMTP_PASSWORD

        }

    });

}

/*
|--------------------------------------------------------------------------
| Templates Loader
|--------------------------------------------------------------------------
*/

export async function loadTemplate(

    templateName

) {

    try {

        const templatePath = path.join(

            TEMPLATE_DIRECTORY,

            `${templateName}.html`

        );

        return await fs.readFile(

            templatePath,

            "utf8"

        );

    } catch (error) {

        throw new Error(

            `Email template "${templateName}" not found.`

        );

    }

}

/*
|--------------------------------------------------------------------------
| Generic Send Email
|--------------------------------------------------------------------------
*/

export async function sendEmail({

    to,

    subject,

    html,

    text = "",

    from = EMAIL_FROM

}) {

    try {

        /*
        |--------------------------------------------------------------------------
        | Resend
        |--------------------------------------------------------------------------
        */

        if (resend) {

            return await resend.emails.send({

                from,

                to,

                subject,

                html,

                text

            });

        }

        /*
        |--------------------------------------------------------------------------
        | SMTP / Nodemailer
        |--------------------------------------------------------------------------
        */

        if (transporter) {

            return await transporter.sendMail({

                from,

                to,

                subject,

                html,

                text

            });

        }

        throw new Error(

            "No email provider configured."

        );

    } catch (error) {

        throw new Error(

            `Email sending failed: ${error.message}`

        );

    }

}
