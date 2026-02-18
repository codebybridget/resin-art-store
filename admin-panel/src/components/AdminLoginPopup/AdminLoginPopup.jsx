import React, { useState } from "react";
import "./AdminLoginPopup.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminLoginPopup = ({ url, setShowAdminLogin }) => {
  const { login } = useAdminAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loginAdmin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!form.email || !form.password) {
      toast.error("Email and password required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${url}/api/user/admin-login`, {
        email: form.email,
        password: form.password,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Admin login failed");
        return;
      }

      if (!res.data?.token) {
        toast.error("Token missing from server response");
        return;
      }

      // ✅ Login without refresh
      login(res.data.token);

      toast.success("✅ Admin login successful");

      // ✅ Close popup
      setShowAdminLogin(false);
    } catch (err) {
      console.error("Admin login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-overlay">
      <form className="admin-login-box" onSubmit={loginAdmin}>
        <h2>Admin Login</h2>

        <p className="admin-login-sub">
          Login before you can access the admin panel.
        </p>

        <input
          type="email"
          name="email"
          placeholder="Admin email"
          value={form.email}
          onChange={onChangeHandler}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={onChangeHandler}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPopup;
