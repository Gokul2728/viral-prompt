/**
 * Backend Entry Point
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import promptRoutes from "./routes/prompts";
import viralChatRoutes from "./routes/viralChats";
import userRoutes from "./routes/user";
import notificationRoutes from "./routes/notifications";
import analyticsRoutes from "./routes/analytics";
import adminRoutes from "./routes/admin";
import { errorHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("❌ MongoDB connection failed", err);
  process.exit(1);
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/viral-chats", viralChatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
