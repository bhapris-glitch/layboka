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
/*
|--------------------------------------------------------------------------
| Welcome Email
|--------------------------------------------------------------------------
*/

export function welcomeEmailTemplate({

    customerName,

    companyName = "Layboka AI",

    loginUrl

}) {

    return {

        subject: `Welcome to ${companyName}! 🎉`,

        html: `
            <h2>Welcome ${customerName},</h2>

            <p>
                Thank you for joining
                <strong>${companyName}</strong>.
            </p>

            <p>
                Your AI Sales Executive is now ready
                to help convert visitors into customers.
            </p>

            <p>
                <a href="${loginUrl}">
                    Open Dashboard
                </a>
            </p>

            <p>
                Have an amazing journey!
            </p>
        `

    };

}

/*
|--------------------------------------------------------------------------
| Trial Started Email
|--------------------------------------------------------------------------
*/

export function trialStartedTemplate({

    customerName,

    trialDays,

    expiresAt,

    dashboardUrl

}) {

    return {

        subject: `Your ${trialDays}-Day Free Trial Has Started`,

        html: `
            <h2>Hello ${customerName},</h2>

            <p>
                Your Layboka AI trial has started.
            </p>

            <p>

                Trial Length:
                <strong>${trialDays} days</strong>

                <br>

                Ends On:
                <strong>${expiresAt}</strong>

            </p>

            <p>

                <a href="${dashboardUrl}">
                    Go To Dashboard
                </a>

            </p>

        `

    };

}

/*
|--------------------------------------------------------------------------
| Trial Ending Reminder
|--------------------------------------------------------------------------
*/

export function trialEndingTemplate({

    customerName,

    remainingDays,

    upgradeUrl

}) {

    return {

        subject: `Only ${remainingDays} Day(s) Remaining`,

        html: `
            <h2>Hello ${customerName},</h2>

            <p>

                Your Layboka AI trial will expire
                in <strong>${remainingDays} day(s)</strong>.

            </p>

            <p>

                Upgrade now to keep your AI
                Sales Executive running.

            </p>

            <a href="${upgradeUrl}">

                Upgrade Now

            </a>

        `

    };

}

/*
|--------------------------------------------------------------------------
| Subscription Activated
|--------------------------------------------------------------------------
*/

export function subscriptionActivatedTemplate({

    customerName,

    plan,

    billingCycle,

    dashboardUrl

}) {

    return {

        subject: `Your ${plan} Subscription Is Active ✅`,

        html: `
            <h2>Congratulations ${customerName},</h2>

            <p>

                Your
                <strong>${plan}</strong>
                subscription has been activated.

            </p>

            <p>

                Billing:
                <strong>${billingCycle}</strong>

            </p>

            <p>

                <a href="${dashboardUrl}">
                    Open Dashboard
                </a>

            </p>

        `

    };

}

/*
|--------------------------------------------------------------------------
| Subscription Cancelled
|--------------------------------------------------------------------------
*/

export function subscriptionCancelledTemplate({

    customerName,

    expiresAt,

    reactivateUrl

}) {

    return {

        subject: `Subscription Cancelled`,

        html: `
            <h2>Hello ${customerName},</h2>

            <p>

                Your subscription has been cancelled.

            </p>

            <p>

                You can continue using Layboka AI
                until:

                <strong>${expiresAt}</strong>

            </p>

            <a href="${reactivateUrl}">

                Reactivate Subscription

            </a>

        `

    };

}

/*
|--------------------------------------------------------------------------
| Payment Success
|--------------------------------------------------------------------------
*/

export function paymentSuccessTemplate({

    customerName,

    amount,

    currency,

    invoiceNumber,

    dashboardUrl

}) {

    return {

        subject: `Payment Successful 🎉`,

        html: `
            <h2>Payment Received</h2>

            <p>

                Hello ${customerName},

            </p>

            <p>

                We successfully received your payment.

            </p>

            <ul>

                <li>

                    Amount:
                    ${currency} ${amount}

                </li>

                <li>

                    Invoice:
                    ${invoiceNumber}

                </li>

            </ul>

            <p>

                <a href="${dashboardUrl}">
                    Open Dashboard
                </a>

            </p>

        `

    };

}
/*
|--------------------------------------------------------------------------
| Payment Success Email
|--------------------------------------------------------------------------
*/

export async function sendPaymentSuccessEmail({

    user,

    subscription,

    invoice

}) {

    return sendEmail({

        to: user.email,

        subject: "🎉 Payment Successful - Layboka AI",

        template: "payment-success",

        data: {

            name: user.name,

            plan: subscription.plan,

            amount: invoice.amount,

            currency: invoice.currency,

            invoiceNumber: invoice.invoiceNumber,

            nextBillingDate:

                subscription.currentPeriodEnd

        }

    });

}

/*
|--------------------------------------------------------------------------
| Payment Failed Email
|--------------------------------------------------------------------------
*/

export async function sendPaymentFailedEmail({

    user,

    subscription,

    invoice

}) {

    return sendEmail({

        to: user.email,

        subject: "Payment Failed - Action Required",

        template: "payment-failed",

        data: {

            name: user.name,

            plan: subscription.plan,

            amount: invoice.amount,

            currency: invoice.currency,

            billingPortal:

                invoice.billingPortal,

            retryDate:

                invoice.retryDate

        }

    });

}

/*
|--------------------------------------------------------------------------
| Invoice Email
|--------------------------------------------------------------------------
*/

export async function sendInvoiceEmail({

    user,

    invoice

}) {

    return sendEmail({

        to: user.email,

        subject: `Invoice #${invoice.invoiceNumber}`,

        template: "invoice",

        data: {

            name: user.name,

            invoiceNumber:

                invoice.invoiceNumber,

            amount:

                invoice.amount,

            currency:

                invoice.currency,

            downloadUrl:

                invoice.downloadUrl,

            issuedAt:

                invoice.issuedAt

        }

    });

}

/*
|--------------------------------------------------------------------------
| Password Reset Email
|--------------------------------------------------------------------------
*/

export async function sendPasswordResetEmail({

    user,

    resetToken,

    expiresAt

}) {

    return sendEmail({

        to: user.email,

        subject: "Reset Your Layboka AI Password",

        template: "password-reset",

        data: {

            name: user.name,

            resetUrl:

                `${APP_URL}/reset-password?token=${resetToken}`,

            expiresAt

        }

    });

}

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
*/

export async function sendEmailVerification({

    user,

    verificationToken

}) {

    return sendEmail({

        to: user.email,

        subject: "Verify Your Email Address",

        template: "email-verification",

        data: {

            name: user.name,

            verificationUrl:

                `${APP_URL}/verify-email?token=${verificationToken}`

        }

    });

}
/*
|--------------------------------------------------------------------------
| Welcome Email (Trial Started)
|--------------------------------------------------------------------------
*/

export async function sendTrialWelcomeEmail({

    user,

    trialEndsAt,

    plan = "Starter"

}) {

    return sendEmail({

        to: user.email,

        subject: "🎉 Welcome to Layboka AI – Your Free Trial Has Started",

        template: "trial-welcome",

        data: {

            name: user.name,

            plan,

            trialEndsAt

        }

    });

}

/*
|--------------------------------------------------------------------------
| Welcome Email (Paid Plan Started)
|--------------------------------------------------------------------------
*/

export async function sendPlanWelcomeEmail({

    user,

    subscription

}) {

    return sendEmail({

        to: user.email,

        subject: `Welcome to ${subscription.plan} Plan`,

        template: "plan-welcome",

        data: {

            name: user.name,

            plan: subscription.plan,

            nextBillingDate:

                subscription.currentPeriodEnd

        }

    });

}

/*
|--------------------------------------------------------------------------
| Trial Expiry Reminder
|--------------------------------------------------------------------------
*/

export async function sendTrialExpiryReminder({

    user,

    trialEndsAt,

    hoursRemaining

}) {

    return sendEmail({

        to: user.email,

        subject: `Your Layboka AI Trial Ends in ${hoursRemaining} Hours`,

        template: "trial-expiry-reminder",

        data: {

            name: user.name,

            trialEndsAt,

            hoursRemaining

        }

    });

}

/*
|--------------------------------------------------------------------------
| Subscription Renewal Reminder
|--------------------------------------------------------------------------
*/

export async function sendPlanExpiryReminder({

    user,

    subscription,

    hoursRemaining

}) {

    return sendEmail({

        to: user.email,

        subject: `Your ${subscription.plan} Plan Renews in ${hoursRemaining} Hours`,

        template: "plan-expiry-reminder",

        data: {

            name: user.name,

            plan: subscription.plan,

            renewalDate:

                subscription.currentPeriodEnd,

            hoursRemaining

        }

    });

}
/*
|--------------------------------------------------------------------------
| Cart Recovery Email
|--------------------------------------------------------------------------
*/

export async function sendCartRecoveryEmail({

    visitor,

    shop,

    cart,

    recoveryUrl

}) {

    const subject = `You left something behind at ${shop.storeName}`;

    const html = `
        <h2>Your cart is waiting</h2>

        <p>Hello ${visitor.firstName || "there"},</p>

        <p>You still have items waiting in your cart.</p>

        <p>
            Cart Value:
            <strong>
                ${cart.currency || "USD"} ${cart.total || 0}
            </strong>
        </p>

        <p>
            <a href="${recoveryUrl}">
                Recover My Cart
            </a>
        </p>

        <p>— ${shop.assistantName || "Layboka AI"}</p>
    `;

    return sendEmail({

        to: visitor.email,

        subject,

        html

    });

}

/*
|--------------------------------------------------------------------------
| AI Daily Report
|--------------------------------------------------------------------------
*/

export async function sendDailyReport({

    user,

    analytics

}) {

    const subject = "Layboka AI - Daily Performance Report";

    const html = `
        <h2>Daily Report</h2>

        <table>

            <tr>
                <td>Visitors</td>
                <td>${analytics.visitors}</td>
            </tr>

            <tr>
                <td>Conversations</td>
                <td>${analytics.conversations}</td>
            </tr>

            <tr>
                <td>Orders</td>
                <td>${analytics.orders}</td>
            </tr>

            <tr>
                <td>Revenue</td>
                <td>${analytics.revenue}</td>
            </tr>

            <tr>
                <td>AI Tokens</td>
                <td>${analytics.tokens}</td>
            </tr>

        </table>
    `;

    return sendEmail({

        to: user.email,

        subject,

        html

    });

}

/*
|--------------------------------------------------------------------------
| Weekly Analytics Email
|--------------------------------------------------------------------------
*/

export async function sendWeeklyAnalytics({

    user,

    analytics

}) {

    const subject = "Layboka AI - Weekly Analytics";

    const html = `
        <h2>Weekly Analytics</h2>

        <ul>

            <li>Total Visitors: ${analytics.visitors}</li>

            <li>AI Conversations: ${analytics.conversations}</li>

            <li>Products Recommended: ${analytics.recommendations}</li>

            <li>Recovered Carts: ${analytics.recoveredCarts}</li>

            <li>Total Revenue: ${analytics.revenue}</li>

            <li>Conversion Rate: ${analytics.conversionRate}%</li>

        </ul>
    `;

    return sendEmail({

        to: user.email,

        subject,

        html

    });

}

/*
|--------------------------------------------------------------------------
| Enterprise Lead Notification
|--------------------------------------------------------------------------
*/

export async function sendEnterpriseLeadNotification({

    lead

}) {

    const subject = `New Enterprise Lead - ${lead.company}`;

    const html = `
        <h2>New Enterprise Lead</h2>

        <p><strong>Name:</strong> ${lead.name}</p>

        <p><strong>Email:</strong> ${lead.email}</p>

        <p><strong>Company:</strong> ${lead.company}</p>

        <p><strong>Employees:</strong> ${lead.employees}</p>

        <p><strong>Message:</strong></p>

        <p>${lead.message}</p>
    `;

    return sendEmail({

        to: process.env.SALES_EMAIL,

        subject,

        html

    });

}

/*
|--------------------------------------------------------------------------
| Contact Form Email
|--------------------------------------------------------------------------
*/

export async function sendContactFormEmail({

    contact

}) {

    const subject = `Website Contact - ${contact.subject}`;

    const html = `
        <h2>New Contact Form Submission</h2>

        <p><strong>Name:</strong> ${contact.name}</p>

        <p><strong>Email:</strong> ${contact.email}</p>

        <p><strong>Subject:</strong> ${contact.subject}</p>

        <p><strong>Message:</strong></p>

        <p>${contact.message}</p>
    `;

    return sendEmail({

        to: process.env.SUPPORT_EMAIL,

        subject,

        html

    });

  }
/*
|--------------------------------------------------------------------------
| Send Bulk Emails
|--------------------------------------------------------------------------
*/

export async function sendBulkEmails(

    emails = [],

    options = {}

) {

    const results = [];

    for (const email of emails) {

        try {

            const result = await sendEmail({

                ...email,

                ...options

            });

            results.push({

                success: true,

                email: email.to,

                result

            });

        } catch (error) {

            results.push({

                success: false,

                email: email.to,

                error: error.message

            });

        }

    }

    return {

        total: emails.length,

        successful: results.filter(

            r => r.success

        ).length,

        failed: results.filter(

            r => !r.success

        ).length,

        results

    };

}

/*
|--------------------------------------------------------------------------
| Retry Email
|--------------------------------------------------------------------------
*/

export async function retryEmail(

    emailData,

    retries = 3,

    delay = 1000

) {

    let lastError;

    for (

        let attempt = 1;

        attempt <= retries;

        attempt++

    ) {

        try {

            return await sendEmail(

                emailData

            );

        } catch (error) {

            lastError = error;

            if (

                attempt < retries

            ) {

                await new Promise(

                    resolve =>

                        setTimeout(

                            resolve,

                            delay * attempt

                        )

                );

            }

        }

    }

    throw lastError;

}

/*
|--------------------------------------------------------------------------
| Queue Email
|--------------------------------------------------------------------------
*/

export async function queueEmail(

    emailData

) {

    return {

        queued: true,

        queuedAt: new Date(),

        jobId: crypto.randomUUID(),

        email: emailData.to

    };

}

/*
|--------------------------------------------------------------------------
| Queue Bulk Emails
|--------------------------------------------------------------------------
*/

export async function queueBulkEmails(

    emails = []

) {

    const jobs = [];

    for (const email of emails) {

        jobs.push(

            await queueEmail(

                email

            )

        );

    }

    return {

        queued: jobs.length,

        jobs

    };

}

/*
|--------------------------------------------------------------------------
| Email Service
|--------------------------------------------------------------------------
*/

export const EmailService = {

    createTransporter,

    verifyConnection,

    sendEmail,

    sendTemplate,

    sendWelcomeEmail,

    sendTrialStartedEmail,

    sendSubscriptionEmail,

    sendInvoiceEmail,

    sendPasswordResetEmail,

    sendVerificationEmail,

    sendContactEmail,

    sendEnterpriseLeadEmail,

    sendBulkEmails,

    retryEmail,

    queueEmail,

    queueBulkEmails

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default EmailService;
