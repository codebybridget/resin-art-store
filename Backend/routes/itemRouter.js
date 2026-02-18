import express from "express";
import itemModel from "../models/itemModel.js";
import upload from "../middleware/uploadMiddleware.js";
import adminAuth from "../middleware/adminAuth.js";
import cloudinary from "../config/cloudinary.js";

const itemRouter = express.Router();

/** POST: Add item | URL: /api/item/add (ADMIN ONLY) */
itemRouter.post("/add", adminAuth, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    try {
      if (err) {
        console.error("❌ Multer/Cloudinary error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "Upload failed",
        });
      }

      const { name, description, price, category } = req.body;

      if (!name || !description || !price || !category) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      // Cloudinary returns:
      // req.file.path     -> secure image URL
      // req.file.filename -> public_id
      const imageUrl = req.file.path;
      const cloudinaryId = req.file.filename;

      const newItem = new itemModel({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
        image: imageUrl,
        cloudinaryId,
      });

      await newItem.save();

      return res.status(201).json({
        success: true,
        message: "Item added successfully",
        item: newItem,
      });
    } catch (error) {
      console.error("❌ Error adding item:", error);

      return res.status(500).json({
        success: false,
        message: "Server error while adding item",
        error: error.message,
      });
    }
  });
});

/** GET: List items | URL: /api/item/list (PUBLIC) */
itemRouter.get("/list", async (req, res) => {
  try {
    const items = await itemModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("❌ Error fetching items:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching items",
      error: error.message,
    });
  }
});

/** POST: Remove item | URL: /api/item/remove (ADMIN ONLY) */
itemRouter.post("/remove", adminAuth, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    const deletedItem = await itemModel.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // If item has cloudinaryId, delete image from Cloudinary too
    if (deletedItem.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(deletedItem.cloudinaryId);
      } catch (cloudErr) {
        console.error("⚠️ Failed to delete image from Cloudinary:", cloudErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Item removed successfully",
    });
  } catch (error) {
    console.error("❌ Error removing item:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while removing item",
      error: error.message,
    });
  }
});

export default itemRouter;
