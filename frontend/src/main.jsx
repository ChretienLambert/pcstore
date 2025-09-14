import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";
import store from "./redux/store";
import { fetchProfile } from "./redux/slices/authSlice";

const token = localStorage.getItem("userToken");
if (token && token !== "null" && token !== "undefined") {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  // load current user into store (will clear token if invalid)
  store.dispatch(fetchProfile());
} else {
  delete axios.defaults.headers.common["Authorization"];
  localStorage.removeItem("userToken");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
