import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <section className="privacy-policy" id="privacy-policy">
      <div className="privacy-container">
        <h2>Privacy Policy</h2>

        <p>
          At Ladyb Resin Art Gallery, we respect your privacy and we are
          committed to keeping your personal information safe.
        </p>

        <h3>Information We Collect</h3>
        <p>
          When you place an order, we may collect details like your name, phone
          number, delivery address, and email address.
        </p>

        <h3>How We Use Your Information</h3>
        <p>
          Your information is used strictly for order processing, delivery, and
          communicating with you about your purchase.
        </p>

        <h3>Security</h3>
        <p>
          We do our best to protect your information. However, no online method
          of transmission is 100% secure.
        </p>

        <p className="privacy-last">
          If you have any questions, feel free to contact us via email or
          WhatsApp.
        </p>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
