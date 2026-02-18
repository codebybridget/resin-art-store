import React from "react";
import "./ExploreMenu.css";
import { menu_list, assets } from "../../asset/assets";

const ExploreMenu = ({ category, setCategory }) => {
  const normalize = (str) =>
    str
      ?.trim()
      .toLowerCase()
      .replace(/é/g, "e")
      .replace(/\s+/g, " ");

  const selectedCat = normalize(category);

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>

      <p className="explore-menu-text">
        Discover handcrafted resin art pieces made with premium materials,
        designed to add elegance and character to any space.
      </p>

      <div className="explore-menu-list">
        {/* ALL */}
        <div
          className={`explore-menu-list-item ${
            selectedCat === "all" ? "active" : ""
          }`}
          onClick={() => setCategory("all")}
        >
          <div className="menu-img-container">
            <img
              src={assets.logo}
              alt="All"
              className={selectedCat === "all" ? "active" : ""}
            />
            <span className="hover-dot"></span>
          </div>

          <p>All</p>
        </div>

        {/* Categories */}
        {menu_list.map((item, index) => {
          const menuCat = normalize(item.menu_name);

          return (
            <div
              key={index}
              className={`explore-menu-list-item ${
                selectedCat === menuCat ? "active" : ""
              }`}
              onClick={() => setCategory(menuCat)}
            >
              <div className="menu-img-container">
                <img
                  src={item.menu_image}
                  alt={item.menu_name}
                  className={selectedCat === menuCat ? "active" : ""}
                />
                <span className="hover-dot"></span>
              </div>

              <p>{item.menu_name}</p>
            </div>
          );
        })}
      </div>

      <hr />
    </div>
  );
};

export default ExploreMenu;
