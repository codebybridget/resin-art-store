import React from "react";
import "./Footer.css";
import { assets } from "../../asset/assets";

const Footer = () => {
  // Change these 3 values only
  const whatsappNumber = "2348106667303"; // NO +, NO 0
  const instagramUsername = "ladybresinartgallery";
  const tiktokUsername = "ladybresinartgallery";

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        {/* LEFT */}
        <div className="footer-content-left">
          <img src={assets.logo} alt="Ladyb Resin Art Gallery" />

          <p>
            Handcrafted resin art designed to bring color, depth, and modern
            elegance into everyday spaces.
          </p>

          {/* Social Icons */}
          <div className="footer-social-icons">
            {/* Instagram */}
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noreferrer"
            >
              <img src={assets.instagram_icon} alt="Instagram" />
            </a>

            {/* TikTok */}
            <a
              href={`https://www.tiktok.com/@${tiktokUsername}`}
              target="_blank"
              rel="noreferrer"
            >
              <img src={assets.tiktok_icon} alt="TikTok" />
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello%20I%20want%20to%20place%20an%20order`}
              target="_blank"
              rel="noreferrer"
            >
              <img src={assets.whatsapp_icon} alt="WhatsApp" />
            </a>
          </div>
        </div>

        {/* CENTER */}
        <div className="footer-content-center">
          <h2>COMPANY</h2>

          <ul>
            <li>
              <a href="#home">Home</a>
            </li>

            <li>
              <a href="#about-us">About us</a>
            </li>

            <li>
              <a href="#delivery">Delivery</a>
            </li>

            <li>
              <a href="#privacy-policy">Privacy Policy</a>
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>

          <ul>
            <li>+234 810 666 7303</li>
            <li>adeyeyebridget2@gmail.com</li>
          </ul>
        </div>
      </div>

      <hr />

      <p>
        © 2026 Ladyb Resin Art Gallery. All rights reserved • Fast delivery •
        Guaranteed satisfaction.
      </p>
    </div>
  );
};

export default Footer;
