import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { io } from "../server.js";

/* -------------------- PLACE ORDER -------------------- */
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { items, amount, address, subtotalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty" });
    }

    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Address missing" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const fixedAddress = {
      fullName: address.fullName || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
    };

    const newOrder = new orderModel({
      userId,
      items,
      address: fixedAddress,

      subtotalAmount: Number(subtotalAmount || 0),
      totalAmount: Number(amount),

      payment: false,
      status: "Pending",
    });

    await newOrder.save();

    io.emit("refreshOrders");

    return res.json({
      success: true,
      message: "Order created. Proceed to payment.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to place order" });
  }
};

/* -------------------- USER ORDERS -------------------- */
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("UserOrders Error:", error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders" });
  }
};

/* -------------------- ADMIN LIST ORDERS -------------------- */
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error("ListOrders Error:", error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders" });
  }
};

/* -------------------- ADMIN UPDATE STATUS -------------------- */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing orderId or status" });
    }

    await orderModel.findByIdAndUpdate(orderId, { status });

    io.emit("refreshOrders");

    return res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("UpdateStatus Error:", error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
};

/* -------------------- ADMIN DELETE ORDER -------------------- */
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId",
      });
    }

    const deleted = await orderModel.findByIdAndDelete(orderId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    io.emit("refreshOrders");

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("DeleteOrder Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};

/* -------------------- ADMIN BULK DELETE FAILED ORDERS -------------------- */
const deleteFailedOrders = async (req, res) => {
  try {
    const { olderThanHours } = req.body;

    const hours = Number(olderThanHours || 24);

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await orderModel.deleteMany({
      payment: false,
      createdAt: { $lt: cutoff },
    });

    io.emit("refreshOrders");

    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} unpaid orders older than ${hours} hours`,
    });
  } catch (error) {
    console.error("BulkDelete Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to bulk delete failed orders",
    });
  }
};

export {
  placeOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
  deleteFailedOrders,
};
