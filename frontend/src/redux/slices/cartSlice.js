import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cart") || "[]"),
  loading: false,
  error: null,
};

// If called with a payload that has isCustomBuild true - push directly
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (payload, { getState }) => {
    if (payload && payload.isCustomBuild) {
      return payload;
    }
    const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
    const res = await axios.get(`${BACKEND}/api/products/${payload.productId}`);
    const p = res.data;
    return {
      productId: p._id,
      name: p.name,
      image: p.image,
      price: p.price,
      quantity: payload.quantity || 1,
    };
  }
);

// NEW: update cart item quantity (will update remote cart when userId present, otherwise localStorage)
export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateCartItemQuantity",
  async (
    { productId, quantity, size, color, guestId, userId },
    { rejectWithValue }
  ) => {
    try {
      const BACKEND =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
      // If userId present or token present, attempt backend update
      if (userId || localStorage.getItem("userToken")) {
        const payload = { productId, quantity, size, color, guestId, userId };
        const res = await axios.put(`${BACKEND}/api/cart`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        // expect cart object returned (backend cart schema may differ); normalize to array
        const updatedCart =
          res.data?.products || res.data?.items || res.data || [];
        // persist (safe)
        try {
          localStorage.setItem("cart", JSON.stringify(updatedCart));
        } catch {}
        return updatedCart;
      }
      // Fallback: update localStorage cart array
      const raw = localStorage.getItem("cart");
      const list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(
        (i) =>
          String(i.productId || i._id || i.product) === String(productId) &&
          (i.size || "") === (size || "") &&
          (i.color || "") === (color || "")
      );
      if (idx > -1) {
        if (quantity <= 0) {
          list.splice(idx, 1);
        } else {
          list[idx].quantity = quantity;
        }
      } else if (quantity > 0) {
        list.push({ productId, quantity, size, color, price: 0, name: "Item" });
      }
      localStorage.setItem("cart", JSON.stringify(list));
      return list;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // keep synchronous reducer for simple removals (string id)
    removeFromCart(state, action) {
      state.cartItems = state.cartItems.filter(
        (i) => i.productId !== action.payload
      );
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    clearCart(state) {
      state.cartItems = [];
      localStorage.removeItem("cart");
    },
    setCart(state, action) {
      state.cartItems = action.payload;
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    // Merge an incoming cart (e.g. guest cart after login) into current cart
    mergeCart(state, action) {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      incoming.forEach((inc) => {
        // try to match by productId (or product/_id)
        const pid = inc.productId || inc.product || inc._id || inc.name;
        const exist = state.cartItems.find(
          (i) =>
            String(i.productId || i.product || i._id || i.name) === String(pid)
        );
        if (exist) {
          // increase quantity for non-custom builds, otherwise create new entry
          if (!inc.isCustomBuild) {
            exist.quantity = (exist.quantity || 0) + (inc.quantity || 1);
          } else {
            // for custom builds, always add as distinct item
            state.cartItems.push({ ...inc, productId: pid });
          }
        } else {
          state.cartItems.push({ ...inc, productId: pid });
        }
      });
      try {
        localStorage.setItem("cart", JSON.stringify(state.cartItems));
      } catch (e) {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (!item.isCustomBuild) {
          const exist = state.cartItems.find(
            (i) => i.productId === item.productId
          );
          if (exist) {
            exist.quantity = (exist.quantity || 0) + (item.quantity || 1);
          } else {
            state.cartItems.push({
              productId: item.productId,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: item.quantity || 1,
            });
          }
        } else {
          const buildId = item.productId || `custom_build_${Date.now()}`;
          state.cartItems.push({
            productId: buildId,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity || 1,
            isCustomBuild: true,
            components: item.components || [],
            notes: item.notes || "",
          });
        }
        localStorage.setItem("cart", JSON.stringify(state.cartItems));
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Add to cart failed";
      })

      // handle updateCartItemQuantity lifecycle
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is the updated cart array
        state.cartItems = Array.isArray(action.payload)
          ? action.payload
          : state.cartItems;
        try {
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
        } catch {}
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Update cart failed";
      });
  },
});

export const { removeFromCart, clearCart, setCart, mergeCart } =
  cartSlice.actions;
export default cartSlice.reducer;

// helper exported for direct use
export const buildAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
