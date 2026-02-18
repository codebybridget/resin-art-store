import Item from "../models/itemModel.js";

// ADD ITEM
export const addItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and price are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // ✅ Cloudinary gives the full image URL
    const imageUrl = req.file.path;

    const newItem = new Item({
      name,
      description,
      price: Number(price),
      category,
      image: imageUrl, // ✅ Save cloudinary URL
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
    console.error("Error listing items:", error.message);

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
    console.error("Error fetching item:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE ITEM
export const removeItem = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await Item.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.json({
      success: true,
      message: "Item removed successfully",
    });
  } catch (error) {
    console.error("Error removing item:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
