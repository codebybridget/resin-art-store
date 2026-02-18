import React, { useContext, useMemo } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { sizeExtra } from "../../data/resinOptions";

const Cart = () => {
  const { cartItem, item_list, removeFromCart, url, formatNaira } =
    useContext(StoreContext);

  const navigate = useNavigate();

  const cartArray = useMemo(() => {
    return Object.entries(cartItem || {}).map(([cartKey, row]) => ({
      cartKey,
      ...row,
    }));
  }, [cartItem]);

  const subtotal = useMemo(() => {
    let total = 0;

    cartArray.forEach((row) => {
      const item = item_list.find((i) => String(i._id) === String(row.itemId));
      if (!item) return;

      const normalizedCategory = row.category?.trim().toLowerCase() || "";
      const isHomeDecor = normalizedCategory === "home decor resin";

      const finalPrice = isHomeDecor
        ? Number(item.price) + sizeExtra(row.size)
        : Number(item.price);

      total += finalPrice * Number(row.quantity || 0);
    });

    return total;
  }, [cartArray, item_list]);

  return (
    <div className="cart">
      <h2>Your Cart</h2>

      <div className="cart-items">
        <div className="cart-items-title">
          <p>Image</p>
          <p>Name</p>
          <p>Options</p>
          <p>Qty</p>
          <p>Total</p>
          <p>Remove</p>
        </div>

        <hr />

        {cartArray.length === 0 ? (
          <p style={{ padding: "15px" }}>Your cart is empty.</p>
        ) : (
          cartArray.map((row) => {
            const item = item_list.find(
              (i) => String(i._id) === String(row.itemId)
            );
            if (!item) return null;

            const imageUrl = item.image
              ? item.image.startsWith("http")
                ? item.image
                : `${url}/uploads/${item.image}`
              : "";

            const normalizedCategory = row.category?.trim().toLowerCase() || "";
            const isHomeDecor = normalizedCategory === "home decor resin";

            const finalPrice = isHomeDecor
              ? Number(item.price) + sizeExtra(row.size)
              : Number(item.price);

            return (
              <div
                key={row.cartKey}
                className="cart-items-title cart-items-item"
              >
                <img src={imageUrl} alt={item.name} />

                <p>{item.name}</p>

                <p style={{ fontSize: "13px" }}>
                  {row.color1} + {row.color2}
                  {isHomeDecor && ` | Size: ${row.size}`}
                  {row.customText && ` | "${row.customText}"`}
                </p>

                <p>{row.quantity}</p>

                <p>{formatNaira(finalPrice * row.quantity)}</p>

                <p
                  className="remove-btn"
                  onClick={() => removeFromCart(row.cartKey)}
                >
                  x
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="cart-summary">
        <p>
          Subtotal: <span>{formatNaira(subtotal)}</span>
        </p>

        <p>
          Delivery Fee:{" "}
          <span style={{ opacity: 0.7 }}>Pay on delivery</span>
        </p>

        <hr />

        <h3>
          Total: <span>{formatNaira(subtotal)}</span>
        </h3>

        <button
          onClick={() => navigate("/order")}
          className="checkout-btn"
          disabled={subtotal === 0}
        >
          {subtotal === 0 ? "Cart is Empty" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
