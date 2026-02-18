import React, { useContext, useMemo } from "react";
import "./CartDrawer.css";
import { StoreContext } from "../../context/StoreContext";
import { sizeExtra } from "../../data/resinOptions";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ isOpen, onClose }) => {
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

  const goToCheckout = () => {
    onClose();
    navigate("/order");
  };

  const goToCart = () => {
    onClose();
    navigate("/cart");
  };

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="cart-drawer-header">
          <h3>Your Basket</h3>

          <button className="cart-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {cartArray.length === 0 ? (
          <div className="cart-drawer-empty">
            <p>Your cart is empty.</p>
            <button onClick={onClose}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {cartArray.map((row) => {
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
                  <div key={row.cartKey} className="cart-drawer-row">
                    <img src={imageUrl} alt={item.name} />

                    <div className="cart-drawer-info">
                      <p className="cart-drawer-name">{item.name}</p>

                      <p className="cart-drawer-options">
                        {row.color1} + {row.color2}
                        {isHomeDecor && ` | Size: ${row.size}`}
                        {row.customText && ` | "${row.customText}"`}
                      </p>

                      <div className="cart-drawer-bottom">
                        <span className="cart-drawer-qty">
                          Qty: {row.quantity}
                        </span>

                        <span className="cart-drawer-price">
                          {formatNaira(finalPrice * row.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      className="cart-drawer-remove"
                      onClick={() => removeFromCart(row.cartKey)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-drawer-total">
                <span>Subtotal</span>
                <b>{formatNaira(subtotal)}</b>
              </div>

              <button className="cart-drawer-checkout" onClick={goToCheckout}>
                Checkout
              </button>

              <button className="cart-drawer-viewcart" onClick={goToCart}>
                View full cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
