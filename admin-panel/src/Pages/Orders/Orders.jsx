import React, { useEffect, useState } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets";
import { io } from "socket.io-client";
import { useAdminAuth } from "../../context/AdminAuthContext";

const Orders = ({ url }) => {
  const { adminToken } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

  const getAdminHeaders = () => {
    if (!adminToken) return null;

    return {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    };
  };

  const fetchAllOrders = async () => {
    try {
      const headersObj = getAdminHeaders();

      if (!headersObj) {
        toast.error("Admin token missing. Please login again.");
        return;
      }

      // ✅ FIXED: /api/order/list (NOT /api/orders/list)
      const response = await axios.get(`${url}/api/order/list`, headersObj);

      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error(response.data.message || "Error fetching orders");
      }
    } catch (err) {
      console.error("🔥 Error fetching orders:", err);
      toast.error(err.response?.data?.message || "Network error fetching orders");
    }
  };

  useEffect(() => {
    if (!adminToken) return;
    fetchAllOrders();
  }, [adminToken]);

  // Socket: refresh orders when new order comes in
  useEffect(() => {
    if (!adminToken) return;

    const socket = io(url, {
      auth: { token: adminToken },
    });

    socket.on("connect", () =>
      console.log("⚡ Connected to socket:", socket.id)
    );

    socket.on("refreshOrders", () => {
      fetchAllOrders();
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => socket.disconnect();
  }, [url, adminToken]);

  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;

    try {
      const headersObj = getAdminHeaders();

      if (!headersObj) {
        toast.error("Admin token missing. Please login again.");
        return;
      }

      // ✅ FIXED: /api/order/status
      const response = await axios.post(
        `${url}/api/order/status`,
        { orderId, status: newStatus },
        headersObj
      );

      if (response.data.success) {
        toast.success("✅ Order status updated");

        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("🔥 Status update error:", err);
      toast.error(err.response?.data?.message || "Network error updating status");
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      const headersObj = getAdminHeaders();

      if (!headersObj) {
        toast.error("Admin token missing. Please login again.");
        return;
      }

      // ✅ FIXED: /api/order/delete
      const res = await axios.post(
        `${url}/api/order/delete`,
        { orderId },
        headersObj
      );

      if (res.data?.success) {
        toast.success("🗑️ Order deleted");
        fetchAllOrders();
      } else {
        toast.error(res.data?.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const bulkDeleteFailed = async () => {
    const confirmDelete = window.confirm(
      "Delete ALL unpaid orders older than 24 hours?"
    );

    if (!confirmDelete) return;

    try {
      const headersObj = getAdminHeaders();

      if (!headersObj) {
        toast.error("Admin token missing. Please login again.");
        return;
      }

      setBulkDeleting(true);

      // ✅ FIXED: /api/order/delete-failed
      const res = await axios.post(
        `${url}/api/order/delete-failed`,
        { olderThanHours: 24 },
        headersObj
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Bulk delete done");
        fetchAllOrders();
      } else {
        toast.error(res.data?.message || "Bulk delete failed");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="admin-orders-page">
      {/* HEADER */}
      <div className="admin-orders-header">
        <h2>All Orders</h2>

        <button
          className="danger-btn"
          onClick={bulkDeleteFailed}
          disabled={bulkDeleting}
        >
          {bulkDeleting ? "Deleting..." : "Delete Failed Orders (24h+)"}
        </button>
      </div>

      {/* LIST */}
      <div className="admin-orders-list">
        {orders.length === 0 ? (
          <p className="admin-orders-empty">No orders found.</p>
        ) : (
          orders.map((order) => {
            const subtotal =
              typeof order.subtotalAmount === "number" &&
              order.subtotalAmount > 0
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
              <div key={order._id} className="admin-order-card">
                {/* LEFT ICON */}
                <div className="admin-order-icon">
                  <img src={assets.parcel_icon} alt="Parcel" />
                </div>

                {/* MAIN INFO */}
                <div className="admin-order-main">
                  {/* ITEMS */}
                  <p className="admin-order-items">
                    {order.items?.map((item, idx) => (
                      <span key={idx}>
                        {item.name} x {item.quantity}
                        {idx !== order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>

                  {/* CUSTOMER */}
                  <div className="admin-order-customer">
                    <p className="admin-order-name">
                      {order.address?.fullName || "No Name"}
                    </p>

                    <p className="admin-order-phone">
                      {order.address?.phone || "No phone"}
                    </p>
                  </div>

                  {/* ADDRESS */}
                  <div className="admin-order-address">
                    <p>{order.address?.street || "No street"}</p>
                    <p>
                      {order.address?.city || ""}{" "}
                      {order.address?.state ? `, ${order.address.state}` : ""}
                    </p>
                  </div>

                  {/* TOTAL */}
                  <p className="admin-order-total">
                    <b>Total:</b> {formatNaira(total)}
                  </p>

                  {/* PAYMENT */}
                  <p className="admin-order-payment">
                    <b>Payment:</b>{" "}
                    {(() => {
                      const paymentStatus =
                        order.paymentStatus ||
                        order.payment_status ||
                        order.payment?.status ||
                        (order.payment === true ? "paid" : null) ||
                        (order.isPaid === true ? "paid" : null) ||
                        (order.paid === true ? "paid" : null) ||
                        "pending";

                      const normalized = String(paymentStatus).toLowerCase();

                      if (
                        normalized === "paid" ||
                        normalized === "success" ||
                        normalized === "successful"
                      ) {
                        return <span className="paid">Paid</span>;
                      }

                      if (
                        normalized === "failed" ||
                        normalized === "cancelled"
                      ) {
                        return <span className="not-paid">Failed</span>;
                      }

                      return <span className="not-paid">Pending</span>;
                    })()}
                  </p>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="admin-order-actions">
                  <select
                    className="admin-order-status"
                    onChange={(e) => statusHandler(e, order._id)}
                    value={order.status || "Pending"}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  <button
                    className="danger-btn-outline"
                    onClick={() => deleteOrder(order._id)}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;
