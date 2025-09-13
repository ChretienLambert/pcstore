// adminProductSlice.js - UPDATED
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { updateProduct } from "./productsSlice";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;

// helper: read token consistently and guard invalid values
const getBearerToken = () => {
  const raw =
    localStorage.getItem("userToken") ?? localStorage.getItem("UserToken");
  if (!raw || raw === "null" || raw === "undefined") return null;
  return `Bearer ${raw}`;
};

// async thunk to fetch admin products
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async () => {
    const headers = {};
    const bearer = getBearerToken();
    if (bearer) headers.Authorization = bearer;
    const response = await axios.get(`${API_URL}/api/admin/products`, {
      headers,
    });
    return response.data;
  }
);

// ADD THIS: fetch single product for admin
export const fetchAdminProduct = createAsyncThunk(
  "adminProducts/fetchProduct",
  async (id) => {
    const headers = {};
    const bearer = getBearerToken();
    if (bearer) headers.Authorization = bearer;
    const response = await axios.get(`${API_URL}/api/admin/products/${id}`, {
      headers,
    });
    return response.data;
  }
);

//async func to create a new product
export const createProduct = createAsyncThunk(
  "adminProducts/createProduct",
  async (productData) => {
    const headers = {};
    const bearer = getBearerToken();
    if (bearer) headers.Authorization = bearer;
    const response = await axios.post(
      `${API_URL}/api/admin/products`,
      productData,
      { headers }
    );
    return response.data;
  }
);

// update an existing product (fixed axios signature)
export const UpdateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({ id, productData }) => {
    const headers = {};
    const bearer = getBearerToken();
    if (bearer) headers.Authorization = bearer;
    const response = await axios.put(
      `${API_URL}/api/admin/products/${id}`,
      productData,
      { headers }
    );
    return response.data;
  }
);

// delete a product (fixed axios signature)
export const DeleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id) => {
    const headers = {};
    const bearer = getBearerToken();
    if (bearer) headers.Authorization = bearer;
    await axios.delete(`${API_URL}/api/admin/products/${id}`, { headers });
    return id;
  }
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    selectedProduct: null, // ADD THIS
    loading: false,
    error: null,
  },
  reducers: {
    // ADD THIS: clear selected product
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // ADD THIS: handle fetchAdminProduct
      .addCase(fetchAdminProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      // update product
      .addCase(UpdateProduct.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.products.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.products[index] = updated;
        if (
          state.selectedProduct &&
          state.selectedProduct._id === updated._id
        ) {
          state.selectedProduct = updated;
        }
      })
      // delete product
      .addCase(DeleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
        if (
          state.selectedProduct &&
          state.selectedProduct._id === action.payload
        ) {
          state.selectedProduct = null;
        }
      });
  },
});

export const { clearSelectedProduct } = adminProductSlice.actions; // ADD THIS
export default adminProductSlice.reducer;
