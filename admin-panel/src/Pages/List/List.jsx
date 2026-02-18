import React, { useEffect, useState } from "react";
import axios from "axios";
import "./List.css";
import { toast } from "react-toastify";

const ADMIN_TOKEN_KEY = "admin_token";

const List = ({ url }) => {
  const [items, setItems] = useState([]);

  // Fetch item list (public route)
  const fetchItems = async () => {
    try {
      const res = await axios.get(`${url}/api/item/list`);

      if (res.data?.success) {
        setItems(res.data.items || []);
      } else {
        setItems([]);
        toast.error(res.data?.message || "❌ No items found");
      }
    } catch (error) {
      console.error("Error fetching items:", error.response?.data || error);
      toast.error("❌ Failed to fetch item list");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Remove item (admin protected)
  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);

      if (!token) {
        toast.error("Admin token missing. Please login again.");
        return;
      }

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this item?"
      );

      if (!confirmDelete) return;

      const res = await axios.post(
        `${url}/api/item/remove`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        toast.success("✅ Item removed successfully!");
        fetchItems(); // refresh list from server
      } else {
        toast.error(res.data?.message || "❌ Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error.response?.data || error);
      toast.error(error.response?.data?.message || "❌ Failed to remove item");
    }
  };

  return (
    <div className="list">
      <p>Item List</p>

      <div className="list-table">
        <div className="list-table-format title">
          <p>Image</p>
          <p>Name</p>
          <p>Description</p>
          <p>Price</p>
          <p>Category</p>
          <p>Action</p>
        </div>

        {items.map((item) => {
          const imageUrl = item.image?.startsWith("http")
            ? item.image
            : `${url}/uploads/${item.image}`;

          return (
            <div key={item._id} className="list-table-format">
              <img src={imageUrl} alt={item.name} />

              <p>{item.name}</p>
              <p>{item.description}</p>
              <p>₦{Number(item.price || 0).toLocaleString()}</p>
              <p>{item.category}</p>

              <p onClick={() => removeItem(item._id)} className="remove-btn">
                ❌
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;
