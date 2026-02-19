import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetails.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../asset/assets";

import {
  resinColors,
  getSizesForCategory,
  sizeMultiplier,
  isCustomizationCategory,
} from "../../data/resinOptions";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    item_list = [],
    cartItem,
    addToCart,
    removeFromCart,
    formatNaira,
    loading,
  } = useContext(StoreContext);

  const product = item_list.find((item) => String(item?._id) === String(id));

  const [selectedImage, setSelectedImage] = useState("");
  const [qty, setQty] = useState(1);

  // If items are still loading
  if (loading) {
    return <div style={{ padding: "30px" }}>Loading product...</div>;
  }

  // If product not found
  if (!product) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate("/")}>Go back</button>
      </div>
    );
  }

  const { name, price, description, category, images = [] } = product;

  const safeImages = Array.isArray(images) ? images : [];

  // ✅ Set default selected image safely
  useEffect(() => {
    if (safeImages.length > 0) {
      setSelectedImage(safeImages[0]);
    } else {
      setSelectedImage(assets.placeholder);
    }
  }, [product]);

  const sizes = useMemo(() => getSizesForCategory(category), [category]);

  const [color1, setColor1] = useState("Blue");
  const [color2, setColor2] = useState("White");
  const [size, setSize] = useState(sizes?.[0] || "One Size");
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    setSize(sizes?.[0] || "One Size");
  }, [sizes]);

  const normalizedCategory = category?.trim().toLowerCase() || "";

  const showSize = normalizedCategory === "home decor resin";
  const showCustomText = isCustomizationCategory(category);

  // ✅ MULTIPLIER PRICING
  const finalPrice = showSize
    ? Number(price) * sizeMultiplier(size)
    : Number(price);

  const safeSize = showSize ? size : "One Size";
  const safeCustomText = showCustomText ? customText.trim() : "";

  const cartKey = `${id}_${color1}_${color2}_${safeSize}_${safeCustomText}`;
  const cartQty = cartItem?.[cartKey]?.quantity || 0;

  const addItemToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(cartKey, id, {
        color1,
        color2,
        size: safeSize,
        customText: safeCustomText,
        category,
      });
    }
  };

  return (
    <div className="product-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="temu-product-layout">
        {/* LEFT: THUMBNAILS */}
        <div className="temu-thumbs">
          {safeImages.length > 0 ? (
            safeImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`thumb-${index}`}
                className={selectedImage === img ? "active" : ""}
                onClick={() => setSelectedImage(img)}
              />
            ))
          ) : (
            <img
              src={assets.placeholder}
              alt="thumb-placeholder"
              className="active"
            />
          )}
        </div>

        {/* MIDDLE: MAIN IMAGE */}
        <div className="temu-main-image">
          <img src={selectedImage} alt={name} />
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className="temu-info">
          <h2 className="temu-title">{name}</h2>

          <div className="temu-rating">
            <img src={assets.rating_starts} alt="rating" />
            <span>4.7</span>
          </div>

          <p className="temu-price">{formatNaira(finalPrice)}</p>

          <p className="temu-category">{category}</p>

          <p className="temu-desc">{description}</p>

          {/* OPTIONS */}
          <div className="temu-options-box">
            <h3>Choose Options</h3>

            <div className="temu-option-row">
              <label>Color 1:</label>
              <select value={color1} onChange={(e) => setColor1(e.target.value)}>
                {resinColors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="temu-option-row">
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
              <div className="temu-option-row">
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
              <div className="temu-option-row">
                <label>Custom Text:</label>
                <input
                  type="text"
                  value={customText}
                  placeholder="Example: Happy Birthday Sarah"
                  onChange={(e) => setCustomText(e.target.value)}
                />
              </div>
            )}

            {/* QTY DROPDOWN */}
            <div className="temu-option-row">
              <label>Qty:</label>
              <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CART BUTTON */}
          {!cartQty ? (
            <button className="temu-add-btn" onClick={addItemToCart}>
              Add to Cart
            </button>
          ) : (
            <div className="qty-box">
              <button onClick={() => removeFromCart(cartKey)}>-</button>
              <span>{cartQty}</span>
              <button onClick={() => addToCart(cartKey, id)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
