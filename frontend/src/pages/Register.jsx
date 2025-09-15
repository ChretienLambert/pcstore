import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import register from "../assets/register.jpg";
import { registerUser } from "../redux/slices/authSlice";
import { mergeCart } from "../redux/slices/cartSlice";
import { setCart } from "../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mismatchError, setMismatchError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading, error } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  // redirect parameter (?redirect=/checkout)
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      // persist local cart into Redux store before navigation/merge
      try {
        const local = JSON.parse(localStorage.getItem("cart") || "[]");
        if (Array.isArray(local) && local.length) {
          dispatch(setCart(local));
        }
      } catch (e) {
        console.warn("Register: failed to parse local cart", e);
      }
      navigate(isCheckoutRedirect ? "/checkout" : "/");
    }
  }, [user, isCheckoutRedirect, dispatch, navigate]);

  const handleRegister = (e) => {
    e.preventDefault();
    setPasswordError("");
    setMismatchError("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setMismatchError("Passwords do not match");
      return;
    }
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 bg-white p-8 sm:p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Create Your Account
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Join us to start your shopping journey
            </p>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value.length >= 6) {
                      setPasswordError("");
                    }
                  }}
                  required
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-500">{passwordError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (password === e.target.value) {
                      setMismatchError("");
                    }
                  }}
                  required
                />
                {mismatchError && (
                  <p className="mt-2 text-sm text-red-500">{mismatchError}</p>
                )}
                {error && (
                  <p className="mt-2 text-sm text-red-500">
                    Registration failed. Please try again.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end text-sm">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to={`/login?redirect=${encodeURIComponent(redirect)}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                }`}
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
        {/* Right Side - Image */}
        <div className="hidden md:block w-1/2">
          <img
            src={register}
            alt="Register background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}