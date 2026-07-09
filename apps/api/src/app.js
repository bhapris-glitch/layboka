import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000"
    ],
    credentials: true
  })
);

app.use(compression());

app.use(cookieParser());

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

app.use(mongoSanitize());

app.use(hpp());

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Layboka API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

/*
|--------------------------------------------------------------------------
| API Root
|--------------------------------------------------------------------------
*/

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    name: "Layboka API",
    version: "1.0.0",
    environment: process.env.NODE_ENV
  });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/v1/auth", (req, res) => {
  res.json({
    message: "Auth route ready"
  });
});

app.use("/api/v1/shopify", (req, res) => {
  res.json({
    message: "Shopify route ready"
  });
});

app.use("/api/v1/chat", (req, res) => {
  res.json({
    message: "Chat route ready"
  });
});

app.use("/api/v1/subscriptions", (req, res) => {
  res.json({
    message: "Subscription route ready"
  });
});

app.use("/api/v1/analytics", (req, res) => {
  res.json({
    message: "Analytics route ready"
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

export default app;
