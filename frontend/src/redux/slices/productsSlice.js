import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const normalizeId = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe === "string") return maybe;
  return maybe._id || maybe.id || maybe.productId || null;
};

// fetch single product (accepts id string or product object)
export const fetchSingleProduct = createAsyncThunk(
  "products/fetchSingleProduct",
  async (maybeId, { rejectWithValue }) => {
    try {
      const id = normalizeId(maybeId);
      if (!id) return rejectWithValue({ message: "Invalid product id" });
      const { data } = await axios.get(`${BACKEND}/api/products/${id}`);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        return rejectWithValue({ message: "Product not found" });
      }
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// fetch by filters: normalize incoming keys (name -> category, collection -> collections)
export const fetchProductsByFilters = createAsyncThunk(
  "products/fetchByFilters",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const f = { ...filters };

      // map query keys to backend fields
      if (f.name && !f.category) {
        f.category = f.name;
        delete f.name;
      }
      if (f.collection && !f.collections) {
        f.collections = f.collection;
        delete f.collection;
      }
      if (f.category && typeof f.category === "string") {
        f.category = f.category.trim();
      }

      // remove empty values
      Object.keys(f).forEach((k) => {
        if (f[k] === undefined || f[k] === null || f[k] === "") delete f[k];
      });

      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => {
        if (Array.isArray(v)) params.set(k, v.join(","));
        else if (typeof v === "object") params.set(k, JSON.stringify(v));
        else params.set(k, String(v));
      });

      const { data } = await axios.get(`${BACKEND}/api/products?${params.toString()}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// Async thunk to update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BACKEND}/api/products/${id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk to fetch similar products (defensive)
export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilar",
  async (maybeId, { rejectWithValue }) => {
    try {
      const id = normalizeId(maybeId);
      if (!id) return rejectWithValue({ message: "Invalid product id for similar products" });
      const { data } = await axios.get(`${BACKEND}/api/products/similar/${id}`);
      return data;
    } catch (err) {
      // if backend returns 404 for no similar products, resolve with empty array
      if (err.response?.status === 404) {
        return [];
      }
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    selectedProduct: null,
    similarProducts: [],
    loading: false,
    error: null,
    filters: {
      category: "",
      size: "",
      color: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "",
      search: "",
      material: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: "",
        size: "",
        color: "",
        brand: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "",
        search: "",
        material: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch products by filters
      .addCase(fetchProductsByFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProductsByFilters.rejected, (state, action) => {
        state.loading = false;
        state.products = [];
        state.error = action.payload?.message || action.error?.message || String(action.error);
      })

      // fetch single product
      .addCase(fetchSingleProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchSingleProduct.rejected, (state, action) => {
        state.loading = false;
        state.selectedProduct = null;
        state.error = action.payload?.message || action.error?.message || String(action.error);
      })

      // update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload;
        const index = state.products.findIndex((product) => product._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        if (state.selectedProduct && state.selectedProduct._id === updatedProduct._id) {
          state.selectedProduct = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || String(action.error);
      })

      // similar products
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        // keep similarProducts empty on failure
        state.similarProducts = [];
        state.error = action.payload?.message || action.error?.message || String(action.error);
      });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;