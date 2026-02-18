import axios from "axios";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { io } from "../server.js";

/* -------------------- PAYSTACK HELPERS -------------------- */
const getPaystackSecret = () => process.env.PAYSTACK_SECRET_KEY || "";

/* -------------------- INIT PAYSTACK PAYMENT -------------------- */
export const initPaystackPayment = async (req, res) => {
  try {
    const paystackSecret = getPaystackSecret();

    if (!paystackSecret) {
      return res.status(500).json({
        success: false,
        message: "Paystack secret key missing in .env",
      });
    }

    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ensure the order belongs to the logged-in user
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    // Prevent re-payment
    if (order.payment === true) {
      return res.json({
        success: true,
        message: "Order already paid",
        authorization_url: null,
        reference: order.reference,
      });
    }

    // Get the user's real email
    const user = await userModel.findById(userId);

    const amountInKobo = Math.round(Number(order.totalAmount || 0) * 100);

    if (!amountInKobo || amountInKobo <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const callbackUrl = `${process.env.FRONTEND_URL}/payment-success`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user?.email || "test@email.com",
        amount: amountInKobo,
        callback_url: callbackUrl,
        metadata: {
          orderId: String(order._id),
          userId: String(userId),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = response.data?.data;

    if (!paystackData?.authorization_url || !paystackData?.reference) {
      return res.status(500).json({
        success: false,
        message: "Paystack did not return authorization details",
      });
    }

    // Save the payment reference on the order
    order.reference = paystackData.reference;
    await order.save();

    return res.json({
      success: true,
      authorization_url: paystackData.authorization_url,
      reference: paystackData.reference,
    });
  } catch (error) {
    console.error(
      "🔥 Paystack init error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Payment init failed",
    });
  }
};

/* -------------------- VERIFY PAYSTACK PAYMENT -------------------- */
/** This route should NOT require auth, because Paystack sometimes redirects without token. */
export const verifyPaystackPayment = async (req, res) => {
  try {
    const paystackSecret = getPaystackSecret();

    if (!paystackSecret) {
      return res.status(500).json({
        success: false,
        message: "Paystack secret key missing in .env",
      });
    }

    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Reference is required",
      });
    }

    // Verify the transaction with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      }
    );

    const data = response.data?.data;

    if (!data) {
      return res.status(500).json({
        success: false,
        message: "Invalid Paystack response",
      });
    }

    if (data.status !== "success") {
      return res.json({
        success: false,
        message: "Payment not successful",
      });
    }

    // Get the order ID from Paystack metadata
    const orderId = data.metadata?.orderId;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID missing from Paystack metadata",
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent double verification
    if (order.payment === true) {
      return res.json({
        success: true,
        message: "Already verified",
        order,
      });
    }

    // Mark order as paid
    order.payment = true;
    order.status = "Processing";
    order.reference = reference;
    await order.save();

    // Clear user cart after successful payment
    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

    // ✅ IMPORTANT: Tell admin panel to refresh instantly
    io.emit("refreshOrders");

    return res.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Paystack verify error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Payment verification failed",
    });
  }
};
