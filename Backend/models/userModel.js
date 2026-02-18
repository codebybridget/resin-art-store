import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    // ✅ NEW: Admin flag
    isAdmin: { type: Boolean, default: false },

    // cartData stores cart items using cartKey as the key
    cartData: {
      type: Map,
      of: Object,
      default: {},
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
