/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
*/

import mongoose from "mongoose";

import Shop from "../../models/Shop.js";
import User from "../../models/User.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Visitor from "../../models/Visitor.js";
import Subscription from "../../models/Subscription.js";
import Order from "../../models/Order.js";
import Analytics from "../../models/Analytics.js";
import Invoice from "../../models/Invoice.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Parser } from "@json2csv/plainjs";

const { Types } = mongoose;

/*
|--------------------------------------------------------------------------
| Report Configuration
|--------------------------------------------------------------------------
*/

export const REPORT_CONFIG = {

    DEFAULT_DAYS: 30,

    MAX_DAYS: 365,

    TOP_PRODUCTS_LIMIT: 10,

    TOP_COUNTRIES_LIMIT: 10,

    RECENT_CONVERSATIONS: 10,

    DEFAULT_CURRENCY: "USD"

};

/*
|--------------------------------------------------------------------------
| Dashboard Overview
|--------------------------------------------------------------------------
*/

export async function getDashboardOverview(

    shopId

) {

    const [

        visitors,

        conversations,

        orders,

        subscriptions

    ] = await Promise.all([

        Visitor.countDocuments({

            shop: shopId

        }),

        Conversation.countDocuments({

            shop: shopId,

            deleted: false

        }),

        Order.countDocuments({

            shop: shopId,

            deleted: false

        }),

        Subscription.countDocuments({

            shop: shopId,

            status: "active"

        })

    ]);

    return {

        visitors,

        conversations,

        orders,

        activeSubscriptions: subscriptions

    };

}

/*
|--------------------------------------------------------------------------
| Revenue Summary
|--------------------------------------------------------------------------
*/

export async function getRevenueSummary(

    shopId

) {

    const revenue = await Order.aggregate([

        {

            $match: {

                shop: new Types.ObjectId(

                    shopId

                ),

                deleted: false,

                financialStatus: "paid"

            }

        },

        {

            $group: {

                _id: null,

                totalRevenue: {

                    $sum: "$totalPrice"

                },

                averageOrderValue: {

                    $avg: "$totalPrice"

                },

                totalOrders: {

                    $sum: 1

                }

            }

        }

    ]);

    return revenue[0] || {

        totalRevenue: 0,

        averageOrderValue: 0,

        totalOrders: 0

    };

}

/*
|--------------------------------------------------------------------------
| Conversation Summary
|--------------------------------------------------------------------------
*/

export async function getConversationSummary(

    shopId

) {

    const summary = await Conversation.aggregate([

        {

            $match: {

                shop: new Types.ObjectId(

                    shopId

                ),

                deleted: false

            }

        },

        {

            $group: {

                _id: "$status",

                total: {

                    $sum: 1

                }

            }

        }

    ]);

    return summary;

}
/*
|--------------------------------------------------------------------------
| Visitor Summary
|--------------------------------------------------------------------------
*/

export async function getVisitorSummary(

    shopId,

    filters = {}

) {

    const query = {

        shop: shopId,

        deleted: false,

        ...filters

    };

    const [

        totalVisitors,

        uniqueVisitors,

        returningVisitors,

        onlineVisitors

    ] = await Promise.all([

        Visitor.countDocuments(query),

        Visitor.distinct("sessionId", query),

        Visitor.countDocuments({

            ...query,

            totalVisits: { $gt: 1 }

        }),

        Visitor.countDocuments({

            ...query,

            isOnline: true

        })

    ]);

    return {

        totalVisitors,

        uniqueVisitors: uniqueVisitors.length,

        returningVisitors,

        onlineVisitors

    };

}

/*
|--------------------------------------------------------------------------
| AI Usage Summary
|--------------------------------------------------------------------------
*/

export async function getAIUsageSummary(

    shopId,

    filters = {}

) {

    const query = {

        shop: shopId,

        deleted: false,

        ...filters

    };

    const usage = await Message.aggregate([

        {

            $match: query

        },

        {

            $group: {

                _id: null,

                promptTokens: {

                    $sum: "$ai.promptTokens"

                },

                completionTokens: {

                    $sum: "$ai.completionTokens"

                },

                totalTokens: {

                    $sum: "$ai.totalTokens"

                },

                totalCost: {

                    $sum: "$ai.estimatedCost"

                },

                averageLatency: {

                    $avg: "$performance.latency"

                }

            }

        }

    ]);

    return usage[0] || {

        promptTokens: 0,

        completionTokens: 0,

        totalTokens: 0,

        totalCost: 0,

        averageLatency: 0

    };

}

/*
|--------------------------------------------------------------------------
| Message Statistics
|--------------------------------------------------------------------------
*/

export async function getMessageStatistics(

    conversationId

) {

    const stats = await Message.aggregate([

        {

            $match: {

                conversation: conversationId,

                deleted: false

            }

        },

        {

            $group: {

                _id: "$role",

                count: {

                    $sum: 1

                }

            }

        }

    ]);

    return stats;

}

/*
|--------------------------------------------------------------------------
| Order Summary
|--------------------------------------------------------------------------
*/

export async function getOrderSummary(

    shopId,

    filters = {}

) {

    const query = {

        shop: shopId,

        deleted: false,

        ...filters

    };

    const [

        totalOrders,

        revenue,

        averageOrder

    ] = await Promise.all([

        Order.countDocuments(query),

        Order.aggregate([

            {

                $match: query

            },

            {

                $group: {

                    _id: null,

                    revenue: {

                        $sum: "$total"

                    }

                }

            }

        ]),

        Order.aggregate([

            {

                $match: query

            },

            {

                $group: {

                    _id: null,

                    average: {

                        $avg: "$total"

                    }

                }

            }

        ])

    ]);

    return {

        totalOrders,

        revenue:

            revenue[0]?.revenue || 0,

        averageOrderValue:

            averageOrder[0]?.average || 0

    };

}

/*
|--------------------------------------------------------------------------
| Conversion Metrics
|--------------------------------------------------------------------------
*/

export async function getConversionMetrics(

    shopId,

    filters = {}

) {

    const visitors = await Visitor.countDocuments({

        shop: shopId,

        deleted: false,

        ...filters

    });

    const orders = await Order.countDocuments({

        shop: shopId,

        deleted: false,

        ...filters

    });

    const conversations =

        await Conversation.countDocuments({

            shop: shopId,

            deleted: false,

            ...filters

        });

    const conversionRate =

        visitors === 0

            ? 0

            : Number(

                (

                    (orders / visitors) *

                    100

                ).toFixed(2)

            );

    return {

        visitors,

        conversations,

        orders,

        conversionRate

    };

        }
/*
|--------------------------------------------------------------------------
| Revenue Analytics
|--------------------------------------------------------------------------
*/

export async function buildRevenueAnalytics({

    shopId,

    startDate,

    endDate

}) {

    const orders = await Order.find({

        shop: shopId,

        createdAt: {

            $gte: startDate,

            $lte: endDate

        },

        financialStatus: "paid"

    });

    const totalRevenue = orders.reduce(

        (sum, order) => sum + (order.totalPrice || 0),

        0

    );

    const aiRevenue = orders.reduce(

        (sum, order) => sum + (order.aiRevenue || 0),

        0

    );

    return {

        totalOrders: orders.length,

        totalRevenue,

        aiRevenue,

        aiRevenuePercentage:

            totalRevenue > 0

                ? Number(

                    (

                        aiRevenue /

                        totalRevenue *

                        100

                    ).toFixed(2)

                )

                : 0

    };

}

/*
|--------------------------------------------------------------------------
| Subscription Analytics
|--------------------------------------------------------------------------
*/

export async function buildSubscriptionAnalytics() {

    const subscriptions =

        await Subscription.find();

    const active = subscriptions.filter(

        s => s.status === "active"

    );

    const trial = subscriptions.filter(

        s => s.status === "trial"

    );

    const cancelled = subscriptions.filter(

        s => s.status === "cancelled"

    );

    const mrr = active.reduce(

        (sum, item) =>

            sum + (item.planPrice || 0),

        0

    );

    return {

        total: subscriptions.length,

        active: active.length,

        trial: trial.length,

        cancelled: cancelled.length,

        monthlyRecurringRevenue: mrr

    };

}

/*
|--------------------------------------------------------------------------
| Product Performance
|--------------------------------------------------------------------------
*/

export async function buildProductPerformance(

    shopId

) {

    const products = await Product.find({

        shop: shopId

    });

    return products.map(product => ({

        id: product._id,

        title: product.title,

        views: product.analytics?.views || 0,

        recommendations:

            product.analytics?.recommendations || 0,

        clicks:

            product.analytics?.clicks || 0,

        addToCart:

            product.analytics?.addToCart || 0,

        purchases:

            product.analytics?.purchases || 0,

        revenue:

            product.analytics?.revenue || 0

    }));

}

/*
|--------------------------------------------------------------------------
| AI Performance Report
|--------------------------------------------------------------------------
*/

export async function buildAIReport(

    shopId,

    startDate,

    endDate

) {

    const conversations =

        await Conversation.find({

            shop: shopId,

            createdAt: {

                $gte: startDate,

                $lte: endDate

            }

        });

    let totalMessages = 0;

    let totalTokens = 0;

    let totalCost = 0;

    let totalRevenue = 0;

    conversations.forEach(

        conversation => {

            totalMessages +=

                conversation.totalMessages || 0;

            totalTokens +=

                conversation.totalTokens || 0;

            totalCost +=

                conversation.estimatedCost || 0;

            totalRevenue +=

                conversation.aiRevenue?.totalRevenue || 0;

        }

    );

    return {

        conversations:

            conversations.length,

        totalMessages,

        totalTokens,

        totalCost,

        revenueGenerated:

            totalRevenue,

        averageMessages:

            conversations.length

                ? Number(

                    (

                        totalMessages /

                        conversations.length

                    ).toFixed(2)

                )

                : 0

    };

}

/*
|--------------------------------------------------------------------------
| Daily Report
|--------------------------------------------------------------------------
*/

export async function buildDailyReport(

    shopId

) {

    const start = new Date();

    start.setHours(

        0,

        0,

        0,

        0

    );

    return buildDashboardReport({

        shopId,

        startDate: start,

        endDate: new Date()

    });

}

/*
|--------------------------------------------------------------------------
| Weekly Report
|--------------------------------------------------------------------------
*/

export async function buildWeeklyReport(

    shopId

) {

    const start = new Date();

    start.setDate(

        start.getDate() - 7

    );

    return buildDashboardReport({

        shopId,

        startDate: start,

        endDate: new Date()

    });

}

/*
|--------------------------------------------------------------------------
| Monthly Report
|--------------------------------------------------------------------------
*/

export async function buildMonthlyReport(

    shopId

) {

    const start = new Date();

    start.setMonth(

        start.getMonth() - 1

    );

    return buildDashboardReport({

        shopId,

        startDate: start,

        endDate: new Date()

    });

        }
/*
|--------------------------------------------------------------------------
| Export Report
|--------------------------------------------------------------------------
*/

export async function exportReport(

    report,

    format = "json"

) {

    switch (format.toLowerCase()) {

        case "csv":
            return exportCSV(report);

        case "excel":
        case "xlsx":
            return exportExcel(report);

        case "pdf":
            return exportPDF(report);

        case "json":
        default:
            return exportJSON(report);

    }

}

/*
|--------------------------------------------------------------------------
| CSV Export
|--------------------------------------------------------------------------
*/

export async function exportCSV(

    report

) {

    const parser = new Parser({

        flatten: true

    });

    const csv = parser.parse(

        Array.isArray(report)

            ? report

            : [report]

    );

    return {

        format: "csv",

        extension: ".csv",

        mimeType: "text/csv",

        filename: `report-${Date.now()}.csv`,

        data: csv

    };

}

/*
|--------------------------------------------------------------------------
| Excel Export
|--------------------------------------------------------------------------
*/

export async function exportExcel(

    report

) {

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(

        "Layboka Report"

    );

    const rows = Array.isArray(report)

        ? report

        : [report];

    if (rows.length > 0) {

        worksheet.columns = Object.keys(

            rows[0]

        ).map(key => ({

            header: key,

            key,

            width: 25

        }));

        worksheet.addRows(rows);

    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {

        format: "excel",

        extension: ".xlsx",

        mimeType:

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        filename: `report-${Date.now()}.xlsx`,

        data: buffer

    };

}

/*
|--------------------------------------------------------------------------
| PDF Export
|--------------------------------------------------------------------------
*/

export async function exportPDF(

    report

) {

    const doc = new PDFDocument({

        margin: 40,

        size: "A4"

    });

    const chunks = [];

    doc.on("data", chunk =>

        chunks.push(chunk)

    );

    doc.fontSize(18)

        .text("Layboka AI Report");

    doc.moveDown();

    doc.fontSize(10)

        .text(

            JSON.stringify(

                report,

                null,

                2

            )

        );

    doc.end();

    return await new Promise(

        resolve => {

            doc.on("end", () => {

                resolve({

                    format: "pdf",

                    extension: ".pdf",

                    mimeType:

                        "application/pdf",

                    filename:

                        `report-${Date.now()}.pdf`,

                    data:

                        Buffer.concat(

                            chunks

                        )

                });

            });

        }

    );

}

/*
|--------------------------------------------------------------------------
| JSON Export
|--------------------------------------------------------------------------
*/

export async function exportJSON(

    report

) {

    return {

        format: "json",

        extension: ".json",

        mimeType:

            "application/json",

        filename:

            `report-${Date.now()}.json`,

        data: JSON.stringify(

            report,

            null,

            2

        )

    };

  }
/*
|--------------------------------------------------------------------------
| Business Insights
|--------------------------------------------------------------------------
*/

export async function buildBusinessInsights(shopId) {

    const analytics = await Analytics.findOne({
        shop: shopId
    });

    const insights = [];

    if (!analytics) {
        return insights;
    }

    if (analytics.conversionRate < 2) {

        insights.push({
            type: "warning",
            title: "Low Conversion Rate",
            description:
                "Visitors are engaging but purchases are low."
        });

    }

    if (analytics.abandonedCarts > 20) {

        insights.push({
            type: "opportunity",
            title: "Cart Recovery",
            description:
                "Enable more aggressive AI follow-up for abandoned carts."
        });

    }

    if (analytics.aiRevenue > analytics.totalRevenue * 0.30) {

        insights.push({
            type: "success",
            title: "AI Performing Well",
            description:
                "Layboka AI is generating a significant share of revenue."
        });

    }

    return insights;

}

/*
|--------------------------------------------------------------------------
| Growth Metrics
|--------------------------------------------------------------------------
*/

export async function buildGrowthMetrics(current, previous) {

    const growth = (currentValue, previousValue) => {

        if (!previousValue || previousValue === 0) {

            return currentValue > 0 ? 100 : 0;

        }

        return Number(

            (((currentValue - previousValue) / previousValue) * 100)

            .toFixed(2)

        );

    };

    return {

        revenueGrowth:
            growth(current.revenue, previous.revenue),

        visitorGrowth:
            growth(current.visitors, previous.visitors),

        conversationGrowth:
            growth(current.conversations, previous.conversations),

        orderGrowth:
            growth(current.orders, previous.orders),

        aiRevenueGrowth:
            growth(current.aiRevenue, previous.aiRevenue)

    };

}

/*
|--------------------------------------------------------------------------
| KPI Builder
|--------------------------------------------------------------------------
*/

export function buildKPIs(report) {

    return {

        revenue: report.revenue,

        orders: report.orders,

        visitors: report.visitors,

        conversations: report.conversations,

        conversionRate: report.conversionRate,

        averageOrderValue: report.averageOrderValue,

        aiRevenue: report.aiRevenue,

        recoveredRevenue: report.recoveredRevenue,

        aiRevenueShare:

            report.revenue > 0

                ? Number(

                    (
                        (report.aiRevenue / report.revenue) * 100

                    ).toFixed(2)

                )

                : 0,

        recoveryRate:

            report.abandonedRevenue > 0

                ? Number(

                    (
                        (report.recoveredRevenue /

                            report.abandonedRevenue) * 100

                    ).toFixed(2)

                )

                : 0

    };

}

/*
|--------------------------------------------------------------------------
| Report Service
|--------------------------------------------------------------------------
*/

export const ReportService = {

    generateDashboardReport,
    generateRevenueReport,
    generateConversationReport,
    generateVisitorReport,
    generateProductReport,

    buildBusinessInsights,
    buildGrowthMetrics,
    buildKPIs

};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default ReportService;
