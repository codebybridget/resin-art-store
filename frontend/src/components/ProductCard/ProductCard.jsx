import React, { useContext } from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../asset/assets";

const ProductCard = ({ id, name, price, image, category }) => {
  const navigate = useNavigate();
  const { url, formatNaira } = useContext(StoreContext);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${url}/uploads/${image}`
    : assets.placeholder;

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="product-card-img">
        <img src={imageUrl} alt={name} />
      </div>

      <div className="product-card-info">
        <p className="product-card-name">{name}</p>
        <p className="product-card-category">{category}</p>

        <p className="product-card-price">
          {formatNaira(Number(price || 0))}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
