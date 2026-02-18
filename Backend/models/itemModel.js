import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, trim: true },

    /**
     * With Cloudinary, store the full image URL here.
     * Example:
     * https://res.cloudinary.com/.../image/upload/...jpg
     */
    image: { type: String, required: true, trim: true },

    /**
     * Optional but recommended:
     * Store Cloudinary public_id so you can delete the image later.
     */
    cloudinaryId: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError when nodemon restarts
const itemModel = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default itemModel;
