# 🚀 Layboka

> AI Sales Executive for Shopify Stores

Layboka is a production-ready SaaS platform that installs an AI Sales Executive into Shopify stores. It helps merchants increase sales, answer customer questions, recommend products, recover abandoned carts, provide order support, and grow revenue 24/7.

---

# Brand

| Property | Value |
|----------|-------|
| Name | Layboka |
| Primary Color | #FF3B2F |
| Background | #1E3928 |
| Frontend | Next.js 15 |
| Backend | Express.js |
| Database | MongoDB Atlas |
| AI | OpenAI |
| Hosting | Vercel + Railway |

---

# Features

- AI Sales Executive
- Shopify OAuth Installation
- One-Click Store Installation
- GPT Model Routing
- Product Recommendation
- Upsell & Cross Sell
- Cart Recovery
- Order Tracking
- Customer Support
- Customer Memory
- Store Analytics
- Live Dashboard
- Subscription Billing
- Enterprise Plan
- Admin Panel
- Webhooks
- Email Notifications
- Secure Authentication

---

# Pricing

| Plan | Price | AI Model |
|------|--------|-----------|
| Starter | $25/month | GPT-4o-mini |
| Growth | $59/month | GPT-4o-mini |
| Premium | $149/month | GPT-5 |
| Enterprise | Contact Sales | GPT-5 (VIP) |

---

# Tech Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Query
- React Hook Form
- Axios

## Backend

- Node.js 22
- Express.js
- MongoDB
- Mongoose
- JWT
- Shopify API
- OpenAI API
- Stripe
- Redis
- Socket.IO

---

# Project Structure

```
layboka/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── chatbot-sdk/
│   ├── shared/
│   └── ui/
│
├── docs/
├── scripts/
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-org/layboka.git
```

---

## Install Dependencies

```bash
pnpm install
```

---

## Configure Environment

Copy the environment template.

```bash
cp .env.example .env
```

Fill in:

- MongoDB
- OpenAI
- Shopify
- Stripe
- Email
- Redis

---

## Start Development

```bash
pnpm dev
```

---

# Build Production

```bash
pnpm build
```

---

# Deploy

## Frontend

Deploy **apps/web** to Vercel.

---

## Backend

Deploy **apps/api** to Railway.

---

## Database

MongoDB Atlas

---

# AI Routing

Starter

↓

GPT-4o-mini

Growth

↓

GPT-4o-mini

Premium

↓

GPT-5

Enterprise

↓

GPT-5 (VIP)

---

# Shopify Installation Flow

Merchant enters Shopify store

↓

Validate store

↓

Shopify OAuth

↓

Merchant approves permissions

↓

Store connected

↓

Install AI Sales Executive

↓

Register Webhooks

↓

Create Trial Subscription

↓

Redirect Dashboard

---

# 7-Day Premium Trial

Every new merchant receives:

- Premium AI
- GPT-5
- Full Dashboard
- Analytics
- AI Sales Executive

After 7 days:

- Premium features are locked
- Merchant can upgrade without losing data

---

# Security

- JWT Authentication
- Password Hashing
- Helmet
- Rate Limiting
- CORS
- Mongo Sanitization
- Secure Cookies
- HTTPS Ready

---

# License

MIT License

Copyright © 2026 Layboka.

All rights reserved.
