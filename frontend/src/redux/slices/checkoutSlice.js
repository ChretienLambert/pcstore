import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { clearCart } from "../slices/cartSlice";
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

export const createOrder = createAsyncThunk(
  "checkout/createOrder",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      const headers = {};
      if (token && token !== "null" && token !== "undefined") {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await axios.post(`${BACKEND}/api/orders`, payload, {
        headers,
      });
      // on success: clear frontend cart state + localStorage so UI empties like normal prebuilt flow
      try {
        dispatch(clearCart());
      } catch (e) {
        /* ignore */
      }
      try {
        localStorage.removeItem("cart");
      } catch (e) {
        /* ignore */
      }
      return res.data;
    } catch (err) {
      const payloadErr =
        err?.response?.data || err.message || "Order creation failed";
      return rejectWithValue(payloadErr);
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    loading: false,
    error: null,
    order: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message;
      });
  },
});

export default checkoutSlice.reducer;
