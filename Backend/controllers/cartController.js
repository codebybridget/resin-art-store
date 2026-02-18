import userModel from "../models/userModel.js";

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartKey, itemId, color1, color2, size, customText, category } =
      req.body;

    if (!cartKey || !itemId) {
      return res.status(400).json({
        success: false,
        message: "cartKey and itemId required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure cartData is Map
    if (!(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    const existing = user.cartData.get(cartKey);

    if (existing) {
      const updatedItem = {
        ...existing,
        quantity: Number(existing.quantity || 0) + 1,
      };

      user.cartData.set(cartKey, updatedItem);
    } else {
      user.cartData.set(cartKey, {
        itemId,
        quantity: 1,
        color1: color1 || "",
        color2: color2 || "",
        size: size || "One Size",
        customText: customText || "",
        category: category || "",
      });
    }

    // ✅ IMPORTANT FIX
    user.markModified("cartData");

    await user.save();

    return res.json({
      success: true,
      message: "Added to cart",
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding to cart",
    });
  }
};

// REMOVE FROM CART
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartKey } = req.body;

    if (!cartKey) {
      return res.status(400).json({
        success: false,
        message: "cartKey required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    const existing = user.cartData.get(cartKey);

    if (!existing) {
      return res.json({
        success: true,
        message: "Item not found",
        cartData: Object.fromEntries(user.cartData),
      });
    }

    if (Number(existing.quantity || 0) > 1) {
      const updatedItem = {
        ...existing,
        quantity: Number(existing.quantity || 0) - 1,
      };

      user.cartData.set(cartKey, updatedItem);
    } else {
      user.cartData.delete(cartKey);
    }

    // ✅ IMPORTANT FIX
    user.markModified("cartData");

    await user.save();

    return res.json({
      success: true,
      message: "Removed from cart",
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing from cart",
    });
  }
};

// GET CART
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    return res.json({
      success: true,
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
};

export { addToCart, removeFromCart, getCart };
