import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../redux/slices/cartSlice";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // read cart properly from redux (cartSlice stores { cart: { products: [...] } })
  const cartState = useSelector((s) => s.cart || {});
  const products = cartState?.cart?.products || [];

  const [address, setAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!products || products.length === 0) return setError("Cart is empty");
    if (!address.address || !address.city || !address.postalCode || !address.country)
      return setError("Complete shipping address");

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

      // 1) create checkout session
      const createRes = await axios.post(`${BACKEND}/api/checkout`, payload, { headers });
      const checkout = createRes.data;
      if (!checkout || !checkout._id) throw new Error("Failed to create checkout session");

      // 2) simulate payment -> mark checkout as paid
      const payPayload = { paymentStatus: "paid", paymentDetails: { method: paymentMethod, provider: "simulated" } };
      await axios.put(`${BACKEND}/api/checkout/${checkout._id}/pay`, payPayload, { headers });

      // 3) finalize checkout into an order
      const finalizeRes = await axios.post(`${BACKEND}/api/checkout/${checkout._id}/finalize`, {}, { headers });
      const order = finalizeRes.data;
      if (!order || !order._id) throw new Error("Failed to finalize order");

      // 4) clear client cart (redux + localStorage)
      try {
        dispatch(clearCart());
        localStorage.removeItem("cart");
      } catch (err) {
        // ignore
      }

      setLoading(false);
      navigate(`/order/${order._id}`);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || "Checkout failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Address" value={address.address} onChange={(e)=>setAddress({...address,address:e.target.value})} className="p-2 border" />
          <input placeholder="City" value={address.city} onChange={(e)=>setAddress({...address,city:e.target.value})} className="p-2 border" />
          <input placeholder="Postal Code" value={address.postalCode} onChange={(e)=>setAddress({...address,postalCode:e.target.value})} className="p-2 border" />
          <input placeholder="Country" value={address.country} onChange={(e)=>setAddress({...address,country:e.target.value})} className="p-2 border" />
        </div>

        <div className="mt-4">
          <label className="block mb-2">Payment</label>
          <select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)} className="p-2 border">
            <option value="cod">Cash on Delivery</option>
            <option value="card">Card (placeholder)</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end">
          <button disabled={loading} type="submit" className="bg-[#5C5CFF] text-white py-2 px-4 rounded hover:bg-blue-600">
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
