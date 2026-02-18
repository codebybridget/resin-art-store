import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

import {
  placeOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
  deleteFailedOrders,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

/* -------------------- USER -------------------- */
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

/* -------------------- ADMIN -------------------- */
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.post("/status", adminAuth, updateStatus);

// ✅ Delete one order
orderRouter.post("/delete", adminAuth, deleteOrder);

// ✅ Bulk delete unpaid orders older than X hours
orderRouter.post("/delete-failed", adminAuth, deleteFailedOrders);

export default orderRouter;
