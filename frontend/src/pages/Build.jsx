import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createOrder } from "../redux/slices/checkoutSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import fallbackImage from "../assets/cheap-pc.jpg";

const PART_SLOTS = [
  "CPU",
  "Motherboard",
  "RAM",
  "GPU",
  "Storage",
  "PSU",
  "Case",
  "Cooler",
];

const STORAGE_KEY = "customBuildDraft_v1";

const Build = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [build, setBuild] = useState({});
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "{}";
      setBuild(JSON.parse(raw));
    } catch (err) {
      console.warn("Failed to parse custom build draft", err);
      setBuild({});
    }
  }, []);

  // fetch product catalog once to populate droplists
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${BACKEND}/api/products`);
        if (!mounted) return;
        setParts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn("Failed to load parts list", err);
        setParts([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // persist build draft when user changes selections
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build || {}));
    } catch (e) {
      console.warn("Failed to save build draft", e);
    }
  }, [build]);

  const getOptionsForSlot = (slot) => {
    const candidates = parts.filter(
      (p) =>
        p &&
        (p.isPart === true ||
          Boolean(p.partType) ||
          String(p.category || "").toLowerCase().includes("pc part") ||
          String(p.category || "").toLowerCase().includes("parts"))
    );

    const match = (p = "") => String(p || "").toLowerCase().includes(slot.toLowerCase());
    const matched = candidates.filter(
      (p) =>
        match(p.name) ||
        match(p.partType) ||
        match(p.subcategory) ||
        match(p.category) ||
        match(p.collections)
    );
    return matched.length ? matched : candidates.slice(0, 40);
  };

  const handleSelectPart = (slot, value) => {
    if (value === "none") {
      setBuild((s) => {
        const next = { ...s };
        delete next[slot];
        return next;
      });
      return;
    }
    if (value === "custom") {
      setBuild((s) => ({ ...s, [slot]: { custom: true, name: "", price: 0 } }));
      return;
    }
    const p = parts.find((x) => String(x._id || x.id) === String(value));
    if (p) {
      setBuild((s) => ({ ...s, [slot]: { ...p, productId: p._id || p.id } }));
    }
  };

  const handleCustomChange = (slot, field, val) => {
    setBuild((s) => {
      const cur = s[slot] || {};
      return { ...s, [slot]: { ...cur, [field]: field === "price" ? Number(val || 0) : val } };
    });
  };

  const getOrderItemsFromBuild = (buildObj) => {
    const items = PART_SLOTS.map((slot) => buildObj[slot]).filter(Boolean);
    return items.map((part, i) => ({
      // only include productId for real catalog parts; omit "product" entirely for customs
      productId: part?.productId || null,
      name: part?.name || part?.customName || `Custom ${PART_SLOTS[i]}`,
      quantity: 1,
      price: Number(part?.price || 0),
      image: part?.image || part?.images?.[0] || part?.img || fallbackImage,
      isCustomBuild: true,
      components: [{ slot: part?.partType || PART_SLOTS[i], name: part?.name }],
    }));
  };

  const handleCreateOrder = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const orderItems = getOrderItemsFromBuild(build);
      if (!orderItems.length) {
        setSuccessMsg("Your build is empty. Please select components.");
        setTimeout(() => setSuccessMsg(null), 2500);
        setLoading(false);
        return;
      }
      const itemsPrice = orderItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0);
      const idempotencyKey = `build-${Date.now()}`;
      const payload = {
        orderItems,
        shippingAddress: build.shippingAddress || {},
        paymentMethod: "CustomBuild",
        itemsPrice,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: itemsPrice,
        isCustomBuild: true,
        idempotencyKey,
      };

      console.log("createOrder dispatched (Build.jsx)", { idempotencyKey, items: orderItems.length });
      console.log("createOrder payload (Build.jsx)", payload);
      const res = await dispatch(createOrder(payload)).unwrap();
      console.log("createOrder result (Build.jsx)", res);
      if (res && (res._id || res.id)) navigate(`/order/${res._id || res.id}`);
      else navigate("/order-confirmation");
    } catch (err) {
      console.error("createOrder failed (Build.jsx)", err);
      // delete draft on error as requested
      localStorage.removeItem(STORAGE_KEY);
      setBuild({});
      setSuccessMsg("Order failed — draft deleted");
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const addBuildToCart = () => {
    const items = getOrderItemsFromBuild(build);
    if (!items.length) {
      setSuccessMsg("Select at least one part before adding to cart.");
      setTimeout(() => setSuccessMsg(null), 2500);
      return;
    }
    const totalPrice = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0);
    // Do NOT include "product" or other fields that backend/mongoose may cast.
    const cartItem = {
      name: `Custom Build — ${items.map((i) => i.name).filter(Boolean).slice(0, 3).join(", ")}`,
      price: totalPrice,
      quantity: 1,
      image: items.find((i) => i.image)?.image || fallbackImage,
      isCustomBuild: true,
      components: items.map((i) => ({ slot: i.components?.[0]?.slot, name: i.name, price: i.price })),
      meta: { builtAt: new Date().toISOString() },
    };

    console.log("Add custom build to cart", { cartItem });
    dispatch(addToCart(cartItem));

    // transient success message NEXT TO BUTTONS (no route change)
    setSuccessMsg("Custom build added to cart");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Build Your PC</h1>

      <div className="mb-6 space-y-4">
        {PART_SLOTS.map((slot) => {
          const selected = build[slot];
          const options = getOptionsForSlot(slot);
          return (
            <div key={slot} className="p-4 bg-white rounded shadow">
              <label className="block font-semibold mb-2">{slot}</label>
              <div className="flex gap-3 items-center">
                <select
                  value={selected?.productId || (selected?.custom ? "custom" : (selected ? "selected" : "none"))}
                  onChange={(e) => handleSelectPart(slot, e.target.value)}
                  className="input flex-1"
                >
                  <option value="none">-- None --</option>
                  <option value="custom">Custom entry</option>
                  {options.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name} — FCFA {Number(p.price || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-gray-500">Selected: {selected?.name || "None"}</div>
              </div>

              {selected?.custom && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input
                    placeholder={`${slot} name`}
                    value={selected.name || ""}
                    onChange={(e) => handleCustomChange(slot, "name", e.target.value)}
                    className="input"
                  />
                  <input
                    placeholder="Price"
                    type="number"
                    value={selected.price || 0}
                    onChange={(e) => handleCustomChange(slot, "price", e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={addBuildToCart} disabled={loading} className="btn-primary">
          {loading ? "Adding..." : "Add build to cart"}
        </button>

        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setBuild({});
          }}
          className="btn-ghost"
        >
          Clear Draft
        </button>

        {/* transient message near buttons */}
        {successMsg && <div className="ml-4 text-sm text-green-700">{successMsg}</div>}
      </div>
    </div>
  );
};

export default Build;