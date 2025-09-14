import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getBearerToken = () => {
  const raw = localStorage.getItem("userToken");
  if (!raw || raw === "null" || raw === "undefined") return null;
  return `Bearer ${raw}`;
};

// Fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const headers = {};
      const bearer = getBearerToken();
      if (bearer) headers.Authorization = bearer;
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        { headers }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// update order delivery/payment/status (admin)
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, update }, { rejectWithValue }) => {
    try {
      const headers = {};
      const bearer = getBearerToken();
      if (bearer) headers.Authorization = bearer;
      // Call the admin route for updates
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        update,
        { headers }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete an order
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      const headers = {};
      const bearer = getBearerToken();
      if (bearer) headers.Authorization = bearer;
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        { headers }
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    totalOrders: 0,
    totalSales: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize payload to an array
        const list = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.orders)
          ? action.payload.orders
          : [];

        // Deduplicate by _id (safe if backend or client accidentally returns duplicates)
        const map = new Map();
        list.forEach((o) => {
          if (!o || !o._id) return;
          map.set(String(o._id), o);
        });
        state.orders = Array.from(map.values());
        state.totalOrders = state.orders.length;
        state.totalSales = state.orders.reduce(
          (acc, order) => acc + Number(order.totalPrice || 0),
          0
        );
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message;
      })

      // When an order is updated, replace the single entry and keep list deduped
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated || !updated._id) return;
        const idx = state.orders.findIndex(
          (o) => String(o._id) === String(updated._id)
        );
        if (idx !== -1) {
          state.orders[idx] = updated;
        } else {
          // if not present insert at top
          state.orders.unshift(updated);
          // ensure uniqueness
          const uniq = new Map();
          state.orders.forEach((o) => uniq.set(String(o._id), o));
          state.orders = Array.from(uniq.values());
        }
        // recalc totals
        state.totalOrders = state.orders.length;
        state.totalSales = state.orders.reduce(
          (acc, order) => acc + Number(order.totalPrice || 0),
          0
        );
      })

      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          (order) => String(order._id) !== String(action.payload)
        );
        state.totalOrders = state.orders.length;
        state.totalSales = state.orders.reduce(
          (acc, order) => acc + Number(order.totalPrice || 0),
          0
        );
      });
  },
});

export default adminOrderSlice.reducer;
