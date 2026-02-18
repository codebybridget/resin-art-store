import React from "react";
import "./Delivery.css";

const Delivery = () => {
  return (
    <section className="delivery-section" id="delivery">
      <div className="delivery-card">
        <h2 className="delivery-title">Delivery Information</h2>

        <p className="delivery-subtitle">
          We deliver across Nigeria. Delivery fees are not paid online you
          will pay the delivery fee on the day your product is
          delivered.
        </p>

        <p
          style={{
            marginTop: "14px",
            fontSize: "13px",
            color: "#6b7280",
            lineHeight: "1.6",
          }}
        >
          Delivery cost depends on your location and the courier service used.
          After your order is placed, we will contact you to confirm the
          delivery fee before dispatch.
        </p>
      </div>
    </section>
  );
};

export default Delivery;
