import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../redux/slices/checkoutSlice";
import { useNavigate } from "react-router-dom";

const CheckoutPay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);

  const handlePayAndCreateOrder = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const orderItems = (cartItems || []).map((it) => ({
        productId: it.productId || it._id || it.id,
        name: it.name,
        quantity: Number(it.quantity || 1),
        price: Number(it.price || 0),
        image: it.image || it.img || "",
      }));

      const itemsPrice = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const payload = {
        orderItems,
        shippingAddress: {}, // wire this to real checkout data
        paymentMethod: "Online",
        itemsPrice,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: itemsPrice,
        idempotencyKey: `checkoutpay-${Date.now()}`,
      };

      console.log("createOrder dispatched (CheckoutPay.jsx)", { key: payload.idempotencyKey });
      const res = await dispatch(createOrder(payload)).unwrap();
      console.log("createOrder result (CheckoutPay.jsx)", res);
      if (res && (res._id || res.id)) navigate(`/order/${res._id || res.id}`);
      else navigate("/order-confirmation");
    } catch (err) {
      console.error("createOrder failed (CheckoutPay.jsx)", err);
      alert(err?.message || "Payment/order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ...payment UI... */}
      <button onClick={handlePayAndCreateOrder} disabled={loading} className="btn-primary">
        {loading ? "Processing..." : "Pay & Place Order"}
      </button>
    </div>
  );
};

export default CheckoutPay;