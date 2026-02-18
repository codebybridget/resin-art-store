import React from "react";
import "./Header.css";

const Header = () => {
  const scrollToMenu = () => {
    const menuSection = document.getElementById("explore-menu");

    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="header">
      <div className="header-contents">
        <h2>Timeless Resin Art, Crafted by Hand</h2>
        <p>Premium materials. Unique designs. Lasting beauty.</p>
        <button onClick={scrollToMenu}>View Menu</button>
      </div>
    </div>
  );
};

export default Header;
