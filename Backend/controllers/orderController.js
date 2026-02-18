import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

/**
 * We avoid importing io directly from server.js to prevent circular imports.
 * Instead, we read it from global scope.
 * (We'll set global.io in server.js)
 */
const emitRefreshOrders = () => {
  try {
    if (global.io) {
      global.io.emit("refreshOrders");
    }
  } catch (err) {
    console.error("Socket emit error:", err.message);
  }
};

/**
 * Helper: sanitize numbers safely
 */
const toNumber = (value) => {
  if (value === null || value === undefined) return 0;

  // If it comes as "₦2000" or "$2000"
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.]/g, "");
    return Number(cleaned);
  }

  return Number(value);
};

/* -------------------- PLACE ORDER -------------------- */
const placeOrder = async (req, res) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const { items, amount, address, subtotalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const totalAmount = toNumber(amount);
    const subAmount = toNumber(subtotalAmount);

    if (!totalAmount || Number.isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (!address || typeof address !== "object") {
      return res.status(400).json({
        success: false,
        message: "Address missing",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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

      subtotalAmount: subAmount,
      totalAmount,

      payment: false,
      status: "Pending",
    });

    await newOrder.save();

    emitRefreshOrders();

    return res.status(201).json({
      success: true,
      message: "Order created. Proceed to payment.",
      orderId: newOrder._id,
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Place Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

/* -------------------- USER ORDERS -------------------- */
const userOrders = async (req, res) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("❌ UserOrders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/* -------------------- ADMIN LIST ORDERS -------------------- */
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("❌ ListOrders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/* -------------------- ADMIN UPDATE STATUS -------------------- */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId or status",
      });
    }

    const updated = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    emitRefreshOrders();

    return res.status(200).json({
      success: true,
      message: "Status updated",
      order: updated,
    });
  } catch (error) {
    console.error("❌ UpdateStatus Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
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

    emitRefreshOrders();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("❌ DeleteOrder Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
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

    emitRefreshOrders();

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} unpaid orders older than ${hours} hours`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ BulkDelete Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to bulk delete failed orders",
      error: error.message,
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
