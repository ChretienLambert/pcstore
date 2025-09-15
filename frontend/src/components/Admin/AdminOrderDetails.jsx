import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchAllOrders } from "../../redux/slices/adminOrderSlice";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const getBearerToken = () => {
  const raw = localStorage.getItem("userToken");
  if (!raw || raw === "null" || raw === "undefined") return null;
  return `Bearer ${raw}`;
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchOrder = async (orderId) => {
    if (!orderId) {
      setError("Invalid order id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      const bearer = getBearerToken();
      if (bearer) headers.Authorization = bearer;
      // use the public order GET (orderRoutes.js GET /:id) which enforces owner/admin
      const res = await axios.get(`${BACKEND}/api/orders/${orderId}`, { headers });
      setOrder(res.data);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err.message || "Failed to load order";
      console.error("fetchOrder error", { orderId, status, err: err?.response?.data || err });
      if (status === 404) setError("Order not found (404)");
      else if (status === 401 || status === 403) setError("Unauthorized. Log in as admin.");
      else setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder(id);
    else setLoading(false);
  }, [id]);

  const handleUpdateStatus = async (status) => {
    if (!order || !order._id) return;
    setStatusLoading(true);
    try {
      const headers = {};
      const bearer = getBearerToken();
      if (bearer) headers.Authorization = bearer;
      
      // For delivered status, we need to update both status and isDelivered
      const updateData = { status };
      if (status === "delivered") {
        updateData.isDelivered = true;
        updateData.deliveredAt = new Date().toISOString();
      }
      
      const res = await axios.put(
        `${BACKEND}/api/orders/${order._id}/status`, 
        updateData, 
        { headers }
      );
      
      setOrder(res.data);
      // refresh admin orders list so Orders page reflects change immediately
      try {
        dispatch(fetchAllOrders());
      } catch (e) {
        /* ignore refresh errors */
      }
    } catch (err) {
      console.error("handleUpdateStatus error", err);
      alert(err?.response?.data?.message || err.message || "Update failed");
    } finally {
      setStatusLoading(false);
    }
  };

  // Check if order is delivered based on status or isDelivered field
  const isDelivered = order?.status === "delivered" || order?.isDelivered;

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const itemsTotal = order.orderItems?.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Order {String(order._id).slice(0, 12)}</h2>
          <div className="text-sm text-gray-500">Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Status: {order.status || (order.isPaid ? "paid" : "pending")}</div>
          <div className="text-lg font-semibold mt-1">FCFA {Number(order.totalPrice || itemsTotal).toLocaleString()}</div>
        </div>
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
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">FCFA {(Number(it.price || 0) * Number(it.quantity || 1)).toLocaleString()}</div>
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
              <div>Method: {order.paymentMethod || "—"}</div>
              <div>Status: {order.paymentStatus || (order.isPaid ? "paid" : "pending")}</div>
              {order.paidAt && <div>Paid at: {new Date(order.paidAt).toLocaleString()}</div>}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h4 className="font-semibold mb-2">Admin Actions</h4>
            <div className="space-y-3">
              <button 
                onClick={() => handleUpdateStatus("paid")} 
                disabled={statusLoading || order.isPaid || order.status === "paid"} 
                className="btn-primary w-full py-2 rounded disabled:opacity-50"
              >
                Mark Paid
              </button>
              <button 
                onClick={() => handleUpdateStatus("pending")} 
                disabled={statusLoading || (!order.isPaid && order.status !== "paid")} 
                className="btn-ghost w-full py-2 rounded disabled:opacity-50"
              >
                Mark Unpaid
              </button>
              <button 
                onClick={() => handleUpdateStatus("delivered")} 
                disabled={statusLoading || isDelivered} 
                className="bg-green-600 text-white w-full py-2 rounded disabled:opacity-50"
              >
                {isDelivered ? "Delivered" : "Mark Delivered"}
              </button>
              <button onClick={() => navigate(-1)} className="btn-ghost w-full py-2 rounded">Back</button>
            </div>
          </div>

          {/* Delivery Status Display */}
          <div className="card p-4">
            <h4 className="font-semibold mb-2">Delivery Status</h4>
            <div className={`text-center p-3 rounded ${
              isDelivered ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {isDelivered ? (
                <div>
                  <div className="font-bold">✓ Delivered</div>
                  {order.deliveredAt && (
                    <div className="text-sm mt-1">
                      {new Date(order.deliveredAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-bold">Pending Delivery</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminOrderDetails;