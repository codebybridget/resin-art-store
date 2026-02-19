import React, { useContext, useMemo, useState, useEffect } from "react";
import "./FullItem.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../asset/assets";
import { useNavigate } from "react-router-dom";

import {
  resinColors,
  getSizesForCategory,
  sizeMultiplier,
  isCustomizationCategory,
} from "../../data/resinOptions";

const FullItem = ({ id, name, price, description, images = [], category }) => {
  const navigate = useNavigate();

  const { cartItem, addToCart, removeFromCart, formatNaira } =
    useContext(StoreContext);

  const sizes = useMemo(() => getSizesForCategory(category), [category]);

  const [color1, setColor1] = useState("Blue");
  const [color2, setColor2] = useState("White");
  const [size, setSize] = useState(sizes?.[0] || "One Size");
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    setSize(sizes?.[0] || "One Size");
  }, [sizes]);

  // ✅ FIX: If images is missing, fallback to placeholder
  const imageUrl =
    Array.isArray(images) && images.length > 0 ? images[0] : assets.placeholder;

  const normalizedCategory = category?.trim().toLowerCase() || "";

  const showSize = normalizedCategory === "home decor resin";
  const showCustomText = isCustomizationCategory(category);

  // ✅ FINAL PRICE: multiplier for Home Decor Resin
  const basePrice = Number(price) || 0;
  const finalPrice = showSize
    ? basePrice * sizeMultiplier(size)
    : basePrice;

  const safeSize = showSize ? size : "One Size";
  const safeCustomText = showCustomText ? customText.trim() : "";

  const cartKey = `${id}_${color1}_${color2}_${safeSize}_${safeCustomText}`;
  const qty = cartItem?.[cartKey]?.quantity || 0;

  const addItemToCart = (e) => {
    e.stopPropagation();

    addToCart(cartKey, id, {
      color1,
      color2,
      size: safeSize,
      customText: safeCustomText,
      category,
    });
  };

  const removeItemFromCart = (e) => {
    e.stopPropagation();
    removeFromCart(cartKey);
  };

  return (
    <div className="full-item" id={`item-${id}`}>
      {/* IMAGE CLICK OPENS PRODUCT PAGE */}
      <div
        className="full-item-img-container"
        onClick={() => navigate(`/product/${id}`)}
        style={{ cursor: "pointer" }}
      >
        <img className="full-item-image" src={imageUrl} alt={name} />
      </div>

      <div className="full-item-info">
        <div className="full-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>

        <p className="full-item-desc">{description}</p>

        <p className="full-item-price">{formatNaira(finalPrice)}</p>

        {/* CUSTOMIZATION BOX */}
        <div className="customize-box">
          <h4>Choose Options</h4>

          <div className="customize-row">
            <label>Color 1:</label>
            <select value={color1} onChange={(e) => setColor1(e.target.value)}>
              {resinColors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="customize-row">
            <label>Color 2:</label>
            <select value={color2} onChange={(e) => setColor2(e.target.value)}>
              {resinColors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {showSize && (
            <div className="customize-row">
              <label>Size:</label>
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showCustomText && (
            <div className="customize-row">
              <label>Custom Text:</label>
              <input
                type="text"
                value={customText}
                placeholder="Example: Happy Birthday Sarah"
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* CART BUTTONS */}
        {!qty ? (
          <button className="add-btn" onClick={addItemToCart}>
            Add to Cart
          </button>
        ) : (
          <div className="qty-box">
            <button onClick={removeItemFromCart}>-</button>
            <span>{qty}</span>
            <button onClick={addItemToCart}>+</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullItem;
