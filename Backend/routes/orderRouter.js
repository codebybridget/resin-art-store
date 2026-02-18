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

// Place order
orderRouter.post("/place", authMiddleware, placeOrder);

// Get user orders (your current route)
orderRouter.post("/userorders", authMiddleware, userOrders);

// Optional alias (in case frontend uses /myorders)
orderRouter.get("/myorders", authMiddleware, userOrders);

/* -------------------- ADMIN -------------------- */

// List all orders
orderRouter.get("/list", adminAuth, listOrders);

// Update order status
orderRouter.post("/status", adminAuth, updateStatus);

// Delete one order
orderRouter.post("/delete", adminAuth, deleteOrder);

// Bulk delete unpaid orders older than X hours
orderRouter.post("/delete-failed", adminAuth, deleteFailedOrders);

export default orderRouter;
