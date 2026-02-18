import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  initPaystackPayment,
  verifyPaystackPayment,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

/**
 * USER: Initialize Paystack payment
 * Requires login because it creates a payment for a user order.
 */
paymentRouter.post("/init", authMiddleware, initPaystackPayment);

/**
 * Paystack verification callback
 * This should NOT require auth because Paystack will call it without your JWT.
 */
paymentRouter.post("/verify", verifyPaystackPayment);

export default paymentRouter;
