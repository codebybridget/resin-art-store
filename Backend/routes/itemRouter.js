import express from "express";
import itemModel from "../models/itemModel.js";
import upload from "../middleware/uploadMiddleware.js";
import adminAuth from "../middleware/adminAuth.js";

const itemRouter = express.Router();

/** POST: Add item | URL: /api/item/add (ADMIN ONLY) */
itemRouter.post("/add", adminAuth, upload.single("image"), async (req, res) => {
  try {
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

    const newItem = new itemModel({
      name,
      description,
      price,
      category,
      image: req.file.filename,
    });

    await newItem.save();

    return res.status(201).json({
      success: true,
      message: "Item added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error adding item:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while adding item",
    });
  }
});

/** GET: List items | URL: /api/item/list (PUBLIC) */
itemRouter.get("/list", async (req, res) => {
  try {
    const items = await itemModel.find();

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching items",
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

    return res.status(200).json({
      success: true,
      message: "Item removed successfully",
    });
  } catch (error) {
    console.error("Error removing item:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while removing item",
    });
  }
});

export default itemRouter;
