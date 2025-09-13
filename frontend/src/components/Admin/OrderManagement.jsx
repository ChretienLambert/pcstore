import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus, deleteOrder } from "../../redux/slices/adminOrderSlice";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await dispatch(deleteOrder(id)).unwrap();
      // fetch again or rely on slice update
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.message || "Delete failed");
    }
  };

  const toggleDelivered = async (order) => {
    const confirmMsg = order.isDelivered ? "Mark as not delivered?" : "Mark as delivered?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const update = { isDelivered: !order.isDelivered };
      await dispatch(updateOrderStatus({ id: order._id, update })).unwrap();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err?.message || "Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {String(error)}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr>
              <th>ID</th><th>User</th><th>Total</th><th>Payment</th><th>Delivered</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{order._id}</td>
                <td className="p-2">{order.user?.email || order.user?.name || "—"}</td>
                <td className="p-2">FCFA {Number(order.totalPrice || 0).toLocaleString()}</td>
                <td className="p-2">{order.paymentStatus || (order.isPaid ? "paid" : "pending")}</td>
                <td className="p-2">{order.isDelivered ? "Yes" : "No"}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => toggleDelivered(order)} className="bg-yellow-500 text-white px-2 py-1 rounded">Toggle Delivered</button>
                  <button onClick={() => handleDelete(order._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
