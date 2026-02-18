import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../asset/assets";
import "./MyOrders.css";

const MyOrders = () => {
  const { url, token, formatNaira } = useContext(StoreContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${url}/api/orders/userorders`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  if (!token) return <p>Please log in to see your orders.</p>;
  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="myOrders">
      <h2>My Orders</h2>

      <div className="container">
        {orders.map((order) => {
          // Calculate subtotal safely (fallback for older orders)
          const subtotal =
            typeof order.subtotalAmount === "number" && order.subtotalAmount > 0
              ? order.subtotalAmount
              : order.items?.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.price || 0) * Number(item.quantity || 0),
                  0
                ) || 0;

          const total =
            typeof order.totalAmount === "number" && order.totalAmount > 0
              ? order.totalAmount
              : subtotal;

          return (
            <div key={order._id} className="my-orders-order">
              <img src={assets.parcel_icon} alt="Parcel" />

              <div>
                {/* ITEMS */}
                <p>
                  {order.items.map((item, idx) => (
                    <span key={idx}>
                      {item.name} x {item.quantity} — {formatNaira(item.price)}
                      {idx !== order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>

                {/* SUBTOTAL */}
                <p>
                  <strong>Subtotal:</strong> {formatNaira(subtotal)}
                </p>

                {/* TOTAL */}
                <p>
                  <strong>Total Paid:</strong> {formatNaira(total)}
                </p>

                {/* PAYMENT */}
                <p>
                  <strong>Payment:</strong>{" "}
                  {order.payment ? (
                    <span style={{ color: "green", fontWeight: "700" }}>
                      Paid
                    </span>
                  ) : (
                    <span style={{ color: "#b00020", fontWeight: "700" }}>
                      Not Paid
                    </span>
                  )}
                </p>

                {/* STATUS */}
                <p>
                  <span> ● </span> <b>{order.status}</b>
                </p>

                <button onClick={fetchOrders}>Track your order</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
