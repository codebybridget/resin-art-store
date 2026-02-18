import React, { createContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const USER_TOKEN_KEY = "user_token";

const StoreContextProvider = ({ children, setShowLogin }) => {
  const url = import.meta.env.VITE_API_URL;

  const [cartItem, setCartItems] = useState({});
  const [item_list, setItemList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem(USER_TOKEN_KEY) || "");

  // ✅ SEARCH STATE (used by Navbar + ItemDisplay)
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Format Naira
  const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

  // ✅ Logout safely
  const logoutUser = () => {
    setToken("");
    setCartItems({});
    localStorage.removeItem(USER_TOKEN_KEY);

    if (setShowLogin) setShowLogin(true);
  };

  // ✅ ONE axios instance for the whole app
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: url,
      headers: { "Content-Type": "application/json" },
    });

    // attach token
    instance.interceptors.request.use((config) => {
      const savedToken = localStorage.getItem(USER_TOKEN_KEY);

      if (savedToken) {
        config.headers.Authorization = `Bearer ${savedToken}`;
      }

      return config;
    });

    // auto logout if token expires
    instance.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logoutUser();
        }
        return Promise.reject(err);
      }
    );

    return instance;
  }, [url]);

  // ✅ Fetch items
  const fetchItemList = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/api/item/list");

      if (response.data?.success && Array.isArray(response.data.items)) {
        setItemList(response.data.items);
      } else {
        setItemList([]);
        setError("No items found");
      }
    } catch (err) {
      setItemList([]);
      setError(err.response?.data?.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch cart
  const fetchCart = async () => {
    const savedToken = localStorage.getItem(USER_TOKEN_KEY);
    if (!savedToken) return;

    try {
      const response = await axiosInstance.post("/api/cart/get");

      if (response.data?.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (err) {
      console.error("Fetch cart error:", err.response?.data || err.message);
    }
  };

  // ✅ Run once when app loads
  useEffect(() => {
    fetchItemList();

    const savedToken = localStorage.getItem(USER_TOKEN_KEY);

    if (savedToken) {
      setToken(savedToken);
      fetchCart();
    }
  }, []);

  // ✅ When token changes (login), refresh cart
  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  // ✅ Add to cart
  const addToCart = async (cartKey, itemId, customization = {}) => {
    const savedToken = localStorage.getItem(USER_TOKEN_KEY);

    // If not logged in, open login popup
    if (!savedToken) {
      if (setShowLogin) setShowLogin(true);
      return;
    }

    // ✅ OPTIMISTIC UPDATE
    setCartItems((prev) => {
      const copy = { ...prev };

      if (copy[cartKey]) {
        copy[cartKey] = {
          ...copy[cartKey],
          quantity: Number(copy[cartKey].quantity || 0) + 1,
        };
      } else {
        copy[cartKey] = {
          itemId,
          quantity: 1,
          ...customization,
        };
      }

      return copy;
    });

    try {
      const response = await axiosInstance.post("/api/cart/add", {
        cartKey,
        itemId,
        ...customization,
      });

      if (response.data?.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      fetchCart();
    }
  };

  // ✅ Remove from cart
  const removeFromCart = async (cartKey) => {
    const savedToken = localStorage.getItem(USER_TOKEN_KEY);

    if (!savedToken) {
      if (setShowLogin) setShowLogin(true);
      return;
    }

    // ✅ OPTIMISTIC UPDATE
    setCartItems((prev) => {
      const copy = { ...prev };

      if (!copy[cartKey]) return prev;

      const qty = Number(copy[cartKey].quantity || 0);

      if (qty > 1) {
        copy[cartKey] = { ...copy[cartKey], quantity: qty - 1 };
      } else {
        delete copy[cartKey];
      }

      return copy;
    });

    try {
      const response = await axiosInstance.post("/api/cart/remove", { cartKey });

      if (response.data?.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (err) {
      console.error("Remove from cart error:", err.response?.data || err.message);
      fetchCart();
    }
  };

  // ✅ Total cart amount
  const getTotalCartAmount = () => {
    let total = 0;

    for (let cartKey in cartItem) {
      const row = cartItem[cartKey];
      const item = item_list.find((i) => String(i._id) === String(row.itemId));
      if (!item) continue;

      total += Number(item.price) * Number(row.quantity || 0);
    }

    return total;
  };

  // ✅ Total cart count (for cart badge)
  const getTotalCartCount = () => {
    let count = 0;

    for (let cartKey in cartItem) {
      count += Number(cartItem[cartKey]?.quantity || 0);
    }

    return count;
  };

  return (
    <StoreContext.Provider
      value={{
        url,
        token,
        setToken,

        item_list,
        cartItem,
        setCartItems,

        fetchCart,
        fetchItemList,

        addToCart,
        removeFromCart,

        getTotalCartAmount,
        getTotalCartCount,

        formatNaira,
        axiosInstance,

        loading,
        error,

        // ✅ SEARCH
        searchText,
        setSearchText,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
