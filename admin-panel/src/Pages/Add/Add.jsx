import React, { useRef, useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useAdminAuth } from "../../context/AdminAuthContext";

const Add = ({ url }) => {
  const { adminToken } = useAdminAuth();

  // ✅ MULTIPLE IMAGES
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

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

  const validateImages = (files) => {
    if (!files || files.length === 0) return "Please upload at least 1 image.";
    if (files.length > 6) return "You can upload maximum 6 images.";

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB per image

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
      }

      if (file.size > maxSize) {
        return "One of the images is too large. Max allowed size is 10MB.";
      }
    }

    return null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!adminToken) {
      toast.error("Admin token missing. Please login again.");
      return;
    }

    const imageError = validateImages(images);
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

      // ✅ SEND MULTIPLE IMAGES
      images.forEach((file) => {
        formData.append("images", file);
      });

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

        setImages([]);

        // ✅ reset input so you can upload same images again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

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
          <p>Upload Images (1 - 6)</p>

          <label htmlFor="images">
            <img
              src={
                images.length > 0
                  ? URL.createObjectURL(images[0])
                  : assets.upload_area
              }
              alt="preview"
            />
          </label>

          <input
            ref={fileInputRef}
            onChange={(e) => {
              const newFiles = Array.from(e.target.files || []);

              // ✅ FIX: add new images to the old ones
              setImages((prev) => {
                const combined = [...prev, ...newFiles];

                // ✅ max 6 images only
                return combined.slice(0, 6);
              });

              // ✅ allow re-selecting same file later
              e.target.value = "";
            }}
            type="file"
            id="images"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            hidden
          />

          {/* ✅ PREVIEW ALL IMAGES */}
          {images.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "15px",
              }}
            >
              {images.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "80px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
