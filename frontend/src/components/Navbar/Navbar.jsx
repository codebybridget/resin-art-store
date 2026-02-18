import React, { useContext, useEffect, useMemo, useState } from "react";
import "./Navbar.css";
import { assets } from "../../asset/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import CartDrawer from "../CartDrawer/CartDrawer";

const USER_TOKEN_KEY = "user_token";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // ✅ mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ search
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    token,
    setToken,
    getTotalCartCount,

    // ✅ from StoreContext
    item_list,
    searchText,
    setSearchText,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getTotalCartCount();

  const normalize = (str) => String(str || "").trim().toLowerCase();

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem(USER_TOKEN_KEY);
    setShowDropdown(false);
    navigate("/");
  };

  const openCart = () => {
    setShowDropdown(false);
    setShowCartDrawer(true);
  };

  const closeCart = () => setShowCartDrawer(false);

  const clearSearch = () => {
    setSearchText("");
    setShowSuggestions(false);
  };

  // ✅ Smooth scroll helper
  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    setShowDropdown(false);

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 250);

      return;
    }

    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ When clicking a suggestion: go to home, then scroll to item
  const goToItem = (itemId, itemName) => {
    setSearchText(itemName);
    setShowSuggestions(false);
    setSearchOpen(false);

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        const el = document.getElementById(`item-${itemId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);

      return;
    }

    setTimeout(() => {
      const el = document.getElementById(`item-${itemId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  // ✅ Auto update active menu when scrolling (only on "/")
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = ["home", "menu", "mobile-app", "about", "delivery", "privacy"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMenu(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  // close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // close suggestions if search closed
  useEffect(() => {
    if (!searchOpen) setShowSuggestions(false);
  }, [searchOpen]);

  // ✅ Suggestions list (top 6)
  const suggestions = useMemo(() => {
    const search = normalize(searchText);

    if (!search) return [];

    return (item_list || [])
      .filter((item) => {
        const name = normalize(item.name);
        const desc = normalize(item.description);
        return name.includes(search) || desc.includes(search);
      })
      .slice(0, 6);
  }, [item_list, searchText]);

  return (
    <>
      <nav className="navbar">
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("home");
          }}
        >
          <img src={assets.logo} alt="Logo" className="logo" />
        </Link>

        {/* DESKTOP MENU */}
        <ul className="navbar-menu">
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className={menu === "home" ? "active nav-btn" : "nav-btn"}
          >
            home
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("menu")}
            className={menu === "menu" ? "active nav-btn" : "nav-btn"}
          >
            menu
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("mobile-app")}
            className={menu === "mobile-app" ? "active nav-btn" : "nav-btn"}
          >
            mobile-app
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("about")}
            className={menu === "about" ? "active nav-btn" : "nav-btn"}
          >
            about
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("delivery")}
            className={menu === "delivery" ? "active nav-btn" : "nav-btn"}
          >
            delivery
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("privacy")}
            className={menu === "privacy" ? "active nav-btn" : "nav-btn"}
          >
            privacy
          </button>
        </ul>

        <div className="navbar-right">
          {/* 🔍 SEARCH ICON BUTTON */}
          <button
            type="button"
            className="search-btn"
            onClick={() => {
              setSearchOpen((prev) => !prev);
              setShowDropdown(false);
            }}
            aria-label="Search"
          >
            <img src={assets.search_icon} alt="Search" />
          </button>

          {/* CART ICON */}
          <div className="navbar-search-icon">
            <button
              className="cart-icon-btn"
              onClick={openCart}
              type="button"
              aria-label="Open cart"
            >
              <img src={assets.basket_icon} alt="Cart" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>

          {/* LOGIN / PROFILE */}
          {!token ? (
            <button onClick={() => setShowLogin(true)}>Sign in</button>
          ) : (
            <div className="navbar-profile">
              <img
                src={assets.profile_icon}
                alt="Profile"
                onClick={() => setShowDropdown((prev) => !prev)}
              />

              {showDropdown && (
                <ul className="nav-profile-dropdown">
                  <li
                    onClick={() => {
                      navigate("/myorders");
                      setShowDropdown(false);
                    }}
                  >
                    <img src={assets.bag_icon} alt="Orders" />
                    <p>Orders</p>
                  </li>

                  <hr />

                  <li onClick={handleLogout}>
                    <img src={assets.logout_icon} alt="Logout" />
                    <p>Logout</p>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* MOBILE HAMBURGER */}
          <button
            className="hamburger-btn"
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* FLOATING CART BUTTON */}
        <button
          type="button"
          className="floating-cart-btn"
          onClick={openCart}
          aria-label="Open cart"
        >
          <img src={assets.basket_icon} alt="Cart" />
          <span>{cartCount}</span>
        </button>
      </nav>

      {/* ✅ SEARCH BAR + SUGGESTIONS */}
      {searchOpen && (
        <div className="navbar-searchbar">
          <div className="navbar-searchbar-inner">
            <div className="search-input-wrapper">
              <img src={assets.search_icon} alt="Search" />

              <input
                type="text"
                placeholder="Search for products..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoFocus
              />

              {searchText && (
                <button
                  type="button"
                  className="search-x-btn"
                  onClick={clearSearch}
                >
                  ✖
                </button>
              )}
            </div>

            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchOpen(false);
                setShowSuggestions(false);
              }}
              type="button"
            >
              Close
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && searchText && (
            <div className="search-suggestions">
              {suggestions.length === 0 ? (
                <p className="no-suggestion">No matching products found.</p>
              ) : (
                suggestions.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    className="suggestion-item"
                    onClick={() => goToItem(item._id, item.name)}
                  >
                    <span className="suggestion-name">{item.name}</span>
                    <span className="suggestion-category">
                      {item.category || ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className={menu === "home" ? "active" : ""}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("menu")}
              className={menu === "menu" ? "active" : ""}
            >
              Menu
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("mobile-app")}
              className={menu === "mobile-app" ? "active" : ""}
            >
              Mobile App
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className={menu === "about" ? "active" : ""}
            >
              About
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("delivery")}
              className={menu === "delivery" ? "active" : ""}
            >
              Delivery
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("privacy")}
              className={menu === "privacy" ? "active" : ""}
            >
              Privacy
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={showCartDrawer} onClose={closeCart} />
    </>
  );
};

export default Navbar;
