import React, { useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useAdminAuth } from "../../context/AdminAuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAdminAuth();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <img className="logo" src={assets.logo} alt="Logo" />

      <div className="navbar-profile-container">
        <button
          className="navbar-profile"
          onClick={toggleMenu}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          type="button"
        >
          <img src={assets.profile_image} alt="Admin profile" />
        </button>

        {menuOpen && (
          <ul className="navbar-menu">
            <li>
              <button className="logout-btn" onClick={handleLogout} type="button">
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
