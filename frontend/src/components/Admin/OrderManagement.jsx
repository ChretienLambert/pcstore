import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, deleteOrder } from "../../redux/slices/adminOrderSlice";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.adminOrders || { orders: [], loading: false, error: null });

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // accept the id (string) — ensure callers pass order._id
  const viewOrder = (orderId) => {
    if (!orderId) return;
    navigate(`/admin/orders/${orderId}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await dispatch(deleteOrder(id)).unwrap();
      await dispatch(fetchAllOrders());
    } catch (err) {
      alert(err?.message || "Delete failed");
    }
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
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <button onClick={() => viewOrder(order._id)} className="text-left text-blue-700 hover:underline">
                    #{String(order._id).slice(0, 8)}
                  </button>
                </td>
                <td className="p-3">{order.user?.name || order.user?.email || "Guest"}</td>
                <td className="p-3">{order.orderItems?.length || 0}</td>
                <td className="p-3">FCFA {Number(order.totalPrice || 0).toLocaleString()}</td>
                <td className="p-3">{order.isPaid ? "Paid" : "Pending"}</td>
                <td className="p-3">{order.isDelivered ? "Yes" : "No"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => viewOrder(order._id)} className="bg-blue-600 text-white px-2 py-1 rounded">View</button>
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
