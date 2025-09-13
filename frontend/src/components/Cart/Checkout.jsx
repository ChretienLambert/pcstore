import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../redux/slices/cartSlice";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
const STORAGE_KEY = "checkoutDraft_v1";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || {});
  const cartState = useSelector((s) => s.cart || {});
  const products = cartState?.cart?.products || [];

  // step: "review" | "payment"
  const [step, setStep] = useState("review");
  const [checkoutId, setCheckoutId] = useState(null);
  const [address, setAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutTotals, setCheckoutTotals] = useState({
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
  });

  // compute totals helper
  const computeTotals = (items) => {
    const itemsPrice = items.reduce(
      (s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)),
      0
    );
    const shippingPrice = 0;
    const taxPrice = 0;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  };

  // restore draft on mount so refresh keeps you in the flow
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.address) setAddress(parsed.address);
        if (parsed?.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed?.checkoutId) {
          setCheckoutId(parsed.checkoutId);
          setStep(parsed.step || "payment");
        }
        // if cart changed, recompute totals later
      }
    } catch (err) {
      // ignore parse errors
    }
    // compute totals based on current cart
    setCheckoutTotals(computeTotals(products));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist draft whenever relevant state changes
  useEffect(() => {
    const draft = {
      address,
      paymentMethod,
      checkoutId,
      step,
      totals: checkoutTotals,
      itemsSnapshot: products.map((p) => ({
        productId: p.productId || p.product || p._id,
        name: p.name,
        price: Number(p.price || 0),
        quantity: Number(p.quantity || 1),
      })),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (err) {
      // ignore storage failures
    }
  }, [address, paymentMethod, checkoutId, step, checkoutTotals, products]);

  // Create checkout session (step 1)
  const handleCreateCheckout = async (e) => {
    e?.preventDefault();
    setError(null);
    if (!products || products.length === 0) {
      return setError("Cart is empty");
    }
    if (!address.address || !address.city || !address.postalCode || !address.country) {
      return setError("Please complete the shipping address");
    }

    const checkoutItems = products.map((p) => ({
      productId: p.productId || p.product || p._id,
      name: p.name,
      image: p.image,
      price: Number(p.price || 0),
      quantity: Number(p.quantity || 1),
      size: p.size,
      color: p.color,
    }));

    const totals = computeTotals(checkoutItems);
    setCheckoutTotals(totals);

    const payload = {
      checkoutItems,
      shippingAddress: address,
      paymentMethod,
      totalPrice: totals.totalPrice,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const createRes = await axios.post(`${BACKEND}/api/checkout`, payload, { headers });
      const checkout = createRes.data;
      if (!checkout || !checkout._id) {
        throw new Error("Failed to create checkout session");
      }
      setCheckoutId(checkout._id);
      setStep("payment");
      setError(null);
    } catch (err) {
      // If user is not authenticated, redirect to login and ensure the flow returns to the review step
      if (err.response?.status === 401) {
        setStep("review");
        // persist draft (the useEffect persisting draft will run)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          address,
          paymentMethod,
          checkoutId: null,
          step: "review",
          totals: checkoutTotals,
          itemsSnapshot: products.map((p) => ({
            productId: p.productId || p.product || p._id,
            name: p.name,
            price: Number(p.price || 0),
            quantity: Number(p.quantity || 1),
          })),
        }));
        navigate("/login?redirect=/checkout");
        return;
      }

      setError(err.response?.data?.message || err.message || "Failed to create checkout");
    } finally {
      setLoading(false);
    }
  };

  // Confirm payment and finalize order (step 2)
  const handleConfirmPayment = async () => {
    if (!checkoutId) return setError("No checkout session to pay");
    setError(null);
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // mark checkout as paid
      await axios.put(
        `${BACKEND}/api/checkout/${checkoutId}/pay`,
        { paymentStatus: "paid", paymentDetails: { method: paymentMethod, provider: "simulated" } },
        { headers }
      );

      // finalize into an order
      const finalizeRes = await axios.post(`${BACKEND}/api/checkout/${checkoutId}/finalize`, {}, { headers });
      const order = finalizeRes.data;
      if (!order || !order._id) throw new Error("Failed to finalize order");

      // clear client cart and draft
      try {
        dispatch(clearCart());
        localStorage.removeItem("cart");
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        // ignore
      }

      navigate(`/order/${order._id}`);
    } catch (err) {
      // If token expired / not authenticated while confirming payment, send back to login and to review step
      if (err.response?.status === 401) {
        setStep("review");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          address,
          paymentMethod,
          checkoutId,
          step: "review",
          totals: checkoutTotals,
          itemsSnapshot: products.map((p) => ({
            productId: p.productId || p.product || p._id,
            name: p.name,
            price: Number(p.price || 0),
            quantity: Number(p.quantity || 1),
          })),
        }));
        navigate("/login?redirect=/checkout");
        return;
      }

      setError(err.response?.data?.message || err.message || "Payment/finalize failed");
    } finally {
      setLoading(false);
    }
  };

  // Cancel checkout and go back to review (keeps draft)
  const handleBackToReview = () => {
    setStep("review");
    setError(null);
  };

  // Small UI helpers
  const stepIndicator = (
    <div className="flex items-center gap-3 mb-6">
      <div className={`px-3 py-1 rounded-full text-sm ${step === "review" ? "bg-[#5C5CFF] text-white" : "bg-gray-100 text-gray-700"}`}>1. Review</div>
      <div className="text-gray-400">→</div>
      <div className={`px-3 py-1 rounded-full text-sm ${step === "payment" ? "bg-[#5C5CFF] text-white" : "bg-gray-100 text-gray-700"}`}>2. Payment</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Checkout</h2>
      {stepIndicator}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {step === "review" && (
        <form onSubmit={handleCreateCheckout}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Address"
              value={address.address}
              onChange={(e) => setAddress({ ...address, address: e.target.value })}
              className="p-2 border rounded input"
            />
            <input
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="p-2 border rounded input"
            />
            <input
              placeholder="Postal Code"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              className="p-2 border rounded input"
            />
            <input
              placeholder="Country"
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
              className="p-2 border rounded input"
            />
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
              {products.map((p) => (
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
              <div className="text-sm text-gray-600">Items: FCFA {computeTotals(products).itemsPrice.toLocaleString()}</div>
              <div className="text-lg font-semibold">Total: FCFA {computeTotals(products).totalPrice.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost px-4 py-2 rounded" onClick={() => navigate(-1)}>
              Back to Shop
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-4 py-2 rounded">
              {loading ? "Creating..." : "Proceed to Payment"}
            </button>
          </div>
        </form>
      )}

      {step === "payment" && (
        <div>
          <div className="p-4 card mb-4">
            <h3 className="font-semibold">Payment confirmation</h3>
            <p className="text-sm text-gray-600 mt-2">Checkout ID: <span className="font-mono text-xs">{checkoutId}</span></p>
            <p className="mt-2">Payment method: <strong>{paymentMethod}</strong></p>
            <div className="mt-4">
              <h4 className="font-medium">Order summary</h4>
              <div className="mt-2 text-sm text-gray-600">Items: FCFA {checkoutTotals.itemsPrice.toLocaleString()}</div>
              <div className="text-lg font-semibold">Total: FCFA {checkoutTotals.totalPrice.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button onClick={handleBackToReview} className="btn-ghost px-4 py-2 rounded">
              Edit Order
            </button>
            <div className="flex gap-3">
              <button onClick={() => { localStorage.removeItem(STORAGE_KEY); navigate("/"); }} className="btn-ghost px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleConfirmPayment} disabled={loading} className="btn-primary px-4 py-2 rounded">
                {loading ? "Processing payment..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
