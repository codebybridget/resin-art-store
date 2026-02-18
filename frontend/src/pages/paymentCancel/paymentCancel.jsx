import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>❌ Payment cancelled</h2>
      <p>You can try again from your cart.</p>

      <button
        onClick={() => navigate("/cart")}
        style={{
          padding: "12px 18px",
          borderRadius: "10px",
          border: "none",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
          marginTop: "15px",
        }}
      >
        Back to Cart
      </button>
    </div>
  );
};

export default PaymentCancel;
