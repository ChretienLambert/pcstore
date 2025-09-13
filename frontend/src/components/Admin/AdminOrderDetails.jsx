import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => {
    const raw = localStorage.getItem("userToken");
    if (!raw || raw === "null" || raw === "undefined") return null;
    return raw;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // use the same endpoint as the user page which returns populated user
        const res = await axios.get(`${BACKEND}/api/orders/${id}`, { headers });
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const itemsTotal = order.orderItems?.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Order Details</h1>
        <div className="text-sm text-gray-500">#{order._id}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <section className="card p-4">
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="divide-y">
              {order.orderItems?.map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {it.image && <img src={it.image} alt={it.name} className="w-16 h-12 object-cover rounded" />}
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-500">Product: {it.productId || it._id}</div>
                      {it.size && <div className="text-sm text-gray-500">Size: {it.size}</div>}
                      {it.color && <div className="text-sm text-gray-500">Color: {it.color}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">FCFA {(Number(it.price) * Number(it.quantity)).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                    <div className="text-sm text-gray-500">Unit: FCFA {Number(it.price).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <div className="text-sm text-gray-700">
              <div>{order.shippingAddress?.address}</div>
              <div>{order.shippingAddress?.city} {order.shippingAddress?.postalCode}</div>
              <div>{order.shippingAddress?.country}</div>
            </div>
          </section>

          <section className="card p-4">
            <h3 className="font-semibold mb-2">Payment</h3>
            <div className="text-sm text-gray-700">
              <div>Method: {order.paymentMethod || order.paymentStatus || "—"}</div>
              <div>Status: {order.paymentStatus || (order.isPaid ? "paid" : "pending")}</div>
              {order.paidAt && <div>Paid at: {new Date(order.paidAt).toLocaleString()}</div>}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h4 className="font-semibold">Summary</h4>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600">
                <div>Items total</div>
                <div>FCFA {itemsTotal.toLocaleString()}</div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <div>Shipping</div>
                <div>FCFA {Number(order.shippingPrice || 0).toLocaleString()}</div>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-3">
                <div>Total</div>
                <div>FCFA {Number(order.totalPrice || itemsTotal).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h4 className="font-semibold mb-2">Customer</h4>
            {order.user ? (
              <div>
                <div className="font-medium">{order.user.name || order.user.email}</div>
                <div className="text-sm text-gray-500">{order.user.email}</div>
                <div className="mt-3">
                  <button
                    onClick={() => navigate("/admin/users", { state: { selectedUserId: order.user._id } })}
                    className="btn-primary w-full"
                  >
                    View Customer Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Guest order</div>
            )}
          </div>

          <div>
            <button onClick={() => navigate(-1)} className="btn-ghost w-full py-2 rounded">Back</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminOrderDetails;