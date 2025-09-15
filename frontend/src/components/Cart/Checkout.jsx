import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../redux/slices/checkoutSlice";
import { useNavigate } from "react-router-dom";
import fallbackImage from "../../assets/cheap-pc.jpg";

const Checkout = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems: cartItemsState = [] } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [shipping, setShipping] = useState({ address: "", city: "", postalCode: "", country: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const computeTotals = (items = []) => {
    const itemsPrice = (items || []).reduce((s, i) => s + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
    const shippingPrice = 0;
    const taxPrice = 0;
    return { itemsPrice, shippingPrice, taxPrice, totalPrice: itemsPrice + shippingPrice + taxPrice };
  };

  const orderItems = (cartItemsState || []).map((it) => ({
    productId: it.productId || it._id || it.id,
    name: it.name,
    quantity: Number(it.quantity || 1),
    price: Number(it.price || 0),
    image: it.image || it.img || fallbackImage,
  }));

  const handlePlaceOrder = async () => {
    if (loading) return;
    setError(null);

    if (!orderItems.length) {
      setError("Cart is empty");
      return;
    }

    const totals = computeTotals(orderItems);
    const idempotencyKey = `checkout-${Date.now()}`;

    const payload = {
      orderItems,
      shippingAddress: shipping,
      paymentMethod,
      itemsPrice: totals.itemsPrice,
      shippingPrice: totals.shippingPrice,
      taxPrice: totals.taxPrice,
      totalPrice: totals.totalPrice,
      idempotencyKey,
    };

    try {
      setLoading(true);
      console.log("createOrder dispatched (Checkout.jsx)", { idempotencyKey, items: orderItems.length, user: user?._id });
      console.log("createOrder payload (Checkout.jsx)", payload);
      const res = await dispatch(createOrder(payload)).unwrap();
      console.log("createOrder result (Checkout.jsx)", res);
      if (res && (res._id || res.id)) navigate(`/order/${res._id || res.id}`);
      else navigate("/order-confirmation");
    } catch (err) {
      console.error("createOrder failed (Checkout.jsx)", err);
      setError(err?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => setShipping((s) => ({ ...s, [field]: e.target.value }));

  const totals = computeTotals(cartItemsState);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Checkout</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input placeholder="Address" value={shipping.address} onChange={handleChange("address")} className="p-2 border rounded input" required />
          <input placeholder="City" value={shipping.city} onChange={handleChange("city")} className="p-2 border rounded input" required />
          <input placeholder="Postal Code" value={shipping.postalCode} onChange={handleChange("postalCode")} className="p-2 border rounded input" required />
          <input placeholder="Country" value={shipping.country} onChange={handleChange("country")} className="p-2 border rounded input" required />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Payment</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="p-2 border rounded input">
            <option value="cod">Cash on Delivery</option>
            <option value="card">Card (placeholder)</option>
          </select>
        </div>

        <div className="p-4 card mb-4">
          <h3 className="font-semibold">Order summary</h3>
          <ul className="mt-2 divide-y">
            {cartItemsState.map((p) => (
              <li key={p.productId || p._id} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">Qty: {p.quantity}</div>
                </div>
                <div className="font-medium">FCFA {(Number(p.price || 0) * Number(p.quantity || 1)).toLocaleString()}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-right">
            <div className="text-sm text-gray-600">Items: FCFA {totals.itemsPrice.toLocaleString()}</div>
            <div className="text-lg font-semibold">Total: FCFA {totals.totalPrice.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="px-6 py-3 bg-blue-600 text-white cursor-pointer rounded-xl font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300" onClick={() => navigate(-1)}>Back to Shop</button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 cursor-pointer text-white rounded-xl font-semibold shadow-md hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">{loading ? "Creating..." : "Proceed to Payment"}</button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
