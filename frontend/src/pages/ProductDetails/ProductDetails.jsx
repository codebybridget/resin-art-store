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

  const product = useMemo(() => {
    return item_list.find((item) => String(item?._id) === String(id));
  }, [item_list, id]);

  const [selectedImage, setSelectedImage] = useState(assets.placeholder);

  // Safe product values
  const name = product?.name || "";
  const price = product?.price || 0;
  const description = product?.description || "";
  const category = product?.category || "";
  const images = product?.images || [];

  const safeImages = Array.isArray(images) ? images : [];

  // Set default selected image safely
  useEffect(() => {
    if (safeImages.length > 0) {
      setSelectedImage(safeImages[0]);
    } else {
      setSelectedImage(assets.placeholder);
    }
  }, [id, safeImages]);

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

  // ✅ Now return safely (no hooks below)
  if (loading) {
    return <div style={{ padding: "30px" }}>Loading product...</div>;
  }

  if (!product) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate("/")}>Go back</button>
      </div>
    );
  }

  return (
    <div className="product-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-container">
        {/* LEFT: GALLERY */}
        <div className="product-gallery">
          <div className="product-image-box">
            <img src={selectedImage} alt={name} />
          </div>

          {/* THUMBNAILS */}
          {safeImages.length > 1 && (
            <div className="product-thumbnails">
              {safeImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`thumb-${index}`}
                  className={selectedImage === img ? "active" : ""}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: INFO */}
        <div className="product-info">
          <h2>{name}</h2>

          <p className="product-price">{formatNaira(finalPrice)}</p>

          <p className="product-category">{category}</p>

          <p className="product-desc">{description}</p>

          {/* CUSTOMIZATION BOX */}
          <div className="customize-box">
            <h3>Choose Options</h3>

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

          {/* CART ACTIONS */}
          <div className="cart-actions">
            {!qty ? (
              <button className="add-btn" onClick={addItemToCart}>
                Add to Cart
              </button>
            ) : (
              <div className="qty-box">
                <button onClick={() => removeFromCart(cartKey)}>-</button>
                <span>{qty}</span>
                <button onClick={addItemToCart}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
