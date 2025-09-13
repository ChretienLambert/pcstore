import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, updateOrderStatus, deleteOrder } from "../../redux/slices/adminOrderSlice";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await dispatch(deleteOrder(id)).unwrap();
    } catch (err) {
      alert(err?.message || "Delete failed");
    }
  };

  const toggleDelivered = async (order) => {
    if (!window.confirm(order.isDelivered ? "Mark as not delivered?" : "Mark as delivered?")) return;
    try {
      const update = { isDelivered: !order.isDelivered };
      await dispatch(updateOrderStatus({ id: order._id, update })).unwrap();
    } catch (err) {
      alert(err?.message || "Update failed");
    }
  };

  const viewOrder = (order) => {
    if (!order || !order._id) return;
    navigate(`/admin/orders/${order._id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {String(error)}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Delivered</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && [...Array(8)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
              </tr>
            ))}
            {!loading && orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="text-left text-blue-700 hover:underline">
                    #{String(order._id).slice(0,8)}
                  </button>
                </td>
                <td className="p-3">
                  {order.user ? (
                    <button onClick={(e)=>{ e.stopPropagation(); navigate("/admin/users", { state: { selectedUserId: order.user._id } }); }} className="text-left underline text-blue-600">
                      {order.user?.name || order.user?.email}
                    </button>
                  ) : (
                    <span className="text-gray-500">Guest</span>
                  )}
                </td>
                <td className="p-3">{order.orderItems?.length || 0}</td>
                <td className="p-3">FCFA {Number(order.totalPrice || 0).toLocaleString()}</td>
                <td className="p-3">{order.paymentStatus || (order.isPaid ? "paid" : "pending")}</td>
                <td className="p-3">{order.isDelivered ? <span className="text-green-600">Yes</span> : <span className="text-yellow-600">No</span>}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleDelivered(order)} className="bg-yellow-500 text-white px-2 py-1 rounded">Toggle</button>
                    <button onClick={() => handleDelete(order._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
