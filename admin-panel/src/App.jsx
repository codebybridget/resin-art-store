import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";

import Add from "./Pages/Add/Add";
import List from "./Pages/List/List";
import Orders from "./Pages/Orders/Orders";

import AdminLoginPopup from "./components/AdminLoginPopup/AdminLoginPopup";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminAuth } from "./context/AdminAuthContext";

const App = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { adminToken } = useAdminAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    setShowAdminLogin(!adminToken);
  }, [adminToken]);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      {showAdminLogin && (
        <AdminLoginPopup url={url} setShowAdminLogin={setShowAdminLogin} />
      )}

      {!showAdminLogin && (
        <>
          <Navbar />
          <hr />

          <div className="app-content">
            <Sidebar />

            <Routes>
              <Route path="/" element={<Navigate to="/orders" />} />
              <Route path="/add" element={<Add url={url} />} />
              <Route path="/list" element={<List url={url} />} />
              <Route path="/orders" element={<Orders url={url} />} />

              {/* Prevent blank page */}
              <Route path="*" element={<Navigate to="/orders" />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
