import React, { useState } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import ItemDisplay from "../../components/ItemDisplay/ItemDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import AboutUs from "../../components/AboutUs/AboutUs";
import Delivery from "../../components/Delivery/Delivery";
import PrivacyPolicy from "../../components/PrivacyPolicy/PrivacyPolicy";
import "./Home.css";

const Home = () => {
  const [category, setCategory] = useState("all");

  return (
    <div>
      {/* HOME SECTION */}
      <section id="home" className="scroll-section">
        <Header />
      </section>

      {/* MENU SECTION */}
      <section id="menu" className="scroll-section">
        <ExploreMenu category={category} setCategory={setCategory} />
        <ItemDisplay category={category} />
      </section>

      {/* MOBILE APP SECTION */}
      <section id="mobile-app" className="scroll-section">
        <AppDownload />
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="scroll-section">
        <AboutUs />
      </section>

      {/* DELIVERY SECTION */}
      <section id="delivery" className="scroll-section">
        <Delivery />
      </section>

      {/* PRIVACY SECTION */}
      <section id="privacy" className="scroll-section">
        <PrivacyPolicy />
      </section>
    </div>
  );
};

export default Home;
