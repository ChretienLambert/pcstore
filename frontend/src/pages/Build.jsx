// frontend/src/pages/Build.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// import { createOrder } from "../redux/slices/checkoutSlice";
import { addToCart } from "../redux/slices/cartSlice";
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
  // navigate removed as create order / checkout flow is removed
  const [build, setBuild] = useState({});
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

  // Load draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "{}";
      setBuild(JSON.parse(raw));
    } catch (err) {
      console.warn("Failed to parse custom build draft", err);
      setBuild({});
    }
  }, []);

  // Fetch parts list
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

  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build || {}));
    } catch (e) {
      console.warn("Failed to save build draft", e);
    }
  }, [build]);

  // helper: normalize image into a string URL acceptable to backend
  const normalizeImageForOrder = (image) => {
    if (!image) return fallbackImage || "";
    if (typeof image === "string") return image;
    // object shapes
    if (image.url) return image.url;
    if (image.src) return image.src;
    if (image.path) return image.path.startsWith("http") ? image.path : `${BACKEND}${image.path}`;
    if (image.secure_url) return image.secure_url;
    if (image.publicUrl) return image.publicUrl;
    // fallback
    return fallbackImage || "";
  };

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
    return matched.length ? matched : candidates.slice(0, 60);
  };

  // removed "custom" option handling — only product selections or none allowed
  const handleSelectPart = (slot, value) => {
    if (value === "none") {
      setBuild((s) => {
        const next = { ...s };
        delete next[slot];
        return next;
      });
      return;
    }
    const p = parts.find((x) => String(x._id || x.id) === String(value));
    if (p) {
      // store a lightweight object; keep images array on part
      setBuild((s) => ({ ...s, [slot]: { ...p, productId: p._id || p.id } }));
    }
  };

  const handleCustomChange = (slot, field, val) => {
    setBuild((s) => {
      const cur = s[slot] || {};
      return { ...s, [slot]: { ...cur, [field]: field === "price" ? Number(val || 0) : val } };
    });
  };

  // Build order items array: ensure image is a string
  const getOrderItemsFromBuild = (buildObj) => {
    const items = PART_SLOTS.map((slot) => buildObj[slot]).filter(Boolean);

    return items.map((part, i) => {
      const slotName = part?.partType || PART_SLOTS[i];
      const name = part?.name || part?.customName || `Custom ${slotName}`;
      const price = Number(part?.price || 0);
      const productId = part?.productId || null;

      // choose an image string (url) for backend
      const rawImg = part?.image || part?.images?.[0] || part?.img || fallbackImage;
      const imageUrl = normalizeImageForOrder(rawImg);

      return {
        productId,                         // null for pure customs
        name,
        quantity: 1,
        price,
        image: imageUrl,                   // IMPORTANT: string, not object
        isCustomBuild: true,
        // detailed components for order history / rebuildability
        components: [
          {
            slot: slotName,
            name,
            price,
            productId,
          },
        ],
      };
    });
  };

  // removed handleCreateOrder (checkout / create order) per request

  const addBuildToCart = () => {
    const items = getOrderItemsFromBuild(build);
    if (!items.length) {
      setSuccessMsg("Select at least one part before adding to cart.");
      setTimeout(() => setSuccessMsg(null), 2500);
      return;
    }
    const totalPrice = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0);

    // normalized image for the cart item
    const imageForCart = items.length ? (items[0].image || fallbackImage) : fallbackImage;

    const cartItem = {
      name: `Custom Build — ${items.map((i) => i.name).filter(Boolean).slice(0, 6).join(", ")}`,
      price: totalPrice,
      quantity: 1,
      image: imageForCart || fallbackImage,
      isCustomBuild: true,
      components: items.map((i) => ({ slot: i.components?.[0]?.slot, name: i.name, price: i.price, productId: i.productId })),
      meta: { builtAt: new Date().toISOString() },
    };

    console.log("Add custom build to cart", { cartItem });
    dispatch(addToCart(cartItem));

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
          const value = selected?.productId || "none";
          return (
            <div key={slot} className="p-4 bg-white rounded shadow hover:shadow-lg transition-shadow overflow-hidden">
              <label className="block font-semibold mb-2">{slot}</label>
              <div className="flex gap-3 items-center">
                <select
                  value={value}
                  onChange={(e) => handleSelectPart(slot, e.target.value)}
                  className="input flex-1 min-w-0 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="none">-- None --</option>
                  {/* removed custom entry option to keep list strictly products */}
                  {options.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name} — FCFA {Number(p.price || 0).toLocaleString()}
                    </option>
                  ))}
                </select>

                <div className="text-sm text-gray-500 min-w-0 truncate" title={selected?.name || "None"}>
                  Selected: {selected?.name || "None"}
                </div>
              </div>

              {/* show a small preview image and price */}
              {selected && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={selected?.images?.[0]?.url || selected?.image || selected?.images?.[0] || fallbackImage}
                    alt={selected?.name}
                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                    style={{ aspectRatio: "1/1" }}
                  />
                  <div className="text-sm min-w-0">
                    <div className="font-medium truncate" title={selected?.name}>{selected?.name}</div>
                    <div className="text-gray-500 truncate">FCFA {Number(selected?.price || 0).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={addBuildToCart} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Adding..." : "Add build to cart"}
        </button>

        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setBuild({});
          }}
          className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
        >
          Clear Draft
        </button>

        {successMsg && <div className="ml-4 text-sm text-green-700">{successMsg}</div>}
      </div>

      {/* Checkout / create order removed as requested */}
    </div>
  );
};

export default Build;
