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

// NOTE: updateOrderStatus will accept either an explicit `update` object OR a shorthand `status` string.
// If `status` is provided, it will be translated into the admin API fields the backend expects.
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, update, status }, { rejectWithValue }) => {
    try {
      const headers = {};
      const bearer = getBearerToken();
      if (bearer) headers.Authorization = bearer;

      // map shorthand statuses to backend fields
      let payload = { ...(update || {}) };
      if (typeof status === "string") {
        const s = status.toLowerCase();
        if (s === "paid") {
          payload.isPaid = true;
          payload.paymentStatus = "paid";
          payload.paidAt = new Date().toISOString();
          payload.status = "paid";
        } else if (s === "pending" || s === "unpaid") {
          payload.isPaid = false;
          payload.paymentStatus = "pending";
          payload.status = "pending";
        } else if (s === "delivered") {
          payload.isDelivered = true;
          payload.deliveredAt = new Date().toISOString();
          payload.status = "delivered";
        } else {
          // allow arbitrary status strings to be sent through as `status`
          payload.status = s;
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        payload,
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
        const list = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.orders)
          ? action.payload.orders
          : [];
        const map = new Map();
        list.forEach((o) => {
          if (o && o._id) map.set(String(o._id), o);
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
          // insert to top
          state.orders.unshift(updated);
        }
        state.totalOrders = state.orders.length;
      })

      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o._id !== action.payload);
        state.totalOrders = state.orders.length;
      });
  },
});

export default adminOrderSlice.reducer;
