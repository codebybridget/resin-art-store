import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ADMIN_TOKEN_KEY = "admin_token";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem(ADMIN_TOKEN_KEY) || ""
  );

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }, [adminToken]);

  const login = (token) => {
    setAdminToken(token);
  };

  const logout = () => {
    setAdminToken("");
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  // Always get the latest token (useful for axios calls)
  const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

  const value = useMemo(
    () => ({
      adminToken,
      login,
      logout,
      getToken,
    }),
    [adminToken]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
