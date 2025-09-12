import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// restore token from storage and set axios default header
const storedToken = localStorage.getItem("userToken");

// only set axios header for a valid token string
if (storedToken && storedToken !== "null" && storedToken !== "undefined") {
  axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
} else {
  // remove invalid token if present
  localStorage.removeItem("userToken");
  delete axios.defaults.headers.common["Authorization"];
}

export const loginUser = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  try {
    const res = await axios.post(`${BACKEND}/api/users/login`, credentials);
    const { token } = res.data;
    // when you receive token on login/register:
    if (token && token !== "null" && token !== "undefined") {
      localStorage.setItem("userToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("userToken");
      delete axios.defaults.headers.common["Authorization"];
    }
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const registerUser = createAsyncThunk("auth/register", async (credentials, thunkAPI) => {
  try {
    const res = await axios.post(`${BACKEND}/api/users/register`, credentials);
    const { token } = res.data;
    // when you receive token on login/register:
    if (token && token !== "null" && token !== "undefined") {
      localStorage.setItem("userToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("userToken");
      delete axios.defaults.headers.common["Authorization"];
    }
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${BACKEND}/api/users/profile`);
      return res.data; // expect { ...user }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: storedToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("userToken");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; })

      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; })

      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload || null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
        // if token invalid, clear it
        state.token = null;
        localStorage.removeItem("userToken");
        delete axios.defaults.headers.common["Authorization"];
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
