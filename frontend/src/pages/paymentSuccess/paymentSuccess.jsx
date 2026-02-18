import React, { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const PaymentSuccess = () => {
  const { axiosInstance, fetchCart } = useContext(StoreContext);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setMessage("❌ No payment reference found.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await axiosInstance.post("/api/payment/verify", {
          reference,
        });

        if (res.data.success) {
          setMessage("✅ Payment verified successfully!");

          // Clear cart on frontend
          await fetchCart();

          // Redirect to My Orders
          setTimeout(() => {
            navigate("/myorders");
          }, 1500);
        } else {
          setMessage("❌ Payment verification failed.");
        }
      } catch (error) {
        console.error("Verify error:", error.response?.data || error.message);
        setMessage("❌ Payment verification error.");
      }
    };

    verifyPayment();
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default PaymentSuccess;
