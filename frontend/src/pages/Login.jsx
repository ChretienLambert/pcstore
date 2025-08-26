import { useState } from "react";
import {  Link } from "react-router-dom";
import login from "../assets/login.jpg" 


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login Successful: ",{email, password})

  }

  return (
    <div className="flex h-screen">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#5C5CFF] text-white px-8">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Sign into your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg text-black bg-white  border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg text-black bg-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-indigo-500" /> Remember
                me
              </label>
              <Link to="/Register" className="text-blue-300 hover:underline">
                Don't have an account? Register{""}
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden md:block w-1/2">
        <img
          src={login}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
