import React, { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useAdminAuth } from "../../context/AdminAuthContext";

const Add = ({ url }) => {
  const { adminToken } = useAdminAuth();

  const [image, setImage] = useState(null);

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Home Decor Resin",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const validateImage = (file) => {
    if (!file) return "Please upload an image.";

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
    }

    // ✅ match backend (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return "Image is too large. Max allowed size is 10MB.";
    }

    return null;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!adminToken) {
      toast.error("Admin token missing. Please login again.");
      return;
    }

    const imageError = validateImage(image);
    if (imageError) {
      toast.error(imageError);
      return;
    }

    const priceNumber = Number(data.price);

    if (!priceNumber || Number.isNaN(priceNumber) || priceNumber <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("description", data.description.trim());
      formData.append("price", priceNumber);
      formData.append("category", data.category);
      formData.append("image", image);

      const response = await axios.post(`${url}/api/item/add`, formData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Home Decor Resin",
        });

        setImage(null);

        toast.success(response.data.message || "Item added successfully!");
      } else {
        toast.error(response.data.message || "Failed to add item");
      }
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Upload failed";

      console.error("❌ Upload failed:", error?.response?.data || error);

      toast.error(backendMessage);
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>

          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt="preview"
            />
          </label>

          <input
            onChange={(e) => {
              const file = e.target.files?.[0];
              setImage(file || null);
            }}
            type="file"
            id="image"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            hidden
            required
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
            required
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write content here"
            required
          />
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>

            <select
              onChange={onChangeHandler}
              value={data.category}
              name="category"
            >
              <option value="Home Decor Resin">Home Decor Resin</option>
              <option value="Bookmark">Bookmark</option>
              <option value="Resin Jotter">Resin Jotter</option>
              <option value="Resin Serveware">Resin Serveware</option>
              <option value="Resin Jewelry">Resin Jewelry</option>
              <option value="Resin Pen">Resin Pen</option>
              <option value="Resin Keyholders">Resin Keyholders</option>
              <option value="Gift Items">Gift Items</option>
              <option value="Custom Orders">Custom Orders</option>
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Product price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              placeholder="8500"
              required
            />
          </div>
        </div>

        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;
