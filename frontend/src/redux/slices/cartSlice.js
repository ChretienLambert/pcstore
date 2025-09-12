import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// Helper: storage
const loadCartFromStorage = () => {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : { products: [] };
};
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {}
};

// normalize id from many shapes
const normalizeProductId = (productOrId) => {
  if (!productOrId) return null;
  if (typeof productOrId === "string") return productOrId;
  return productOrId._id || productOrId.id || productOrId.productId || null;
};

// Merge backend response into state.cart (handles multiple payload shapes)
const applyCartResponse = (state, payload) => {
  if (!payload) return;

  // full cart object: { products: [...] }
  if (payload.products && Array.isArray(payload.products)) {
    state.cart = payload;
    saveCartToStorage(state.cart);
    return;
  }

  // payload is array of products
  if (Array.isArray(payload)) {
    state.cart = { products: payload };
    saveCartToStorage(state.cart);
    return;
  }

  // payload indicates deletion (contains productId but no products)
  if (payload.productId && !payload.products && !payload.quantity) {
    const pid = normalizeProductId(payload.productId);
    if (pid && state.cart && Array.isArray(state.cart.products)) {
      state.cart.products = state.cart.products.filter((p) => {
        const existingPid = normalizeProductId(p.product || p);
        const sameSize = (p.size || p.sizes || "") === (payload.size || "");
        const sameColor = (p.color || "") === (payload.color || "");
        return !(existingPid === pid && sameSize && sameColor);
      });
      saveCartToStorage(state.cart);
    }
    return;
  }

  // Single item (add/update) -> merge into existing products
  const incoming = payload;
  const incomingPid = normalizeProductId(incoming.product || incoming.productId || incoming);
  if (!incomingPid) return;

  const products = state.cart?.products ? [...state.cart.products] : [];

  const matches = (a, b) => {
    const aPid = normalizeProductId(a.product || a.productId || a);
    const bPid = normalizeProductId(b.product || b.productId || b);
    const aSize = a.size || a.sizes || "";
    const bSize = b.size || b.sizes || "";
    const aColor = a.color || "";
    const bColor = b.color || "";
    return aPid === bPid && aSize === bSize && aColor === bColor;
  };

  let merged = false;
  for (let i = 0; i < products.length; i++) {
    if (matches(products[i], incoming)) {
      const existingQty = Number(products[i].quantity) || 0;
      const incomingQty = Number(incoming.quantity);
      if (Number.isFinite(incomingQty)) {
        // default: treat incoming as increment (add)
        if (incoming.replaceQuantity) {
          products[i].quantity = incomingQty;
        } else {
          products[i].quantity = existingQty + incomingQty;
        }
      }
      // merge other fields
      products[i] = { ...products[i], ...(incoming.product || incoming) };
      merged = true;
      break;
    }
  }

  if (!merged) {
    const toPush = { ...(incoming.product || incoming) };
    toPush.quantity = Number(incoming.quantity) || Number(toPush.quantity) || 1;
    products.push(toPush);
  }

  state.cart = { products };
  saveCartToStorage(state.cart);
};

// thunks (keep same names so UI dispatches work)
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ userId, guestId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BACKEND}/api/cart`, {
        params: { userId, guestId },
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity, size, color, guestId, userId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BACKEND}/api/cart`,
        { productId, quantity, size, color, guestId, userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateCartItemQuantity",
  async ({ productId, quantity, size, color, guestId, userId }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BACKEND}/api/cart`,
        { productId, quantity, size, color, guestId, userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, size, color, guestId, userId }, { rejectWithValue }) => {
    try {
      const res = await axios({
        method: "DELETE",
        url: `${BACKEND}/api/cart`,
        data: { productId, guestId, userId, size, color },
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const mergeCart = createAsyncThunk(
  "cart/mergeCart",
  async ({ guestId, userId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BACKEND}/api/cart/merge`, { guestId, userId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: loadCartFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.cart = { products: [] };
      localStorage.removeItem("cart");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        applyCartResponse(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch cart";
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        applyCartResponse(state, action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add to cart";
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        applyCartResponse(state, action.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update item quantity";
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        applyCartResponse(state, action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to remove item from cart";
      })
      .addCase(mergeCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.loading = false;
        applyCartResponse(state, action.payload);
      })
      .addCase(mergeCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to merge cart";
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;

const buildAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// then use: axios.get(url, { params, headers: buildAuthHeaders() })