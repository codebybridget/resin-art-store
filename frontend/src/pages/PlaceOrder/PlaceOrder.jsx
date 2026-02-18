import React, { useContext, useMemo, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { sizeExtra } from "../../data/resinOptions";

const PlaceOrder = () => {
  const { cartItem, item_list, axiosInstance, formatNaira, token } =
    useContext(StoreContext);

  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
  });

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cartArray = useMemo(() => {
    return Object.entries(cartItem).map(([cartKey, row]) => ({
      cartKey,
      ...row,
    }));
  }, [cartItem]);

  const subtotal = useMemo(() => {
    let total = 0;

    cartArray.forEach((row) => {
      const item = item_list.find((i) => String(i._id) === String(row.itemId));
      if (!item) return;

      const isHomeDecor =
        row.category?.trim().toLowerCase() === "home decor resin";

      const finalPrice = isHomeDecor
        ? Number(item.price) + sizeExtra(row.size)
        : Number(item.price);

      total += finalPrice * Number(row.quantity || 0);
    });

    return total;
  }, [cartArray, item_list]);

  // Online payment is for product total only
  const total = subtotal;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    if (!address.fullName.trim()) return "Full name is required";
    if (!address.phone.trim()) return "Phone number is required";
    if (!address.street.trim()) return "Street address is required";
    if (!address.city.trim()) return "City is required";
    if (!address.state.trim()) return "State is required";

    const phone = address.phone.replace(/\s+/g, "");
    if (phone.length < 10) return "Please enter a valid phone number";

    return null;
  };

  const buildOrderItems = () => {
    return cartArray
      .map((row) => {
        const item = item_list.find(
          (i) => String(i._id) === String(row.itemId)
        );
        if (!item) return null;

        const isHomeDecor =
          row.category?.trim().toLowerCase() === "home decor resin";

        const finalPrice = isHomeDecor
          ? Number(item.price) + sizeExtra(row.size)
          : Number(item.price);

        return {
          itemId: row.itemId,
          name: item.name,
          price: finalPrice,
          quantity: Number(row.quantity || 0),
          image: item.image,

          color1: row.color1 || "",
          color2: row.color2 || "",
          size: row.size || "One Size",
          customText: row.customText || "",
          category: row.category || "",
        };
      })
      .filter((x) => x && x.quantity > 0);
  };

  const placeOrder = async () => {
    try {
      if (isPlacingOrder) return;

      const savedToken = token || localStorage.getItem("token");

      if (!savedToken) {
        alert("❌ Please login to place an order");
        return;
      }

      const addressError = validateAddress();
      if (addressError) {
        alert(`❌ ${addressError}`);
        return;
      }

      const items = buildOrderItems();

      if (!items.length) {
        alert("❌ Your cart is empty");
        return;
      }

      setIsPlacingOrder(true);

      // Create order (product total only)
      const orderRes = await axiosInstance.post("/api/orders/place", {
        items,
        amount: total,
        subtotalAmount: subtotal,
        address,
      });

      if (!orderRes.data?.success || !orderRes.data?.orderId) {
        alert(orderRes.data?.message || "❌ Failed to create order");
        setIsPlacingOrder(false);
        return;
      }

      const orderId = orderRes.data.orderId;

      // Initialize Paystack transaction
      const payRes = await axiosInstance.post("/api/payment/init", { orderId });

      if (!payRes.data?.success || !payRes.data?.authorization_url) {
        alert(payRes.data?.message || "❌ Failed to start payment");
        setIsPlacingOrder(false);
        return;
      }

      // Redirect to Paystack checkout
      window.location.href = payRes.data.authorization_url;
    } catch (err) {
      console.error("Place order error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "❌ Failed to place order");
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="place-order">
      <h2>Checkout</h2>

      <div className="place-order-container">
        {/* LEFT */}
        <div className="place-order-left">
          <h3>Delivery Information</h3>

          <input
            type="text"
            placeholder="Full Name"
            name="fullName"
            value={address.fullName}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder="Phone Number"
            name="phone"
            value={address.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder="Street Address"
            name="street"
            value={address.street}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder="City"
            name="city"
            value={address.city}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder="State"
            name="state"
            value={address.state}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="back-to-cart-btn"
            style={{ marginTop: "14px" }}
          >
            ← Back to Cart
          </button>
        </div>

        {/* RIGHT */}
        <div className="place-order-right">
          <h3>Order Summary</h3>

          {cartArray.map((row) => {
            const item = item_list.find(
              (i) => String(i._id) === String(row.itemId)
            );
            if (!item) return null;

            const isHomeDecor =
              row.category?.trim().toLowerCase() === "home decor resin";

            const finalPrice = isHomeDecor
              ? Number(item.price) + sizeExtra(row.size)
              : Number(item.price);

            return (
              <div key={row.cartKey} className="order-summary-row">
                <p>
                  <b>{item.name}</b> × {row.quantity}
                </p>

                <p style={{ fontSize: "13px" }}>
                  {row.color1} + {row.color2}
                  {isHomeDecor && ` | Size: ${row.size}`}
                  {row.customText && ` | "${row.customText}"`}
                </p>

                <p>{formatNaira(finalPrice * row.quantity)}</p>
              </div>
            );
          })}

          <hr />

          <p>
            Subtotal: <span>{formatNaira(subtotal)}</span>
          </p>

          <p>
            Delivery Fee: <span>Cash on delivery</span>
          </p>

          <h3>
            Total: <span>{formatNaira(total)}</span>
          </h3>

          <button
            disabled={subtotal === 0 || isPlacingOrder}
            onClick={placeOrder}
          >
            {subtotal === 0
              ? "Cart Empty"
              : isPlacingOrder
              ? "Processing..."
              : "Pay Now"}
          </button>

          <p style={{ marginTop: "10px", fontSize: "13px", opacity: 0.75 }}>
            Delivery fee will be paid in cash on the day your product is
            delivered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
