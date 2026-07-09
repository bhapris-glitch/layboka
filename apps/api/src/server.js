import "dotenv/config";

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:3000"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Socket Disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(PORT, () => {
      console.log("======================================");
      console.log("🚀 Layboka API Started");
      console.log(`🌍 Environment : ${process.env.NODE_ENV}`);
      console.log(`📡 Port        : ${PORT}`);
      console.log(`❤️ Health      : http://localhost:${PORT}/health`);
      console.log("======================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("\n🛑 SIGINT received. Shutting down...");

  io.close();

  httpServer.close(() => {
    console.log("✅ HTTP Server Closed");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received. Shutting down...");

  io.close();

  httpServer.close(() => {
    console.log("✅ HTTP Server Closed");
    process.exit(0);
  });
});

startServer();
