import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <section className="about-us" id="about">
      <div className="about-us-container">
        {/* TITLE */}
        <div className="about-us-header">
          <h2>ABOUT LADYB RESIN ART GALLERY</h2>
          <p className="about-us-subtitle">
            Handmade resin pieces designed to add beauty, elegance, and luxury to
            your everyday life.
          </p>
        </div>

        {/* STORY */}
        <div className="about-us-story">
          <p>
            LADYB RESIN ART GALLERY is a handmade resin art brand focused on
            premium-quality designs that bring modern style into your space.
          </p>

          <p>
            Every item is crafted with care and attention to detail  from wall
            frames and trays to custom art pieces, gift items, and luxury home
            décor.
          </p>

          <p>
            We believe every product should feel special. That’s why we focus on
            clean finishing, beautiful packaging, and customer satisfaction from
            start to finish.
          </p>
        </div>

        {/* HIGHLIGHTS */}
        <div className="about-us-highlights">
          <div className="about-card">
            <h3>✨ Premium Handmade Quality</h3>
            <p>
              Each product is carefully designed, polished, and finished to
              perfection.
            </p>
          </div>

          <div className="about-card">
            <h3>🎁 Perfect for Gifting</h3>
            <p>
              Beautiful resin pieces that make birthdays, anniversaries, and
              special moments unforgettable.
            </p>
          </div>

          <div className="about-card">
            <h3>🖌️ Custom Orders Available</h3>
            <p>
              Want something unique? We create custom pieces made just for you.
            </p>
          </div>

          <div className="about-card">
            <h3>🚚 Reliable Delivery</h3>
            <p>
              We deliver safely and quickly, so your items arrive in perfect
              condition.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="about-us-cta">
          <p>
            Thank you for supporting our craft. Explore our collections and find
            something truly special today 💖
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
