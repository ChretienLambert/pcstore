import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${BACKEND}/api/orders/${id}`, { headers });
        setOrder(res.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.message || err.message || "Order not found");
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">No Order details found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Order {order._id}</h2>
      <p><strong>Status:</strong> {order.paymentStatus || (order.isPaid ? "paid" : "pending")}</p>
      <p><strong>Total:</strong> FCFA {Number(order.totalPrice).toLocaleString()}</p>

      <h3 className="mt-4 text-lg font-semibold">Items</h3>
      <ul className="divide-y">
        {order.orderItems?.map((it) => (
          <li key={it.productId || it._id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
            </div>
            <div className="font-medium">FCFA {(Number(it.price) * Number(it.quantity)).toLocaleString()}</div>
          </li>
        ))}
      </ul>

      <h3 className="mt-4 text-lg font-semibold">Shipping address</h3>
      <div>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</div>

      <div className="mt-6">
        <Link to="/" className="text-sm text-blue-600">Back to shop</Link>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
