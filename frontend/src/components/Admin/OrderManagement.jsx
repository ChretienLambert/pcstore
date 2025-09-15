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

  // Calculate total quantity of items in an order
  const getTotalQuantity = (order) => {
    return order.orderItems?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  };

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

  // Determine payment status based on payment method and isPaid
  const getPaymentStatus = (order) => {
    // Treat card payments as paid immediately
    if (order.isPaid || order.paymentMethod === "card") {
      return "Paid";
    } else if (order.paymentMethod === "cash") {
      return "Unpaid"; // Cash on delivery - will pay later
    }
    return "Pending"; // Default fallback
  };

  // Get appropriate styling for payment status
  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs";
      case "Unpaid":
        return "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs";
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
              <th className="p-3">Items (Qty)</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3">Payment Status</th>
              
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const paymentStatus = getPaymentStatus(order);
              const totalQuantity = getTotalQuantity(order);
              return (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <button onClick={() => viewOrder(order._id)} className="text-left text-blue-700 hover:underline">
                      #{String(order._id).slice(0, 8)}
                    </button>
                  </td>
                  <td className="p-3">{order.user?.name || order.user?.email || "Guest"}</td>
                  <td className="p-3">{totalQuantity}</td>
                  <td className="p-3">FCFA {Number(order.totalPrice || 0).toLocaleString()}</td>
                  <td className="p-3 capitalize">{order.paymentMethod || "Unknown"}</td>
                  <td className="p-3">
                    <span className={getPaymentStatusStyle(paymentStatus)}>
                      {paymentStatus}
                    </span>
                  </td>
                  
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => viewOrder(order._id)} className="bg-blue-600 text-white px-2 py-1 rounded">View</button>
                      <button onClick={() => handleDelete(order._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;