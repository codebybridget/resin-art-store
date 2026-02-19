import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import connectDB from "./config/db.js";

import userRouter from "./routes/userRouter.js";
import itemRouter from "./routes/itemRouter.js";
import cartRouter from "./routes/cartRouter.js";
import orderRouter from "./routes/orderRouter.js";
import paymentRouter from "./routes/paymentRouter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ------------------ PATH FIX (ES MODULES) ------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------ ENSURE UPLOADS FOLDER EXISTS ------------------
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ------------------ DEBUG ROUTE ------------------
app.get("/api/debug/cloudinary", (req, res) => {
  return res.json({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
    api_key: process.env.CLOUDINARY_API_KEY
      ? process.env.CLOUDINARY_API_KEY.slice(0, 6) + "****"
      : null,
    api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : null,
  });
});

// ------------------ ALLOWED ORIGINS ------------------
const allowedOrigins = [
  "https://ladybresinartgallery.com",
  "https://www.ladybresinartgallery.com",

  "https://resin-art-store-admin.onrender.com",
  "https://resin-art-store-frontend.onrender.com",

  "http://localhost:5173",
  "http://localhost:5174",
];

// ------------------ CORS OPTIONS ------------------
const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any Render subdomain
    if (origin.endsWith(".onrender.com")) return callback(null, true);

    return callback(new Error("CORS blocked for origin: " + origin), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
};

// ------------------ SOCKET.IO ------------------
export const io = new Server(server, {
  cors: corsOptions,
});

// prevent circular import issues
global.io = io;

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", socket.id, "| reason:", reason);
  });
});

// ------------------ MIDDLEWARE ------------------
app.use(express.json());
app.use(cors(corsOptions));

// ✅ FIX: Handle preflight without using app.options("*")
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// ------------------ ROUTES ------------------
app.use("/api/user", userRouter);
app.use("/api/item", itemRouter);
app.use("/api/cart", cartRouter);

// Main route
app.use("/api/order", orderRouter);

// Compatibility alias
app.use("/api/orders", orderRouter);

app.use("/api/payment", paymentRouter);

// ------------------ UPLOADS ------------------
app.use("/uploads", express.static(uploadPath));

// ------------------ DEFAULT ROUTE ------------------
app.get("/", (req, res) => {
  res.send("Resin Art Store Backend Running 🚀");
});

// ------------------ DB + START ------------------
connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
