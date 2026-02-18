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

// ------------------ ALLOWED ORIGINS ------------------
const allowedOrigins = [
  "https://resin-art-store-frontend.onrender.com",
  "https://resin-art-store-admin.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
];

// ------------------ SOCKET.IO ------------------
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ Admin/User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// ------------------ MIDDLEWARE ------------------
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
}));


// ------------------ ROUTES ------------------
app.use("/api/user", userRouter);
app.use("/api/item", itemRouter);
app.use("/api/cart", cartRouter);

// Your real route:
app.use("/api/order", orderRouter);

// 🔥 Compatibility alias (fixes frontend calling /api/orders/*)
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
