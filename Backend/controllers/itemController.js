import Item from "../models/itemModel.js";
import cloudinary from "../config/cloudinary.js";

// ADD ITEM (MULTIPLE IMAGES)
export const addItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, and category are required",
      });
    }

    // ✅ multer multiple files: req.files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Cloudinary file info
    const images = req.files.map((file) => file.path);
    const cloudinaryIds = req.files.map((file) => file.filename);

    const newItem = new Item({
      name,
      description,
      price: Number(price),
      category,
      images,
      cloudinaryIds,
    });

    await newItem.save();

    return res.status(201).json({
      success: true,
      message: "Item added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error adding item:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LIST ITEMS
export const listItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error listing items:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ITEM BY ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Error fetching item:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE ITEM (DELETE CLOUDINARY IMAGES TOO)
export const removeItem = async (req, res) => {
  try {
    const { id } = req.body;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // ✅ Delete images from Cloudinary
    if (item.cloudinaryIds && item.cloudinaryIds.length > 0) {
      for (const publicId of item.cloudinaryIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.log("⚠️ Cloudinary delete failed:", publicId, err.message);
        }
      }
    }

    await Item.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Item removed successfully",
    });
  } catch (error) {
    console.error("Error removing item:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
