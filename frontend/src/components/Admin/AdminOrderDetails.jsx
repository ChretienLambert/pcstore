import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, updateOrderStatus } from "../../redux/slices/adminOrderSlice";

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
  
  const adminOrders = useSelector((s) => s.adminOrders?.orders || []);
  
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

  // Sync local details with the admin orders list so status is always consistent
  useEffect(() => {
    if (!id) return;
    const updated = adminOrders.find((o) => String(o._id) === String(id));
    if (updated) {
      setOrder(updated);
    }
  }, [adminOrders, id]);

  const handleUpdateStatus = async (status) => {
    try {
      setStatusLoading(true);
      // Use the adminOrderSlice thunk — it updates the store and returns the updated order
      const res = await dispatch(updateOrderStatus({ id, update: { status } })).unwrap();
      // ensure local state reflects the updated order
      setOrder(res);
      // refresh admin orders list for other UI if needed
      dispatch(fetchAllOrders());
    } catch (err) {
      console.error("Failed to update order status", err);
      setError(err?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };
  
  // Check if order is delivered based on status or isDelivered field
  const isDelivered = order?.status === "delivered" || order?.isDelivered;

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const itemsTotal = order.orderItems?.reduce((s, it) => {
    const price = Number(it.price ?? it.unitPrice ?? 0) || 0;
    const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
    return s + price * qty;
  }, 0) || 0;

  const fmt = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n.toLocaleString() : "0";
  };

  // actionable booleans for clearer button enable/disable logic
  const canMarkPaid = !statusLoading && !(order.isPaid || order.status === "paid");
  const canMarkUnpaid = !statusLoading && (order.isPaid || order.status === "paid");
  const canMarkDelivered = !statusLoading && !isDelivered;

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
              {order.orderItems?.map((it, idx) => {
                const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
                const unitPrice = Number(it.price ?? it.unitPrice ?? 0) || 0;
                const imageUrl = it.image || it.images?.[0]?.url || it.product?.images?.[0]?.url || "/images/placeholder.png";
                const components = (it.components ?? it.selectedComponents ?? it.product?.components) || [];
                const isCustomBuild = !!(it.isCustomBuild || String(it.name).toLowerCase().includes("custom build") || (it.tags || []).includes("custom"));

                return (
                  <div key={it._id ?? it.sku ?? `${idx}`} className="py-3 flex items-start justify-between gap-3 border-b last:border-b-0 overflow-hidden">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {imageUrl && <img src={imageUrl} alt={it.name} className="w-16 h-12 object-cover rounded flex-shrink-0" />}
                      <div className="min-w-0">
                        <div className="font-medium truncate" title={it.name}>{it.name}</div>
                        <div className="text-sm text-gray-500 truncate" title={String(it.productId ?? it.product?._id ?? it._id ?? "—")}>
                          Product: {it.productId ?? it.product?._id ?? it._id ?? "—"}
                        </div>

                        {components && components.length > 0 && (
                          isCustomBuild ? (
                            <ul className="text-xs text-gray-600 mt-1 list-disc list-inside space-y-1 break-words">
                              {components.map((c, i2) => (
                                <li key={i2}>
                                  <span className="font-semibold">{c.slot ?? ""}{c.slot ? ": " : ""}</span>
                                  <span>{c.name ?? c.partName ?? String(c)}</span>
                                  {c.price ? <span> — FCFA {Number(c.price).toLocaleString()}</span> : null}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-500 mt-1 truncate" title={components.map(c => (c.slot ? c.slot+': ' : '') + (c.name ?? c.partName ?? c)).join(', ')}>
                              {components.map((c) => (c.slot ? `${c.slot}: ` : "") + (c.name ?? c.partName ?? c)).filter(Boolean).join(", ")}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-medium">FCFA {(unitPrice * qty).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Qty: {qty}</div>
                      <div className="text-sm text-gray-500">Unit: FCFA {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
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
                type="button"
                onClick={() => handleUpdateStatus("paid")} 
                disabled={!canMarkPaid}
                aria-disabled={!canMarkPaid}
                title={canMarkPaid ? "Mark order as paid" : "Already paid or action in progress"}
                className={`w-full py-2 rounded text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  canMarkPaid ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-400 cursor-not-allowed"
                }`}
              >
                {statusLoading && !canMarkPaid ? "Processing..." : "Mark Paid"}
              </button>

              <button 
                type="button"
                onClick={() => handleUpdateStatus("pending")} 
                disabled={!canMarkUnpaid}
                aria-disabled={!canMarkUnpaid}
                title={canMarkUnpaid ? "Revert payment / mark unpaid" : "Not in paid state or action in progress"}
                className={`w-full py-2 rounded border transition focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                  canMarkUnpaid ? "bg-white hover:bg-gray-50 border-gray-300 text-gray-700" : "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                }`}
              >
                {statusLoading && !canMarkUnpaid ? "Processing..." : "Mark Unpaid"}
              </button>

              <button 
                type="button"
                onClick={() => handleUpdateStatus("delivered")} 
                disabled={!canMarkDelivered}
                aria-disabled={!canMarkDelivered}
                title={canMarkDelivered ? "Mark order as delivered" : "Already delivered or action in progress"}
                className={`w-full py-2 rounded text-white transition focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  canMarkDelivered ? "bg-green-600 hover:bg-green-700" : "bg-green-400 cursor-not-allowed"
                }`}
              >
                {isDelivered ? "Delivered" : "Mark Delivered"}
              </button>

              <button 
                type="button"
                onClick={() => navigate(-1)} 
                className="w-full py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-offset-1"
              >
                Back
              </button>
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

      {/* Order Items Detailed View (collapsed by default) */}
      <div className="mt-6">
        <details className="group" open>
          <summary className="flex items-center justify-between p-4 bg-gray-100 rounded cursor-pointer">
            <h4 className="font-semibold">Order Items Details</h4>
            <span className="text-sm text-gray-500">
              {order.orderItems?.length} item{order.orderItems?.length !== 1 ? "s" : ""}
            </span>
          </summary>

          <div className="card p-4">
            <h4 className="font-semibold mb-2">Order Items</h4>

            {/* scrollable area to avoid layout crash when many items */}
            <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: 8 }}>
              {order.orderItems?.map((it, idx) => {
                const key = it._id ?? it.sku ?? `${it.name}-${idx}`;
                const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
                const unitPrice = Number(it.price ?? it.unitPrice ?? 0) || 0;
                const imageUrl = it.image || it.images?.[0]?.url || it.product?.images?.[0]?.url || "/images/placeholder.png";
                const components = it.components ?? it.selectedComponents ?? it.product?.components ?? [];

                const isCustomBuild =
                  String(it.name).toLowerCase().includes("custom build") ||
                  (it.tags || []).includes("custom") ||
                  (it.product?.tags || []).includes("custom");

                const MAX_COMPONENTS_SHOWN = 50;
                const showComponents = components.slice(0, MAX_COMPONENTS_SHOWN);
                const remaining = Math.max(0, components.length - showComponents.length);

                return (
                  <div
                    key={key}
                    className="py-3 flex items-center justify-between gap-3 border-b last:border-b-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={it.name}
                          className="w-16 h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div
                          className="font-medium truncate"
                          title={it.name}
                        >
                          {it.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate" title={String(it.productId ?? it.product?._id ?? it._id ?? "—")}>
                          Product: {it.productId ?? it.product?._id ?? it._id ?? "—"}
                        </div>

                        {showComponents.length > 0 && (
                          isCustomBuild ? (
                            <ul className="text-xs text-gray-500 mt-1 list-disc list-inside space-y-1 break-words">
                              {showComponents.map((c, i2) => (
                                <li key={i2}>
                                  <span className="font-semibold">{c.slot ?? ""}{c.slot ? ": " : ""}</span>
                                  <span>{c.name ?? c.partName ?? String(c)}</span>
                                  {c.price ? <span> — FCFA {fmt(c.price)}</span> : null}
                                </li>
                              ))}
                              {remaining > 0 && <li className="text-gray-400">+ {remaining} more</li>}
                            </ul>
                          ) : (
                            (() => {
                              const ctext = showComponents
                                .map((c) => {
                                  if (!c) return "";
                                  const label = c.name ?? c.partName ?? (typeof c === "string" ? c : "");
                                  const slot = c.slot ? `${c.slot}: ` : "";
                                  return slot + label + (c.price ? ` (FCFA ${fmt(c.price)})` : "");
                                })
                                .filter(Boolean)
                                .join(", ");
                              return (
                                <div className="text-xs text-gray-500 mt-1 truncate" title={ctext + (remaining > 0 ? ` +${remaining} more` : "")}>
                                  {ctext}
                                  {remaining > 0 && ` +${remaining} more`}
                                </div>
                              );
                            })()
                          )
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-medium">FCFA {fmt(unitPrice * qty)}</div>
                      <div className="text-sm text-gray-500">Qty: {qty}</div>
                      <div className="text-sm text-gray-500">Unit: FCFA {fmt(unitPrice)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AdminOrderDetails;