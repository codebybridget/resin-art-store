import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

import itemRouter from "./routes/itemRouter.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRouter.js";
import orderRouter from "./routes/orderRouter.js";
import paymentRouter from "./routes/paymentRouter.js";

import upload from "./middleware/uploadMiddleware.js";

/* -------------------- Load ENV FIRST -------------------- */
dotenv.config({ path: path.resolve("./.env") });

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- Ensure uploads folder exists -------------------- */
const uploadsPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

/* -------------------- Middleware -------------------- */
app.use(express.json());

/**
 * IMPORTANT:
 * You have 2 frontends:
 * - User site (FRONTEND_URL)
 * - Admin panel (ADMIN_URL)
 */
const allowedOrigins = [
  "http://localhost:5173", // user
  "http://localhost:5174", // admin (YOUR CURRENT PORT)
  "http://localhost:5175", // optional admin if you ever use it
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman or server-to-server
      if (!origin) return callback(null, true);

      // Allow exact origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any render.com subdomain
      try {
        const url = new URL(origin);

        if (url.hostname.endsWith(".onrender.com")) {
          return callback(null, true);
        }
      } catch (error) {}

      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

/* -------------------- Static uploads -------------------- */
app.use("/uploads", express.static(uploadsPath));

/* -------------------- Routes -------------------- */
app.use("/api/payment", paymentRouter);
app.use("/api/item", itemRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

/* -------------------- Upload Test Route -------------------- */
app.post("/test-upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  return res.json({
    success: true,
    filename: req.file.filename,
    imageUrl: `${process.env.BACKEND_URL || `http://localhost:${PORT}`}/uploads/${
      req.file.filename
    }`,
  });
});

/* -------------------- Global Error Handler -------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  return res.status(500).json({
    success: false,
    message: err.message,
  });
});

/* -------------------- HTTP + Socket.IO -------------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const url = new URL(origin);

        if (url.hostname.endsWith(".onrender.com")) {
          return callback(null, true);
        }
      } catch (error) {}

      return callback(new Error("Not allowed by Socket.IO CORS: " + origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("👋 Client disconnected:", socket.id);
  });
});

export { io };

/* -------------------- Start Server -------------------- */
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await connectDB();
});
