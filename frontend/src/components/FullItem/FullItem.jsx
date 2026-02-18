import React, { useContext, useMemo, useState, useEffect } from "react";
import "./FullItem.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../asset/assets";

import {
  resinColors,
  getSizesForCategory,
  sizeExtra,
  isCustomizationCategory,
} from "../../data/resinOptions";

const FullItem = ({ id, name, price, description, image, category }) => {
  const { cartItem, addToCart, removeFromCart, url, formatNaira } =
    useContext(StoreContext);

  const sizes = useMemo(() => getSizesForCategory(category), [category]);

  const [color1, setColor1] = useState("Blue");
  const [color2, setColor2] = useState("White");
  const [size, setSize] = useState(sizes?.[0] || "One Size");
  const [customText, setCustomText] = useState("");

  // Reset size when category changes
  useEffect(() => {
    setSize(sizes?.[0] || "One Size");
  }, [sizes]);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${url}/uploads/${image}`
    : assets.placeholder;

  const normalizedCategory = category?.trim().toLowerCase() || "";

  const showSize = normalizedCategory === "home decor resin";
  const showCustomText = isCustomizationCategory(category);

  // Price changes only for Home Decor Resin
  const finalPrice = showSize ? Number(price) + sizeExtra(size) : Number(price);

  // ✅ Only include size if category supports it
  const safeSize = showSize ? size : "One Size";

  // ✅ Only include customText if category supports it
  const safeCustomText = showCustomText ? customText.trim() : "";

  // ✅ Stable cartKey
  const cartKey = `${id}_${color1}_${color2}_${safeSize}_${safeCustomText}`;

  const qty = cartItem?.[cartKey]?.quantity || 0;

  const addItemToCart = () => {
    addToCart(cartKey, id, {
      color1,
      color2,
      size: safeSize,
      customText: safeCustomText,
      category,
    });
  };

  return (
    // ✅ IMPORTANT: this id makes search suggestions scroll to the product
    <div className="full-item" id={`item-${id}`}>
      <div className="full-item-img-container">
        <img className="full-item-image" src={imageUrl} alt={name} />

        {!qty ? (
          <img
            className="add"
            onClick={addItemToCart}
            src={assets.add_icon_white}
            alt="Add"
          />
        ) : (
          <div className="full-item-counter">
            <img
              onClick={() => removeFromCart(cartKey)}
              src={assets.remove_icon_red}
              alt="Remove"
            />
            <p>{qty}</p>
            <img
              onClick={addItemToCart}
              src={assets.add_icon_green}
              alt="Add"
            />
          </div>
        )}
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

          {/* Color 1 */}
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

          {/* Color 2 */}
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

          {/* Size ONLY Home Decor Resin */}
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

          {/* Custom text ONLY Personalized Resin Art + Custom Orders */}
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
      </div>
    </div>
  );
};

export default FullItem;
