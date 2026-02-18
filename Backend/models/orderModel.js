import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },

    quantity: { type: Number, required: true },
    price: { type: Number, required: true },

    category: { type: String, default: "" },
    color1: { type: String, default: "" },
    color2: { type: String, default: "" },
    size: { type: String, default: "One Size" },

    occasion: { type: String, default: "" },
    customText: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    address: {
      fullName: { type: String, default: "" },
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    // Product subtotal only
    subtotalAmount: { type: Number, default: 0 },

    // Total paid online (same as subtotal)
    totalAmount: { type: Number, required: true },

    payment: { type: Boolean, default: false },
    reference: { type: String, default: "" },

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Delivered"],
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default orderModel;
