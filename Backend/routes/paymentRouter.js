import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  initPaystackPayment,
  verifyPaystackPayment,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/init", authMiddleware, initPaystackPayment);

// This should NOT require auth (Paystack redirect may not include token)
paymentRouter.post("/verify", verifyPaystackPayment);

export default paymentRouter;
