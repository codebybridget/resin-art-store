import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // stores filename
  },
  { timestamps: true }
);

// Prevent OverwriteModelError when nodemon restarts
const itemModel = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default itemModel;
