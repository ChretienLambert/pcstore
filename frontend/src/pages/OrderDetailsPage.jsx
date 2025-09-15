// frontend/pages/OrderDetailsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem("userToken");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${BACKEND}/api/orders/${id}`, { headers });
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Order not found");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">No Order Found</div>;

  // safer items total calculation
  const itemsTotal = order.orderItems?.reduce((s, it) => {
    const price = Number(it.price ?? it.unitPrice ?? 0) || 0;
    const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
    return s + price * qty;
  }, 0) || 0;

  const fmt = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n.toLocaleString() : "0";
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white shadow rounded p-6 mb-8 flex justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Order #{String(order._id).slice(0, 10)}
          </h2>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              order.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.isPaid ? "Paid" : "Pending"}
          </span>
          <div className="text-lg font-semibold mt-2 text-gray-800">
            Total: FCFA {Number(order.totalPrice || itemsTotal).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white shadow rounded p-4">
            <h3 className="font-semibold text-lg mb-4">Items</h3>

            {/* make items list scrollable to avoid layout blowup */}
            <div
              className="divide-y"
              style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 8 }}
            >
              {order.orderItems?.map((it, i) => {
                const key = it._id ?? it.sku ?? `${it.name}-${i}`;
                const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
                const price = Number(it.price ?? it.unitPrice ?? it.price ?? 0) || 0;
                const imageUrl =
                  it.image ||
                  it.images?.[0]?.url ||
                  it.product?.images?.[0]?.url ||
                  "/images/placeholder.png";
                // components may be on the item directly or on the referenced product
                const components = (it.components ?? it.selectedComponents ?? it.product?.components) || [];

                const isCustomBuild = !!(it.isCustomBuild || String(it.name).toLowerCase().includes("custom build") || (it.tags || []).includes("custom"));

                return (
                  <div key={key} className="py-4 flex items-start justify-between gap-4 overflow-hidden">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {imageUrl && (
                        <img src={imageUrl} alt={it.name} className="w-20 h-16 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate" title={it.name}>{it.name}</p>
                        <p className="text-sm text-gray-500">Qty: {qty}</p>

                        {components && components.length > 0 && (
                          isCustomBuild ? (
                            <ul className="text-xs text-gray-600 mt-2 list-disc list-inside space-y-1">
                              {components.map((c, idx) => (
                                <li key={idx} className="break-words">
                                  <span className="font-semibold">{c.slot ?? ""}{c.slot ? ": " : ""}</span>
                                  <span>{c.name ?? c.partName ?? String(c)}</span>
                                  {c.price ? <span> — FCFA {Number(c.price).toLocaleString()}</span> : null}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-500 mt-2 truncate" title={components.map(c => (c.slot ? c.slot + ': ' : '') + (c.name ?? c.partName ?? c)).join(', ')}>
                              {components.map((c) => (c.slot ? `${c.slot}: ` : "") + (c.name ?? c.partName ?? c)).filter(Boolean).join(", ")}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">FCFA {(price * qty).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Unit: FCFA {price.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white shadow rounded p-4">
            <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
            <p className="text-gray-700 break-words whitespace-normal">
              {order.shippingAddress?.address}, {order.shippingAddress?.city}{" "}
              {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Items</span>
              <span>FCFA {itemsTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>FCFA {Number(order.shippingPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>FCFA {Number(order.totalPrice).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
