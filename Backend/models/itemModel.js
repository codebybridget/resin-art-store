import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, trim: true },

    // ✅ Multiple images (Temu style)
    images: { type: [String], required: true, default: [] },

    // ✅ Store cloudinary public ids (so you can delete later)
    cloudinaryIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError when nodemon restarts
const itemModel = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default itemModel;
